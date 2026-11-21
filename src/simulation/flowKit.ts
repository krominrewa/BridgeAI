/**
 * 仿真练习的通用流程引擎：步骤推进、遗漏提醒、统计计数与会话保存。
 * 各课程只提供数据、校验规则与步骤组件，交互反馈口径保持一致。
 */

export type HelpTier = 1 | 2 | 3

export type StepStats = {
  errors: number
  hints: number
  /** 本步用到的最高提示档位：0 表示没用过，3 表示用到“手把手”。 */
  maxTier: number
}

export type FlowStats = {
  startedAt: number | null
  finishedAt: number | null
  errors: number
  hints: number
  /** 桥桥主动出现的次数，不计入用户主动求助。 */
  autoHints: number
  byStep: StepStats[]
}

/** 所有课程共用的状态骨架，课程在此基础上追加自己的选择字段。 */
export type FlowBase = {
  started: boolean
  step: number
  notice: string | null
  noticeSeq: number
  help: string | null
  /** 当前帮助卡显示的档位，1 方向、2 具体、3 手把手。 */
  helpTier: HelpTier
  /** 桥桥主动提示的当前文案；换步或关闭后清空。 */
  nudge: string | null
  nudgeSeq: number
  /** 已经主动提醒过的步骤，每步最多一次。 */
  nudgedSteps: number[]
  stats: FlowStats
}

export type FlowActionBase =
  | { type: 'start' }
  | { type: 'exit' }
  | { type: 'restart' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'help'; tier?: HelpTier }
  | { type: 'dismissHelp' }
  | { type: 'nudge'; kind: 'idle' | 'errors' }
  | { type: 'dismissNudge' }

export type FlowRules<S> = {
  titles: string[]
  confirmStep: number
  successStep: number
  initial: S
  /** 点“下一步/确认”时缺什么，返回一句说清“缺什么、怎么补”的大白话。 */
  missingNotice: (state: S) => string | null
  /** 第 2 档提示：具体做法，稳定、可预期，也是 AI 不可用时的兜底。 */
  helpText: (state: S) => string
  /** 可选：课程自定义三档提示；不提供时由步骤名与 helpText 组合出通用三档。 */
  hintText?: (state: S, tier: HelpTier) => string
  /** 可选：第 3 档“手把手”里点名按钮或兜底办法。 */
  handholdText?: (state: S) => string
  /** 可选：课程自定义主动提醒文案。 */
  nudgeText?: (state: S) => string
  /** 点确认时补充凭证类数据，例如模拟编号。 */
  onConfirm?: (state: S) => Partial<S>
  /** 退回上一步时需要一并清除的派生数据，例如作废旧凭证。 */
  onBack?: (state: S) => Partial<S>
  /** 刷新续练时最多能恢复到哪一步。 */
  reachableStep?: (state: S) => number
}

export function emptyStats(titles: string[]): FlowStats {
  return {
    startedAt: null,
    finishedAt: null,
    errors: 0,
    hints: 0,
    autoHints: 0,
    byStep: titles.map(() => ({ errors: 0, hints: 0, maxTier: 0 })),
  }
}

export function bumpStats(
  stats: FlowStats,
  step: number,
  key: 'errors' | 'hints',
  tier: HelpTier = 1,
): FlowStats {
  const byStep = stats.byStep.map((item, index) => {
    if (index !== step) return item
    if (key === 'errors') return { ...item, errors: item.errors + 1 }
    return { ...item, hints: item.hints + 1, maxTier: Math.max(item.maxTier, tier) }
  })
  return key === 'errors' ? { ...stats, errors: stats.errors + 1, byStep } : { ...stats, hints: stats.hints + 1, byStep }
}

export function bumpAutoHints(stats: FlowStats): FlowStats {
  return { ...stats, autoHints: stats.autoHints + 1 }
}

/** 展示遗漏提醒；同一提醒连续重复点击只记 1 次错误，有过有效操作后再犯才重新计数。 */
export function withNotice<S extends FlowBase>(state: S, notice: string): S {
  const repeated = state.notice === notice
  return {
    ...state,
    notice,
    noticeSeq: state.noticeSeq + 1,
    help: null,
    stats: repeated ? state.stats : bumpStats(state.stats, state.step, 'errors'),
  }
}

function clampTier(value: number | undefined): HelpTier {
  if (value === 3) return 3
  if (value === 2) return 2
  return 1
}

/** 第 1 档只给方向：这一步做什么，不直接点名答案。 */
function directionText<S extends FlowBase>(state: S, rules: FlowRules<S>): string {
  const title = rules.titles[state.step] ?? ''
  if (state.step === rules.confirmStep) {
    return `这一步是“${title}”。从屏幕上方往下逐行核对，没问题就点最下面的确认按钮。`
  }
  return `这一步是“${title}”。先读屏幕上的说明，点一下最符合的内容，再点最下面的按钮。`
}

function tierText<S extends FlowBase>(state: S, rules: FlowRules<S>, tier: HelpTier): string {
  if (rules.hintText) return rules.hintText(state, tier)
  const detailed = rules.helpText(state)
  if (tier === 1) return directionText(state, rules)
  if (tier === 2) return detailed
  const handhold =
    rules.handholdText?.(state) ??
    (state.step === rules.confirmStep
      ? '还是拿不准？就看屏幕中间那张核对表，逐行读一遍；哪一项不对，点“上一步”回去改。'
      : '还是找不到？点屏幕上方的“朗读”可以听一遍；也可以让家人坐在旁边，一起看页面最显眼的那几张卡片。')
  return `${detailed} ${handhold}`
}

function nudgeTextFor<S extends FlowBase>(state: S, rules: FlowRules<S>): string {
  if (rules.nudgeText) return rules.nudgeText(state)
  const title = rules.titles[state.step] ?? ''
  if (state.step === rules.confirmStep) {
    return `别着急，先把中间的信息从上到下核对一遍，没问题再点最下面的确认按钮。`
  }
  return `别着急，这一步是“${title}”。点一下页面上最符合的一项，再点最下面的按钮。`
}

export function createFlowReducer<S extends FlowBase, A extends { type: string }>(
  rules: FlowRules<S>,
  handleExtra?: (state: S, action: A) => S | null,
): (state: S, action: FlowActionBase | A) => S {
  const { titles, confirmStep, successStep, initial } = rules

  return (state, action) => {
    if (handleExtra) {
      const handled = handleExtra(state, action as A)
      if (handled) return handled
    }

    switch (action.type) {
      case 'start':
        return {
          ...state,
          started: true,
          step: 0,
          notice: null,
          help: null,
          helpTier: 1,
          nudge: null,
          nudgedSteps: [],
          stats: { ...state.stats, startedAt: Date.now() },
        }
      case 'exit':
        return initial
      case 'restart':
        return { ...initial, started: true, stats: { ...emptyStats(titles), startedAt: Date.now() } }
      case 'prev': {
        if (state.step === 0) {
          return { ...state, notice: null, help: null, helpTier: 1, nudge: null }
        }
        const back = rules.onBack?.(state) ?? {}
        return { ...state, step: state.step - 1, notice: null, help: null, helpTier: 1, nudge: null, ...back }
      }
      case 'next': {
        const notice = rules.missingNotice(state)
        if (notice) return withNotice(state, notice)
        if (state.step === confirmStep) {
          const extra = rules.onConfirm?.(state) ?? {}
          return {
            ...state,
            step: successStep,
            notice: null,
            help: null,
            helpTier: 1,
            nudge: null,
            ...extra,
            stats: { ...state.stats, finishedAt: Date.now() },
          }
        }
        return {
          ...state,
          step: Math.min(state.step + 1, successStep),
          notice: null,
          help: null,
          helpTier: 1,
          nudge: null,
        }
      }
      case 'help': {
        const tier = clampTier((action as { tier?: HelpTier }).tier)
        return {
          ...state,
          help: tierText(state, rules, tier),
          helpTier: tier,
          nudge: null,
          stats: bumpStats(state.stats, state.step, 'hints', tier),
        }
      }
      case 'dismissHelp':
        return { ...state, help: null, helpTier: 1 }
      case 'nudge': {
        if (state.nudgedSteps.includes(state.step)) return state
        const stepErrors = state.stats.byStep[state.step]?.errors ?? 0
        if ((action as { kind?: 'idle' | 'errors' }).kind === 'errors' && stepErrors < 2) return state
        return {
          ...state,
          nudge: nudgeTextFor(state, rules),
          nudgeSeq: state.nudgeSeq + 1,
          nudgedSteps: [...state.nudgedSteps, state.step],
          stats: bumpAutoHints(state.stats),
        }
      }
      case 'dismissNudge':
        return { ...state, nudge: null }
      default:
        return state
    }
  }
}

export function readId(raw: Record<string, unknown>, key: string): string | null {
  const value = raw[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function readStep(raw: Record<string, unknown>, limit: number): number {
  const value = raw.step
  if (typeof value !== 'number' || !Number.isInteger(value)) return 0
  return Math.min(Math.max(value, 0), limit)
}

export function readCount(raw: Record<string, unknown>, key: string): number {
  const value = raw[key]
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0
}

export function readTime(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

/** 统计信息可能来自旧版本或损坏的存储，逐项降级到安全默认值。 */
export function normalizeStats(raw: unknown, titles: string[]): FlowStats {
  const base = emptyStats(titles)
  if (typeof raw !== 'object' || raw === null) return base
  const stats = raw as Record<string, unknown>
  const startedAt = readTime(stats.startedAt)
  const finishedAt = readTime(stats.finishedAt)
  const byStep = Array.isArray(stats.byStep) ? stats.byStep : []
  return {
    startedAt,
    finishedAt: startedAt !== null && finishedAt !== null && finishedAt >= startedAt ? finishedAt : null,
    errors: readCount(stats, 'errors'),
    hints: readCount(stats, 'hints'),
    autoHints: readCount(stats, 'autoHints'),
    byStep: base.byStep.map((item, index) => {
      const entry = byStep[index]
      if (typeof entry !== 'object' || entry === null) return item
      const record = entry as Record<string, unknown>
      return {
        errors: readCount(record, 'errors'),
        hints: readCount(record, 'hints'),
        maxTier: Math.min(readCount(record, 'maxTier'), 3),
      }
    }),
  }
}

/** 会话内续练：浏览器禁用存储时读写都静默降级，练习本身不受影响。 */
export function loadStoredFlow<S>(key: string, fallback: () => S, normalize: (raw: Record<string, unknown>) => S): S {
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return fallback()
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return fallback()
    return normalize(parsed as Record<string, unknown>)
  } catch {
    return fallback()
  }
}

export function saveStoredFlow(key: string, state: unknown): void {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(state))
  } catch {
    // 无法保存时保持当前页面内可继续练习
  }
}
