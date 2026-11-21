/**
 * 第一课「模拟预约挂号」的状态机。
 * 通用步骤推进、统计与保存由 flowKit 提供，这里只描述挂号特有的选择与校验。
 */
import {
  buildDayOptions,
  dayText,
  departmentsOf,
  findDepartment,
  findDoctor,
  findHospital,
  HOSPITALS,
  makeBookingCode,
  seatsLeft,
  slotText,
} from '../../data/appointment'
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

export const STEP_TITLES = ['选择医院', '选择科室', '选择医生', '选择时间', '确认信息', '预约成功']

export const TOTAL_STEPS = STEP_TITLES.length

export const CONFIRM_STEP = 4

export const SUCCESS_STEP = 5

export const STORAGE_KEY = 'bridgeai:appointment:v1'

export type SelectField = 'hospitalId' | 'departmentId' | 'doctorId' | 'date' | 'slotId'

export type FlowState = FlowBase & {
  hospitalId: string | null
  departmentId: string | null
  doctorId: string | null
  date: string | null
  slotId: string | null
  bookingCode: string | null
}

export type ExtraAction =
  | { type: 'select'; field: SelectField; value: string }
  | { type: 'unavailableSlot' }

export type FlowAction = FlowActionBase | ExtraAction

export const initialFlowState: FlowState = {
  started: false,
  step: 0,
  notice: null,
  noticeSeq: 0,
  help: null,
  stats: emptyStats(STEP_TITLES),
  hospitalId: null,
  departmentId: null,
  doctorId: null,
  date: null,
  slotId: null,
  bookingCode: null,
}

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

/** 换上层选择会作废下层结果，避免拿着旧医生去新科室。 */
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

function handleExtra(state: FlowState, action: ExtraAction): FlowState | null {
  switch (action.type) {
    case 'select':
      return withSelection(state, action.field, action.value)
    case 'unavailableSlot': {
      const notice = state.date
        ? '这个时间段已经约满了，请换一个还有号的时间。'
        : '请先在上面选一个看病的日期，再点时间段。'
      return withNotice(state, notice)
    }
    default:
      return null
  }
}

export function helpText(state: FlowState): string {
  const hospital = findHospital(state.hospitalId)
  const department = findDepartment(state.departmentId)
  const doctor = findDoctor(state.doctorId)

  switch (state.step) {
    case 0:
      return hospital
        ? `医院已经选好了：${hospital.name}。现在点最下面的蓝色“下一步”按钮，去选科室。想换医院，直接点另一家就可以。`
        : `先选一家医院。第一次练习可以点“${HOSPITALS[0].name}”，它的科室最齐全。点一下医院卡片，看到“已选择”三个字，再点最下面的蓝色“下一步”按钮。`
    case 1:
      if (department) {
        return `科室选好了：${department.name}。点“下一步”去看这个科室的医生。选错了可以点“上一步”回来重选。`
      }
      return `“${hospital?.name ?? '这家医院'}”有这些科室：${departmentsOf(state.hospitalId)
        .map((item) => `${item.name}（${item.hint}）`)
        .join('、')}。想想您哪里不舒服，点最接近的那一项，再点“下一步”。`
    case 2:
      return doctor
        ? `医生选好了：${doctor.name}。点“下一步”去挑看病的日期和时间。`
        : '这个科室的医生都能看您的病。“主任医师”经验最丰富，“主治医师”看常见小病也够用。挂号费只是练习用的数字，不会真的扣钱。点一位医生，再点“下一步”。'
    case 3: {
      const dateText = dayText(state.date)
      const slot = slotText(state.slotId)
      const full = Boolean(state.doctorId && state.date && state.slotId) && seatsLeft(state.doctorId ?? '', state.date ?? '', state.slotId ?? '') === 0
      if (!dateText) return '先在上面选一个日期，例如“明天”。选好日期后，下面才会显示能约的时间段。'
      if (!slot) {
        return `日期选好了：${dateText}。现在点一个时间段：写着“还剩几个号”的都能选，写着“已约满”的不能选，换一个就好。`
      }
      if (full) return '您点的这个时间段已经约满了。请点另一个写着“还剩几个号”的时间，再点“下一步”。'
      return `看病时间选好了：${dateText} ${slot}。点“下一步”核对预约信息。`
    }
    case 4:
      return '请从上到下核对医院、科室、医生和看病时间。哪一项不对，点“上一步”回去改，改完再点“下一步”回到这里。都没问题就点“确认预约”——这是练习，不会真的挂号，也不会扣钱。'
    case 5:
      return '您已经完成练习了。下面有本次学习小结，告诉您用了多久、哪里还需要复习。点“再练一次”可以从头再来一遍。'
    default:
      return '点最下面的蓝色“下一步”继续。如果漏选了内容，会出现文字提醒，告诉您缺什么、怎么补。'
  }
}

export function helpPayload(state: FlowState): HelpRequest {
  const hospital = findHospital(state.hospitalId)
  const department = findDepartment(state.departmentId)
  const doctor = findDoctor(state.doctorId)
  const visitText = [dayText(state.date), slotText(state.slotId)].filter(Boolean).join(' ')
  const choices = [
    ...departmentsOf(state.hospitalId).map((item) => ({ name: item.name, hint: item.hint })),
  ]

  return {
    courseId: 'appointment',
    courseTitle: '模拟预约挂号',
    step: state.step,
    stepTitle: STEP_TITLES[state.step] ?? '',
    facts: [
      fact('医院', hospital?.name ?? null),
      fact('科室', department?.name ?? null),
      fact('医生', doctor ? `${doctor.name}（${doctor.title}）` : null),
      fact('看病时间', visitText || null),
    ],
    options: state.step === 1 ? choices : [],
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
  onConfirm: (state) => ({
    bookingCode: makeBookingCode(state.doctorId ?? '', state.date ?? '', state.slotId ?? ''),
  }),
  onBack: () => ({ bookingCode: null }),
  reachableStep: (state) => {
    if (!state.hospitalId) return 0
    if (!state.departmentId) return 1
    if (!state.doctorId) return 2
    if (!state.date || !state.slotId) return 3
    return CONFIRM_STEP
  },
}

export const flowReducer = createFlowReducer<FlowState, ExtraAction>(rules, handleExtra)

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
    ...initialFlowState,
    started: raw.started === true,
    hospitalId,
    departmentId,
    doctorId,
    date,
    slotId,
    stats: normalizeStats(raw.stats, STEP_TITLES),
  }

  const limit = rules.reachableStep?.(base) ?? 0
  const code = readId(raw, 'bookingCode')
  const storedStep = typeof raw.step === 'number' && Number.isInteger(raw.step) ? raw.step : 0
  const step = storedStep === SUCCESS_STEP && code && limit === CONFIRM_STEP ? SUCCESS_STEP : Math.min(Math.max(storedStep, 0), limit)

  return { ...base, step, bookingCode: step === SUCCESS_STEP ? code : null }
}

export function loadFlowState(): FlowState {
  return loadStoredFlow(STORAGE_KEY, () => initialFlowState, normalize)
}

export function saveFlowState(state: FlowState): void {
  saveStoredFlow(STORAGE_KEY, state)
}
