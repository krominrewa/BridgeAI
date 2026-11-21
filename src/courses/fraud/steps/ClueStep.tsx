import { CheckIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import StepHeading from '../../../components/simulation/StepHeading'
import type { FraudStepProps } from '../state'
import { cluesFound, isCluesComplete } from '../state'
import Transcript from '../Transcript'

export default function ClueStep({ scenario, state, dispatch }: FraudStepProps) {
  const found = cluesFound(state)
  const complete = isCluesComplete(state, scenario)

  return (
    <>
      <StepHeading
        title="找出可疑的地方"
        hint={`点一下您觉得不对劲的句子，一共 ${scenario.clues.length} 处。点到正常句子也没关系。`}
      />

      <p className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-lg font-bold text-brand-800">
        <span className="h-5 w-5 shrink-0 text-lagoon-700">
          <CheckIcon />
        </span>
        已找到 {found} / {scenario.clues.length} 处
      </p>

      <Transcript
        scenario={scenario}
        marked={state.markedClues}
        onInspect={(lineId) => dispatch({ type: 'inspect', id: lineId })}
      />

      {state.soft ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 rounded-2xl border-2 border-lagoon-200 bg-lagoon-50 px-4 py-3 text-lg leading-relaxed text-ink"
        >
          {state.soft}
        </div>
      ) : null}

      {complete ? (
        <NoteCard
          tone="brand"
          title="都找到了"
          text="骗子的话术再换花样，通常也离不开这几种：让您离开官方渠道、让您转钱、向您要验证码或密码。点“下一步”选择该怎么做。"
        />
      ) : null}
    </>
  )
}