import { MODES } from '../../../data/transit'
import { BusIcon, CarIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

const MODE_ICONS = {
  taxi: <CarIcon />,
  bus: <BusIcon />,
}

export default function ModeStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="今天怎么去" hint="点一下“打车”或“公交地铁”。两种都练一遍最好。" />
      <OptionGroup
        options={MODES.map((mode) => ({
          id: mode.id,
          title: mode.name,
          description: mode.hint,
          meta: `适合：${mode.when}`,
          icon: MODE_ICONS[mode.id],
        }))}
        selectedId={state.mode}
        onSelect={(id) => dispatch({ type: 'select', field: 'mode', value: id })}
      />
      <NoteCard
        tone="brand"
        title="什么时候值得打车"
        text="赶时间去医院、拎很多东西、下雨天、腿脚不舒服，这几种情况打车更稳妥。不着急、路又近，公交省钱也不用等太久。"
      />
    </>
  )
}
