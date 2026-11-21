/**
 * 仅用于本地自动化测试的 mock 上游（OpenAI 兼容格式），不是真实模型。
 * 配合 teaching-proxy.mjs 验证 AI 通路、思考中状态与降级逻辑。
 *   MOCK_DELAY_MS=900 node server/mock-llm.mjs   （默认端口 8788）
 */
import http from 'node:http'

const PORT = Number(process.env.MOCK_PORT ?? 8788)
const DELAY = Number(process.env.MOCK_DELAY_MS ?? 900)

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function mockGuidance(context) {
  const parts = ['【智能桥桥】']
  if (context.notice) {
    parts.push(`先别急，屏幕上的提醒说了怎么补救：${context.notice}`)
  } else {
    const chosen = (context.facts ?? [])
      .filter((item) => item && item.value)
      .map((item) => `${item.label}已选${item.value}`)
    parts.push(
      chosen.length
        ? `${chosen.join('，')}。`
        : `现在这一步是“${context.stepTitle ?? '继续'}”，先点一个选项。`,
    )
    const first = (context.options ?? [])[0]
    if (first?.name) parts.push(`拿不准的话，可以先点“${first.name}”。`)
    parts.push('然后点屏幕下方蓝色的按钮继续。')
  }
  parts.push('这是练习，不会真的扣钱。')
  return parts.join('')
}

http
  .createServer(async (req, res) => {
    if (req.method !== 'POST' || (req.url ?? '').split('?')[0] !== '/chat/completions') {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'not-found' }))
      return
    }
    try {
      const body = JSON.parse(await readBody(req))
      const userMessage = (body.messages ?? []).find((item) => item.role === 'user')
      const context = JSON.parse(userMessage?.content ?? '{}')
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            choices: [{ message: { role: 'assistant', content: mockGuidance(context) } }],
          }),
        )
      }, DELAY)
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'bad-request' }))
    }
  })
  .listen(PORT, () => {
    console.log(`mock-llm listening on http://127.0.0.1:${PORT} (delay=${DELAY}ms)`)
  })