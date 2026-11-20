import { buildDayOptions, findDoctor, findSlot, seatsLeft, type DayOption } from '../../../data/appointment'
import { CheckIcon, ClockIcon } from '../../icons'
import ChoiceButton from '../ChoiceButton'
import StepHeading from '../StepHeading'
import type { StepProps } from '../stepProps'

type DayButtonProps = {
  day: DayOption
  selected: boolean
  onClick: () => void
}

function DayButton({ day, selected, onClick }: DayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[92px] w-full flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-2 text-center transition-all duration-150 ${
        selected
          ? 'border-brand-600 bg-brand-50 shadow-card'
          : 'border-brand-100 bg-white hover:border-brand-400 hover:shadow-card active:scale-[0.99]'
      }`}
    >
      <span className="text-xl font-bold leading-tight text-ink">{day.relative || day.weekday}</span>
      <span className="text-base leading-tight text-ink-soft">{day.dayLabel}</span>
      {selected ? (
        <span className="flex items-center gap-1 text-base font-bold leading-tight text-brand-700">
          <span className="h-4 w-4">
            <CheckIcon />
          </span>
          已选择
        </span>
      ) : (
        <span className="text-base leading-tight text-ink-muted">{day.relative ? day.weekday : '可预约'}</span>
      )}
    </button>
  )
}

function GroupTitle({ index, text }: { index: number; text: string }) {
  return (
    <h3 className="mt-5 flex items-center gap-2 text-lg font-bold text-ink">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
        {index}
      </span>
      {text}
    </h3>
  )
}

export default function ScheduleStep({ state, dispatch }: StepProps) {
  const doctor = findDoctor(state.doctorId)
  const days = buildDayOptions()
  const slots = (doctor?.slotIds ?? [])
    .map((id) => findSlot(id))
    .filter((slot): slot is NonNullable<typeof slot> => Boolean(slot))

  return (
    <>
      <StepHeading
        title="选择日期和时间"
        hint="先点一个日期，再点一个时间段。写着“已约满”的时间不能选，换一个就好。"
      />

      <GroupTitle index={1} text="哪天去看病？" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {days.map((day) => (
          <DayButton
            key={day.date}
            day={day}
            selected={state.date === day.date}
            onClick={() => dispatch({ type: 'select', field: 'date', value: day.date })}
          />
        ))}
      </div>

      <GroupTitle index={2} text="几点去看病？" />
      {state.date ? null : (
        <p className="mt-2 text-lg leading-relaxed text-ink-soft">请先在上面选一个日期，这里才会显示可约的时间。</p>
      )}
      <div className="mt-3 space-y-3">
        {slots.map((slot) => {
          const seats = state.date && doctor ? seatsLeft(doctor.id, state.date, slot.id) : 0
          const full = seats === 0
          const unavailable = !state.date || full
          return (
            <ChoiceButton
              key={slot.id}
              title={`${slot.period} ${slot.label}`}
              meta={full ? '这个时间不能选，换一个就好' : undefined}
              icon={<ClockIcon />}
              tag={
                !state.date
                  ? { text: '先选日期', tone: 'neutral' }
                  : full
                    ? { text: '已约满', tone: 'amber' }
                    : { text: `还剩 ${seats} 个号`, tone: 'lagoon' }
              }
              selected={state.slotId === slot.id}
              unavailable={unavailable}
              onClick={() => {
                if (unavailable) {
                  dispatch({ type: 'unavailableSlot' })
                  return
                }
                dispatch({ type: 'select', field: 'slotId', value: slot.id })
              }}
            />
          )
        })}
      </div>
    </>
  )
}