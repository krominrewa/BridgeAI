import PhoneFrame from '../../components/PhoneFrame'
import CourseShell from '../../components/simulation/CourseShell'
import type { CourseEngine, WelcomeContent } from '../../simulation/courseFlow'
import { useCourseFlow } from '../../simulation/courseFlow'
import type { CourseMeta } from '../types'
import AccountStep from './steps/AccountStep'
import AmountStep from './steps/AmountStep'
import BillStep from './steps/BillStep'
import ConfirmStep from './steps/ConfirmStep'
import SuccessStep from './steps/SuccessStep'
import TypeStep from './steps/TypeStep'
import {
  CONFIRM_STEP,
  flowReducer,
  helpPayload,
  loadFlowState,
  STEP_TITLES,
  STORAGE_KEY,
  SUCCESS_STEP,
  type ExtraAction,
  type FlowState,
} from './state'

export const paymentMeta: CourseMeta = {
  id: 'payment',
  navLabel: '模拟缴费',
  eyebrow: '数字生活缴费 · 第二课',
  title: '数字生活缴费',
  summary: '在仿真手机里缴一次水电燃气费：选类型、对户号、看账单、选金额，核对后缴清。',
  facts: ['约 10 分钟', '6 个步骤', '不扣真钱'],
  intro:
    '从选择电费、水费还是燃气费开始，练习找到自家户号、看懂账单明细、分清“全额”和“预存”，核对信息后拿到缴费凭证。每一步都能点“我需要帮助”，完成后有学习小结。',
  steps: STEP_TITLES,
  pageLead:
    '下面是一部练习用的手机。一共 6 步：选缴费类型、选户号、看账单、选金额、确认信息、缴费成功。户号和金额都是虚构的，随便点、放心练，一分钱也不会真扣。',
  tips: [
    '户号不是身份证号，先对地址和户主再往下走。',
    '账单页要看完用量、单价和最后期限，再决定缴多少。',
    '看不懂就点“我需要帮助”，桥桥会针对您当前这一步给出解释。',
    '“下一步”固定在屏幕底部，不用翻到最下面找。',
    '练习进度会自动保存，刷新页面可以接着练。',
    '完成后有学习小结：用时、出错次数、需要复习的步骤。',
  ],
}

const welcome: WelcomeContent = {
  name: '模拟缴费',
  lead: '这是一部练习手机，我是引导助手桥桥。一共 6 步，约 10 分钟，我带您把一笔水电燃气费缴清楚。',
  points: ['学会找到并核对户号', '学会看懂账单和违约金', '分清全额缴纳与预存'],
  note: '户号、地址和金额都是虚构的，不需要账号，绝不会真的扣钱。',
}

const reportNote =
  '“错误操作”指漏选类型、户号、金额或缴费方式就点“下一步”；同一提醒连续重复点击只记 1 次。练习中出错很正常，再练一次会更熟练。'

const engine: CourseEngine<FlowState, ExtraAction> = {
  titles: STEP_TITLES,
  confirmStep: CONFIRM_STEP,
  successStep: SUCCESS_STEP,
  confirmLabel: '确认缴费',
  steps: [TypeStep, AccountStep, BillStep, AmountStep, ConfirmStep, SuccessStep],
  helpPayload,
}

export default function PaymentCourse() {
  const { state, dispatch } = useCourseFlow(STORAGE_KEY, loadFlowState, flowReducer)

  return (
    <PhoneFrame
      label={paymentMeta.navLabel}
      title="模拟手机"
      onExit={state.started ? () => dispatch({ type: 'exit' }) : undefined}
    >
      <CourseShell engine={engine} welcome={welcome} reportNote={reportNote} state={state} dispatch={dispatch} />
    </PhoneFrame>
  )
}
