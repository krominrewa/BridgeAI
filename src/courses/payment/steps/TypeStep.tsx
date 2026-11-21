import type { ReactNode } from 'react'
import { BILL_TYPES, type BillTypeId } from '../../../data/payment'
import { BoltIcon, FlameIcon, WaterDropIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

const TYPE_ICONS: Record<BillTypeId, ReactNode> = {
  electric: <BoltIcon />,
  water: <WaterDropIcon />,
  gas: <FlameIcon />,
}

export default function TypeStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  return (
    <>
      <StepHeading title="选择要缴的费用" hint="点一下这次要缴哪一种。家里的水电燃气都是这样缴的。" />
      <OptionGroup
        options={BILL_TYPES.map((type) => ({
          id: type.id,
          title: type.name,
          description: type.hint,
          meta: `${type.company} · ${type.cycle}`,
          icon: TYPE_ICONS[type.id],
        }))}
        selectedId={state.typeId}
        onSelect={(id) => dispatch({ type: 'select', field: 'typeId', value: id })}
      />
      <NoteCard
        tone="brand"
        title="为什么要先选类型"
        text="电费、水费、燃气费是三个不同的单位，各有各的户号。选错类型就找不到自家的户号，所以第一步先把这个定下来。"
      />
    </>
  )
}
