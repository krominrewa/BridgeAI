import { ArrowRightIcon, CheckIcon, LockIcon } from './icons'
import { hrefFor } from '../router'

type CourseCardProps = {
  title: string
  summary: string
  badge: string
  facts?: string[]
  steps?: string[]
  intro?: string
  locked?: boolean
}

export default function CourseCard({
  title,
  summary,
  badge,
  facts = [],
  steps = [],
  intro,
  locked = false,
}: CourseCardProps) {
  if (locked) {
    return (
      <article className="h-full rounded-2xl border border-dashed border-brand-200 bg-paper px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold leading-snug text-ink-soft">{title}</h2>
          <span className="badge shrink-0 border border-brand-200 bg-white text-ink-soft">
            <span className="h-4 w-4">
              <LockIcon />
            </span>
            未开放
          </span>
        </div>
        <p className="mt-1.5 text-base leading-relaxed text-ink-muted">{summary}</p>
      </article>
    )
  }

  return (
    <article className="surface-card hover:border-brand-200 hover:shadow-card-hover">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-lagoon-100 text-lagoon-800">
          <span className="h-4 w-4">
            <CheckIcon />
          </span>
          可学习
        </span>
        <span className="badge bg-brand-50 text-brand-800">{badge}</span>
      </div>

      <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink-soft">{summary}</p>

      {facts.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {facts.map((fact) => (
            <li key={fact} className="flex items-center gap-1.5 text-base font-medium text-ink-soft">
              <span className="h-4 w-4 text-lagoon-700">
                <CheckIcon />
              </span>
              {fact}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4">
        <a href={hrefFor('simulation')} className="btn btn-primary w-full justify-center sm:w-auto sm:min-w-[240px]">
          进入模拟训练
          <span className="h-6 w-6">
            <ArrowRightIcon />
          </span>
        </a>
      </div>

      {steps.length > 0 || intro ? (
        <details className="group mt-4 rounded-2xl border border-brand-100 bg-paper px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-lg font-semibold text-brand-700 [&::-webkit-details-marker]:hidden">
            课程介绍与步骤
            <span className="h-5 w-5 shrink-0 transition-transform group-open:rotate-90">
              <ArrowRightIcon />
            </span>
          </summary>
          {intro ? <p className="mt-3 text-base leading-relaxed text-ink-soft">{intro}</p> : null}
          {steps.length > 0 ? (
            <ol aria-label="课程步骤" className="mt-3 grid gap-2 sm:grid-cols-2">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-2 rounded-xl border border-brand-100 bg-white px-3 py-2 text-base font-medium text-ink-soft"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          ) : null}
        </details>
      ) : null}
    </article>
  )
}