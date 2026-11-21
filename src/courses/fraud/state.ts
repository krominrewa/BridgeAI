/**
 * 三节防骗课共用的状态机：看清情境 → 找可疑点 → 选做法 → 安全操作演练 → 小测 → 完成。
 * 课程之间只换 FraudScenario 数据，交互、计分与刷新续练口径保持一致。
 */
import {
  correctAction,
  correctOption,
  findClue,
  NORMAL_LINE_HINT,
  type FraudScenario,
} from '../../data/fraud'
import type { CourseStepProps } from '../../simulation/courseFlow'
import { fact, type HelpRequest } from '../../simulation/helpRequest'
import {
  createFlowReducer,
  emptyStats,
  loadStoredFlow,
  normalizeStats,
  readId,
  saveStoredFlow,
  withNotice,
  type FlowActionBase,
  type FlowBase,
  type FlowRules,
} from '../../simulation/flowKit'

export const STEP_TITLES = ['看清情境', '找出可疑点', '选择做法', '安全操作演练', '安全知识小测', '训练完成']

export const CONFIRM_STEP = 4

export const SUCCESS_STEP = 5

export type FlowState = FlowBase & {
  markedClues: string[]
  /** 刚点开的一句为什么可疑/正常，或选对后的肯定说明。 */
  soft: string | null
  actionId: string | null
  drill: string[]
  /** 只保存答对的选项，答错即时解释、允许重选。 */
  answers: Record<string, string>
  certificate: string | null
}

export type ExtraAction =
  | { type: 'inspect'; id: string }
  | { type: 'chooseAction'; id: string }
  | { type: 'drill'; id: string }
  | { type: 'answer'; questionId: string; optionId: string }

export type FlowAction = FlowActionBase | ExtraAction

export type FraudStepProps = CourseStepProps<FlowState, ExtraAction> & {
  scenario: FraudScenario
}

function initialFor(): FlowState {
  return {
    started: false,
    step: 0,
    notice: null,
    noticeSeq: 0,
    help: null,
    helpTier: 1,
    nudge: null,
    nudgeSeq: 0,
    nudgedSteps: [],
    stats: emptyStats(STEP_TITLES),
    markedClues: [],
    soft: null,
    actionId: null,
    drill: [],
    answers: {},
    certificate: null,
  }
}

export function cluesFound(state: FlowState): number {
  return state.markedClues.length
}

export function isCluesComplete(state: FlowState, scenario: FraudScenario): boolean {
  return scenario.clues.every((clue) => state.markedClues.includes(clue.id))
}

export function isActionCorrect(state: FlowState, scenario: FraudScenario): boolean {
  return state.actionId === correctAction(scenario).id
}

export function isDrillComplete(state: FlowState, scenario: FraudScenario): boolean {
  return state.drill.length === scenario.drill.length
}

export function nextDrillStep(state: FlowState, scenario: FraudScenario) {
  return scenario.drill[state.drill.length] ?? null
}

export function isQuizComplete(state: FlowState, scenario: FraudScenario): boolean {
  return scenario.quiz.every((question) => state.answers[question.id] === correctOption(question).id)
}

function certificateFor(scenario: FraudScenario): string {
  let value = 0
  for (let index = 0; index < scenario.code.length; index += 1) {
    value = (value * 31 + scenario.code.charCodeAt(index)) >>> 0
  }
  return `SAFE-${scenario.code}-${`${value % 1000000}`.padStart(6, '0')}`
}

function helpTextFor(state: FlowState, scenario: FraudScenario): string {
  const found = cluesFound(state)
  const remaining = scenario.clues.length - found
  const right = correctAction(scenario)

  switch (state.step) {
    case 0:
      return `先完整读一遍这段${scenario.kind}，不用急着判断。记住三类信号：让您离开官方渠道、让您转钱、向您要验证码或密码。看完点“下一步”，我们一起找破绽。`
    case 1:
      if (remaining === 0) {
        return `几处可疑点都找到了：${scenario.clues.map((clue) => clue.label).join('；')}。点“下一步”，看看遇到这种情况该怎么做。`
      }
      return `先找“要钱、要码、要保密”的地方。已经找到 ${found} 处，还有 ${remaining} 处。点一下句子就会标出来；点到正常句子也没关系，桥桥会告诉您为什么不算。`
    case 2:
      if (state.actionId === right.id) {
        return `您选了“${right.title}”，这是对的。${right.feedback} 点“下一步”做一遍安全操作。`
      }
      return `最安全的做法通常是不在对方给的渠道里操作：先挂断或退出，再用自己手机里的官方入口核实。选一种做法试试，选错了桥桥会解释。`
    case 3: {
      const next = nextDrillStep(state, scenario)
      if (!next) return '安全操作做完了。点“下一步”做两道小测。'
      return `按顺序做安全操作。现在这一步是：“${next.label}”。${next.hint}`
    }
    case 4:
      return '两道题都答对就能完成训练。答错会立刻解释，不扣分，可以重新选。'
    default:
      return `训练完成。遇到拿不准的电话或短信：先挂断、不点链接，再打 96110 咨询；已经转钱就打 110 报警。`
  }
}

function hintTextFor(state: FlowState, scenario: FraudScenario, tier: 1 | 2 | 3): string {
  const detailed = helpTextFor(state, scenario)
  if (tier === 2) return detailed

  if (tier === 1) {
    switch (state.step) {
      case 0:
        return '这一步是“看清情境”。把这段消息完整读一遍，不用急着判断对错。'
      case 1:
        return '这一步是“找出可疑点”。点一下您觉得不对劲的句子，点错了也没关系。'
      case 2:
        return '这一步是“选择做法”。四个做法里，只有一个最安全。'
      case 3:
        return '这一步是“安全操作演练”。按顺序点按钮，不会真的拨号，也不会转钱。'
      case 4:
        return '这一步是“安全知识小测”。两道题都选最安全的那个答案。'
      default:
        return '这一步是“训练完成”。看看下面的要点，记住了再来一次会更稳。'
    }
  }

  const remaining = scenario.clues.length - cluesFound(state)
  let handhold: string
  switch (state.step) {
    case 0:
      handhold = '看完就点“下一步”，我们一起找破绽。'
      break
    case 1:
      handhold =
        remaining > 0
          ? `先找提到“链接、微信、验证码、转账、保密”的句子，点一下试试；还有 ${remaining} 处。`
          : '都找到了，点“下一步”看看该怎么做。'
      break
    case 2:
      handhold = '先排除让您转账、加微信、点链接的选项；剩下那个让您挂断、自己核实的，就是最安全的。'
      break
    case 3:
      handhold = '看哪个按钮写着“现在点这里”，就点哪个；点错了会提醒您先做上一步。'
      break
    case 4:
      handhold = '不确定就选“挂断、不点、不转账”这一类的答案，答错会解释，可以重选。'
      break
    default:
      handhold = '拿不准就打 96110 咨询，已经转钱就打 110 报警。'
  }
  return `${detailed} ${handhold}`
}

function nudgeTextFor(state: FlowState, scenario: FraudScenario): string {
  switch (state.step) {
    case 1:
      return '慢慢看，点一下您觉得可疑的那句话；标错了也没关系，桥桥会解释。'
    case 2:
      return '想一想：哪种做法不让您转账、不给验证码？点它试试。'
    case 3:
      return `按顺序点写着“现在点这里”的按钮，还剩 ${scenario.drill.length - state.drill.length} 步，不会真的拨号。`
    case 4:
      return '两道小题，选最安全的那个答案；答错会解释，可以重选。'
    default:
      return '别着急，先把这段消息完整读一遍，看完点“下一步”。'
  }
}

export function helpPayloadFor(state: FlowState, scenario: FraudScenario): HelpRequest {
  const action = scenario.actions.find((item) => item.id === state.actionId)

  return {
    courseId: scenario.courseId,
    courseTitle: scenario.title,
    step: state.step,
    stepTitle: STEP_TITLES[state.step] ?? '',
    facts: [
      fact('骗局类型', scenario.overview.type),
      fact('渠道', scenario.kind),
      fact('可疑点', `${cluesFound(state)} / ${scenario.clues.length} 处`),
      fact('已选做法', action?.title ?? null),
      fact('安全操作', `${state.drill.length} / ${scenario.drill.length} 步`),
      fact('小测', `${Object.keys(state.answers).length} / ${scenario.quiz.length} 题`),
    ],
    options:
      state.step === 1
        ? scenario.clues.map((clue) => ({ name: clue.label, hint: '可疑点' }))
        : state.step === 2
          ? scenario.actions.map((item) => ({ name: item.title, hint: item.description }))
          : state.step === 4
            ? scenario.quiz.map((question) => ({ name: question.question, hint: '小测题' }))
            : [],
    notice: state.notice,
  }
}

function handleExtra(state: FlowState, scenario: FraudScenario, action: ExtraAction): FlowState | null {
  switch (action.type) {
    case 'inspect': {
      const line = scenario.lines.find((item) => item.id === action.id)
      const clueId = line?.clueId
      if (!clueId) return { ...state, soft: NORMAL_LINE_HINT, notice: null, help: null }
      const marked = state.markedClues.includes(clueId)
      return {
        ...state,
        markedClues: marked
          ? state.markedClues.filter((id) => id !== clueId)
          : [...state.markedClues, clueId],
        soft: marked ? null : findClue(scenario, clueId)?.why ?? null,
        notice: null,
        help: null,
      }
    }
    case 'chooseAction': {
      const choice = scenario.actions.find((item) => item.id === action.id)
      if (!choice) return null
      if (!choice.correct) return { ...withNotice(state, choice.feedback), soft: null }
      return { ...state, actionId: choice.id, notice: null, help: null, soft: choice.feedback }
    }
    case 'drill': {
      const expected = nextDrillStep(state, scenario)
      if (!expected) return state
      if (action.id !== expected.id) {
        return withNotice(state, `先做上一步：“${expected.label}”。${expected.hint}`)
      }
      return { ...state, drill: [...state.drill, action.id], notice: null, help: null, soft: null }
    }
    case 'answer': {
      const question = scenario.quiz.find((item) => item.id === action.questionId)
      const option = question?.options.find((item) => item.id === action.optionId)
      if (!question || !option) return null
      if (!option.correct) {
        return withNotice(state, `这个答案不对。${option.explain}`)
      }
      return {
        ...state,
        answers: { ...state.answers, [question.id]: option.id },
        notice: null,
        help: null,
        soft: option.explain,
      }
    }
    default:
      return null
  }
}

export type FraudFlow = {
  storageKey: string
  initial: FlowState
  reducer: (state: FlowState, action: FlowAction) => FlowState
  load: () => FlowState
  helpPayload: (state: FlowState) => HelpRequest
}

const FLOW_CACHE = new Map<string, FraudFlow>()

export function createFraudFlow(scenario: FraudScenario): FraudFlow {
  const cached = FLOW_CACHE.get(scenario.key)
  if (cached) return cached

  const initial = initialFor()
  const storageKey = `bridgeai:${scenario.courseId}:v1`

  function missingNotice(state: FlowState): string | null {
    switch (state.step) {
      case 1: {
        const remaining = scenario.clues.length - cluesFound(state)
        return remaining > 0
          ? `还有 ${remaining} 处可疑点没找出来。重点看：让您离开官方渠道、让您转钱、向您要验证码或密码的句子。`
          : null
      }
      case 2:
        return isActionCorrect(state, scenario)
          ? null
          : '还没有选对安全做法。想一想：正规机构会不会让您加微信、转钱或要验证码？'
      case 3: {
        const next = nextDrillStep(state, scenario)
        return next ? `安全操作还没做完。下一步是：“${next.label}”。` : null
      }
      case 4: {
        const pending = scenario.quiz.filter((question) => state.answers[question.id] !== correctOption(question).id)
        return pending.length > 0 ? `小测还有第 ${pending.map((question) => question.id.slice(1)).join('、')} 题没答对。答错会解释原因，可以再选。` : null
      }
      default:
        return null
    }
  }

  const rules: FlowRules<FlowState> = {
    titles: STEP_TITLES,
    confirmStep: CONFIRM_STEP,
    successStep: SUCCESS_STEP,
    initial,
    missingNotice,
    helpText: (state) => helpTextFor(state, scenario),
    hintText: (state, tier) => hintTextFor(state, scenario, tier),
    nudgeText: (state) => nudgeTextFor(state, scenario),
    onConfirm: () => ({ certificate: certificateFor(scenario) }),
    onBack: () => ({ certificate: null }),
    reachableStep: (state) => {
      if (!isCluesComplete(state, scenario)) return 1
      if (!isActionCorrect(state, scenario)) return 2
      if (!isDrillComplete(state, scenario)) return 3
      if (!isQuizComplete(state, scenario)) return CONFIRM_STEP
      return SUCCESS_STEP
    },
  }

  const baseReducer = createFlowReducer<FlowState, ExtraAction>(rules, (state, action) =>
    handleExtra(state, scenario, action),
  )

  // 换步或重开时清除上一屏的临时解释，避免带到新步骤
  const reducer = (state: FlowState, action: FlowAction): FlowState => {
    const next = baseReducer(state, action)
    if (action.type === 'next' || action.type === 'prev' || action.type === 'start' || action.type === 'restart' || action.type === 'exit' || action.type === 'dismissHelp') {
      return next.soft === null ? next : { ...next, soft: null }
    }
    return next
  }

  function normalize(raw: Record<string, unknown>): FlowState {
    const clueIds = new Set(scenario.clues.map((clue) => clue.id))
    const markedClues = Array.isArray(raw.markedClues)
      ? Array.from(new Set(raw.markedClues.filter((id): id is string => typeof id === 'string' && clueIds.has(id))))
      : []

    const actionId = readId(raw, 'actionId')
    const action = scenario.actions.find((item) => item.id === actionId && item.correct)

    const rawDrill = Array.isArray(raw.drill) ? raw.drill.filter((id): id is string => typeof id === 'string') : []
    const drill: string[] = []
    for (const step of scenario.drill) {
      if (rawDrill[drill.length] !== step.id) break
      drill.push(step.id)
    }

    const answers: Record<string, string> = {}
    if (typeof raw.answers === 'object' && raw.answers !== null) {
      for (const question of scenario.quiz) {
        const value = (raw.answers as Record<string, unknown>)[question.id]
        if (typeof value === 'string' && value === correctOption(question).id) answers[question.id] = value
      }
    }

    const base: FlowState = {
      ...initial,
      started: raw.started === true,
      markedClues,
      soft: null,
      actionId: action?.id ?? null,
      drill,
      answers,
      certificate: null,
      stats: normalizeStats(raw.stats, STEP_TITLES),
    }

    const limit = rules.reachableStep?.(base) ?? 0
    const certificate = readId(raw, 'certificate')
    const storedStep = typeof raw.step === 'number' && Number.isInteger(raw.step) ? raw.step : 0
    const step =
      storedStep === SUCCESS_STEP && certificate && limit === SUCCESS_STEP
        ? SUCCESS_STEP
        : Math.min(Math.max(storedStep, 0), limit)

    return { ...base, step, certificate: step === SUCCESS_STEP ? certificate : null }
  }

  const flow: FraudFlow = {
    storageKey,
    initial,
    reducer,
    load: () => loadStoredFlow(storageKey, () => initial, normalize),
    helpPayload: (state) => helpPayloadFor(state, scenario),
  }
  FLOW_CACHE.set(scenario.key, flow)
  return flow
}

export function saveFraudFlow(storageKey: string, state: FlowState): void {
  saveStoredFlow(storageKey, state)
}