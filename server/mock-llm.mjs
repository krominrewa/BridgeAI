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
  if (context.notice && context.notice.includes('约满')) {
    parts.push('您点的时间段约满了，别着急，换一个写着“还剩几个号”的时间，再点“下一步”。')
  } else if (context.step === 1) {
    parts.push(
      context.departmentName
        ? `科室已选${context.departmentName}，点“下一步”去看医生。`
        : '想想您哪里不舒服，点最接近的科室，再点“下一步”。',
    )
  } else {
    parts.push(`现在练习“${context.stepTitle ?? '下一步'}”，按屏幕上的蓝色按钮继续就好。`)
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