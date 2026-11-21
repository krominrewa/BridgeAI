import SafetyNote from '../../../components/simulation/SafetyNote'
import StepHeading from '../../../components/simulation/StepHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'
import { summaryRows } from '../summary'

export default function ConfirmStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="确认缴费信息" hint="付钱之前再看一遍，尤其是户号和地址。想改点“上一步”。" />
      <SummaryCard rows={summaryRows(state)} title="请核对缴费信息" />
      <SafetyNote text="这是练习：点“确认缴费”不会真的扣钱，也不会向任何单位提交信息。真实缴费时，按下确认键钱就出去了，所以这一步要认真核对。" />
    </>
  )
}
