import SafetyNote from '../../../components/simulation/SafetyNote'
import StepHeading from '../../../components/simulation/StepHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import { findMode } from '../../../data/transit'
import type { ExtraAction, FlowState } from '../state'
import { summaryRows } from '../summary'

export default function ConfirmStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  const bus = findMode(state.mode)?.id === 'bus'
  return (
    <>
      <StepHeading title="确认行程" hint={bus ? '核对线路、上车站和下车站，再看一眼首末班时间。' : '核对去哪儿、在哪儿上车和预估车费。'} />
      <SummaryCard rows={summaryRows(state)} title={bus ? '请核对乘车信息' : '请核对叫车信息'} />
      <SafetyNote
        text={
          bus
            ? '这是练习：点“确认行程”不会真的买票，也不会扣钱。真实乘车时刷交通卡、手机乘车码或投币即可。'
            : '这是练习：点“确认行程”不会真的叫车，不会有车来接您，也不会扣钱。真实下单前，请确认预估价和上车地点。'
        }
      />
    </>
  )
}
