/**
 * 教学助手适配层：把当前练习状态交给服务端代理生成通俗指导。
 * 密钥只存在于服务端（见 server/teaching-proxy.mjs），前端永远不接触密钥。
 * 未配置代理、请求失败或超时一律回退到本地规则提示，练习不受影响。
 */
import type { HelpRequest } from './helpRequest'

export type TeachingResult = {
  text: string
  source: 'local' | 'ai'
}

const endpoint = (import.meta.env.VITE_TEACHING_API_URL ?? '').trim()

/** 是否配置了安全的服务端教学代理；未配置时只走本地规则。 */
export const teachingConfigured = endpoint.length > 0

const TIMEOUT_MS = 8000
const MAX_TEXT_LENGTH = 600

export async function requestTeaching(request: HelpRequest, localText: string): Promise<TeachingResult> {
  if (!teachingConfigured) return { text: localText, source: 'local' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
    if (!response.ok) return { text: localText, source: 'local' }
    const data: unknown = await response.json()
    const text =
      typeof data === 'object' && data !== null && typeof (data as { text?: unknown }).text === 'string'
        ? (data as { text: string }).text.trim()
        : ''
    if (!text || text.length > MAX_TEXT_LENGTH) return { text: localText, source: 'local' }
    return { text, source: 'ai' }
  } catch {
    return { text: localText, source: 'local' }
  } finally {
    clearTimeout(timer)
  }
}
