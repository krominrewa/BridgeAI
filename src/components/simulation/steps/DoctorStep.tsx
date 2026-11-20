import { doctorsOf, findDepartment } from '../../../data/appointment'
import { UserIcon } from '../../icons'
import ChoiceButton from '../ChoiceButton'
import StepHeading from '../StepHeading'
import type { StepProps } from '../stepProps'

export default function DoctorStep({ state, dispatch }: StepProps) {
  const department = findDepartment(state.departmentId)
  const doctors = doctorsOf(state.departmentId)

  return (
    <>
      <StepHeading
        title="选择医生"
        hint={`${department?.name ?? '这个科室'}有下面这些医生。挂号费只是练习用的数字，不会真的扣钱。`}
      />
      <div className="mt-3 space-y-3">
        {doctors.map((doctor) => (
          <ChoiceButton
            key={doctor.id}
            title={doctor.name}
            description={`擅长：${doctor.goodAt}`}
            meta={`${doctor.titleHint} · 模拟挂号费 ${doctor.fee} 元`}
            icon={<UserIcon />}
            tag={{ text: doctor.title, tone: 'brand' }}
            selected={state.doctorId === doctor.id}
            onClick={() => dispatch({ type: 'select', field: 'doctorId', value: doctor.id })}
          />
        ))}
      </div>
    </>
  )
}
