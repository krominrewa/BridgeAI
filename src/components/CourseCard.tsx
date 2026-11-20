import { ArrowRightIcon, CheckIcon, LockIcon } from './icons'
import { hrefFor } from '../router'

type CourseCardProps = {
  title: string
  summary: string
  badge: string
  facts?: string[]
  steps?: string[]
  locked?: boolean
}

export default function CourseCard({ title, summary, badge, facts = [], steps = [], locked = false }: CourseCardProps) {
  if (locked) {
    return (
      <article className="surface-card h-full border-dashed border-brand-200 bg-paper shadow-none">
        <span className="badge border border-brand-200 bg-white text-ink-soft">
          <span className="h-4 w-4">
            <LockIcon />
          </span>
          未开放
        </span>
        <h2 className="mt-4 text-2xl font-bold text-ink-soft">{title}</h2>
        <p className="mt-2 text-lg leading-relaxed text-ink-muted">{summary}</p>
        <p className="mt-4 text-base text-ink-muted">{badge} · 开放后无需账号即可练习</p>
      </article>
    )
  }

  return (
    <article className="surface-card hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover">
      <div className="flex flex-wrap items-center gap-3">
        <span className="badge bg-lagoon-50 text-lagoon-800">{badge}</span>
        <span className="badge bg-brand-50 text-brand-800">情景模拟课</span>
        <span className="badge bg-lagoon-100 text-lagoon-800">
          <span className="h-4 w-4">
            <CheckIcon />
          </span>
          可学习
        </span>
      </div>

      <h2 className="mt-5 text-3xl font-bold text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{summary}</p>

      {steps.length > 0 ? (
        <ol aria-label="课程步骤预览" className="mt-6 flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <li
              key={step}
              className="flex items-center gap-2 rounded-full border border-brand-100 bg-paper px-3 py-1.5 text-base font-medium text-ink-soft"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      ) : null}

      {facts.length > 0 ? (
        <ul className="mt-6 grid gap-4 border-t border-brand-50 pt-6 sm:grid-cols-3">
          {facts.map((fact) => (
            <li key={fact} className="rounded-2xl bg-brand-50/70 px-4 py-3 text-center text-lg font-medium text-brand-800">
              {fact}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-7">
        <a href={hrefFor('simulation')} className="btn btn-primary w-full justify-center sm:w-auto sm:min-w-[260px]">
          进入模拟训练
          <span className="h-6 w-6">
            <ArrowRightIcon />
          </span>
        </a>
      </div>
    </article>
  )
}