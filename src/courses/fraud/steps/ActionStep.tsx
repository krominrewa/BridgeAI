import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import { correctAction } from '../../../data/fraud'
import type { FraudStepProps } from '../state'

export default function ActionStep({ scenario, state, dispatch }: FraudStepProps) {
  const right = correctAction(scenario)

  return (
    <>
      <StepHeading
        title="哪一种做法最安全"
        hint="点一种做法。选错了桥桥会解释原因，可以再选。"
      />

      <OptionGroup
        options={scenario.actions.map((action) => ({
          id: action.id,
          title: action.title,
          description: action.description,
        }))}
        selectedId={state.actionId}
        onSelect={(id) => dispatch({ type: 'chooseAction', id })}
      />

      {state.actionId === right.id ? (
        <NoteCard tone="brand" title="这样做是对的" text={state.soft ?? right.feedback} />
      ) : null}
    </>
  )
}