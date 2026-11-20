import { STEP_TITLES, SUCCESS_STEP, TOTAL_STEPS } from '../../simulation/appointmentState'

type FlowProgressProps = {
  step: number
}

export default function FlowProgress({ step }: FlowProgressProps) {
  const finished = step === SUCCESS_STEP

  return (
    <div className="rounded-2xl bg-brand-50 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1" aria-live="polite">
        <p className="text-lg font-bold text-brand-800">
          {finished ? '全部完成' : `第 ${step + 1} 步 / 共 ${TOTAL_STEPS} 步`}
        </p>
        <p className="text-base font-medium text-ink-soft">{STEP_TITLES[step]}</p>
      </div>
      <ol className="mt-2 flex gap-1" aria-hidden="true">
        {STEP_TITLES.map((title, index) => (
          <li
            key={title}
            className={`h-2 flex-1 rounded-full ${index <= step ? 'bg-brand-600' : 'bg-brand-200'}`}
          />
        ))}
      </ol>
    </div>
  )
}
