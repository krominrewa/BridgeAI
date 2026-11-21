/**
 * 出行课程用的虚构数据：目的地、上车点、车型、公交线路与派车结果。
 * 车牌、司机、费用都由起点确定性生成，同一组选择刷新后结果不变。
 */

export type TravelMode = 'taxi' | 'bus'

export type Destination = {
  id: string
  name: string
  address: string
  /** 到了以后去哪儿，用来练习“说清楚是哪个门”。 */
  gate: string
  distanceKm: number
  taxiMinutes: number
  busMinutes: number
}

export type Pickup = {
  id: string
  name: string
  hint: string
  walkMinutes: number
  /** 不能在这里上车（例如路中间），点了只会得到安全提醒。 */
  unsafe?: boolean
}

export type CarType = {
  id: string
  name: string
  hint: string
  /** 预计费用（元）。 */
  price: number
  waitMinutes: number
  tag?: string
}

export type BusRoute = {
  id: string
  name: string
  hint: string
  board: string
  alight: string
  minutes: number
  price: number
  firstLast: string
  /** 该线路当前不可用（例如夜班车已结束）。 */
  stopped?: boolean
}

export const MODES: { id: TravelMode; name: string; hint: string; when: string }[] = [
  { id: 'taxi', name: '打车', hint: '门到门，赶时间、拿东西、身体不舒服时更省力', when: '着急、路远、拎重物、下雨天' },
  { id: 'bus', name: '公交地铁', hint: '便宜、班次固定，适合不赶时间', when: '不着急、想省钱、路程近' },
]

export const DESTINATIONS: Destination[] = [
  {
    id: 'hospital',
    name: '市人民医院',
    address: '健康路 88 号',
    gate: '门诊大楼西门（挂号在大厅左手边）',
    distanceKm: 3.2,
    taxiMinutes: 14,
    busMinutes: 28,
  },
  {
    id: 'clinic',
    name: '阳光里社区卫生服务中心',
    address: '阳光里街 12 号',
    gate: '一楼接种室，门口有无障碍坡道',
    distanceKm: 1.1,
    taxiMinutes: 7,
    busMinutes: 16,
  },
  {
    id: 'market',
    name: '中心农贸市场',
    address: '安康街 66 号',
    gate: '南门菜场入口（早上人最多）',
    distanceKm: 2.4,
    taxiMinutes: 11,
    busMinutes: 22,
  },
  {
    id: 'son',
    name: '儿子家',
    address: '锦绣花园 5 栋 1802',
    gate: '小区北门，进门左手第二单元',
    distanceKm: 8.6,
    taxiMinutes: 24,
    busMinutes: 46,
  },
  {
    id: 'station',
    name: '模拟火车站',
    address: '站前大道 1 号',
    gate: '南进站口（有电梯，离售票厅近）',
    distanceKm: 11.5,
    taxiMinutes: 30,
    busMinutes: 52,
  },
]

export const PICKUPS: Pickup[] = [
  { id: 'south', name: '小区南门 · 花坛旁', hint: '大部分车都在这里等，最好找', walkMinutes: 2 },
  { id: 'north', name: '小区北门 · 便利店门口', hint: '有座位可以等', walkMinutes: 3 },
  { id: 'stop', name: '街口公交站牌下', hint: '打车也能在这儿等，好找', walkMinutes: 5 },
  { id: 'middle', name: '马路中间的公交站', hint: '要横穿两次马路', walkMinutes: 1, unsafe: true },
]

export const CAR_TYPES: CarType[] = [
  { id: 'easy', name: '快车（最常用）', hint: '普通轿车，五座，能放一个行李箱', price: 14.5, waitMinutes: 4, tag: '推荐' },
  { id: 'shared', name: '拼车', hint: '和别人同路，便宜一点但要绕路接人', price: 9.8, waitMinutes: 9 },
  { id: 'taxi', name: '出租车', hint: '打表计费，可以直接上车', price: 18.0, waitMinutes: 6 },
  { id: 'comfort', name: '商务车（空间大）', hint: '座椅高、好上下，适合腿脚不方便或坐轮椅的家属陪同', price: 32.0, waitMinutes: 11 },
  { id: 'carpool', name: '顺风车', hint: '需要车主接单，现在没有同路的车主', price: 8.0, waitMinutes: 40, tag: '暂时没有' },
]

const ROUTES_BY_DEST: Record<string, BusRoute[]> = {
  hospital: [
    { id: 'h-101', name: '101 路（直达）', hint: '不用换乘，上车坐 6 站', board: '阳光里街口', alight: '市人民医院', minutes: 24, price: 2, firstLast: '首班 6:00 / 末班 21:30' },
    { id: 'h-m2', name: '地铁 2 号线 + 步行', hint: '不堵车，出站走 400 米', board: '阳光里站', alight: '健康路站', minutes: 26, price: 3, firstLast: '首班 6:15 / 末班 22:40' },
    { id: 'h-night', name: '夜间 8 路', hint: '只在深夜开行', board: '阳光里街口', alight: '市人民医院', minutes: 30, price: 4, firstLast: '23:00 - 5:00', stopped: true },
  ],
  clinic: [
    { id: 'c-7', name: '7 路（直达）', hint: '两站路，老人卡免费', board: '阳光里街口', alight: '阳光里街', minutes: 9, price: 1, firstLast: '首班 6:10 / 末班 21:00' },
    { id: 'c-3', name: '3 路 + 步行 300 米', hint: '班次密，5 分钟一趟', board: '阳光里北门', alight: '安康街口', minutes: 14, price: 2, firstLast: '首班 5:50 / 末班 22:00' },
  ],
  market: [
    { id: 'm-21', name: '21 路（直达）', hint: '菜场门口就有站，方便拎东西', board: '阳光里街口', alight: '中心市场', minutes: 18, price: 2, firstLast: '首班 5:40 / 末班 20:30' },
    { id: 'm-5', name: '5 路 + 步行 500 米', hint: '车多人多，早高峰慢一点', board: '阳光里北门', alight: '安康街口', minutes: 23, price: 2, firstLast: '首班 6:00 / 末班 21:20' },
  ],
  son: [
    { id: 's-k3', name: 'K3 路（大站快车）', hint: '停站少，最快的一班公交', board: '阳光里街口', alight: '锦绣花园', minutes: 38, price: 3, firstLast: '首班 6:20 / 末班 20:40' },
    { id: 's-m1', name: '地铁 1 号线 + 步行', hint: '要过一次安检，换乘通道有电梯', board: '阳光里站', alight: '锦绣花园站', minutes: 42, price: 4, firstLast: '首班 6:15 / 末班 22:40' },
    { id: 's-88', name: '88 路（区间车）', hint: '这一段今天检修，暂时不停', board: '阳光里北门', alight: '锦绣花园', minutes: 45, price: 2, firstLast: '首班 7:00 / 末班 19:00', stopped: true },
  ],
  station: [
    { id: 't-50', name: '50 路（火车站直达）', hint: '行李多建议坐这个，车下有行李舱', board: '阳光里街口', alight: '火车站南广场', minutes: 44, price: 3, firstLast: '首班 5:30 / 末班 22:00' },
    { id: 't-m2', name: '地铁 2 号线 + 步行 600 米', hint: '不堵车，赶车时最稳', board: '阳光里站', alight: '火车站', minutes: 48, price: 4, firstLast: '首班 6:15 / 末班 22:40' },
  ],
}

const DRIVER_NAMES = ['周师傅', '陈师傅', '吴师傅', '郑师傅', '徐师傅', '何师傅']

function hash(text: string): number {
  let value = 0
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) >>> 0
  }
  return value
}

export function findMode(id: TravelMode | null) {
  return MODES.find((mode) => mode.id === id)
}

export function findDestination(id: string | null): Destination | undefined {
  return DESTINATIONS.find((item) => item.id === id)
}

export function findPickup(id: string | null): Pickup | undefined {
  return PICKUPS.find((item) => item.id === id)
}

export function findCar(id: string | null): CarType | undefined {
  return CAR_TYPES.find((item) => item.id === id)
}

export function routesFor(destinationId: string | null): BusRoute[] {
  return (destinationId && ROUTES_BY_DEST[destinationId]) || []
}

export function findRoute(destinationId: string | null, id: string | null): BusRoute | undefined {
  return routesFor(destinationId).find((route) => route.id === id)
}

/** 车是否约得到：顺风车在练习里固定为“暂时没有车主”。 */
export function isCarAvailable(car: CarType): boolean {
  return car.tag !== '暂时没有'
}

export function yuan(value: number): string {
  return `${value.toFixed(2)} 元`
}

export function taxiPrice(car: CarType, destination: Destination | undefined): number {
  const km = destination?.distanceKm ?? 3
  return Math.round((car.price + km * 2.2) * 10) / 10
}

/** 派车结果：车牌、司机与行程号，由选择确定性生成。 */
export function tripDetail(pickupId: string, carId: string, destinationId: string | null) {
  const seed = hash(`trip|${pickupId}|${carId}|${destinationId}`)
  const letter = 'ABCDEFGH'.charAt(seed % 8)
  const plate = `模拟 ${letter}${1000 + (seed % 8999)}`
  const driver = DRIVER_NAMES[seed % DRIVER_NAMES.length]
  const rating = (4.7 + (seed % 3) / 10).toFixed(1)
  const code = `XC${`${100000 + (seed % 899999)}`}`
  return { plate, driver, rating, code }
}
