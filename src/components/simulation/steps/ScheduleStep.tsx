import { buildDayOptions, findDoctor, findSlot, seatsLeft, type DayOption } from '../../../data/appointment'
import { CheckIcon } from '../../icons'
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
      className={`flex min-h-[84px] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-3 text-center transition-colors duration-150 ${
        selected ? 'border-brand-600 bg-brand-50' : 'border-brand-100 bg-white hover:border-brand-400'
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
      ) : null}
    </button>
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

      <h3 className="mt-5 text-lg font-bold text-ink">第一件事：哪天去看病？</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {days.map((day) => (
          <DayButton
            key={day.date}
            day={day}
            selected={state.date === day.date}
            onClick={() => dispatch({ type: 'select', field: 'date', value: day.date })}
          />
        ))}
      </div>

      <h3 className="mt-6 text-lg font-bold text-ink">第二件事：几点去看病？</h3>
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
              meta={!state.date ? '先选日期' : full ? '已约满，请换其他时间' : `还剩 ${seats} 个号`}
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
