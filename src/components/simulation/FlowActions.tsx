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
    <div className="flex flex-wrap gap-3">
      {step > 0 ? (
        <button type="button" onClick={onPrev} className="btn btn-secondary min-h-[56px] shrink-0 gap-2 px-4 text-lg">
          <span className="h-[20px] w-[20px]">
            <ArrowLeftIcon />
          </span>
          上一步
        </button>
      ) : null}
      <button type="button" onClick={onNext} className="btn btn-primary min-h-[56px] flex-1 gap-2 px-3 text-lg">
        {isConfirm ? '确认预约' : '下一步'}
        <span className="h-[22px] w-[22px]">{isConfirm ? <CheckIcon /> : <ArrowRightIcon />}</span>
      </button>
    </div>
  )
}