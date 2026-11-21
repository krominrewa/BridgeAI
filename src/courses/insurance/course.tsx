import PhoneFrame from '../../components/PhoneFrame'
import CourseShell from '../../components/simulation/CourseShell'
import type { CourseEngine, WelcomeContent } from '../../simulation/courseFlow'
import { useCourseFlow } from '../../simulation/courseFlow'
import type { CourseMeta } from '../types'
import ConfirmStep from './steps/ConfirmStep'
import IntroStep from './steps/IntroStep'
import SceneStep from './steps/SceneStep'
import SuccessStep from './steps/SuccessStep'
import UserStep from './steps/UserStep'
import VerifyStep from './steps/VerifyStep'
import {
  CONFIRM_STEP,
  flowReducer,
  helpPayload,
  isVerified,
  loadFlowState,
  STEP_TITLES,
  STORAGE_KEY,
  SUCCESS_STEP,
  type ExtraAction,
  type FlowState,
} from './state'

export const insuranceMeta: CourseMeta = {
  id: 'insurance',
  navLabel: '模拟医保',
  eyebrow: '医保与电子凭证查询 · 第四课',
  title: '医保与电子凭证查询',
  summary: '在仿真手机里出示一次医保凭证：选场景、选使用人、验身份，再查余额和使用记录。',
  facts: ['约 12 分钟', '6 个步骤', '含防骗提醒'],
  intro:
    '先弄明白电子凭证和实体卡的关系，再练习选使用场景、给本人或绑定的家人出示、用短信验证码或刷脸验身份，最后查个人账户余额和最近的使用记录。第 4 步专门讲验证码防骗。',
  steps: STEP_TITLES,
  pageLead:
    '下面是一部练习用的手机。一共 6 步：认识电子凭证、选使用场景、选使用人、验证身份、出示凭证、查余额与记录。账户、编号和记录都是虚构的，不会查询任何真实信息。',
  tips: [
    '验证码、密码、二维码截图，谁要都不能给。',
    '替家人出示前，先确认已经绑定亲情账户。',
    '看不懂就点“我需要帮助”，桥桥会针对您当前这一步给出解释。',
    '“下一步”固定在屏幕底部，不用翻到最下面找。',
    '练习进度会自动保存，刷新页面可以接着练。',
    '完成后有学习小结：用时、出错次数、需要复习的步骤。',
  ],
}

const welcome: WelcomeContent = {
  name: '模拟医保',
  lead: '这是一部练习手机，我是引导助手桥桥。一共 6 步，约 12 分钟。我带您把医保电子凭证出示一次，顺便学会查余额。',
  points: ['看懂电子凭证能做什么', '学会出示凭证、验证身份', '学会查余额和刷卡记录'],
  note: '账户、编号、记录都是虚构的，不会查询任何真实医保信息。',
}

const reportNote =
  '“错误操作”指漏选场景、使用人或验证方式就点“下一步”，以及验证码填错；同一提醒连续重复点击只记 1 次。练习中出错很正常，再练一次会更熟练。'

const VOICE_LINES = [
  '第 1 步，认识电子凭证。它和实体医保卡作用一样，看完点下一步。',
  '第 2 步，选择使用场景。挂号、买药还是结算，点一个。',
  '第 3 步，选择使用人。第一次练习点本人。',
  '第 4 步，验证身份。可以填短信验证码，也可以点开始刷脸。',
  '第 5 步，出示凭证。核对场景和使用人，再点出示凭证。',
  '凭证已出示。下面是模拟二维码、余额和记录。',
]

const engine: CourseEngine<FlowState, ExtraAction> = {
  titles: STEP_TITLES,
  confirmStep: CONFIRM_STEP,
  successStep: SUCCESS_STEP,
  confirmLabel: '出示凭证',
  steps: [IntroStep, SceneStep, UserStep, VerifyStep, ConfirmStep, SuccessStep],
  helpPayload,
  voiceLine: (state) => VOICE_LINES[state.step] ?? VOICE_LINES[0],
  takeaways: ['电子凭证和实体医保卡作用一样', '验证码、密码、二维码谁要都不能给', '替家人出示前先确认已绑定亲情账户'],
  nextCourse: 'fraud-refund',
  tasks: (state) => {
    switch (state.step) {
      case 0:
        return [
          {
            id: 'read',
            text: '把电子凭证和实体卡的关系看一遍',
            done: () => false,
            waiting: '看明白就点“我做好了”，我们实际出示一次。',
          },
        ]
      case 1:
        return [
          {
            id: 'scene',
            text: '点一下这次要做什么：挂号、买药或结算',
            done: (s) => Boolean(s.sceneId),
            waiting: '还没有选场景。第一次练可以点“药店买药”。',
          },
        ]
      case 2:
        return [
          {
            id: 'user',
            text: '选这次给谁用，第一次练点本人',
            done: (s) => Boolean(s.userId),
            waiting: '还没有选使用人。点“本人”那一张。',
          },
        ]
      case 3:
        return [
          {
            id: 'verify',
            text: '用短信验证码或刷脸通过身份验证',
            done: (s) => isVerified(s),
            waiting: '还没有验证通过。先获取验证码并照着输入，或点开始刷脸。',
          },
        ]
      case 4:
        return [
          {
            id: 'review',
            text: '核对场景、使用人和参保地',
            done: () => false,
            waiting: '核对好后，点“出示凭证”。这是练习，不会查询真实医保。',
          },
        ]
      default:
        return []
    }
  },
}

export default function InsuranceCourse() {
  const { state, dispatch } = useCourseFlow(STORAGE_KEY, loadFlowState, flowReducer)

  return (
    <PhoneFrame
      label={insuranceMeta.navLabel}
      title="模拟手机"
      onExit={state.started ? () => dispatch({ type: 'exit' }) : undefined}
    >
      <CourseShell
        courseId="insurance"
        engine={engine}
        welcome={welcome}
        reportNote={reportNote}
        state={state}
        dispatch={dispatch}
      />
    </PhoneFrame>
  )
}
