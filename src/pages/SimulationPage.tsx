import BackLink from '../components/BackLink'
import { BridgeBuddy, CheckIcon } from '../components/icons'
import { COURSE_META, COURSE_ORDER, COURSE_SCREENS } from '../courses/registry'
import { hrefFor, useLocation } from '../router'

export default function SimulationPage() {
  const { courseId } = useLocation()
  const meta = COURSE_META[courseId]
  const Screen = COURSE_SCREENS[courseId]
  const others = COURSE_ORDER.filter((id) => id !== courseId)

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:mx-auto lg:block lg:max-w-6xl lg:flex-none lg:min-h-[auto] lg:px-5 lg:py-16">
      <h1 className="sr-only lg:hidden">{`${meta.title} · 模拟手机练习`}</h1>

      <div className="hidden lg:block">
        <BackLink to="learning" label="返回学习中心" />
        <header className="mt-3">
          <p className="text-lg font-semibold text-lagoon-700">{meta.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold text-ink sm:text-5xl">模拟手机界面</h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-soft sm:text-xl">{meta.pageLead}</p>
        </header>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:mt-8 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10 lg:flex-none lg:min-h-[auto]">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-none lg:min-h-[auto]">
          <Screen />
        </div>

        <aside className="hidden space-y-6 lg:block">
          <section className="surface-card">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 shrink-0">
                <BridgeBuddy />
              </span>
              <h2 className="text-2xl font-bold text-ink">引导助手「桥桥」</h2>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              每一步都有“我需要帮助”按钮：点一下，桥桥会根据您当前的选择，用大白话说明下一步该点哪里。
              提示由稳定的本地规则生成，界面上也如实标注，不是实时 AI 回答；后续可替换为 AI 模型，不影响练习本身。
            </p>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">
              漏选必要内容时，会出现琥珀色的“请注意”提醒，告诉您缺什么、怎么补；
              桥桥的帮助卡片是青绿色，两者一眼就能分清。
            </p>
          </section>

          <section className="surface-card border-lagoon-100 bg-lagoon-50/60">
            <h2 className="text-2xl font-bold text-ink">练习小贴士</h2>
            <ul className="mt-4 space-y-3">
              {meta.tips.map((tip) => (
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
            <h2 className="text-2xl font-bold text-ink">这部练习手机怎么用</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              屏幕上方显示“第几步 / 共 {meta.steps.length} 步”和{meta.steps.length}个步骤圆点：打勾的是已完成，蓝色的是当前这一步。
              “下一步”和最后那枚确认按钮固定在屏幕底部，列表再长也随时点得到；左上角“退出”可回到欢迎页。
            </p>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">
              完成后会生成模拟凭证和学习小结：完成情况、用时、错误操作次数、使用提示次数、需要复习的步骤，
              并可以一键再练一次。全部使用虚构数据，不连接真实系统，不涉及支付、登录与个人真实信息。
              主要操作支持键盘使用，提示可被读屏软件感知。
            </p>
          </section>

          <section className="surface-card">
            <h2 className="text-2xl font-bold text-ink">换一节课接着练</h2>
            <ul className="mt-4 space-y-3">
              {others.map((id) => (
                <li key={id}>
                  <a
                    href={hrefFor('simulation', id)}
                    className="flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border-2 border-brand-100 bg-white px-4 text-lg font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
                  >
                    {COURSE_META[id].title}
                    <span className="text-base font-normal text-ink-muted">{COURSE_META[id].eyebrow}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
