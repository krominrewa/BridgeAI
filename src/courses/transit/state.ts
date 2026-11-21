/**
 * 第三课「出行打车与公交查询」的状态机：
 * 选方式 → 选目的地 → 选上车点 → 选车或线路 → 确认行程 → 出行成功。
 * 打车与公交共用骨架，第 4 步和第 6 步按方式换内容。
 */
import {
  CAR_TYPES,
  DESTINATIONS,
  findCar,
  findDestination,
  findMode,
  findPickup,
  findRoute,
  isCarAvailable,
  MODES,
  routesFor,
  taxiPrice,
  tripDetail,
  yuan,
  type BusRoute,
  type TravelMode,
} from '../../data/transit'
import { fact, type HelpRequest } from '../../simulation/helpRequest'
import {
  createFlowReducer,
  emptyStats,
  loadStoredFlow,
  normalizeStats,
  readId,
  saveStoredFlow,
  withNotice,
  type FlowActionBase,
  type FlowBase,
  type FlowRules,
} from '../../simulation/flowKit'

export const STEP_TITLES = ['选择出行方式', '选择目的地', '选择上车点', '选车或线路', '确认行程', '出行完成']

export const TOTAL_STEPS = STEP_TITLES.length

export const CONFIRM_STEP = 4

export const SUCCESS_STEP = 5

export const STORAGE_KEY = 'bridgeai:transit:v1'

export type SelectField = 'mode' | 'destinationId' | 'pickupId' | 'carId' | 'routeId'

export type FlowState = FlowBase & {
  mode: TravelMode | null
  destinationId: string | null
  pickupId: string | null
  carId: string | null
  routeId: string | null
  tripCode: string | null
}

export type ExtraAction = { type: 'select'; field: SelectField; value: string } | { type: 'blocked'; id: string }

export type FlowAction = FlowActionBase | ExtraAction

export const initialFlowState: FlowState = {
  started: false,
  step: 0,
  notice: null,
  noticeSeq: 0,
  help: null,
  helpTier: 1,
  nudge: null,
  nudgeSeq: 0,
  nudgedSteps: [],
  stats: emptyStats(STEP_TITLES),
  mode: null,
  destinationId: null,
  pickupId: null,
  carId: null,
  routeId: null,
  tripCode: null,
}

export function currentRoute(state: FlowState): BusRoute | undefined {
  return findRoute(state.destinationId, state.routeId)
}

/** 第 4 步的选择是否齐了：打车看车型，公交看线路。 */
function hasVehicle(state: FlowState): boolean {
  if (state.mode === 'taxi') {
    const car = findCar(state.carId)
    return Boolean(car && isCarAvailable(car))
  }
  if (state.mode === 'bus') return Boolean(currentRoute(state))
  return false
}

export function blockedNotice(state: FlowState, id: string): string {
  const pickup = findPickup(id)
  if (pickup?.unsafe) return '这里要横穿马路才能到，不能在马路中间上车。请选小区门口或人行道上的站牌。'
  const car = findCar(id)
  if (car && !isCarAvailable(car)) return `“${car.name}”现在没有同路的车主，等不了太久。选“快车（最常用）”最快能走。`
  const route = routesFor(state.destinationId).find((item) => item.id === id)
  if (route?.stopped) return `“${route.name}”今天这一段不停车，换一条能坐的线路。`
  return '这一项现在选不了，换一个试试。'
}

export function missingNotice(state: FlowState): string | null {
  switch (state.step) {
    case 0:
      return state.mode ? null : '还没有选怎么去。想快一点选“打车”，想省钱选“公交地铁”。'
    case 1:
      return state.destinationId ? null : '还没有选去哪儿。点一个要去的地址。'
    case 2:
      if (!state.pickupId) return '还没有选在哪儿上车。点一个小区门口或站牌。'
      return findPickup(state.pickupId)?.unsafe ? '这个上车点要在马路中间等车，不安全，换一个。' : null
    case 3:
      if (state.mode === 'bus') {
        return state.routeId ? null : '还没有选坐哪条线路。点一条写着“直达”的，最省心。'
      }
      if (!state.carId) return '还没有选要什么样的车。第一次练可以点“快车（最常用）”。'
      return hasVehicle(state) ? null : '这辆车现在约不到，换一个能叫到的车型。'
    default:
      return null
  }
}

function handleExtra(state: FlowState, action: ExtraAction): FlowState | null {
  if (action.type === 'blocked') {
    return withNotice(state, blockedNotice(state, action.id))
  }
  const base = { ...state, notice: null, help: null }
  switch (action.field) {
    case 'mode':
      // 换出行方式后，车型/线路都要重选（打车和公交的选择互不相干）
      return { ...base, mode: action.value as TravelMode, carId: null, routeId: null }
    case 'destinationId':
      return { ...base, destinationId: action.value, routeId: null, carId: null }
    case 'pickupId':
      return { ...base, pickupId: action.value }
    case 'carId':
      return { ...base, carId: action.value, routeId: null }
    case 'routeId':
      return { ...base, routeId: action.value, carId: null }
    default:
      return null
  }
}

export function helpText(state: FlowState): string {
  const mode = findMode(state.mode)
  const destination = findDestination(state.destinationId)
  const pickup = findPickup(state.pickupId)
  const car = findCar(state.carId)
  const route = currentRoute(state)
  const way = mode?.id === 'bus' ? '坐公交' : '打车'

  switch (state.step) {
    case 0:
      return mode
        ? `已经选好${mode.name}。${mode.id === 'taxi' ? '打车门到门最省力，' : '公交便宜但要走到站点，'}点“下一步”选去哪儿。想换方式，直接点另一张卡片。`
        : `先想这次怎么去：${MODES.map((item) => `${item.name}——${item.hint}`).join('；')}。赶时间、拎东西、身体不舒服就打车；不着急、想省钱就坐公交。点一下，再点“下一步”。`
    case 1:
      if (destination) {
        return `目的地选好了：${destination.name}（${destination.address}）。点“下一步”选${way}的上车点。真实生活里最好输到“哪个门”，例如${destination.gate}。`
      }
      return `这里列出几个常去的地方，直接点一个就行，不用自己打字。练习时也可以试着认准“${DESTINATIONS[0].name}”这类全名——${way}时要说清是哪家医院、哪个小区的门。`
    case 2:
      if (pickup) {
        return pickup.unsafe
          ? '这个点要在马路中间等车，不安全。点“上一步”回去，或选小区南门、街口站牌这种人行道上能等的地方。'
          : `上车点选好了：${pickup.name}，从家走过去约 ${pickup.walkMinutes} 分钟。${mode?.id === 'bus' ? '公交要记住站名，别坐反方向。' : '车到了会在约定的地方等您。'}点“下一步”。`
      }
      return mode?.id === 'bus'
        ? '坐公交要走到站牌下等车，选一个人行道边上、有座位或遮雨的站点。别选马路中间的站台，来回穿马路很危险。'
        : '打车要选司机能停、您好找的地方：小区门口、便利店旁、街口站牌都行。不要选马路中间或禁停的路口，司机会被拍，您也不安全。'
    case 3:
      if (state.mode === 'bus') {
        if (!route) {
          return `去${destination?.name ?? '目的地'}有这些线路：${routesFor(state.destinationId)
            .map((item) => `${item.name}（${item.minutes} 分钟，${yuan(item.price)}）`)
            .join('、')}。写着“直达”的不用换乘，最适合练手；写着“不停车”的是今天检修，点了会有提醒。`
        }
        return `线路选好了：${route.name}，从 ${route.board} 上车、${route.alight} 下车，约 ${route.minutes} 分钟，${yuan(route.price)}。注意${route.firstLast}，别错过末班车。点“下一步”。`
      }
      if (!car) {
        return `车型按需要选：${CAR_TYPES.filter(isCarAvailable)
          .map((item) => `${item.name}——${item.hint}`)
          .join('；')}。价格只是练习用的数字，不会真扣钱。`
      }
      return `车选好了：${car.name}，预计 ${yuan(taxiPrice(car, destination))}，${car.waitMinutes} 分钟能到。点“下一步”核对行程。`
    case 4:
      return state.mode === 'bus'
        ? '核对线路、上车站和下车站。看清楚“首班/末班”时间，太晚了就没有车。没问题点“确认行程”——这是练习，不会真的购票。'
        : '核对去哪儿、在哪儿上车、车型和预计费用。都没问题点“确认行程”——这是练习，不会真的叫车，也不会有车来接您。'
    case 5:
      return state.mode === 'bus'
        ? '行程已经生成，下面有乘车提醒。真实坐公交可以刷交通卡、手机乘车码或投币。想再练一遍点“再练一次”。'
        : '车叫到了，下面是车牌和司机信息。真实坐车时，上车前一定要对车牌；还可以用“行程分享”把行程发给家人。想再练一遍点“再练一次”。'
    default:
      return '点最下面蓝色的“下一步”继续。漏选了内容会出现黄色提醒，告诉您缺什么、怎么补。'
  }
}

export function helpPayload(state: FlowState): HelpRequest {
  const mode = findMode(state.mode)
  const destination = findDestination(state.destinationId)
  const pickup = findPickup(state.pickupId)
  const car = findCar(state.carId)
  const route = currentRoute(state)

  const options =
    state.step === 3
      ? state.mode === 'bus'
        ? routesFor(state.destinationId).map((item) => ({ name: item.name, hint: `${item.board} → ${item.alight}，约 ${item.minutes} 分钟` }))
        : CAR_TYPES.map((item) => ({ name: item.name, hint: item.hint }))
      : []

  return {
    courseId: 'transit',
    courseTitle: '出行打车与公交查询',
    step: state.step,
    stepTitle: STEP_TITLES[state.step] ?? '',
    facts: [
      fact('出行方式', mode?.name ?? null),
      fact('目的地', destination ? `${destination.name}（${destination.address}）` : null),
      fact('上车点', pickup?.name ?? null),
      state.mode === 'bus' ? fact('线路', route ? `${route.name}，${route.board} 上车` : null) : fact('车型', car ? `${car.name}，约 ${yuan(taxiPrice(car, destination))}` : null),
    ],
    options,
    notice: state.notice,
  }
}

const rules: FlowRules<FlowState> = {
  titles: STEP_TITLES,
  confirmStep: CONFIRM_STEP,
  successStep: SUCCESS_STEP,
  initial: initialFlowState,
  missingNotice,
  helpText,
  onConfirm: (state) => ({ tripCode: tripDetail(state.pickupId ?? '', state.carId ?? state.routeId ?? '', state.destinationId).code }),
  onBack: () => ({ tripCode: null }),
  reachableStep: (state) => {
    if (!state.mode) return 0
    if (!state.destinationId) return 1
    if (!state.pickupId || findPickup(state.pickupId)?.unsafe) return 2
    if (!hasVehicle(state)) return 3
    return CONFIRM_STEP
  },
}

export const flowReducer = createFlowReducer<FlowState, ExtraAction>(rules, handleExtra)

function normalize(raw: Record<string, unknown>): FlowState {
  const mode = (readId(raw, 'mode') as TravelMode | null) ?? null
  const validMode = mode === 'taxi' || mode === 'bus' ? mode : null
  const destination = findDestination(readId(raw, 'destinationId'))
  const pickup = findPickup(readId(raw, 'pickupId'))
  const car = findCar(readId(raw, 'carId'))
  const routeId = readId(raw, 'routeId')
  const route = destination ? findRoute(destination.id, routeId) : undefined

  const base: FlowState = {
    ...initialFlowState,
    started: raw.started === true,
    mode: validMode,
    destinationId: destination?.id ?? null,
    pickupId: pickup && !pickup.unsafe ? pickup.id : null,
    carId: validMode === 'taxi' && car && isCarAvailable(car) ? car.id : null,
    routeId: validMode === 'bus' && route && !route.stopped ? route.id : null,
    stats: normalizeStats(raw.stats, STEP_TITLES),
  }

  const limit = rules.reachableStep?.(base) ?? 0
  const code = readId(raw, 'tripCode')
  const storedStep = typeof raw.step === 'number' && Number.isInteger(raw.step) ? raw.step : 0
  const step =
    storedStep === SUCCESS_STEP && code && limit === CONFIRM_STEP ? SUCCESS_STEP : Math.min(Math.max(storedStep, 0), limit)

  return { ...base, step, tripCode: step === SUCCESS_STEP ? code : null }
}

export function loadFlowState(): FlowState {
  return loadStoredFlow(STORAGE_KEY, () => initialFlowState, normalize)
}

export function saveFlowState(state: FlowState): void {
  saveStoredFlow(STORAGE_KEY, state)
}
