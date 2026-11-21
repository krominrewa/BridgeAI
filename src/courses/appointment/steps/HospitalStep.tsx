import { HOSPITALS } from '../../../data/appointment'
import { HospitalIcon } from '../../../components/icons'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function HospitalStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="选择医院" hint="点一下您想去的医院。都是虚构的，选错也没关系。" />
      <OptionGroup
        options={HOSPITALS.map((hospital) => ({
          id: hospital.id,
          title: hospital.name,
          description: hospital.hint,
          meta: hospital.address,
          icon: <HospitalIcon />,
        }))}
        selectedId={state.hospitalId}
        onSelect={(id) => dispatch({ type: 'select', field: 'hospitalId', value: id })}
      />
    </>
  )
}
