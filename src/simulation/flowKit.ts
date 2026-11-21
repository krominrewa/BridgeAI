/**
 * 仿真练习的通用流程引擎：步骤推进、遗漏提醒、统计计数与会话保存。
 * 各课程只提供数据、校验规则与步骤组件，交互反馈口径保持一致。
 */

export type StepStats = {
  errors: number
  hints: number
}

export type FlowStats = {
  startedAt: number | null
  finishedAt: number | null
  errors: number
  hints: number
  byStep: StepStats[]
}

/** 所有课程共用的状态骨架，课程在此基础上追加自己的选择字段。 */
export type FlowBase = {
  started: boolean
  step: number
  notice: string | null
  noticeSeq: number
  help: string | null
  stats: FlowStats
}

export type FlowActionBase =
  | { type: 'start' }
  | { type: 'exit' }
  | { type: 'restart' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'help' }
  | { type: 'dismissHelp' }

export type FlowRules<S> = {
  titles: string[]
  confirmStep: number
  successStep: number
  initial: S
  /** 点“下一步/确认”时缺什么，返回一句说清“缺什么、怎么补”的大白话。 */
  missingNotice: (state: S) => string | null
  /** 本地规则提示：稳定、可预期，AI 不可用时以此兜底。 */
  helpText: (state: S) => string
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
    byStep: titles.map(() => ({ errors: 0, hints: 0 })),
  }
}

export function bumpStats(stats: FlowStats, step: number, key: 'errors' | 'hints'): FlowStats {
  const byStep = stats.byStep.map((item, index) => {
    if (index !== step) return item
    return key === 'errors' ? { ...item, errors: item.errors + 1 } : { ...item, hints: item.hints + 1 }
  })
  return key === 'errors' ? { ...stats, errors: stats.errors + 1, byStep } : { ...stats, hints: stats.hints + 1, byStep }
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
          stats: { ...state.stats, startedAt: Date.now() },
        }
      case 'exit':
        return initial
      case 'restart':
        return { ...initial, started: true, stats: { ...emptyStats(titles), startedAt: Date.now() } }
      case 'prev': {
        if (state.step === 0) return { ...state, notice: null, help: null }
        const back = rules.onBack?.(state) ?? {}
        return { ...state, step: state.step - 1, notice: null, help: null, ...back }
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
            ...extra,
            stats: { ...state.stats, finishedAt: Date.now() },
          }
        }
        return { ...state, step: Math.min(state.step + 1, successStep), notice: null, help: null }
      }
      case 'help':
        return {
          ...state,
          help: rules.helpText(state),
          stats: bumpStats(state.stats, state.step, 'hints'),
        }
      case 'dismissHelp':
        return { ...state, help: null }
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
    byStep: base.byStep.map((item, index) => {
      const entry = byStep[index]
      if (typeof entry !== 'object' || entry === null) return item
      const record = entry as Record<string, unknown>
      return { errors: readCount(record, 'errors'), hints: readCount(record, 'hints') }
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
