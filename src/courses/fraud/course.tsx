import type { ComponentType } from 'react'
import PhoneFrame from '../../components/PhoneFrame'
import CourseShell from '../../components/simulation/CourseShell'
import { FRAUD_SCENARIOS, type FraudScenario } from '../../data/fraud'
import type { CourseEngine, CourseStepProps, WelcomeContent } from '../../simulation/courseFlow'
import { useCourseFlow } from '../../simulation/courseFlow'
import type { CourseMeta } from '../types'
import {
  CONFIRM_STEP,
  createFraudFlow,
  isActionCorrect,
  isCluesComplete,
  isDrillComplete,
  isQuizComplete,
  STEP_TITLES,
  SUCCESS_STEP,
  type ExtraAction,
  type FlowState,
  type FraudStepProps,
} from './state'
import ActionStep from './steps/ActionStep'
import ClueStep from './steps/ClueStep'
import DrillStep from './steps/DrillStep'
import QuizStep from './steps/QuizStep'
import SceneStep from './steps/SceneStep'
import SuccessStep from './steps/SuccessStep'

export function fraudMeta(scenario: FraudScenario): CourseMeta {
  return {
    id: scenario.courseId,
    navLabel: scenario.navLabel,
    eyebrow: `AI 防骗训练 · ${scenario.lesson}`,
    title: scenario.title,
    summary: scenario.summary,
    facts: ['约 10 分钟', '6 个步骤', `${scenario.clues.length} 处破绽`],
    intro: scenario.intro,
    steps: STEP_TITLES,
    pageLead: `${scenario.transcriptLead} 一共 6 步：看清情境、找出可疑点、选择做法、安全操作演练、安全知识小测、训练完成。所有对话、号码和链接都是虚构的，不会真的拨号，也没有可点击的链接。`,
    tips: [
      '所有对话、号码和链接都是虚构的，练习不会真的拨号或打开网页。',
      '找可疑点时，重点看“离开官方渠道、要钱、要验证码、要保密”这几类信号。',
      '选错做法不会跳过，桥桥会解释风险，可以再选。',
      '看不懂就点“我需要帮助”，桥桥会针对当前这一步解释。',
      '练习进度会自动保存，刷新页面可以接着练。',
    ],
  }
}

const welcomeFor = (scenario: FraudScenario): WelcomeContent => ({
  name: `防骗练习 · ${scenario.navLabel}`,
  lead: scenario.welcomeLead,
  points: scenario.points,
  note: `本课的对话、号码、链接全部虚构，只用于识别练习；不会真的拨打电话，也没有可点击的链接。拿不准就打 96110 咨询。`,
})

const reportNote =
  '“错误操作”指没找齐可疑点、选了有风险的做法、安全操作跳步或小测答错就点“完成训练”；同一条提醒连续重复出现只记 1 次。答错后都会解释原因，改对就能继续。'

function voiceLines(scenario: FraudScenario): string[] {
  return [
    `${scenario.transcriptLead} 先完整看一遍，不用急着判断。`,
    '找出可疑点。点一下可疑的句子，重点看：让您离开官方渠道、让您转钱、向您要验证码或密码的地方。',
    '选择最安全的做法。不在对方给的渠道里操作，先挂断或退出，再用自己知道的官方入口核实。',
    '做一遍安全操作。按顺序点按钮就行，不会真的拨号。',
    '两道小测。答错会解释原因，可以重新选。',
    '训练完成。记住：先挂断、不转账、不点链接，拿不准就打 96110。',
  ]
}

function bindStep(Step: ComponentType<FraudStepProps>, scenario: FraudScenario) {
  return function BoundFraudStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
    return <Step scenario={scenario} state={state} dispatch={dispatch} />
  }
}

const ENGINE_CACHE = new Map<string, CourseEngine<FlowState, ExtraAction>>()

function engineFor(scenario: FraudScenario): CourseEngine<FlowState, ExtraAction> {
  const cached = ENGINE_CACHE.get(scenario.key)
  if (cached) return cached

  const flow = createFraudFlow(scenario)
  const lines = voiceLines(scenario)

  const engine: CourseEngine<FlowState, ExtraAction> = {
    titles: STEP_TITLES,
    confirmStep: CONFIRM_STEP,
    successStep: SUCCESS_STEP,
    confirmLabel: '完成训练',
    steps: [SceneStep, ClueStep, ActionStep, DrillStep, QuizStep, SuccessStep].map((Step) =>
      bindStep(Step as ComponentType<FraudStepProps>, scenario),
    ),
    helpPayload: flow.helpPayload,
    voiceLine: (state) => lines[state.step] ?? lines[0],
    tasks: (state) => {
      switch (state.step) {
        case 1:
          return [
            {
              id: 'clues',
              text: `点出 ${scenario.clues.length} 处可疑的句子`,
              done: (s) => isCluesComplete(s, scenario),
              waiting: `还有 ${scenario.clues.length - state.markedClues.length} 处没找到。重点找让您离开官方渠道、转钱、要验证码的句子。`,
            },
          ]
        case 2:
          return [
            {
              id: 'action',
              text: '选一个最安全的做法',
              done: (s) => isActionCorrect(s, scenario),
              waiting: '还没有选到安全做法。想一想：正规机构会不会让您加微信、转钱或要验证码？',
            },
          ]
        case 3:
          return [
            {
              id: 'drill',
              text: '按顺序做完安全操作',
              done: (s) => isDrillComplete(s, scenario),
              waiting: `安全操作还没做完，还剩 ${scenario.drill.length - state.drill.length} 步。看哪一个按钮写着“现在点这里”。`,
            },
          ]
        case 4:
          return [
            {
              id: 'quiz',
              text: '两道小测都选对',
              done: (s) => isQuizComplete(s, scenario),
              waiting: '还有题没答对。答错会解释原因，可以重新选。',
            },
          ]
        default:
          return []
      }
    },
  }
  ENGINE_CACHE.set(scenario.key, engine)
  return engine
}

function FraudCourse({ scenario }: { scenario: FraudScenario }) {
  const flow = createFraudFlow(scenario)
  const { state, dispatch } = useCourseFlow(flow.storageKey, flow.load, flow.reducer)

  return (
    <PhoneFrame
      label={scenario.navLabel}
      title="模拟手机"
      onExit={state.started ? () => dispatch({ type: 'exit' }) : undefined}
    >
      <CourseShell
        engine={engineFor(scenario)}
        welcome={welcomeFor(scenario)}
        reportNote={reportNote}
        state={state}
        dispatch={dispatch}
      />
    </PhoneFrame>
  )
}

export function FraudRefundCourse() {
  return <FraudCourse scenario={FRAUD_SCENARIOS.refund} />
}

export function FraudOfficialCourse() {
  return <FraudCourse scenario={FRAUD_SCENARIOS.official} />
}

export function FraudSubsidyCourse() {
  return <FraudCourse scenario={FRAUD_SCENARIOS.subsidy} />
}