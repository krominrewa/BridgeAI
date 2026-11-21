import { findCar, findDestination, findMode, findPickup, taxiPrice, tripDetail, yuan, type CarType, type Destination } from '../../data/transit'
import type { SummaryRow } from '../../components/simulation/SummaryCard'
import { currentRoute, type FlowState } from './state'

export function vehicleText(state: FlowState): string {
  if (state.mode === 'bus') {
    const route = currentRoute(state)
    return route ? `${route.name}（${route.board} → ${route.alight}）` : '未选择'
  }
  const car = findCar(state.carId)
  if (!car) return '未选择'
  return `${car.name} · 预估 ${yuan(taxiPrice(car, findDestination(state.destinationId)))}`
}

function priceText(state: FlowState, car: CarType | undefined, destination: Destination | undefined): string {
  if (state.mode === 'bus') {
    const route = currentRoute(state)
    return route ? `${yuan(route.price)} · ${route.firstLast}` : '未选择'
  }
  return car ? `约 ${yuan(taxiPrice(car, destination))}（高峰期会上浮）` : '未选择'
}

export function minutesText(state: FlowState): string {
  const destination = findDestination(state.destinationId)
  if (!destination) return '未选择'
  const route = currentRoute(state)
  if (state.mode === 'bus') return `约 ${route?.minutes ?? destination.busMinutes} 分钟`
  return `路上约 ${destination.taxiMinutes} 分钟`
}

export function summaryRows(state: FlowState): SummaryRow[] {
  const mode = findMode(state.mode)
  const destination = findDestination(state.destinationId)
  const pickup = findPickup(state.pickupId)
  const car = findCar(state.carId)
  const bus = state.mode === 'bus'

  return [
    { label: '怎么去', value: mode?.name ?? '未选择' },
    { label: '去哪儿', value: destination ? `${destination.name}（${destination.address}）` : '未选择' },
    { label: '到哪个门', value: destination?.gate ?? '未选择' },
    { label: '在哪儿上车', value: pickup ? `${pickup.name} · 走约 ${pickup.walkMinutes} 分钟` : '未选择' },
    { label: bus ? '坐哪条线路' : '叫什么车', value: vehicleText(state) },
    { label: '预计时间', value: minutesText(state) },
    { label: bus ? '票价与首末班' : '预估车费', value: priceText(state, car, destination) },
  ]
}

export function plateInfo(state: FlowState) {
  return tripDetail(state.pickupId ?? '', state.carId ?? state.routeId ?? '', state.destinationId)
}
