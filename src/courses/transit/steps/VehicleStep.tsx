import { CAR_TYPES, findCar, findDestination, findMode, isCarAvailable, routesFor, taxiPrice, yuan } from '../../../data/transit'
import { BusIcon, CarIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function VehicleStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  const bus = findMode(state.mode)?.id === 'bus'
  const destination = findDestination(state.destinationId)

  if (bus) {
    return (
      <>
        <StepHeading title="坐哪条线路" hint="点一条线路。写着“直达”的不用换乘。" />
        <OptionGroup
          options={routesFor(state.destinationId).map((route) => ({
            id: route.id,
            title: route.name,
            description: `${route.board} 上车 → ${route.alight} 下车`,
            meta: `约 ${route.minutes} 分钟 · ${yuan(route.price)} · ${route.firstLast}`,
            icon: <BusIcon />,
            unavailable: route.stopped,
            tag: route.stopped ? { text: '今天不停', tone: 'amber' } : undefined,
          }))}
          selectedId={state.routeId}
          onSelect={(id) => dispatch({ type: 'select', field: 'routeId', value: id })}
          onUnavailable={(id) => dispatch({ type: 'blocked', id })}
          note={routesFor(state.destinationId).length === 0 ? '这个目的地暂时没有查询到线路，点上一步换一个目的地试试。' : undefined}
        />
        <NoteCard
          tone="brand"
          title="看清首班车和末班车"
          text="每条线路都有收车时间。赶早班车或晚上回家，先确认“末班”是几点；万一错过，页面一般会给出下一条能坐的线路或打车方案。"
        />
      </>
    )
  }

  const car = findCar(state.carId)

  return (
    <>
      <StepHeading title="要什么样的车" hint="点一种车型，看看预计多少钱、几分钟能到。" />
      <OptionGroup
        options={CAR_TYPES.map((item) => ({
          id: item.id,
          title: item.name,
          description: item.hint,
          meta: isCarAvailable(item)
            ? `约 ${yuan(taxiPrice(item, destination))} · ${item.waitMinutes} 分钟到`
            : '现在约不到 · 要等很久',
          icon: <CarIcon />,
          unavailable: !isCarAvailable(item),
          tag: item.tag && isCarAvailable(item) ? { text: item.tag, tone: 'lagoon' } : undefined,
        }))}
        selectedId={state.carId}
        onSelect={(id) => dispatch({ type: 'select', field: 'carId', value: id })}
        onUnavailable={(id) => dispatch({ type: 'blocked', id })}
      />
      <NoteCard
        tone="brand"
        title="价格为什么会不一样"
        text={
          car
            ? `您选的${car.name}到${destination?.name ?? '目的地'}约 ${yuan(taxiPrice(car, destination))}。打车的钱由里程、时间和当时排队的人多少决定，高峰期会更贵，页面会先写清楚预估价。`
            : '下单前页面会写“预估价”，那是大概要付的钱，实际按里程和时间算。看到价格明显偏高，可以换车型或等几分钟再叫。'
        }
      />
    </>
  )
}
