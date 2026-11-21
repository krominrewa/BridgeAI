/**
 * 第四课「医保与电子凭证查询」的状态机：
 * 认识凭证 → 选场景 → 选使用人 → 身份验证 → 出示凭证 → 查余额与记录。
 * 第 4 步是第一个需要动手输入的环节（验证码/刷脸），所以专门做了防骗提示。
 */
import {
  evidenceCode,
  findScene,
  findUser,
  makeSmsCode,
  SCENES,
  usableUsers,
  type SceneId,
} from '../../data/insurance'
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

export const STEP_TITLES = ['认识电子凭证', '选择使用场景', '选择使用人', '验证身份', '出示凭证', '余额与记录']

export const TOTAL_STEPS = STEP_TITLES.length

export const CONFIRM_STEP = 4

export const SUCCESS_STEP = 5

export const STORAGE_KEY = 'bridgeai:insurance:v1'

export type VerifyMethod = 'sms' | 'face'

export type SelectField = 'sceneId' | 'userId' | 'verifyMethod'

export type FlowState = FlowBase & {
  sceneId: SceneId | null
  userId: string | null
  verifyMethod: VerifyMethod | null
  sentCode: string | null
  code: string
  verified: boolean
  evidence: string | null
}

export type ExtraAction =
  | { type: 'select'; field: SelectField; value: string }
  | { type: 'sendCode' }
  | { type: 'inputCode'; value: string }
  | { type: 'face' }
  | { type: 'blocked'; id: string }

export type FlowAction = FlowActionBase | ExtraAction

export const initialFlowState: FlowState = {
  started: false,
  step: 0,
  notice: null,
  noticeSeq: 0,
  help: null,
  stats: emptyStats(STEP_TITLES),
  sceneId: null,
  userId: null,
  verifyMethod: null,
  sentCode: null,
  code: '',
  verified: false,
  evidence: null,
}

/** 换场景、换人或换验证方式，之前验证过的结果就作废。 */
function unverified(state: FlowState, patch: Partial<FlowState>): FlowState {
  return { ...state, ...patch, verified: false, sentCode: null, code: '', evidence: null }
}
export function isVerified(state: FlowState): boolean {
  if (!state.verifyMethod) return false
  if (state.verifyMethod === 'face') return state.verified
  return Boolean(state.sentCode && state.code === state.sentCode)
}

export function missingNotice(state: FlowState): string | null {
  switch (state.step) {
    case 0:
      return null
    case 1:
      return state.sceneId ? null : '还没有选要做什么。点一下“医院挂号”“药店买药”这类场景。'
    case 2:
      return state.userId ? null : '还没有选给谁用。第一次练直接点“本人”那一张。'
    case 3:
      if (!state.verifyMethod) return '还没有选怎么验证。填数字选“短信验证码”，想用摄像头选“刷脸”。'
      if (state.verifyMethod === 'face') {
        return state.verified ? null : '还没有刷脸。点“开始刷脸”，把脸对准框子就行。'
      }
      if (!state.sentCode) return '先点“获取验证码”，短信内容会显示在屏幕上。'
      if (!state.code) return `屏幕上那 6 位数字${state.sentCode}还没填进去。点格子，照着数字输入。`
      if (state.code.length < 6) return '验证码是 6 位数字，现在还不足 6 位，再看一下屏幕上的短信。'
      if (state.code !== state.sentCode) return '验证码和屏幕上的短信不一致。数字要一个对一个，注意别把 6 看成 8。'
      return null
    default:
      return null
  }
}

function handleExtra(state: FlowState, action: ExtraAction): FlowState | null {
  switch (action.type) {
    case 'blocked': {
      const user = findUser(action.id)
      return withNotice(
        state,
        user?.unavailable
          ? `“${user.name}”没有和您绑定亲情账户，不能代出示。医保凭证只能本人或已绑定的家人使用，借给别人刷是违规的。`
          : '这一项现在选不了，换一个试试。',
      )
    }
    case 'sendCode': {
      const code = makeSmsCode()
      return { ...state, notice: null, help: null, verifyMethod: 'sms', sentCode: code, code: '', verified: false }
    }
    case 'inputCode': {
      const digits = action.value.replace(/\D/g, '').slice(0, 6)
      return { ...state, notice: null, code: digits, verified: false }
    }
    case 'face':
      return { ...state, notice: null, help: null, verifyMethod: 'face', verified: true, sentCode: null, code: '' }
    case 'select': {
      const base = { ...state, notice: null, help: null }
      switch (action.field) {
        case 'sceneId':
          return unverified(base, { sceneId: action.value as SceneId })
        case 'userId':
          return unverified(base, { userId: action.value })
        case 'verifyMethod':
          return unverified(base, { verifyMethod: action.value as VerifyMethod })
        default:
          return null
      }
    }
    default:
      return null
  }
}

export function helpText(state: FlowState): string {
  const scene = findScene(state.sceneId)
  const user = findUser(state.userId)

  switch (state.step) {
    case 0:
      return '这一页只要看懂一件事：手机里的“医保电子凭证”和手里那张实体卡作用一样，挂号、买药、结算都能用，不用怕忘带卡。看完点“下一步”，我们实际出示一次。'
    case 1:
      if (scene) {
        return `选好“${scene.name}”：在${scene.where}出示就行。${scene.needs}。点“下一步”，决定这次是给谁用。`
      }
      return `先想这次要做什么：${SCENES.map((item) => `${item.name}——${item.hint}`).join('；')}。第一次练推荐点“药店买药”，最简单。选完点“下一步”。`
    case 2:
      if (user) {
        return `使用人是${user.name}（${user.relation}）。${user.note}。点“下一步”验明身份——这一步是为了不让别人冒用您的医保。`
      }
      return `这里能选您自己，也能选已经绑定“亲情账户”的家人。${usableUsers()
        .map((item) => item.relation)
        .join('、')}。要点是：没绑定的亲戚不能代刷，把自己的凭证给别人用也违规。`
    case 3:
      if (!state.verifyMethod) {
        return '医保要确认是您本人，所以出示前会验一次身份。两种方式：短信验证码（手机收到 6 位数字，自己填）或刷脸（对着摄像头）。练习里两个都可以试。'
      }
      if (state.verifyMethod === 'face') {
        return state.verified
          ? '刷脸通过了——练习里点一下就通过。真机上会把脸对准圆框，按提示眨眨眼。点“下一步”出示凭证。'
          : '点“开始刷脸”这个按钮，把脸对准屏幕中间的框，光线亮一点更容易通过。'
      }
      if (!state.sentCode) return '点蓝色的“获取验证码”。练习里短信直接显示在屏幕上，真实手机会收到一条短信。'
      if (!state.code) return `屏幕上的模拟短信写着“您的验证码是 ${state.sentCode}”。点下面的空格，把这 6 个数字照着输进去，再点“下一步”。`
      if (state.code.length < 6) return `已经输了 ${state.code.length} 位，验证码一共 6 位。补齐${state.sentCode ?? ''}剩下的数字。`
      if (state.code !== state.sentCode) return `再对一遍：短信上是 ${state.sentCode}，您填的是 ${state.code}。哪几位不一样就改掉。填错了可以点“清空”重来。`
      return '验证码填对了。记住这条规矩：这 6 个数字只给自己看，谁打电话来要都是骗子，包括自称医保局、银行的。点“下一步”出示凭证。'
    case 4:
      return '核对场景、使用人和参保地都对得上，再点“出示凭证”。真机上屏幕会出现一个二维码，把它对着扫描口，听到“滴”一声就成功了。'
    case 5:
      return '凭证已经出示。下面是模拟二维码、个人账户余额和最近的记录——这几项随时可以在App里查到。看不懂哪一笔，可以点“上一步”回去重看，或记下来问子女。'
    default:
      return '点最下面蓝色的“下一步”继续。漏选了内容会出现黄色提醒，告诉您缺什么、怎么补。'
  }
}

export function helpPayload(state: FlowState): HelpRequest {
  const scene = findScene(state.sceneId)
  const user = findUser(state.userId)

  return {
    courseId: 'insurance',
    courseTitle: '医保与电子凭证查询',
    step: state.step,
    stepTitle: STEP_TITLES[state.step] ?? '',
    facts: [
      fact('使用场景', scene ? `${scene.name}（${scene.where}）` : null),
      fact('使用人', user ? `${user.name} · ${user.relation}` : null),
      fact('验证方式', state.verifyMethod === 'face' ? '刷脸' : state.verifyMethod === 'sms' ? '短信验证码' : null),
      fact('验证状态', isVerified(state) ? '已通过' : '未通过'),
    ],
    options:
      state.step === 1
        ? SCENES.map((item) => ({ name: item.name, hint: item.hint }))
        : state.step === 2
          ? usableUsers().map((item) => ({ name: `${item.name}（${item.relation}）`, hint: item.note }))
          : [],
    notice: state.notice,
  }
}

const rules: FlowRules<FlowState> = {
  titles: STEP_TITLES,
  confirmStep: CONFIRM_STEP,
  successStep: SUCCESS_STEP,
  initial: initialFlowState,
  missingNotice,
  helpText,
  onConfirm: (state) => ({ evidence: evidenceCode(state.userId ?? '', state.sceneId ?? '') }),
  onBack: () => ({ evidence: null }),
  reachableStep: (state) => {
    if (!state.sceneId) return 1
    if (!state.userId) return 2
    if (!isVerified(state)) return 3
    return CONFIRM_STEP
  },
}

export const flowReducer = createFlowReducer<FlowState, ExtraAction>(rules, handleExtra)

function normalize(raw: Record<string, unknown>): FlowState {
  const sceneId = readId(raw, 'sceneId') as SceneId | null
  const user = findUser(readId(raw, 'userId'))
  const method = readId(raw, 'verifyMethod') as VerifyMethod | null
  const sentCode = readId(raw, 'sentCode')
  const code = typeof raw.code === 'string' ? raw.code.replace(/\D/g, '').slice(0, 6) : ''
  const validMethod = method === 'sms' || method === 'face' ? method : null

  const base: FlowState = {
    ...initialFlowState,
    started: raw.started === true,
    sceneId: findScene(sceneId) ? sceneId : null,
    userId: user && !user.unavailable ? user.id : null,
    verifyMethod: validMethod,
    sentCode: validMethod === 'sms' && sentCode && /^\d{6}$/.test(sentCode) ? sentCode : null,
    code: validMethod === 'sms' ? code : '',
    verified: validMethod === 'face' && raw.verified === true,
    stats: normalizeStats(raw.stats, STEP_TITLES),
  }

  const limit = rules.reachableStep?.(base) ?? 0
  const evidence = readId(raw, 'evidence')
  const storedStep = typeof raw.step === 'number' && Number.isInteger(raw.step) ? raw.step : 0
  const step =
    storedStep === SUCCESS_STEP && evidence && limit === CONFIRM_STEP ? SUCCESS_STEP : Math.min(Math.max(storedStep, 0), limit)

  return { ...base, step, evidence: step === SUCCESS_STEP ? evidence : null }
}

export function loadFlowState(): FlowState {
  return loadStoredFlow(STORAGE_KEY, () => initialFlowState, normalize)
}

export function saveFlowState(state: FlowState): void {
  saveStoredFlow(STORAGE_KEY, state)
}
