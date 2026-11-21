/**
 * 第二课「数字生活缴费」的状态机：选类型 → 选户号 → 看账单 → 选金额与方式 → 确认 → 缴费成功。
 */
import {
  amountChoices,
  billOf,
  findAccount,
  findMethod,
  findType,
  makeReceiptCode,
  yuan,
  type AmountChoice,
  type Bill,
  type BillTypeId,
} from '../../data/payment'
import { fact, type HelpRequest } from '../../simulation/helpRequest'
import {
  createFlowReducer,
  emptyStats,
  loadStoredFlow,
  normalizeStats,
  readId,
  saveStoredFlow,
  type FlowActionBase,
  type FlowBase,
  type FlowRules,
} from '../../simulation/flowKit'

export const STEP_TITLES = ['选择缴费类型', '选择户号', '查看账单', '选择金额', '确认信息', '缴费成功']

export const TOTAL_STEPS = STEP_TITLES.length

export const CONFIRM_STEP = 4

export const SUCCESS_STEP = 5

export const STORAGE_KEY = 'bridgeai:payment:v1'

export type SelectField = 'typeId' | 'accountId' | 'amountId' | 'methodId'

export type FlowState = FlowBase & {
  typeId: BillTypeId | null
  accountId: string | null
  amountId: string | null
  methodId: string | null
  receiptCode: string | null
}

export type ExtraAction = { type: 'select'; field: SelectField; value: string }

export type FlowAction = FlowActionBase | ExtraAction

export const initialFlowState: FlowState = {
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
  typeId: null,
  accountId: null,
  amountId: null,
  methodId: null,
  receiptCode: null,
}

export function currentBill(state: FlowState): Bill | undefined {
  return state.accountId ? billOf(state.accountId) : undefined
}

export function currentAmount(state: FlowState): AmountChoice | undefined {
  if (!state.amountId) return undefined
  return amountChoices(currentBill(state)).find((item) => item.id === state.amountId)
}

export function missingNotice(state: FlowState): string | null {
  switch (state.step) {
    case 0:
      return state.typeId ? null : '还没有选缴哪种费用。先点一下“电费”“水费”或“燃气费”。'
    case 1:
      return state.accountId ? null : '还没有选户号。户号就是账单上的缴费编号，点一个您家在用的。'
    case 2:
      return null
    case 3:
      if (!state.amountId) return '还没有选缴多少钱。点一个金额，再点“下一步”。'
      if (!state.methodId) return '金额选好了，再点一下用哪种方式缴。'
      return null
    default:
      return null
  }
}

function handleExtra(state: FlowState, action: ExtraAction): FlowState | null {
  if (action.type !== 'select') return null
  const base = { ...state, notice: null, help: null }
  switch (action.field) {
    case 'typeId':
      // 换费用类型后要重新找户号，账单也不同
      return { ...base, typeId: action.value as BillTypeId, accountId: null, amountId: null }
    case 'accountId':
      return { ...base, accountId: action.value, amountId: null }
    case 'amountId':
      return { ...base, amountId: action.value }
    case 'methodId':
      return { ...base, methodId: action.value }
    default:
      return null
  }
}

export function helpText(state: FlowState): string {
  const type = findType(state.typeId)
  const account = findAccount(state.accountId)
  const bill = currentBill(state)
  const amount = currentAmount(state)
  const method = findMethod(state.methodId)

  switch (state.step) {
    case 0:
      return type
        ? `已经选好要缴${type.name}。点下面蓝色的“下一步”，去填户号。想换一种费用，直接点另一张卡片。`
        : '先选缴哪一种：电费、水费还是燃气费。不确定就看家里的单子写着什么，或者想一下这次要缴给哪个单位。点一下卡片，再点“下一步”。'
    case 1:
      if (account) {
        return `户号选好了：${account.no}（${account.label}）。点“下一步”就能看到这个户号的账单。`
      }
      return `这里列出的是${type?.name ?? '这笔费用'}常用的户号，直接点一个就行，不用自己输入。真实生活里户号在${type?.where ?? '缴费单上'}。注意户号不是身份证号，写错了钱就缴到别人家，所以要核对地址。`
    case 2:
      if (!bill) return '先点上一步回去选户号，选好了这里才会显示账单。'
      return `这一页是账单明细，不用选东西，看完直接点“下一步”。${type?.name ?? '这笔费用'}${bill.period}用了 ${bill.usageText}，单价 ${bill.unitPriceText}，应缴 ${yuan(bill.principal)}${
        bill.lateFee > 0 ? `，另外还有逾期违约金 ${yuan(bill.lateFee)}——那是超过“${bill.dueDate}”这个最后期限产生的费用` : ''
      }。以后自己缴，也要先看清这几项再付钱。`
    case 3:
      if (!amount) {
        return bill
          ? `先选缴多少：写着“全额缴纳 ${yuan(bill.principal + bill.lateFee)}”的那一项最省事，一次结清；“预存”是多存一点在户号里，下次自动抵扣。选完再选缴费方式。`
          : '先回去选户号，有了账单才能选金额。'
      }
      if (!method) return `金额选好了：${amount.title}。下面再点一种缴费方式，练习用哪个都一样，不会真的扣钱。`
      return `金额是 ${amount.title}，方式是${method.name}。点“下一步”核对信息，确认无误再点“确认缴费”。`
    case 4:
      return '从上到下核对费用类型、户号、地址和金额。户号和地址一定要对上，不对就点“上一步”回去重选。都没问题点“确认缴费”——这是练习，不会真的扣钱。'
    case 5:
      return '您已经缴完了。下面是模拟缴费凭证和本课小结，凭证号可以截图留底。想再练一遍点“再练一次”。'
    default:
      return '点最下面蓝色的“下一步”继续。漏选了内容会出现黄色提醒，告诉您缺什么、怎么补。'
  }
}

export function helpPayload(state: FlowState): HelpRequest {
  const type = findType(state.typeId)
  const account = findAccount(state.accountId)
  const bill = currentBill(state)
  const amount = currentAmount(state)
  const method = findMethod(state.methodId)

  return {
    courseId: 'payment',
    courseTitle: '数字生活缴费',
    step: state.step,
    stepTitle: STEP_TITLES[state.step] ?? '',
    facts: [
      fact('缴费类型', type?.name ?? null),
      fact('户号', account ? `${account.no}（${account.label}）` : null),
      fact('本期账单', bill ? `${bill.period} ${yuan(bill.principal)}` : null),
      fact('缴费金额', amount?.title ?? null),
      fact('缴费方式', method?.name ?? null),
    ],
    options: state.step === 3 ? amountChoices(bill).map((item) => ({ name: item.title, hint: item.description })) : [],
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
  onConfirm: (state) => ({ receiptCode: makeReceiptCode(state.accountId ?? '', state.amountId ?? '') }),
  onBack: () => ({ receiptCode: null }),
  reachableStep: (state) => {
    if (!state.typeId) return 0
    if (!state.accountId) return 1
    if (!state.amountId || !state.methodId) return 3
    return CONFIRM_STEP
  },
}

export const flowReducer = createFlowReducer<FlowState, ExtraAction>(rules, handleExtra)

function normalize(raw: Record<string, unknown>): FlowState {
  const typeId = readId(raw, 'typeId') as BillTypeId | null
  const account = findAccount(readId(raw, 'accountId'))
  const validType = findType(typeId) ? typeId : null
  const accountId = account && account.typeId === validType ? account.id : null
  const bill = accountId ? billOf(accountId) : undefined
  const amountId = bill && amountChoices(bill).some((item) => item.id === readId(raw, 'amountId')) ? readId(raw, 'amountId') : null
  const methodId = findMethod(readId(raw, 'methodId'))?.id ?? null

  const base: FlowState = {
    ...initialFlowState,
    started: raw.started === true,
    typeId: validType,
    accountId,
    amountId,
    methodId,
    stats: normalizeStats(raw.stats, STEP_TITLES),
  }

  const limit = rules.reachableStep?.(base) ?? 0
  const code = readId(raw, 'receiptCode')
  const storedStep = typeof raw.step === 'number' && Number.isInteger(raw.step) ? raw.step : 0
  const step =
    storedStep === SUCCESS_STEP && code && limit === CONFIRM_STEP ? SUCCESS_STEP : Math.min(Math.max(storedStep, 0), limit)

  return { ...base, step, receiptCode: step === SUCCESS_STEP ? code : null }
}

export function loadFlowState(): FlowState {
  return loadStoredFlow(STORAGE_KEY, () => initialFlowState, normalize)
}

export function saveFlowState(state: FlowState): void {
  saveStoredFlow(STORAGE_KEY, state)
}
