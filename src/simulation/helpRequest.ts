/**
 * 提示请求的统一数据结构：各课程把自己的选择状态压成“已选内容 + 当前可选项”，
 * 供 AI 教学代理使用；本地大白话提示由各课程模块自己生成，不依赖这里。
 */

export type HelpFact = {
  label: string
  value: string | null
}

export type HelpOption = {
  name: string
  hint: string
}

export type HelpRequest = {
  courseId: string
  courseTitle: string
  step: number
  stepTitle: string
  /** 已经选好的内容，例如「医院：模拟市第一人民医院」。 */
  facts: HelpFact[]
  /** 当前这一步可以选什么。 */
  options: HelpOption[]
  /** 上一步操作留下的提醒，用于针对性解释。 */
  notice: string | null
  /** 提示档位：1 方向、2 具体、3 手把手；本地请求可不填。 */
  tier?: 1 | 2 | 3
}

export function fact(label: string, value: string | null): HelpFact {
  return { label, value: value ?? null }
}
