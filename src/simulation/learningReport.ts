import type { CourseId } from '../router'
import type { FlowBase } from './flowKit'

export type ReviewItem = {
  title: string
  reason: string
}

export type NextSuggestion = {
  text: string
  courseId?: CourseId
}

export type LearningReportData = {
  completedSteps: number
  totalSteps: number
  durationText: string
  finishedAtText: string
  errors: number
  hints: number
  /** 桥桥主动提醒次数，不计入用户求助。 */
  autoHints: number
  review: ReviewItem[]
  /** 用到第 3 档“手把手”提示的步骤。 */
  deepHintSteps: string[]
  encouragement: string
  takeaways: string[]
  nextSuggestion: NextSuggestion
}

export type ReportRules = {
  titles: string[]
  confirmStep: number
  successStep: number
  takeaways?: string[]
  nextCourse?: CourseId
}

function formatDuration(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000))
  if (seconds < 60) return `${seconds} 秒`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest === 0 ? `${minutes} 分钟` : `${minutes} 分 ${rest} 秒`
}

function clockText(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function encouragementFor(errors: number, hints: number): string {
  if (errors === 0 && hints === 0) return '一次就做对了，真稳！'
  if (errors <= 2) return '出错后能自己改过来，这就是学会的样子。'
  return '今天已经完整走了一遍，多练两次就熟了。'
}

export function buildLearningReport(state: FlowBase, rules: ReportRules): LearningReportData {
  const { startedAt, finishedAt, errors, hints, autoHints, byStep } = state.stats
  const { titles, confirmStep, successStep, takeaways = [], nextCourse } = rules
  const review: ReviewItem[] = []
  const deepHintSteps: string[] = []

  for (let step = 0; step <= confirmStep; step += 1) {
    const item = byStep[step]
    if (!item) continue
    if (item.maxTier >= 3) deepHintSteps.push(`第 ${step + 1} 步 · ${titles[step]}`)
    if (item.errors === 0 && item.hints === 0) continue
    const parts: string[] = []
    if (item.errors > 0) parts.push(`${item.errors} 次漏选或点错`)
    if (item.hints > 0) parts.push(`用了 ${item.hints} 次帮助`)
    if (item.maxTier >= 3) parts.push('其中用到手把手提示')
    review.push({ title: `第 ${step + 1} 步 · ${titles[step]}`, reason: parts.join('，') })
  }

  const smooth = errors <= 1 && deepHintSteps.length === 0
  const nextSuggestion: NextSuggestion =
    smooth && nextCourse
      ? { text: '学得挺稳。趁热接着练下一课，把新场景也走一遍。', courseId: nextCourse }
      : smooth
        ? { text: '七节课都走过了。可以挑一节再练一次，越练越熟。' }
        : { text: '建议把这节课再练一次，重点看上面列出的复习步骤。' }

  return {
    completedSteps: state.step >= successStep ? titles.length : state.step,
    totalSteps: titles.length,
    durationText: startedAt !== null && finishedAt !== null ? formatDuration(finishedAt - startedAt) : '未记录',
    finishedAtText: finishedAt !== null ? clockText(finishedAt) : '未记录',
    errors,
    hints,
    autoHints,
    review,
    deepHintSteps,
    encouragement: encouragementFor(errors, hints),
    takeaways,
    nextSuggestion,
  }
}