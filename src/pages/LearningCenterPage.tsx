import CourseCard from '../components/CourseCard'
import { CalendarIcon, ShieldIcon } from '../components/icons'
import { COURSE_META, COURSE_ORDER } from '../courses/registry'

export default function LearningCenterPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
      <header>
        <p className="flex items-center gap-2 text-lg font-semibold text-lagoon-700">
          <span className="h-6 w-6">
            <CalendarIcon />
          </span>
          七课已全部开放
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">学习中心</h1>
        <p className="mt-2 max-w-3xl text-lg leading-relaxed text-ink-soft">
          选一节课，在仿真手机里跟着桥桥一步步练。不联网下单、不扣费，放心大胆地点。
        </p>
      </header>

      <section className="mt-6 grid gap-5">
        {COURSE_ORDER.map((course) => {
          const meta = COURSE_META[course]
          return (
            <CourseCard
              key={course}
              course={course}
              badge={meta.eyebrow}
              title={meta.title}
              summary={meta.summary}
              facts={meta.facts}
              steps={meta.steps}
              intro={meta.intro}
            />
          )
        })}
      </section>

      <p className="mt-6 flex items-start gap-3 rounded-2xl border border-lagoon-100 bg-lagoon-50/60 px-4 py-3 text-base leading-relaxed text-ink-soft">
        <span className="mt-0.5 h-5 w-5 shrink-0 text-lagoon-700">
          <ShieldIcon />
        </span>
        安全承诺：所有课程均为仿真练习，不登录真实账户、不产生费用、不提交个人信息。练熟后再在家人陪伴下尝试真手机。
      </p>
    </div>
  )
}
