import type { CourseId } from '../router'

export type CourseMeta = {
  id: CourseId
  /** 手机顶栏中间显示的课程名。 */
  navLabel: string
  /** 练习页与课程卡片上方的小标题，例如“模拟预约挂号 · 第一课”。 */
  eyebrow: string
  title: string
  summary: string
  facts: string[]
  intro: string
  /** 步骤名列表，课程卡片展开后显示。 */
  steps: string[]
  /** 练习页主标题下的一段说明。 */
  pageLead: string
  /** 练习页右侧“练习小贴士”。 */
  tips: string[]
}
