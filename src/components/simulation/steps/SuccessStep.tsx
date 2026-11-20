import { CheckIcon } from '../../icons'
import { hrefFor } from '../../../router'
import BookingSummary from '../BookingSummary'
import LearningReport from '../LearningReport'
import type { StepProps } from '../stepProps'

export default function SuccessStep({ state, dispatch }: StepProps) {
  return (
    <>
      <div className="mt-6 flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lagoon-500 text-white">
          <span className="h-9 w-9">
            <CheckIcon />
          </span>
        </span>
        <h2 id="step-heading" tabIndex={-1} className="mt-4 text-3xl font-bold leading-snug text-ink">
          模拟预约成功
        </h2>
        <p className="mt-2 text-lg leading-relaxed text-ink-soft">您已完整走完一次挂号流程，做得很好！</p>
      </div>

      <p className="mt-5 rounded-2xl bg-brand-50 px-4 py-3 text-center text-lg font-bold text-brand-800">
        模拟编号：{state.bookingCode ?? '—'}
      </p>

      <BookingSummary state={state} />

      <LearningReport state={state} />

      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        真实生活里，这一步之后通常会收到短信提醒。练习中不会产生任何真实记录，也不会有人上门或来电。
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <button type="button" onClick={() => dispatch({ type: 'restart' })} className="btn btn-primary w-full">
          再练一次
        </button>
        <button type="button" onClick={() => dispatch({ type: 'prev' })} className="btn btn-secondary w-full">
          返回修改信息
        </button>
        <a href={hrefFor('learning')} className="btn btn-ghost w-full">
          返回学习中心
        </a>
      </div>
    </>
  )
}
