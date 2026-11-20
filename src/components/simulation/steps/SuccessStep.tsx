import { CheckIcon } from '../../icons'
import { hrefFor } from '../../../router'
import BookingSummary from '../BookingSummary'
import LearningReport from '../LearningReport'
import type { StepProps } from '../stepProps'

export default function SuccessStep({ state }: StepProps) {
  return (
    <>
      <div className="mt-5 flex flex-col items-center text-center">
        <span className="flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-lagoon-600 text-white shadow-card">
          <span className="h-9 w-9">
            <CheckIcon />
          </span>
        </span>
        <h2 id="step-heading" tabIndex={-1} className="mt-3 text-[26px] font-bold leading-snug text-ink">
          模拟预约成功
        </h2>
        <p className="mt-1 text-lg leading-relaxed text-ink-soft">您已完整走完一次挂号流程，做得很好！</p>
      </div>

      <BookingSummary state={state} title="模拟预约凭证" code={state.bookingCode} />

      <LearningReport state={state} />

      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        真实生活里，这一步之后通常会收到短信提醒。练习中不会产生任何真实记录，也不会有人上门或来电。
      </p>

      <a href={hrefFor('learning')} className="btn btn-ghost mt-4 w-full">
        返回学习中心
      </a>
    </>
  )
}