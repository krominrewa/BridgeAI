/**
 * 跨标签页保留每节课最近一次完成结果，让欢迎页能说“上次练习是什么时候”。
 * 只保存统计摘要，不保存选择内容；浏览器拒绝存储时静默降级。
 */
import type { CourseId } from '../router'

export const PRACTICE_HISTORY_KEY = 'bridgeai:practice-history:v1'

export type PracticeRecord = {
  courseId: CourseId
  finishedAt: number
  durationMs: number
  errors: number
  hints: number
  autoHints: number
  deepHints: number
}

const COURSE_IDS: CourseId[] = [
  'appointment',
  'payment',
  'transit',
  'insurance',
  'fraud-refund',
  'fraud-official',
  'fraud-subsidy',
]

type PracticeStore = Partial<Record<CourseId, PracticeRecord>>

function readCount(raw: Record<string, unknown>, key: string): number {
  const value = raw[key]
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : 0
}

function readStore(): PracticeStore {
  try {
    const raw = localStorage.getItem(PRACTICE_HISTORY_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const store: PracticeStore = {}
    for (const courseId of COURSE_IDS) {
      const entry = (parsed as Record<string, unknown>)[courseId]
      if (typeof entry !== 'object' || entry === null) continue
      const record = entry as Record<string, unknown>
      if (typeof record.finishedAt !== 'number' || !Number.isFinite(record.finishedAt)) continue
      store[courseId] = {
        courseId,
        finishedAt: record.finishedAt,
        durationMs: readCount(record, 'durationMs'),
        errors: readCount(record, 'errors'),
        hints: readCount(record, 'hints'),
        autoHints: readCount(record, 'autoHints'),
        deepHints: readCount(record, 'deepHints'),
      }
    }
    return store
  } catch {
    return {}
  }
}

export function savePracticeRecord(record: PracticeRecord): void {
  try {
    localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify({ ...readStore(), [record.courseId]: record }))
  } catch {
    // 无法保存时只是少了“上次练习”这一行，不影响本次练习
  }
}

export function getPracticeRecord(courseId: CourseId): PracticeRecord | null {
  return readStore()[courseId] ?? null
}

function durationText(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000))
  if (seconds < 60) return `${seconds} 秒`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest === 0 ? `${minutes} 分钟` : `${minutes} 分 ${rest} 秒`
}

export function practiceSummary(record: PracticeRecord): string {
  const date = new Date(record.finishedAt)
  const when = `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  return `${when} · 错误 ${record.errors} 次 · 用时 ${durationText(record.durationMs)}`
}