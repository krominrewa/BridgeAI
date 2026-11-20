import { CheckIcon } from '../icons'

type ChoiceButtonProps = {
  title: string
  description?: string
  meta?: string
  selected: boolean
  unavailable?: boolean
  onClick: () => void
}

export default function ChoiceButton({
  title,
  description,
  meta,
  selected,
  unavailable = false,
  onClick,
}: ChoiceButtonProps) {
  const border = unavailable
    ? 'border-dashed border-brand-200 bg-brand-50/40'
    : selected
      ? 'border-brand-600 bg-brand-50'
      : 'border-brand-100 bg-white hover:border-brand-400'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-disabled={unavailable ? true : undefined}
      className={`flex min-h-[72px] w-full items-start gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-colors duration-150 ${
        unavailable ? 'cursor-not-allowed' : ''
      } ${border}`}
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-300 bg-white text-transparent'
        }`}
        aria-hidden="true"
      >
        <span className="h-4 w-4">
          <CheckIcon />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <span className={`block text-xl font-semibold leading-snug ${unavailable ? 'text-ink-muted' : 'text-ink'}`}>
          {title}
        </span>
        {description ? <span className="mt-1 block text-base leading-relaxed text-ink-soft">{description}</span> : null}
        {meta ? <span className="mt-1 block text-base font-medium text-ink-muted">{meta}</span> : null}
        {selected ? <span className="mt-1 block text-base font-bold text-brand-700">已选择</span> : null}
      </span>
    </button>
  )
}
