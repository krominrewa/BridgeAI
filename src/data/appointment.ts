export type Hospital = {
  id: string
  name: string
  address: string
  hint: string
}

export type Department = {
  id: string
  hospitalId: string
  name: string
  hint: string
}

export type Doctor = {
  id: string
  departmentId: string
  name: string
  title: string
  titleHint: string
  goodAt: string
  fee: number
  slotIds: string[]
}

export type TimeSlot = {
  id: string
  label: string
  period: '上午' | '下午'
}

export type DayOption = {
  date: string
  dayLabel: string
  weekday: string
  relative: string
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'h-city',
    name: '模拟市第一人民医院',
    address: '模拟市健康路 1 号',
    hint: '科室齐全，适合第一次练习',
  },
  {
    id: 'h-tcm',
    name: '模拟市中医院',
    address: '模拟市安康街 26 号',
    hint: '想用中药调理身体时选这里',
  },
  {
    id: 'h-community',
    name: '模拟阳光社区卫生服务中心',
    address: '模拟市阳光里 8 号',
    hint: '离家近，看常见小病、开药',
  },
]

export const DEPARTMENTS: Department[] = [
  { id: 'd-city-nei', hospitalId: 'h-city', name: '内科', hint: '感冒、发烧、咳嗽、肚子不舒服' },
  { id: 'd-city-wai', hospitalId: 'h-city', name: '外科', hint: '摔伤、伤口、需要开刀的问题' },
  { id: 'd-city-gu', hospitalId: 'h-city', name: '骨科', hint: '骨头、关节、腰腿疼痛' },
  { id: 'd-tcm-nei', hospitalId: 'h-tcm', name: '中医内科', hint: '喝中药调理身体、慢性毛病' },
  { id: 'd-tcm-zhen', hospitalId: 'h-tcm', name: '针灸推拿科', hint: '脖子、肩膀、腰腿酸痛' },
  { id: 'd-tcm-lao', hospitalId: 'h-tcm', name: '老年病科', hint: '年纪大、几种慢性病一起看' },
  { id: 'd-com-quan', hospitalId: 'h-community', name: '全科', hint: '常见小病、开药、量血压' },
  { id: 'd-com-yu', hospitalId: 'h-community', name: '预防保健科', hint: '打疫苗、体检方面的咨询' },
]

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-li',
    departmentId: 'd-city-nei',
    name: '李建国',
    title: '主任医师',
    titleHint: '看病经验最丰富',
    goodAt: '长期咳嗽、气管和肺方面的毛病',
    fee: 30,
    slotIds: ['am1', 'am2', 'pm1'],
  },
  {
    id: 'dr-wang',
    departmentId: 'd-city-nei',
    name: '王淑芳',
    title: '副主任医师',
    titleHint: '经验很丰富',
    goodAt: '肠胃不舒服、血压血糖调理',
    fee: 20,
    slotIds: ['am2', 'am3', 'pm2'],
  },
  {
    id: 'dr-chen',
    departmentId: 'd-city-wai',
    name: '陈明远',
    title: '主任医师',
    titleHint: '看病经验最丰富',
    goodAt: '伤口处理、腹部开刀相关问题',
    fee: 30,
    slotIds: ['am1', 'am3', 'pm1'],
  },
  {
    id: 'dr-zhao',
    departmentId: 'd-city-wai',
    name: '赵秀兰',
    title: '主治医师',
    titleHint: '常见病症都能看',
    goodAt: '小伤口换药、体表包块',
    fee: 12,
    slotIds: ['am2', 'pm2', 'pm3'],
  },
  {
    id: 'dr-zhou',
    departmentId: 'd-city-gu',
    name: '周天佑',
    title: '主任医师',
    titleHint: '看病经验最丰富',
    goodAt: '关节疼痛、骨质疏松',
    fee: 30,
    slotIds: ['am1', 'am2', 'pm3'],
  },
  {
    id: 'dr-wu',
    departmentId: 'd-city-gu',
    name: '吴桂英',
    title: '副主任医师',
    titleHint: '经验很丰富',
    goodAt: '腰腿疼、颈椎不舒服',
    fee: 20,
    slotIds: ['am3', 'pm1', 'pm2'],
  },
  {
    id: 'dr-zheng',
    departmentId: 'd-tcm-nei',
    name: '郑海涛',
    title: '主任医师',
    titleHint: '看病经验最丰富',
    goodAt: '中药调理睡眠、脾胃虚弱',
    fee: 30,
    slotIds: ['am1', 'am2', 'am3'],
  },
  {
    id: 'dr-sun',
    departmentId: 'd-tcm-nei',
    name: '孙丽华',
    title: '主治医师',
    titleHint: '常见病症都能看',
    goodAt: '体虚怕冷、季节性调理',
    fee: 12,
    slotIds: ['pm1', 'pm2', 'pm3'],
  },
  {
    id: 'dr-ma',
    departmentId: 'd-tcm-zhen',
    name: '马文斌',
    title: '副主任医师',
    titleHint: '经验很丰富',
    goodAt: '针灸缓解肩颈腰腿痛',
    fee: 20,
    slotIds: ['am2', 'am3', 'pm1'],
  },
  {
    id: 'dr-lin',
    departmentId: 'd-tcm-zhen',
    name: '林静怡',
    title: '主治医师',
    titleHint: '常见病症都能看',
    goodAt: '推拿放松、落枕与肌肉酸痛',
    fee: 12,
    slotIds: ['am1', 'pm2', 'pm3'],
  },
  {
    id: 'dr-he',
    departmentId: 'd-tcm-lao',
    name: '何长庚',
    title: '主任医师',
    titleHint: '看病经验最丰富',
    goodAt: '高血压、糖尿病等长期慢性病',
    fee: 30,
    slotIds: ['am1', 'am3', 'pm2'],
  },
  {
    id: 'dr-xu',
    departmentId: 'd-tcm-lao',
    name: '许宝珍',
    title: '副主任医师',
    titleHint: '经验很丰富',
    goodAt: '老年人多种用药一起调理',
    fee: 20,
    slotIds: ['am2', 'pm1', 'pm3'],
  },
  {
    id: 'dr-gao',
    departmentId: 'd-com-quan',
    name: '高玉山',
    title: '主治医师',
    titleHint: '常见病症都能看',
    goodAt: '感冒发烧、日常开药、量血压',
    fee: 12,
    slotIds: ['am1', 'am2', 'pm1'],
  },
  {
    id: 'dr-luo',
    departmentId: 'd-com-quan',
    name: '罗春梅',
    title: '主治医师',
    titleHint: '常见病症都能看',
    goodAt: '慢性病续方、健康咨询',
    fee: 12,
    slotIds: ['am3', 'pm2', 'pm3'],
  },
  {
    id: 'dr-deng',
    departmentId: 'd-com-yu',
    name: '邓秀英',
    title: '主治医师',
    titleHint: '常见病症都能看',
    goodAt: '疫苗接种安排与注意事项',
    fee: 12,
    slotIds: ['am1', 'am2', 'am3'],
  },
  {
    id: 'dr-feng',
    departmentId: 'd-com-yu',
    name: '冯建国',
    title: '主治医师',
    titleHint: '常见病症都能看',
    goodAt: '老年体检项目咨询',
    fee: 12,
    slotIds: ['pm1', 'pm2', 'pm3'],
  },
]

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'am1', label: '08:30 - 09:00', period: '上午' },
  { id: 'am2', label: '09:30 - 10:00', period: '上午' },
  { id: 'am3', label: '10:30 - 11:00', period: '上午' },
  { id: 'pm1', label: '14:00 - 14:30', period: '下午' },
  { id: 'pm2', label: '15:00 - 15:30', period: '下午' },
  { id: 'pm3', label: '16:00 - 16:30', period: '下午' },
]

export const MOCK_PATIENT = {
  name: '张淑芬',
  age: 68,
  note: '练习用的虚构姓名，不需要填写真实信息',
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function toDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function buildDayOptions(base: Date = new Date()): DayOption[] {
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + index)
    return {
      date: toDateKey(date),
      dayLabel: `${date.getMonth() + 1}月${date.getDate()}日`,
      weekday: WEEKDAYS[date.getDay()],
      relative: index === 0 ? '今天' : index === 1 ? '明天' : index === 2 ? '后天' : '',
    }
  })
}

function hash(text: string): number {
  let value = 0
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) >>> 0
  }
  return value
}

/** 号源为虚构数据：同一医生、日期、时段的结果固定，刷新后不会变化。0 表示已约满。 */
export function seatsLeft(doctorId: string, date: string, slotId: string): number {
  return hash(`${doctorId}|${date}|${slotId}`) % 6
}

export function makeBookingCode(doctorId: string, date: string, slotId: string): string {
  const serial = (hash(`code|${doctorId}|${date}|${slotId}`) % 9000) + 1000
  return `MN${date.replace(/-/g, '')}-${serial}`
}

export function findHospital(id: string | null): Hospital | undefined {
  return HOSPITALS.find((item) => item.id === id)
}

export function findDepartment(id: string | null): Department | undefined {
  return DEPARTMENTS.find((item) => item.id === id)
}

export function findDoctor(id: string | null): Doctor | undefined {
  return DOCTORS.find((item) => item.id === id)
}

export function findSlot(id: string | null): TimeSlot | undefined {
  return TIME_SLOTS.find((item) => item.id === id)
}

export function dayText(date: string | null): string | null {
  const day = buildDayOptions().find((item) => item.date === date)
  if (!day) return null
  return `${day.dayLabel} ${day.weekday}${day.relative ? `（${day.relative}）` : ''}`
}

export function slotText(slotId: string | null): string | null {
  const slot = findSlot(slotId)
  return slot ? `${slot.period} ${slot.label}` : null
}

export function departmentsOf(hospitalId: string | null): Department[] {
  return DEPARTMENTS.filter((item) => item.hospitalId === hospitalId)
}

export function doctorsOf(departmentId: string | null): Doctor[] {
  return DOCTORS.filter((item) => item.departmentId === departmentId)
}
