import { HOSPITALS } from '../../../data/appointment'
import ChoiceButton from '../ChoiceButton'
import StepHeading from '../StepHeading'
import type { StepProps } from '../stepProps'

export default function HospitalStep({ state, dispatch }: StepProps) {
  return (
    <>
      <StepHeading
        title="选择医院"
        hint="点一下您想去的医院。这三家都是练习用的虚构医院，选错了也没关系。"
      />
      <div className="mt-4 space-y-3">
        {HOSPITALS.map((hospital) => (
          <ChoiceButton
            key={hospital.id}
            title={hospital.name}
            description={hospital.hint}
            meta={hospital.address}
            selected={state.hospitalId === hospital.id}
            onClick={() => dispatch({ type: 'select', field: 'hospitalId', value: hospital.id })}
          />
        ))}
      </div>
    </>
  )
}
