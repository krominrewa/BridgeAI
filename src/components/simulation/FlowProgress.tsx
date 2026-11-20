import { STEP_TITLES, SUCCESS_STEP, TOTAL_STEPS } from '../../simulation/appointmentState'
import { CheckIcon } from '../icons'

type FlowProgressProps = {
  step: number
}

export default function FlowProgress({ step }: FlowProgressProps) {
  const finished = step === SUCCESS_STEP

  return (
    <div className="rounded-2xl border border-brand-100 bg-white px-[12px] py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1" aria-live="polite">
        <p className="text-lg font-bold text-brand-800">
          {finished ? '全部完成' : `第 ${step + 1} 步 / 共 ${TOTAL_STEPS} 步`}
        </p>
        <p className="text-base font-semibold text-ink-soft">{STEP_TITLES[step]}</p>
      </div>
      <ol className="mt-2.5 flex items-center gap-[4px]" aria-hidden="true">
        {STEP_TITLES.map((title, index) => {
          const done = index < step || finished
          const current = index === step && !finished
          return (
            <li key={title} className="flex flex-1 items-center gap-[4px]">
              <span
                className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
                  done
                    ? 'bg-lagoon-600 text-white'
                    : current
                      ? 'bg-brand-600 text-white ring-2 ring-brand-200'
                      : 'border-2 border-brand-200 bg-white text-ink-muted'
                }`}
              >
                {done ? (
                  <span className="h-[16px] w-[16px]">
                    <CheckIcon />
                  </span>
                ) : (
                  index + 1
                )}
              </span>
              {index < STEP_TITLES.length - 1 ? (
                <span className={`h-0.5 flex-1 rounded-full ${done ? 'bg-lagoon-300' : 'bg-brand-100'}`} />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}