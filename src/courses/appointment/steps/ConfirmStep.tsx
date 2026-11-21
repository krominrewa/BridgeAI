import SafetyNote from '../../../components/simulation/SafetyNote'
import StepHeading from '../../../components/simulation/StepHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'
import { summaryRows } from '../summary'

export default function ConfirmStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="确认预约信息" hint="核对下面的信息，想改就点“上一步”回去重选。" />
      <SummaryCard rows={summaryRows(state)} title="请核对预约信息" />
      <SafetyNote text="这是练习：点“确认预约”不会真的挂号，不会扣钱，也不会提交任何真实信息。" />
    </>
  )
}
