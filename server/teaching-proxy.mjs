/**
 * 桥桥教学助手 · 服务端代理（零依赖，Node 18+）。
 * API 密钥只从服务端环境变量读取，绝不下发到前端。
 *
 * 启动示例：
 *   TEACHING_API_KEY=sk-xxx node server/teaching-proxy.mjs
 * 可选环境变量：
 *   TEACHING_API_URL      OpenAI 兼容接口地址（默认 DashScope 兼容模式；接 Qoder API 时填 Qoder 提供的兼容地址）
 *   TEACHING_MODEL        模型名（默认 qwen-plus；接 Qoder API 时填对应模型名）
 *   PORT                  监听端口（默认 8787）
 *   TEACHING_ALLOW_ORIGIN 允许的前端来源，逗号分隔（默认本地开发端口）
 * 前端构建时配置：VITE_TEACHING_API_URL=http://127.0.0.1:8787/api/teaching
 */
import http from 'node:http'

const PORT = Number(process.env.PORT ?? 8787)
const API_URL = (process.env.TEACHING_API_URL ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/+$/, '')
const MODEL = process.env.TEACHING_MODEL ?? 'qwen-plus'
const API_KEY = process.env.TEACHING_API_KEY ?? ''
const ALLOW_ORIGINS = (process.env.TEACHING_ALLOW_ORIGIN ?? 'http://127.0.0.1:5174,http://127.0.0.1:5175')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

const SYSTEM_PROMPT =
  '你是“桥桥”，一位教老年人使用手机办数字生活的耐心助手，课程包括挂号、水电燃气缴费、打车与公交、医保电子凭证，' +
  '以及三节防骗训练：冒充客服退款、冒充公检法、补贴短信链接。' +
  '用户消息是当前练习步骤的 JSON：courseTitle 是课程名，stepTitle 是这一步要做的事，facts 是已经选好的内容（null 表示还没选），options 是这一步可选项，notice 是屏幕上的纠错提醒。' +
  '请据此用通俗、温暖、简短的中文给出下一步指导。要求：1 到 3 句话，总共不超过 120 字；直接说“点什么、再做什么”；称呼用户为“您”；' +
  '有 notice 时先解释怎么补救；所有机构、户号、车辆、账户都是虚构练习数据，不要编造真实信息；涉及费用时说明这是练习、不会真的扣钱。' +
  '防骗课的安全底线：只解释话术和风险，绝不提供任何真实链接、二维码、网址或陌生号码，绝不劝用户点链接、转账或提供验证码；' +
  '需要核实时，只提醒用户用自己知道的官方入口，或拨打 96110 咨询、110 报警。只输出指导正文。'

const MAX_BODY_BYTES = 8 * 1024
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 30
const rateBuckets = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const hits = (rateBuckets.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS)
  hits.push(now)
  rateBuckets.set(ip, hits)
  if (rateBuckets.size > 5000) rateBuckets.clear()
  return hits.length > RATE_MAX
}

function corsHeaders(origin) {
  if (!origin || !ALLOW_ORIGINS.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  }
}

function send(res, status, payload, origin) {
  const body = JSON.stringify(payload)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('body-too-large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function clipString(value, max = 200) {
  return typeof value === 'string' ? value.slice(0, max) : null
}

/** 只转发白名单字段并截断长度，避免把任意内容塞进模型提示。 */
function sanitizeContext(raw) {
  if (typeof raw !== 'object' || raw === null) return null
  const step = raw.step
  if (typeof step !== 'number' || !Number.isInteger(step) || step < 0 || step > 5) return null
  const facts = Array.isArray(raw.facts)
    ? raw.facts.slice(0, 8).map((item) => ({
        label: clipString(item?.label, 20),
        value: clipString(item?.value, 60),
      }))
    : []
  const options = Array.isArray(raw.options)
    ? raw.options.slice(0, 12).map((item) => ({
        name: clipString(item?.name, 40),
        hint: clipString(item?.hint, 60),
      }))
    : []
  return {
    courseId: clipString(raw.courseId, 24),
    courseTitle: clipString(raw.courseTitle, 40),
    step,
    stepTitle: clipString(raw.stepTitle, 40),
    facts,
    options,
    notice: clipString(raw.notice, 200),
  }
}

async function callUpstream(context) {
  const response = await fetch(`${API_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(context) },
      ],
      max_tokens: 220,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`upstream-status-${response.status}`)
  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) throw new Error('upstream-empty')
  return text.trim().slice(0, 300)
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin
  const url = (req.url ?? '').split('?')[0]

  if (req.method === 'OPTIONS' && url === '/api/teaching') {
    res.writeHead(204, corsHeaders(origin))
    res.end()
    return
  }
  if (req.method === 'GET' && url === '/api/health') {
    send(res, 200, { ok: true, configured: Boolean(API_KEY) }, origin)
    return
  }
  if (req.method !== 'POST' || url !== '/api/teaching') {
    send(res, 404, { error: 'not-found' }, origin)
    return
  }
  if (!API_KEY) {
    send(res, 503, { error: 'not-configured' }, origin)
    return
  }
  const ip = req.socket.remoteAddress ?? 'unknown'
  if (rateLimited(ip)) {
    send(res, 429, { error: 'rate-limited' }, origin)
    return
  }
  try {
    const context = sanitizeContext(JSON.parse(await readBody(req)))
    if (!context) {
      send(res, 400, { error: 'bad-request' }, origin)
      return
    }
    const text = await callUpstream(context)
    send(res, 200, { text }, origin)
  } catch {
    // 上游不可用/超时/密钥错误：只回笼统错误，前端自动降级本地规则
    send(res, 502, { error: 'upstream-unavailable' }, origin)
  }
})

server.listen(PORT, () => {
  console.log(`teaching-proxy listening on http://127.0.0.1:${PORT} (configured=${Boolean(API_KEY)}, model=${MODEL})`)
})