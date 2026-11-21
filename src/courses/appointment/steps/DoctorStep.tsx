import { doctorsOf } from '../../../data/appointment'
import { UserIcon } from '../../../components/icons'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function DoctorStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="选择医生" hint="点一位医生。挂号费是练习用的数字，不会真扣钱。" />
      <OptionGroup
        options={doctorsOf(state.departmentId).map((doctor) => ({
          id: doctor.id,
          title: doctor.name,
          description: `擅长：${doctor.goodAt}`,
          meta: `${doctor.titleHint} · 模拟挂号费 ${doctor.fee} 元`,
          icon: <UserIcon />,
          tag: { text: doctor.title, tone: 'brand' as const },
        }))}
        selectedId={state.doctorId}
        onSelect={(id) => dispatch({ type: 'select', field: 'doctorId', value: id })}
      />
    </>
  )
}
