import FeatureCard from '../components/FeatureCard'
import PhoneFrame from '../components/PhoneFrame'
import FlowActions from '../components/simulation/FlowActions'
import FlowProgress from '../components/simulation/FlowProgress'
import HospitalStep from '../components/simulation/steps/HospitalStep'
import { ArrowRightIcon, BridgeBuddy, ChartIcon, CheckIcon, PhoneIcon } from '../components/icons'
import { HOSPITALS } from '../data/appointment'
import { hrefFor } from '../router'
import { initialFlowState } from '../simulation/appointmentState'

const FEATURES = [
  {
    icon: <PhoneIcon />,
    title: '模拟手机操作',
    description: '在仿真的手机界面里反复练习，点错也不会弄坏手机，不用怕麻烦别人。',
    steps: ['还原真实 App 界面布局', '步骤进度与选中状态清楚标出', '可随时重来，不限次数'],
  },
  {
    icon: <BridgeBuddy />,
    title: '引导助手「桥桥」',
    description: '桥桥用大白话告诉您“现在该点哪里、为什么会这样”，看不懂时点一下就能得到解释。',
    steps: ['每一步都有大白话说明', '“我需要帮助”随时给提示', '当前为本地规则提示，后续接入大模型'],
  },
  {
    icon: <ChartIcon />,
    title: '学习成果反馈',
    description: '每完成一个场景，都会生成清晰的小结，看得见自己学会了什么、还要练什么。',
    steps: ['完成度与用时一目了然', '出错与求助次数如实记录', '薄弱步骤建议重练'],
  },
]

const PROMISES = ['无需真实账号', '不涉及真实支付', '一步一步跟着做', '出错可以重来']

const PREVIEW_STATE = { ...initialFlowState, hospitalId: HOSPITALS[0].id }
const noop = () => {}

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 via-white to-lagoon-50">
        <div className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-base font-semibold text-brand-700">
                <span className="h-2.5 w-2.5 rounded-full bg-lagoon-500" aria-hidden="true" />
                2026 Qoder 高校创造力大赛 · Hack4Good 技术向善
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                跨越数字鸿沟，
                <br className="hidden sm:block" />
                让科技<span className="text-brand-700">触手可及</span>
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
                在仿真手机里练习预约挂号等数字生活技能，桥桥用大白话陪您一步步完成。无账号、无支付风险，点错随时重来。
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <a href={hrefFor('learning')} className="btn btn-primary">
                  开始学习
                  <span className="h-6 w-6">
                    <ArrowRightIcon />
                  </span>
                </a>
                <a href={hrefFor('about')} className="btn btn-secondary">
                  了解项目
                </a>
              </div>
            </div>

            <div>
              {/* 预览复用真实练习组件；fieldset disabled 使内部按钮不可聚焦、不可点击 */}
              <div className="pointer-events-none select-none" aria-hidden="true">
                <fieldset disabled className="m-0 min-w-0 border-0 p-0 [&_button:disabled]:opacity-100">
                  <PhoneFrame title="模拟手机预览" preview>
                    <div className="phone-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-4">
                      <FlowProgress step={0} />
                      <HospitalStep state={PREVIEW_STATE} dispatch={noop} />
                    </div>
                    <div className="border-t border-brand-100 bg-white px-4 py-3">
                      <FlowActions step={0} onPrev={noop} onNext={noop} />
                    </div>
                  </PhoneFrame>
                </fieldset>
              </div>
              <p className="mt-3 text-center text-base text-ink-muted">
                真实练习界面预览 · 进入课程后即可动手操作
              </p>
            </div>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex items-center gap-2 text-base text-ink-soft sm:text-lg">
                <span className="h-5 w-5 text-lagoon-600 sm:h-6 sm:w-6">
                  <CheckIcon />
                </span>
                {promise}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">三大核心能力，学习更安心</h2>
          <p className="mt-3 text-lg text-ink-soft sm:text-xl">
            从“敢点”到“会点”，我们把复杂的手机操作拆成可以反复练习的小步骤。
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-12 lg:pb-16">
        <div className="surface-card flex flex-col items-start gap-6 bg-gradient-to-br from-brand-700 to-lagoon-700 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">现在开始，迈出第一步</h2>
            <p className="mt-2 text-lg text-brand-100">
              第一节情景课：模拟预约挂号，约 10 分钟，不需要任何账号。
            </p>
          </div>
          <a
            href={hrefFor('learning')}
            className="inline-flex min-h-[60px] shrink-0 items-center gap-3 rounded-full bg-white px-8 text-xl font-bold text-brand-700 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            进入学习中心
            <span className="h-6 w-6">
              <ArrowRightIcon />
            </span>
          </a>
        </div>
      </section>
    </div>
  )
}