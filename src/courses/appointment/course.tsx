import PhoneFrame from '../../components/PhoneFrame'
import CourseShell from '../../components/simulation/CourseShell'
import type { CourseEngine, WelcomeContent } from '../../simulation/courseFlow'
import { useCourseFlow } from '../../simulation/courseFlow'
import type { CourseMeta } from '../types'
import ConfirmStep from './steps/ConfirmStep'
import DepartmentStep from './steps/DepartmentStep'
import DoctorStep from './steps/DoctorStep'
import HospitalStep from './steps/HospitalStep'
import ScheduleStep from './steps/ScheduleStep'
import SuccessStep from './steps/SuccessStep'
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

export const appointmentMeta: CourseMeta = {
  id: 'appointment',
  navLabel: '模拟挂号',
  eyebrow: '模拟预约挂号 · 第一课',
  title: '模拟预约挂号',
  summary: '在仿真手机里完整练一次挂号：选医院、科室、医生、时间，核对后看到预约成功。',
  facts: ['约 10 分钟', '6 个步骤', '无需真实账号'],
  intro:
    '从选择医院开始，练习选科室、选医生、挑看病时间，核对信息后看到预约成功页面。每一步都能点“我需要帮助”看提示，出错可随时返回修改，完成后有学习小结。',
  steps: STEP_TITLES,
  pageLead:
    '下面是一部练习用的手机。一共 6 步：选医院、选科室、选医生、选时间、确认信息、看到预约成功。所有医院和医生都是虚构的，随便点、放心练，不会扣费。',
  tips: [
    '每一步都有大白话说明，告诉您现在该点什么。',
    '看不懂就点“我需要帮助”，桥桥会针对您当前这一步给出解释。',
    '“下一步”固定在屏幕底部，不用翻到最下面找。',
    '选错了不要紧，点“上一步”就能回去改。',
    '练习进度会自动保存，刷新页面可以接着练。',
    '完成后有学习小结：用时、出错次数、需要复习的步骤。',
  ],
}

const welcome: WelcomeContent = {
  name: '模拟挂号',
  lead: '这是一部练习手机，我是引导助手桥桥。一共 6 步，约 10 分钟，我会带您从头到尾挂一次号。',
  points: ['学会选择医院和科室', '学会选择医生与看病时间', '看懂预约成功的提示'],
  note: '全程使用虚构的医院和医生，不需要账号，也不会扣钱。',
}

const reportNote =
  '“错误操作”指漏选内容就点“下一步”，或点了已约满的时间；同一提醒连续重复点击只记 1 次。练习中出错很正常，再练一次会更熟练。'

const engine: CourseEngine<FlowState, ExtraAction> = {
  titles: STEP_TITLES,
  confirmStep: CONFIRM_STEP,
  successStep: SUCCESS_STEP,
  confirmLabel: '确认预约',
  steps: [HospitalStep, DepartmentStep, DoctorStep, ScheduleStep, ConfirmStep, SuccessStep],
  helpPayload,
}

export default function AppointmentCourse() {
  const { state, dispatch } = useCourseFlow(STORAGE_KEY, loadFlowState, flowReducer)

  return (
    <PhoneFrame
      label={appointmentMeta.navLabel}
      title="模拟手机"
      onExit={state.started ? () => dispatch({ type: 'exit' }) : undefined}
    >
      <CourseShell engine={engine} welcome={welcome} reportNote={reportNote} state={state} dispatch={dispatch} />
    </PhoneFrame>
  )
}
