import SuccessHeading from '../../../components/simulation/SuccessHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'
import { summaryRows } from '../summary'

export default function SuccessStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <SuccessHeading title="模拟预约成功" lead="您已完整走完一次挂号流程，做得很好！" />

      <SummaryCard rows={summaryRows(state)} title="模拟预约凭证" code={state.bookingCode} />

      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        真实生活里，这一步之后通常会收到短信提醒。练习中不会产生任何真实记录，也不会有人上门或来电。
      </p>
    </>
  )
}
