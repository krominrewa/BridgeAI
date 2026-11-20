import { ShieldIcon } from '../../icons'
import BookingSummary from '../BookingSummary'
import StepHeading from '../StepHeading'
import type { StepProps } from '../stepProps'

export default function ConfirmStep({ state }: StepProps) {
  return (
    <>
      <StepHeading
        title="确认预约信息"
        hint="请核对下面的信息。想改哪一项，点“上一步”回去重新选就可以。"
      />
      <BookingSummary state={state} title="请核对预约信息" />
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-lagoon-200 bg-lagoon-50 px-4 py-3">
        <span className="mt-0.5 h-6 w-6 shrink-0 text-lagoon-700">
          <ShieldIcon />
        </span>
        <p className="text-base leading-relaxed text-ink-soft">
          这是练习：点“确认预约”不会真的挂号，不会扣钱，也不会提交任何真实信息。
        </p>
      </div>
    </>
  )
}
