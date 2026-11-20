import type { ReactNode } from 'react'
import { CheckIcon, LockIcon } from '../icons'

export type ChoiceTag = {
  text: string
  tone: 'brand' | 'lagoon' | 'amber' | 'neutral'
}

const TAG_TONES: Record<ChoiceTag['tone'], string> = {
  brand: 'bg-brand-50 text-brand-800',
  lagoon: 'bg-lagoon-50 text-lagoon-800',
  amber: 'bg-amber-100 text-amber-900',
  neutral: 'bg-paper text-ink-soft',
}

type ChoiceButtonProps = {
  title: string
  description?: string
  meta?: string
  selected: boolean
  unavailable?: boolean
  onClick: () => void
  icon?: ReactNode
  tag?: ChoiceTag
}

export default function ChoiceButton({
  title,
  description,
  meta,
  selected,
  unavailable = false,
  onClick,
  icon,
  tag,
}: ChoiceButtonProps) {
  const shell = unavailable
    ? 'border-dashed border-brand-200 bg-paper'
    : selected
      ? 'border-brand-600 bg-brand-50 shadow-card'
      : 'border-brand-100 bg-white hover:border-brand-400 hover:shadow-card active:scale-[0.99]'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-disabled={unavailable ? true : undefined}
      className={`flex min-h-[76px] w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all duration-150 ${
        unavailable ? 'cursor-not-allowed' : ''
      } ${shell}`}
    >
      <span
        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
          unavailable
            ? 'border-dashed border-brand-300 bg-white text-ink-muted'
            : selected
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-brand-300 bg-white text-transparent'
        }`}
        aria-hidden="true"
      >
        <span className="h-4 w-4">{unavailable ? <LockIcon /> : <CheckIcon />}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {icon ? (
            <span className={`h-6 w-6 shrink-0 ${unavailable ? 'text-ink-muted' : 'text-brand-600'}`} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <span className={`text-xl font-bold leading-snug ${unavailable ? 'text-ink-muted' : 'text-ink'}`}>{title}</span>
          {tag ? <span className={`badge ${TAG_TONES[tag.tone]}`}>{tag.text}</span> : null}
        </span>
        {description ? (
          <span className={`mt-1 block text-base leading-relaxed ${unavailable ? 'text-ink-muted' : 'text-ink-soft'}`}>
            {description}
          </span>
        ) : null}
        {meta ? <span className="mt-1 block text-base font-medium text-ink-muted">{meta}</span> : null}
        {selected ? (
          <span className="mt-1.5 flex items-center gap-1.5 text-base font-bold text-brand-700">
            <span className="h-4 w-4">
              <CheckIcon />
            </span>
            已选择
          </span>
        ) : null}
      </span>
    </button>
  )
}