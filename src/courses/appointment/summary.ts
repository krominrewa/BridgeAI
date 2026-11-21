import { MOCK_PATIENT, dayText, findDepartment, findDoctor, findHospital, slotText } from '../../data/appointment'
import type { SummaryRow } from '../../components/simulation/SummaryCard'
import type { FlowState } from './state'

export function visitTimeText(state: FlowState): string {
  const dateText = dayText(state.date) ?? state.date ?? '未选择'
  const timeText = slotText(state.slotId)
  return timeText ? `${dateText} ${timeText}` : dateText
}

export function summaryRows(state: FlowState): SummaryRow[] {
  const hospital = findHospital(state.hospitalId)
  const department = findDepartment(state.departmentId)
  const doctor = findDoctor(state.doctorId)

  return [
    { label: '医院', value: hospital?.name ?? '未选择' },
    { label: '科室', value: department?.name ?? '未选择' },
    { label: '医生', value: doctor ? `${doctor.name}（${doctor.title}）` : '未选择' },
    { label: '看病时间', value: visitTimeText(state) },
    { label: '就诊人', value: `${MOCK_PATIENT.name} · ${MOCK_PATIENT.age} 岁（虚构）` },
    { label: '模拟挂号费', value: doctor ? `${doctor.fee} 元（不会真的扣钱）` : '未选择' },
  ]
}
