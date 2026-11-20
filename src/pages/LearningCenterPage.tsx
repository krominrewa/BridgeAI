import CourseCard from '../components/CourseCard'
import BackLink from '../components/BackLink'
import { CalendarIcon, ShieldIcon } from '../components/icons'

const UPCOMING = ['数字生活缴费（水电燃气）', '出行打车与公交查询', '医保与电子凭证查询']

export default function LearningCenterPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
      <BackLink to="home" label="返回首页" />

      <header className="mt-4">
        <p className="flex items-center gap-2 text-lg font-semibold text-lagoon-700">
          <span className="h-6 w-6">
            <CalendarIcon />
          </span>
          第一课已开始
        </p>
        <h1 className="mt-3 text-4xl font-bold text-ink sm:text-5xl">学习中心</h1>
        <p className="mt-4 max-w-3xl text-xl leading-relaxed text-ink-soft">
          选择一门情景课，我们会在仿真的手机界面里，带您一步一步完成操作。练习过程不联网下单、不扣费，可以放心大胆地点。
        </p>
      </header>

      <section className="mt-10">
        <CourseCard
          badge="推荐 · 第一课"
          title="模拟预约挂号"
          summary="从选择医院开始，练习选科室、选医生、挑看病时间，核对信息后看到预约成功页面。共 6 步，每一步都能点“我需要帮助”看提示，完成后有学习小结。全程在模拟界面中完成，出错可随时返回修改。"
          facts={['约 10 分钟', '共 6 个步骤', '无需真实账号']}
        />
      </section>

      <section className="surface-card mt-10 border-lagoon-100 bg-lagoon-50/60">
        <div className="flex items-start gap-4">
          <span className="h-10 w-10 shrink-0 text-lagoon-700">
            <ShieldIcon />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-ink">安全承诺</h2>
            <p className="mt-2 text-lg leading-relaxed text-ink-soft">
              所有课程均为仿真界面练习：不会登录真实账户，不会产生费用，也不会提交任何个人信息。
              练熟之后，再在家人陪伴下尝试真手机，会更从容。
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-ink">正在筹备中的课程</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {UPCOMING.map((course) => (
            <li
              key={course}
              className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-5 py-6 text-lg text-ink-muted"
            >
              {course}
              <span className="mt-2 block text-base text-brand-600">即将上线</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
