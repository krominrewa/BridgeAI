import type { FlowBase } from './flowKit'

export type ReviewItem = {
  title: string
  reason: string
}

export type LearningReportData = {
  completedSteps: number
  totalSteps: number
  durationText: string
  finishedAtText: string
  errors: number
  hints: number
  review: ReviewItem[]
}

export type ReportRules = {
  titles: string[]
  confirmStep: number
  successStep: number
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

export function buildLearningReport(state: FlowBase, rules: ReportRules): LearningReportData {
  const { startedAt, finishedAt, errors, hints, byStep } = state.stats
  const { titles, confirmStep, successStep } = rules
  const review: ReviewItem[] = []

  for (let step = 0; step <= confirmStep; step += 1) {
    const item = byStep[step]
    if (!item || (item.errors === 0 && item.hints === 0)) continue
    const parts: string[] = []
    if (item.errors > 0) parts.push(`${item.errors} 次漏选或点错`)
    if (item.hints > 0) parts.push(`用了 ${item.hints} 次帮助`)
    review.push({ title: `第 ${step + 1} 步 · ${titles[step]}`, reason: parts.join('，') })
  }

  return {
    completedSteps: state.step >= successStep ? titles.length : state.step,
    totalSteps: titles.length,
    durationText: startedAt !== null && finishedAt !== null ? formatDuration(finishedAt - startedAt) : '未记录',
    finishedAtText: finishedAt !== null ? clockText(finishedAt) : '未记录',
    errors,
    hints,
    review,
  }
}
