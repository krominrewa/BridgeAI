import { departmentsOf, findHospital } from '../../../data/appointment'
import ChoiceButton from '../ChoiceButton'
import StepHeading from '../StepHeading'
import type { StepProps } from '../stepProps'

export default function DepartmentStep({ state, dispatch }: StepProps) {
  const hospital = findHospital(state.hospitalId)
  const departments = departmentsOf(state.hospitalId)

  return (
    <>
      <StepHeading
        title="选择科室"
        hint={`在${hospital?.name ?? '这家医院'}里，按哪里不舒服来选。每项下面都写了看什么病。`}
      />
      <div className="mt-4 space-y-3">
        {departments.map((department) => (
          <ChoiceButton
            key={department.id}
            title={department.name}
            description={department.hint}
            selected={state.departmentId === department.id}
            onClick={() => dispatch({ type: 'select', field: 'departmentId', value: department.id })}
          />
        ))}
      </div>
    </>
  )
}
