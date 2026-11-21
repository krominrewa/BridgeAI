import { CheckIcon } from '../../../components/icons'
import SafetyNote from '../../../components/simulation/SafetyNote'
import StepHeading from '../../../components/simulation/StepHeading'
import type { FraudStepProps } from '../state'
import { nextDrillStep } from '../state'

export default function DrillStep({ scenario, state, dispatch }: FraudStepProps) {
  const current = nextDrillStep(state, scenario)

  return (
    <>
      <StepHeading
        title="现在做一遍安全操作"
        hint={`按顺序做完 ${scenario.drill.length} 个动作，点一下按钮就行，不会真的拨号或打开链接。`}
      />

      <ol className="mt-4 space-y-3">
        {scenario.drill.map((step, index) => {
          const done = state.drill.includes(step.id)
          const isCurrent = current?.id === step.id
          return (
            <li key={step.id}>
              <button
                type="button"
                id={`drill-${step.id}`}
                onClick={() => dispatch({ type: 'drill', id: step.id })}
                className={`flex min-h-[76px] w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all duration-150 ${
                  done
                    ? 'border-lagoon-300 bg-lagoon-50'
                    : isCurrent
                      ? 'border-brand-600 bg-brand-50 shadow-card'
                      : 'border-brand-100 bg-white hover:border-brand-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done ? 'bg-lagoon-600 text-white' : 'bg-brand-600 text-white'
                  }`}
                >
                  {done ? (
                    <span className="h-4 w-4">
                      <CheckIcon />
                    </span>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-xl font-bold leading-snug ${done ? 'text-lagoon-900' : 'text-ink'}`}>
                    {step.label}
                  </span>
                  <span className="mt-1 block text-base leading-relaxed text-ink-soft">{step.hint}</span>
                  <span className="mt-1 block text-base font-semibold text-brand-700">
                    {done ? '已完成' : isCurrent ? '现在点这里' : '等前一步做完再点'}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <p className="mt-3 text-lg font-semibold text-ink-soft">
        已完成 {state.drill.length} / {scenario.drill.length} 步
      </p>

      <SafetyNote text="现实中做完这几步，骗局就基本被截断了：不继续通话、不进入对方给的渠道，再用自己知道的官方入口核实。" />
    </>
  )
}