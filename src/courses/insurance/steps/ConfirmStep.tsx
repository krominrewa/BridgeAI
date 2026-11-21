import SafetyNote from '../../../components/simulation/SafetyNote'
import StepHeading from '../../../components/simulation/StepHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'
import { summaryRows } from '../summary'

export default function ConfirmStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="出示之前核对一下" hint="看清楚给谁用、在哪个场景用，不对就点“上一步”回去改。" />
      <SummaryCard rows={summaryRows(state)} title="请核对凭证信息" />
      <SafetyNote text="这是练习：点“出示凭证”不会真的查询任何人的医保信息，也不会产生任何记录。真实操作时，凭证只在您自己的手机里。" />
    </>
  )
}
