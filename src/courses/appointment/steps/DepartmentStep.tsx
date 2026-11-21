import { departmentsOf } from '../../../data/appointment'
import { PlusCircleIcon } from '../../../components/icons'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function DepartmentStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="选择科室" hint="按哪里不舒服来选，每项下面写了看什么病。" />
      <OptionGroup
        options={departmentsOf(state.hospitalId).map((department) => ({
          id: department.id,
          title: department.name,
          description: department.hint,
          icon: <PlusCircleIcon />,
        }))}
        selectedId={state.departmentId}
        onSelect={(id) => dispatch({ type: 'select', field: 'departmentId', value: id })}
      />
    </>
  )
}
