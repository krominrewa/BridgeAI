import FeatureCard from '../components/FeatureCard'
import PhoneFrame from '../components/PhoneFrame'
import { ArrowRightIcon, ChartIcon, CheckIcon, PhoneIcon, SparkIcon } from '../components/icons'
import { hrefFor } from '../router'

const FEATURES = [
  {
    icon: <PhoneIcon />,
    title: '模拟手机操作',
    description: '在仿真的手机界面里反复练习，点错也不会弄坏手机，不用怕麻烦别人。',
    steps: ['还原真实 App 界面布局', '每个步骤都有高亮提示', '可随时重来，不限次数'],
  },
  {
    icon: <SparkIcon />,
    title: 'AI 智能引导',
    description: '用大白话一步步说明“现在该点哪里、为什么会这样”，看不懂时点一下就能得到解释。',
    steps: ['每一步都有大白话说明', '“我需要帮助”随时给提示', '语音朗读与 AI 追问正在接入'],
  },
  {
    icon: <ChartIcon />,
    title: '学习成果反馈',
    description: '每完成一个场景，都会生成清晰的小结，看得见自己学会了什么、还要练什么。',
    steps: ['完成度与用时一目了然', '出错与求助次数如实记录', '薄弱步骤建议重练'],
  },
]

const PROMISES = ['无需真实账号', '不涉及真实支付', '一步一步跟着做', '出错可以重来']

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-lagoon-50">
        <div
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-lagoon-200/40 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-5 py-2 text-base font-semibold text-brand-700">
              <span className="h-2.5 w-2.5 rounded-full bg-lagoon-500" aria-hidden="true" />
              2026 Qoder 高校创造力大赛 · Hack4Good 技术向善
            </p>

            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
              跨越数字鸿沟，
              <br className="hidden sm:block" />
              让科技
              <span className="bg-gradient-to-r from-brand-600 to-lagoon-500 bg-clip-text text-transparent">
                触手可及
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-soft">
              通过 AI 智能引导与模拟操作，帮助用户掌握日常数字技能。
              在完全仿真的手机界面里练习预约挂号、数字生活服务，安全、无真实账户，也没有支付风险。
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
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

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {PROMISES.map((promise) => (
                <li key={promise} className="flex items-center gap-2 text-lg text-ink-soft">
                  <span className="h-6 w-6 text-lagoon-600">
                    <CheckIcon />
                  </span>
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative" aria-hidden="true">
            <PhoneFrame title="模拟手机预览">
              <div className="px-5 py-6">
                <p className="text-base text-ink-muted">模拟应用</p>
                <p className="mt-1 text-2xl font-bold text-ink">智慧医院</p>
                <div className="mt-5 rounded-2xl border-2 border-brand-200 bg-brand-50 p-4">
                  <p className="text-lg font-semibold text-brand-800">第一步：点这里</p>
                  <p className="mt-1 text-base text-ink-soft">预约挂号</p>
                </div>
                <div className="mt-3 space-y-3">
                  <p className="rounded-2xl bg-brand-50/60 px-4 py-3 text-lg text-ink-soft">门诊缴费</p>
                  <p className="rounded-2xl bg-brand-50/60 px-4 py-3 text-lg text-ink-soft">报告查询</p>
                </div>
                <div className="mt-5 rounded-2xl bg-lagoon-50 p-4">
                  <p className="text-base font-semibold text-lagoon-800">AI 提示</p>
                  <p className="mt-1 text-base leading-relaxed text-ink-soft">
                    别着急，先看清蓝色框住的按钮，慢慢点一下就好。
                  </p>
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-ink sm:text-4xl">三大核心能力，学习更安心</h2>
          <p className="mt-4 text-xl text-ink-soft">
            从“敢点”到“会点”，我们把复杂的手机操作拆成可以反复练习的小步骤。
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="surface-card flex flex-col items-start gap-6 bg-gradient-to-br from-brand-600 to-lagoon-600 text-white sm:flex-row sm:items-center sm:justify-between">
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
