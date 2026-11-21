import NoteCard from '../../../components/simulation/NoteCard'
import SuccessHeading from '../../../components/simulation/SuccessHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'
import { summaryRows } from '../summary'

export default function SuccessStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <SuccessHeading title="模拟缴费成功" lead="您独立完成了一次生活缴费，做得很好！" />

      <SummaryCard rows={summaryRows(state)} title="模拟缴费凭证" code={state.receiptCode} />

      <NoteCard
        tone="lagoon"
        title="缴完之后"
        text="真实缴费会收到短信或电子回执，凭证号留着以防对不上账。如果不想每月操作，可以在正规App里开“自动缴费”，绑定后按期扣款；开之前先确认扣款账户里有钱，也要记得每月看一眼账单。"
      />
    </>
  )
}
