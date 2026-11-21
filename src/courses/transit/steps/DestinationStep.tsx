import { DESTINATIONS, findMode } from '../../../data/transit'
import { PinIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function DestinationStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  const bus = findMode(state.mode)?.id === 'bus'
  return (
    <>
      <StepHeading title="去哪儿" hint="点一个要去的地址，不用自己打字。" />
      <OptionGroup
        options={DESTINATIONS.map((destination) => ({
          id: destination.id,
          title: destination.name,
          description: destination.address,
          meta: `${destination.distanceKm} 公里 · ${bus ? `公交约 ${destination.busMinutes} 分钟` : `打车约 ${destination.taxiMinutes} 分钟`}`,
          icon: <PinIcon />,
        }))}
        selectedId={state.destinationId}
        onSelect={(id) => dispatch({ type: 'select', field: 'destinationId', value: id })}
      />
      <NoteCard
        tone="brand"
        title="说清楚是哪个门"
        text="同一个地方往往有好几个门口。真实下单时可以把目的地写细一点，比如“市人民医院门诊大楼西门”，司机或站名对得上，就不会在错误的门口互相等。"
      />
    </>
  )
}
