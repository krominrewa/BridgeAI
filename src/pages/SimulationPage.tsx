import { useEffect, useReducer, useRef } from 'react'
import PhoneFrame from '../components/PhoneFrame'
import BackLink from '../components/BackLink'
import AppointmentFlow from '../components/simulation/AppointmentFlow'
import WelcomeScreen from '../components/simulation/WelcomeScreen'
import { CheckIcon, SparkIcon } from '../components/icons'
import { flowReducer, loadFlowState, saveFlowState } from '../simulation/appointmentState'

const TIPS = [
  '每一步都有大白话说明，告诉您现在该点什么。',
  '看不懂就点“我需要帮助”，会针对您当前这一步给出解释。',
  '选错了不要紧，点“上一步”就能回去改。',
  '练习进度会自动保存，刷新页面可以接着练。',
  '完成后有学习小结：用时、出错次数、需要复习的步骤。',
]

export default function SimulationPage() {
  const [state, dispatch] = useReducer(flowReducer, undefined, loadFlowState)
  const wasStarted = useRef(state.started)

  useEffect(() => {
    saveFlowState(state)
  }, [state])

  // 欢迎页与练习流程切换时，把焦点交给新出现的主要操作，避免键盘焦点丢回页面顶部
  useEffect(() => {
    const justStarted = !wasStarted.current && state.started
    const justExited = wasStarted.current && !state.started
    wasStarted.current = state.started
    if (justStarted) document.getElementById('step-heading')?.focus()
    if (justExited) document.getElementById('start-simulation')?.focus()
  }, [state.started])

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
      <BackLink to="learning" label="返回学习中心" />

      <header className="mt-4">
        <p className="text-lg font-semibold text-lagoon-700">模拟预约挂号 · 第一课</p>
        <h1 className="mt-3 text-4xl font-bold text-ink sm:text-5xl">模拟手机界面</h1>
        <p className="mt-4 max-w-3xl text-xl leading-relaxed text-ink-soft">
          下面是一部练习用的手机。一共 6 步：选医院、选科室、选医生、选时间、确认信息、看到预约成功。
          所有医院和医生都是虚构的，随便点、放心练，不会扣费。
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <PhoneFrame title="模拟手机">
            {state.started ? (
              <AppointmentFlow state={state} dispatch={dispatch} />
            ) : (
              <WelcomeScreen onStart={() => dispatch({ type: 'start' })} />
            )}
          </PhoneFrame>
        </div>

        <aside className="space-y-6">
          <section className="surface-card">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 text-brand-600">
                <SparkIcon />
              </span>
              <h2 className="text-2xl font-bold text-ink">每一步都有说明</h2>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              手机屏幕上方会显示“第几步 / 共 6 步”，下面用大白话说明这一步该做什么。
              漏选了必要内容时，会出现带图标的文字提醒，告诉您缺什么、怎么补。
            </p>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">
              每一步都有“我需要帮助”按钮：点一下就会根据您当前的选择，说明下一步该点哪里。
              提示由稳定的本地规则生成，后续可替换为 AI 模型，不影响练习本身。
            </p>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">
              AI 语音朗读与随时追问解释，将在下一阶段接入。
            </p>
          </section>

          <section className="surface-card border-lagoon-100 bg-lagoon-50/60">
            <h2 className="text-2xl font-bold text-ink">练习小贴士</h2>
            <ul className="mt-4 space-y-3">
              {TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-3 text-lg leading-relaxed text-ink-soft">
                  <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-700">
                    <CheckIcon />
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-card">
            <h2 className="text-2xl font-bold text-ink">当前进度说明</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              第三阶段已完成完整学习闭环：6 步模拟挂号、分步“我需要帮助”提示、
              完成后的学习小结（完成情况、用时、错误操作次数、使用提示次数、需要复习的步骤、再次练习）。
              全部使用虚构数据，不连接真实医院系统，不涉及支付、登录与个人真实信息。
              主要操作支持键盘使用，提示可被读屏软件感知。AI 语音引导将在后续阶段开发。
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
