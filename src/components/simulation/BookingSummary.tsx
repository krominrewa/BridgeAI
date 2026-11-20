import {
  MOCK_PATIENT,
  dayText,
  findDepartment,
  findDoctor,
  findHospital,
  slotText,
} from '../../data/appointment'
import { TicketIcon } from '../icons'
import type { FlowState } from '../../simulation/appointmentState'

function visitTimeText(state: FlowState): string {
  const dateText = dayText(state.date) ?? state.date ?? '未选择'
  const timeText = slotText(state.slotId)
  return timeText ? `${dateText} ${timeText}` : dateText
}

type BookingSummaryProps = {
  state: FlowState
  title?: string
  code?: string | null
}

export default function BookingSummary({ state, title, code }: BookingSummaryProps) {
  const hospital = findHospital(state.hospitalId)
  const department = findDepartment(state.departmentId)
  const doctor = findDoctor(state.doctorId)

  const rows = [
    { label: '医院', value: hospital?.name ?? '未选择' },
    { label: '科室', value: department?.name ?? '未选择' },
    { label: '医生', value: doctor ? `${doctor.name}（${doctor.title}）` : '未选择' },
    { label: '看病时间', value: visitTimeText(state) },
    { label: '就诊人', value: `${MOCK_PATIENT.name} · ${MOCK_PATIENT.age} 岁（虚构）` },
    { label: '模拟挂号费', value: doctor ? `${doctor.fee} 元（不会真的扣钱）` : '未选择' },
  ]

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border-2 border-brand-100 bg-white">
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 bg-brand-50 px-4 py-2.5">
          <p className="flex items-center gap-2 text-lg font-bold text-brand-800">
            <span className="h-6 w-6 shrink-0">
              <TicketIcon />
            </span>
            {title}
          </p>
          <span className="badge bg-white text-brand-800">练习专用</span>
        </div>
      ) : null}
      {code ? (
        <p className="border-b border-dashed border-brand-200 px-4 py-3 text-[22px] font-bold tracking-wide text-ink">
          {code}
        </p>
      ) : null}
      <dl className="divide-y divide-brand-50">
        {rows.map((row) => (
          <div key={row.label} className="px-4 py-2.5">
            <dt className="text-base text-ink-muted">{row.label}</dt>
            <dd className="mt-0.5 text-lg font-semibold leading-snug text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}