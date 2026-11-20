import type { ReactNode } from 'react'

type FeatureCardProps = {
  icon: ReactNode
  title: string
  description: string
  steps: string[]
}

export default function FeatureCard({ icon, title, description, steps }: FeatureCardProps) {
  return (
    <article className="surface-card h-full hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-lagoon-50 text-brand-600">
        <span className="h-9 w-9">{icon}</span>
      </div>
      <h3 className="mt-5 text-2xl font-bold text-ink">{title}</h3>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">{description}</p>
      <ul className="mt-5 space-y-2 border-t border-brand-50 pt-5">
        {steps.map((step) => (
          <li key={step} className="flex items-start gap-3 text-base text-ink-muted">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-lagoon-400" aria-hidden="true" />
            {step}
          </li>
        ))}
      </ul>
    </article>
  )
}
