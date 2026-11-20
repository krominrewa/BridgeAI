import { HOSPITALS } from '../data/appointment'

/** 传给提示来源的当前任务状态：纯数据，便于以后换成 AI 模型生成。 */
export type HelpRequest = {
  step: number
  hospitalName: string | null
  departmentName: string | null
  doctorName: string | null
  departments: { name: string; hint: string }[]
  dateText: string | null
  slotText: string | null
  slotFull: boolean
}

export type HelpProvider = {
  id: string
  getHelp: (request: HelpRequest) => string
}

function localHelp(request: HelpRequest): string {
  const { step, hospitalName, departmentName, doctorName, departments, dateText, slotText, slotFull } = request

  switch (step) {
    case 0:
      return hospitalName
        ? `医院已经选好了：${hospitalName}。现在点最下面的蓝色“下一步”按钮，去选科室。想换医院，直接点另一家就可以。`
        : `先选一家医院。第一次练习可以点“${HOSPITALS[0].name}”，它的科室最齐全。点一下医院卡片，看到“已选择”三个字，再点最下面的蓝色“下一步”按钮。`
    case 1:
      if (departmentName) {
        return `科室选好了：${departmentName}。点“下一步”去看这个科室的医生。选错了可以点“上一步”回来重选。`
      }
      return `“${hospitalName ?? '这家医院'}”有这些科室：${departments
        .map((item) => `${item.name}（${item.hint}）`)
        .join('、')}。想想您哪里不舒服，点最接近的那一项，再点“下一步”。`
    case 2:
      return doctorName
        ? `医生选好了：${doctorName}。点“下一步”去挑看病的日期和时间。`
        : '这个科室的医生都能看您的病。“主任医师”经验最丰富，“主治医师”看常见小病也够用。挂号费只是练习用的数字，不会真的扣钱。点一位医生，再点“下一步”。'
    case 3:
      if (!dateText) return '先在上面选一个日期，例如“明天”。选好日期后，下面才会显示能约的时间段。'
      if (!slotText) {
        return `日期选好了：${dateText}。现在点一个时间段：写着“还剩几个号”的都能选，写着“已约满”的不能选，换一个就好。`
      }
      if (slotFull) return '您点的这个时间段已经约满了。请点另一个写着“还剩几个号”的时间，再点“下一步”。'
      return `看病时间选好了：${dateText} ${slotText}。点“下一步”核对预约信息。`
    case 4:
      return '请从上到下核对医院、科室、医生和看病时间。哪一项不对，点“上一步”回去改，改完再点“下一步”回到这里。都没问题就点“确认预约”——这是练习，不会真的挂号，也不会扣钱。'
    case 5:
      return '您已经完成练习了。下面有本次学习小结，告诉您用了多久、哪里还需要复习。点“再练一次”可以从头再来一遍。'
    default:
      return '点最下面的蓝色“下一步”继续。如果漏选了内容，会出现文字提醒，告诉您缺什么、怎么补。'
  }
}

export const localHelpProvider: HelpProvider = {
  id: 'local-rules',
  getHelp: localHelp,
}

let currentProvider: HelpProvider = localHelpProvider

/** 以后接入 AI 模型时替换提示来源；本地规则始终保留作为兜底。 */
export function setHelpProvider(provider: HelpProvider): void {
  currentProvider = provider
}

export function requestHelp(request: HelpRequest): string {
  return currentProvider.getHelp(request) || localHelp(request)
}