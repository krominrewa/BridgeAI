import {
  buildDayOptions,
  dayText,
  departmentsOf,
  findDepartment,
  findDoctor,
  findHospital,
  makeBookingCode,
  seatsLeft,
  slotText,
} from '../data/appointment'
import { requestHelp, type HelpRequest } from './helpProvider'

export const STEP_TITLES = ['选择医院', '选择科室', '选择医生', '选择时间', '确认信息', '预约成功']

export const TOTAL_STEPS = STEP_TITLES.length

export const CONFIRM_STEP = 4

export const SUCCESS_STEP = 5

export type SelectField = 'hospitalId' | 'departmentId' | 'doctorId' | 'date' | 'slotId'

export type StepStats = {
  errors: number
  hints: number
}

export type FlowStats = {
  startedAt: number | null
  finishedAt: number | null
  errors: number
  hints: number
  byStep: StepStats[]
}

export type FlowState = {
  started: boolean
  step: number
  hospitalId: string | null
  departmentId: string | null
  doctorId: string | null
  date: string | null
  slotId: string | null
  notice: string | null
  noticeSeq: number
  help: string | null
  bookingCode: string | null
  stats: FlowStats
}

export type FlowAction =
  | { type: 'start' }
  | { type: 'exit' }
  | { type: 'restart' }
  | { type: 'select'; field: SelectField; value: string }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'help' }
  | { type: 'dismissHelp' }
  | { type: 'unavailableSlot' }

function emptyStats(): FlowStats {
  return {
    startedAt: null,
    finishedAt: null,
    errors: 0,
    hints: 0,
    byStep: STEP_TITLES.map(() => ({ errors: 0, hints: 0 })),
  }
}

export const initialFlowState: FlowState = {
  started: false,
  step: 0,
  hospitalId: null,
  departmentId: null,
  doctorId: null,
  date: null,
  slotId: null,
  notice: null,
  noticeSeq: 0,
  help: null,
  bookingCode: null,
  stats: emptyStats(),
}

const STORAGE_KEY = 'bridgeai:appointment:v1'

/** 遗漏选择时的提示：说清“缺什么”和“接下来怎么做”。 */
export function missingNotice(state: FlowState): string | null {
  switch (state.step) {
    case 0:
      return state.hospitalId ? null : '还没有选医院。先点一下您想去的医院，再点“下一步”。'
    case 1:
      return state.departmentId ? null : '还没有选科室。想想哪里不舒服，点对应的那一项。'
    case 2:
      return state.doctorId ? null : '还没有选医生。点一位医生，再点“下一步”。'
    case 3:
      if (!state.date) return '请先选一个看病的日期，例如“明天”。'
      if (!state.slotId) return '日期选好了，再点一个具体的时间段。'
      if (state.doctorId && seatsLeft(state.doctorId, state.date, state.slotId) === 0) {
        return '这个时间段已经约满了，请换一个还有号的时间。'
      }
      return null
    default:
      return null
  }
}

function withSelection(state: FlowState, field: SelectField, value: string): FlowState {
  const base = { ...state, notice: null, help: null }
  switch (field) {
    case 'hospitalId':
      return { ...base, hospitalId: value, departmentId: null, doctorId: null, date: null, slotId: null }
    case 'departmentId':
      return { ...base, departmentId: value, doctorId: null, date: null, slotId: null }
    case 'doctorId':
      return { ...base, doctorId: value, date: null, slotId: null }
    case 'date':
      return { ...base, date: value, slotId: null }
    case 'slotId':
      return { ...base, slotId: value }
  }
}

function bump(stats: FlowStats, step: number, key: 'errors' | 'hints'): FlowStats {
  const byStep = stats.byStep.map((item, index) => {
    if (index !== step) return item
    return key === 'errors' ? { ...item, errors: item.errors + 1 } : { ...item, hints: item.hints + 1 }
  })
  return key === 'errors' ? { ...stats, errors: stats.errors + 1, byStep } : { ...stats, hints: stats.hints + 1, byStep }
}

export function helpRequest(state: FlowState): HelpRequest {
  const slotFull =
    Boolean(state.doctorId && state.date && state.slotId) &&
    seatsLeft(state.doctorId ?? '', state.date ?? '', state.slotId ?? '') === 0
  return {
    step: state.step,
    hospitalName: findHospital(state.hospitalId)?.name ?? null,
    departmentName: findDepartment(state.departmentId)?.name ?? null,
    doctorName: findDoctor(state.doctorId)?.name ?? null,
    departments: departmentsOf(state.hospitalId).map((item) => ({ name: item.name, hint: item.hint })),
    dateText: dayText(state.date),
    slotText: slotText(state.slotId),
    slotFull,
  }
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        started: true,
        step: 0,
        notice: null,
        help: null,
        stats: { ...state.stats, startedAt: Date.now() },
      }
    case 'exit':
      return initialFlowState
    case 'restart':
      return { ...initialFlowState, started: true, stats: { ...emptyStats(), startedAt: Date.now() } }
    case 'select':
      return withSelection(state, action.field, action.value)
    case 'prev':
      if (state.step === 0) return { ...state, notice: null, help: null }
      return { ...state, step: state.step - 1, notice: null, help: null, bookingCode: null }
    case 'next': {
      const notice = missingNotice(state)
      if (notice) {
        // 同一提醒连续重复点击只记 1 次错误；有过有效操作后再犯才重新计数
        const repeated = state.notice === notice
        return {
          ...state,
          notice,
          noticeSeq: state.noticeSeq + 1,
          help: null,
          stats: repeated ? state.stats : bump(state.stats, state.step, 'errors'),
        }
      }
      if (state.step === CONFIRM_STEP) {
        return {
          ...state,
          step: SUCCESS_STEP,
          notice: null,
          help: null,
          bookingCode: makeBookingCode(state.doctorId ?? '', state.date ?? '', state.slotId ?? ''),
          stats: { ...state.stats, finishedAt: Date.now() },
        }
      }
      return { ...state, step: Math.min(state.step + 1, SUCCESS_STEP), notice: null, help: null }
    }
    case 'help':
      return {
        ...state,
        help: requestHelp(helpRequest(state)),
        stats: bump(state.stats, state.step, 'hints'),
      }
    case 'dismissHelp':
      return { ...state, help: null }
    case 'unavailableSlot': {
      const notice = state.date
        ? '这个时间段已经约满了，请换一个还有号的时间。'
        : '请先在上面选一个看病的日期，再点时间段。'
      const repeated = state.notice === notice
      return {
        ...state,
        notice,
        noticeSeq: state.noticeSeq + 1,
        help: null,
        stats: repeated ? state.stats : bump(state.stats, state.step, 'errors'),
      }
    }
  }
}

function reachableStep(state: FlowState): number {
  if (!state.hospitalId) return 0
  if (!state.departmentId) return 1
  if (!state.doctorId) return 2
  if (!state.date || !state.slotId) return 3
  return CONFIRM_STEP
}

function readId(raw: Record<string, unknown>, key: string): string | null {
  const value = raw[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}

function readCount(raw: Record<string, unknown>, key: string): number {
  const value = raw[key]
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0
}

function readTime(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function normalizeStats(raw: unknown): FlowStats {
  const base = emptyStats()
  if (typeof raw !== 'object' || raw === null) return base
  const stats = raw as Record<string, unknown>
  const startedAt = readTime(stats.startedAt)
  const finishedAt = readTime(stats.finishedAt)
  const byStep = Array.isArray(stats.byStep) ? stats.byStep : []
  return {
    startedAt,
    finishedAt: startedAt !== null && finishedAt !== null && finishedAt >= startedAt ? finishedAt : null,
    errors: readCount(stats, 'errors'),
    hints: readCount(stats, 'hints'),
    byStep: base.byStep.map((item, index) => {
      const entry = byStep[index]
      if (typeof entry !== 'object' || entry === null) return item
      const record = entry as Record<string, unknown>
      return { errors: readCount(record, 'errors'), hints: readCount(record, 'hints') }
    }),
  }
}

/** 读取上次练习进度；丢弃已失效的选择（例如隔天刷新后日期已不在可选范围内）。 */
function normalize(raw: Record<string, unknown>): FlowState {
  const hospitalId = findHospital(readId(raw, 'hospitalId'))?.id ?? null
  const department = findDepartment(readId(raw, 'departmentId'))
  const departmentId = department && department.hospitalId === hospitalId ? department.id : null
  const doctor = findDoctor(readId(raw, 'doctorId'))
  const doctorId = doctor && doctor.departmentId === departmentId ? doctor.id : null

  const storedDate = readId(raw, 'date')
  const date = storedDate && buildDayOptions().some((day) => day.date === storedDate) ? storedDate : null
  const storedSlot = readId(raw, 'slotId')
  const slotId =
    date && doctorId && storedSlot && doctor?.slotIds.includes(storedSlot) && seatsLeft(doctorId, date, storedSlot) > 0
      ? storedSlot
      : null

  const base: FlowState = {
    started: raw.started === true,
    step: 0,
    hospitalId,
    departmentId,
    doctorId,
    date,
    slotId,
    notice: null,
    noticeSeq: 0,
    help: null,
    bookingCode: null,
    stats: normalizeStats(raw.stats),
  }

  const limit = reachableStep(base)
  const storedStep = typeof raw.step === 'number' && Number.isInteger(raw.step) ? raw.step : 0
  const code = readId(raw, 'bookingCode')
  const step = storedStep === SUCCESS_STEP && code && limit === CONFIRM_STEP ? SUCCESS_STEP : Math.min(Math.max(storedStep, 0), limit)

  return { ...base, step, bookingCode: step === SUCCESS_STEP ? code : null }
}

export function loadFlowState(): FlowState {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return initialFlowState
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return initialFlowState
    return normalize(parsed as Record<string, unknown>)
  } catch {
    return initialFlowState
  }
}

export function saveFlowState(state: FlowState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 浏览器禁用存储时，练习仍可在当前页面内正常进行
  }
}