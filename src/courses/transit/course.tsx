import PhoneFrame from '../../components/PhoneFrame'
import CourseShell from '../../components/simulation/CourseShell'
import type { CourseEngine, WelcomeContent } from '../../simulation/courseFlow'
import { useCourseFlow } from '../../simulation/courseFlow'
import type { CourseMeta } from '../types'
import ConfirmStep from './steps/ConfirmStep'
import DestinationStep from './steps/DestinationStep'
import ModeStep from './steps/ModeStep'
import PickupStep from './steps/PickupStep'
import SuccessStep from './steps/SuccessStep'
import VehicleStep from './steps/VehicleStep'
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

export const transitMeta: CourseMeta = {
  id: 'transit',
  navLabel: '模拟出行',
  eyebrow: '出行打车与公交查询 · 第三课',
  title: '出行打车与公交查询',
  summary: '在仿真手机里练出门：打车选车型、公交认线路，核对上车点与车牌再出发。',
  facts: ['约 12 分钟', '6 个步骤', '两种走法'],
  intro:
    '先决定打车还是坐公交，再练选目的地、挑安全的上车点、看车型与线路的预估时间和费用，核对信息后完成行程。打车分支练“对车牌、分享行程”，公交分支练“认站名、看首末班”。',
  steps: STEP_TITLES,
  pageLead:
    '下面是一部练习用的手机。一共 6 步：选出行方式、选目的地、选上车点、选车或线路、确认行程、看到出行完成。打车和公交可以各练一遍，地址与车辆都是虚构的，不会真的派车。',
  tips: [
    '上车点选人行道上能等的地方，别选马路中间。',
    '打车先看预估价，公交先看首班末班。',
    '看不懂就点“我需要帮助”，桥桥会针对您当前这一步给出解释。',
    '“下一步”固定在屏幕底部，不用翻到最下面找。',
    '练习进度会自动保存，刷新页面可以接着练。',
    '完成后有学习小结：用时、出错次数、需要复习的步骤。',
  ],
}

const welcome: WelcomeContent = {
  name: '模拟出行',
  lead: '这是一部练习手机，我是引导助手桥桥。一共 6 步，约 12 分钟。打车、公交各练一遍，出门就不用麻烦别人了。',
  points: ['学会打车：选地点、看车型', '学会查公交：认线路和首末班', '学会安全习惯：核对车牌、分享行程'],
  note: '地址、车辆、司机全部虚构，不会真的派车，也不会扣钱。',
}

const reportNote =
  '“错误操作”指漏选方式、目的地、上车点或车辆就点“下一步”，以及点了不能等的上车点或约不到的车；同一提醒连续重复点击只记 1 次。练习中出错很正常，再练一次会更熟练。'

const engine: CourseEngine<FlowState, ExtraAction> = {
  titles: STEP_TITLES,
  confirmStep: CONFIRM_STEP,
  successStep: SUCCESS_STEP,
  confirmLabel: '确认行程',
  steps: [ModeStep, DestinationStep, PickupStep, VehicleStep, ConfirmStep, SuccessStep],
  helpPayload,
}

export default function TransitCourse() {
  const { state, dispatch } = useCourseFlow(STORAGE_KEY, loadFlowState, flowReducer)

  return (
    <PhoneFrame
      label={transitMeta.navLabel}
      title="模拟手机"
      onExit={state.started ? () => dispatch({ type: 'exit' }) : undefined}
    >
      <CourseShell engine={engine} welcome={welcome} reportNote={reportNote} state={state} dispatch={dispatch} />
    </PhoneFrame>
  )
}
