import { findMode, PICKUPS } from '../../../data/transit'
import { WalkIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function PickupStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  const bus = findMode(state.mode)?.id === 'bus'
  return (
    <>
      <StepHeading title={bus ? '在哪一站等车' : '在哪儿上车'} hint="选一个人行道上能等、司机或司机一眼能看到您的地方。" />
      <OptionGroup
        options={PICKUPS.map((pickup) => ({
          id: pickup.id,
          title: pickup.name,
          description: pickup.hint,
          meta: `从家走约 ${pickup.walkMinutes} 分钟${pickup.unsafe ? ' · 不建议' : ''}`,
          icon: <WalkIcon />,
          unavailable: pickup.unsafe,
          tag: pickup.unsafe ? { text: '不安全', tone: 'amber' } : undefined,
        }))}
        selectedId={state.pickupId}
        onSelect={(id) => dispatch({ type: 'select', field: 'pickupId', value: id })}
        onUnavailable={(id) => dispatch({ type: 'blocked', id })}
      />
      <NoteCard
        tone="amber"
        title="为什么不在路中间等"
        text={
          bus
            ? '过马路要走红斑马线，等车站在人行道里侧。车来了先看站牌上的方向，坐反了要多花一倍时间。'
            : '马路中间、路口转弯处、公交专用道都是禁停区：司机会被罚，您也要在车流里穿行。宁可多走两分钟到小区门口。'
        }
      />
    </>
  )
}
