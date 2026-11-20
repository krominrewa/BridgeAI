import CourseCard from '../components/CourseCard'
import { CalendarIcon, ShieldIcon } from '../components/icons'
import { STEP_TITLES } from '../simulation/appointmentState'

const UPCOMING = ['数字生活缴费（水电燃气）', '出行打车与公交查询', '医保与电子凭证查询']

export default function LearningCenterPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
      <header>
        <p className="flex items-center gap-2 text-lg font-semibold text-lagoon-700">
          <span className="h-6 w-6">
            <CalendarIcon />
          </span>
          第一课已开始
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">学习中心</h1>
        <p className="mt-2 max-w-3xl text-lg leading-relaxed text-ink-soft">
          选一节课，在仿真手机里跟着桥桥一步步练。不联网下单、不扣费，放心大胆地点。
        </p>
      </header>

      <section className="mt-6">
        <CourseCard
          badge="第一课 · 情景模拟"
          title="模拟预约挂号"
          summary="在仿真手机里完整练一次挂号：选医院、科室、医生、时间，核对后看到预约成功。"
          facts={['约 10 分钟', '6 个步骤', '无需真实账号']}
          steps={STEP_TITLES}
          intro="从选择医院开始，练习选科室、选医生、挑看病时间，核对信息后看到预约成功页面。每一步都能点“我需要帮助”看提示，出错可随时返回修改，完成后有学习小结。"
        />
      </section>

      <p className="mt-6 flex items-start gap-3 rounded-2xl border border-lagoon-100 bg-lagoon-50/60 px-4 py-3 text-base leading-relaxed text-ink-soft">
        <span className="mt-0.5 h-5 w-5 shrink-0 text-lagoon-700">
          <ShieldIcon />
        </span>
        安全承诺：所有课程均为仿真练习，不登录真实账户、不产生费用、不提交个人信息。练熟后再在家人陪伴下尝试真手机。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink sm:text-2xl">正在筹备中的课程</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {UPCOMING.map((course) => (
            <li key={course} className="h-full">
              <CourseCard locked badge="筹备中" title={course} summary="筹备中 · 开放后无需账号即可练习" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}