import { ArrowRightIcon } from './icons'
import { hrefFor } from '../router'

type CourseCardProps = {
  title: string
  summary: string
  badge: string
  facts: string[]
}

export default function CourseCard({ title, summary, badge, facts }: CourseCardProps) {
  return (
    <article className="surface-card hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-lagoon-50 px-4 py-1.5 text-base font-semibold text-lagoon-800">
          {badge}
        </span>
        <span className="rounded-full bg-brand-50 px-4 py-1.5 text-base font-semibold text-brand-700">
          情景模拟课
        </span>
      </div>

      <h2 className="mt-5 text-3xl font-bold text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{summary}</p>

      <ul className="mt-6 grid gap-4 border-t border-brand-50 pt-6 sm:grid-cols-3">
        {facts.map((fact) => (
          <li key={fact} className="rounded-2xl bg-brand-50/70 px-4 py-3 text-center text-lg font-medium text-brand-800">
            {fact}
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <a href={hrefFor('simulation')} className="btn btn-primary w-full sm:w-auto">
          开始这门课
          <span className="h-6 w-6">
            <ArrowRightIcon />
          </span>
        </a>
      </div>
    </article>
  )
}
