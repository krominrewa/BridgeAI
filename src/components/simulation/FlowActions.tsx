import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { CONFIRM_STEP } from '../../simulation/appointmentState'

type FlowActionsProps = {
  step: number
  onPrev: () => void
  onNext: () => void
}

export default function FlowActions({ step, onPrev, onNext }: FlowActionsProps) {
  const isConfirm = step === CONFIRM_STEP

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button type="button" onClick={onNext} className="btn btn-primary w-full">
        {isConfirm ? '确认预约' : '下一步'}
        <span className="h-6 w-6">{isConfirm ? <CheckIcon /> : <ArrowRightIcon />}</span>
      </button>
      {step > 0 ? (
        <button type="button" onClick={onPrev} className="btn btn-secondary w-full">
          <span className="h-6 w-6">
            <ArrowLeftIcon />
          </span>
          上一步
        </button>
      ) : null}
    </div>
  )
}
