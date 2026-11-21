import { buildDayOptions, findDoctor, findSlot, seatsLeft } from '../../../data/appointment'
import { ClockIcon } from '../../../components/icons'
import OptionGroup, { GroupTitle } from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import TileGroup from '../../../components/simulation/TileGroup'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function ScheduleStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  const doctor = findDoctor(state.doctorId)
  const days = buildDayOptions()
  const slots = (doctor?.slotIds ?? [])
    .map((id) => findSlot(id))
    .filter((slot): slot is NonNullable<typeof slot> => Boolean(slot))

  return (
    <>
      <StepHeading title="选择日期和时间" hint="先点日期，再点时间段。“已约满”的换一个就好。" />

      <GroupTitle index={1} text="哪天去看病？" />
      <TileGroup
        tiles={days.map((day) => ({
          id: day.date,
          title: day.relative || day.weekday,
          subtitle: day.dayLabel,
          note: day.relative ? day.weekday : '可预约',
        }))}
        selectedId={state.date}
        onSelect={(id) => dispatch({ type: 'select', field: 'date', value: id })}
      />

      <GroupTitle index={2} text="几点去看病？" />
      <OptionGroup
        note={state.date ? undefined : '请先在上面选一个日期，这里才会显示可约的时间。'}
        options={slots.map((slot) => {
          const seats = state.date && doctor ? seatsLeft(doctor.id, state.date, slot.id) : 0
          const full = seats === 0
          return {
            id: slot.id,
            title: `${slot.period} ${slot.label}`,
            meta: full ? '这个时间不能选，换一个就好' : undefined,
            icon: <ClockIcon />,
            tag: !state.date
              ? { text: '先选日期', tone: 'neutral' as const }
              : full
                ? { text: '已约满', tone: 'amber' as const }
                : { text: `还剩 ${seats} 个号`, tone: 'lagoon' as const },
            unavailable: !state.date || full,
          }
        })}
        selectedId={state.slotId}
        onSelect={(id) => dispatch({ type: 'select', field: 'slotId', value: id })}
        onUnavailable={() => dispatch({ type: 'unavailableSlot' })}
      />
    </>
  )
}
