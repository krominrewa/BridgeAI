/**
 * 零依赖的界面采集与验收工具：驱动系统已安装的 Chrome 无头模式（CDP 协议）。
 * 用法：node tools/capture.mjs <输出目录> [场景名过滤]
 * 需要本地预览服务已启动（默认 http://127.0.0.1:5173）。
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]
const PORT = 9333
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const OUT_DIR = process.argv[2] ?? 'screenshots/run'
const FILTER = process.argv[3] ?? ''
const STORAGE_KEY = 'bridgeai:appointment:v1'

const HELPERS = `
window.__qa = {
  wait: (ms) => new Promise((r) => setTimeout(r, ms)),
  all: () => Array.from(document.querySelectorAll('button, a')),
  byText: (t) => window.__qa.all().find((b) => b.textContent.trim().startsWith(t)),
  click: async (t) => {
    const el = window.__qa.byText(t)
    if (!el) throw new Error('找不到可点击元素：' + t)
    el.click()
    await window.__qa.wait(140)
  },
  choices: () => Array.from(document.querySelectorAll('button[aria-pressed]')),
  pick: async (index) => {
    const list = window.__qa.choices().filter((b) => b.getAttribute('aria-disabled') !== 'true')
    if (!list[index]) throw new Error('没有第 ' + index + ' 个可选项')
    list[index].click()
    await window.__qa.wait(140)
  },
  pickLast: async () => {
    const list = window.__qa.choices().filter((b) => b.getAttribute('aria-disabled') !== 'true')
    list[list.length - 1].click()
    await window.__qa.wait(140)
  },
  heading: () => (document.getElementById('step-heading') || {}).textContent || null,
  notice: () => (document.querySelector('[role="alert"]') || {}).textContent || null,
  help: () => (document.getElementById('help-panel') || {}).textContent || null,
  report: () => {
    const el = document.querySelector('[aria-labelledby="learning-report-title"]')
    return el ? el.textContent.replace(/\\s+/g, ' ') : null
  },
  overflow: () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  wide: () => {
    const limit = document.documentElement.clientWidth
    return Array.from(document.querySelectorAll('*'))
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.right > limit + 1 || r.left < -1))
      .slice(0, 10)
      .map(({ el, r }) => ({
        tag: el.tagName,
        cls: String(el.className).slice(0, 70),
        left: Math.round(r.left),
        right: Math.round(r.right),
        text: (el.textContent || '').trim().slice(0, 24),
      }))
  },
  start: async () => {
    sessionStorage.removeItem('${STORAGE_KEY}')
    const btn = document.getElementById('start-simulation')
    if (!btn) throw new Error('欢迎页没有开始按钮')
    btn.click()
    await window.__qa.wait(200)
  },
  toStep: async (target) => {
    await window.__qa.start()
    for (let i = 0; i < target; i++) {
      if (i === 3) {
        await window.__qa.pick(0)
        await window.__qa.pickLast()
      } else {
        await window.__qa.pick(0)
      }
      await window.__qa.click('下一步')
    }
  },
  finish: async () => {
    await window.__qa.toStep(4)
    await window.__qa.click('确认预约')
    await window.__qa.wait(260)
  },
}
`

const SCENARIOS = [
  { name: 'home-desktop', width: 1440, height: 900, route: '#/', fullPage: true },
  { name: 'home-mobile', width: 390, height: 844, mobile: true, route: '#/', fullPage: true },
  { name: 'learning-desktop', width: 1440, height: 900, route: '#/learning', fullPage: true },
  { name: 'learning-mobile', width: 390, height: 844, mobile: true, route: '#/learning', fullPage: true },
  { name: 'about-desktop', width: 1440, height: 900, route: '#/about', fullPage: true },
  {
    name: 'sim-welcome-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `sessionStorage.removeItem('${STORAGE_KEY}'); return { overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-hospital-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.toStep(0); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-error-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.start(); await __qa.click('下一步'); return { notice: __qa.notice(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-help-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.toStep(1); await __qa.click('我需要帮助'); return { heading: __qa.heading(), help: __qa.help(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-schedule-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.toStep(3); await __qa.pick(0); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-confirm-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.toStep(4); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-success-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.finish(); return { heading: __qa.heading(), report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-success-desktop',
    width: 1440,
    height: 900,
    route: '#/simulation',
    clip: '.shadow-phone',
    fullPage: true,
    script: `await __qa.finish(); return { heading: __qa.heading(), report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-report-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.finish();
      document.querySelector('[aria-labelledby="learning-report-title"]').scrollIntoView({ block: 'center' });
      await __qa.wait(200);
      return { report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-large-mobile',
    width: 390,
    height: 844,
    mobile: true,
    largeText: '24px',
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.toStep(3); await __qa.pick(0);
      document.querySelector('.phone-scroll').scrollTo(0, 0);
      const ps = document.querySelector('.phone-scroll');
      return { heading: __qa.heading(), overflow: __qa.overflow(), phoneOverflow: ps.scrollWidth - ps.clientWidth, wide: __qa.wide() }`,
  },
  {
    name: 'home-large-mobile',
    width: 390,
    height: 844,
    mobile: true,
    largeText: '24px',
    route: '#/',
    fullPage: true,
    script: `return { overflow: __qa.overflow(), wide: __qa.wide() }`,
  },
  {
    name: 'sim-reduced-mobile',
    width: 390,
    height: 844,
    mobile: true,
    reducedMotion: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.finish(); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-keyboard-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.start(); return { focusedAfterStart: document.activeElement.id, overflow: __qa.overflow() }`,
    keys: ['Tab'],
    check: `const el = document.activeElement; const cs = getComputedStyle(el);
      return { focusedText: (el.textContent || '').trim().slice(0, 24), focusRing: cs.boxShadow !== 'none' }`,
  },
  {
    name: 'home-skiplink-desktop',
    width: 1440,
    height: 900,
    route: '#/',
    script: `return { overflow: __qa.overflow() }`,
    keys: ['Tab'],
    check: `const el = document.activeElement; const r = el.getBoundingClientRect();
      return { skipText: (el.textContent || '').trim(), skipW: Math.round(r.width), skipH: Math.round(r.height) }`,
  },
  {
    name: 'sim-back-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.toStep(4);
      await __qa.click('上一步');
      const backHeading = __qa.heading();
      await __qa.click('下一步');
      await __qa.click('确认预约');
      await __qa.wait(200);
      await __qa.click('返回修改');
      return { backHeading, afterFinishBack: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-restart-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.finish(); await __qa.click('再练一次');
      return { heading: __qa.heading(), report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-refresh-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.shadow-phone',
    script: `await __qa.toStep(2); return { headingBeforeReload: __qa.heading() }`,
    reload: true,
    check: `return { headingAfterReload: __qa.heading(), overflow: __qa.overflow() }`,
  },
]

async function findChrome() {
  const { access } = await import('node:fs/promises')
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate)
      return candidate
    } catch {
      /* 继续尝试下一个 */
    }
  }
  throw new Error('没有找到 Chrome 或 Edge')
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.seq = 0
    this.pending = new Map()
    this.listeners = new Map()
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(JSON.stringify(msg.error)))
        else resolve(msg.result)
      } else if (msg.method) {
        const fn = this.listeners.get(msg.method)
        if (fn) fn(msg.params)
      }
    })
  }

  send(method, params = {}) {
    const id = ++this.seq
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  once(method, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('等待事件超时：' + method)), timeoutMs)
      this.listeners.set(method, (params) => {
        clearTimeout(timer)
        this.listeners.delete(method)
        resolve(params)
      })
    })
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', {
      expression: `(async () => { ${expression} })()`,
      awaitPromise: true,
      returnByValue: true,
    })
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? JSON.stringify(result.exceptionDetails))
    }
    return result.result.value
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForDebugger() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (res.ok) return res.json()
    } catch {
      /* 尚未就绪 */
    }
    await sleep(250)
  }
  throw new Error('Chrome 调试端口未就绪')
}

async function main() {
  const chrome = await findChrome()
  // 放在 node_modules 缓存下：Vite 默认忽略该目录，避免监听 Chrome 锁文件导致预览服务崩溃
  const profile = path.resolve('node_modules/.cache/bridgeai-chrome')
  const child = spawn(
    chrome,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--window-size=1440,900',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  try {
    await waitForDebugger()
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    const page = targets.find((t) => t.type === 'page')
    if (!page) throw new Error('没有可用的页面目标')

    const ws = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true })
      ws.addEventListener('error', () => reject(new Error('CDP 连接失败')), { once: true })
    })
    const cdp = new Cdp(ws)
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    // 每个场景都从干净的练习状态开始，避免上一场景的续练状态干扰
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `try { if (!location.search.includes('reload=1')) sessionStorage.removeItem('${STORAGE_KEY}') } catch (e) {}`,
    })

    await mkdir(OUT_DIR, { recursive: true })
    const results = []

    for (const scenario of SCENARIOS) {
      if (FILTER && !scenario.name.includes(FILTER)) continue
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: scenario.width,
        height: scenario.height,
        deviceScaleFactor: scenario.mobile ? 2 : 1,
        mobile: Boolean(scenario.mobile),
      })
      if (scenario.reducedMotion) {
        await cdp.send('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
        })
      } else {
        await cdp.send('Emulation.setEmulatedMedia', { features: [] })
      }

      const loaded = cdp.once('Page.loadEventFired')
      // 加查询参数强制整页加载：仅 hash 变化时 Chrome 不会触发 load 事件
      await cdp.send('Page.navigate', { url: `${BASE}/?qa=${scenario.name}${scenario.route}` })
      await loaded
      await sleep(500)
      await cdp.evaluate(HELPERS)
      if (scenario.largeText) {
        await cdp.evaluate(`document.documentElement.style.fontSize = '${scenario.largeText}'`)
        await sleep(300)
      }

      let data = null
      let error = null
      if (scenario.script) {
        try {
          data = await cdp.evaluate(scenario.script)
        } catch (err) {
          error = String(err.message ?? err)
          try {
            data = await cdp.evaluate(
              `return { url: location.href, root: document.getElementById('root').childElementCount, text: document.body.innerText.replace(/\\s+/g,' ').slice(0, 300) }`,
            )
          } catch {
            /* 页面可能已不可用 */
          }
        }
      }

      if (scenario.reload) {
        const reloaded = cdp.once('Page.loadEventFired')
        await cdp.send('Page.navigate', { url: `${BASE}/?qa=${scenario.name}&reload=1${scenario.route}` })
        await reloaded
        await sleep(500)
        await cdp.evaluate(HELPERS)
      }
      if (scenario.keys) {
        for (const key of scenario.keys) {
          const code = key === 'Tab' ? 9 : 13
          await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code })
          await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code })
          await sleep(120)
        }
      }
      if (scenario.check) {
        const extra = await cdp.evaluate(scenario.check)
        data = { ...(data ?? {}), ...extra }
      }

      const shot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: Boolean(scenario.fullPage || scenario.clip),
        ...(scenario.clip
          ? {
              clip: await cdp.evaluate(
                `scrollTo({ top: 0, left: 0, behavior: 'instant' });
                 const r = document.querySelector('${scenario.clip}').getBoundingClientRect();
                 return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height, scale: 1 }`,
              ),
            }
          : {}),
      })
      const file = path.join(OUT_DIR, `${scenario.name}.png`)
      await writeFile(file, Buffer.from(shot.data, 'base64'))
      results.push({ name: scenario.name, file, data, error })
      console.log(`${error ? 'FAIL' : 'OK  '} ${scenario.name}${error ? ' :: ' + error : ''}`)
      if (data) console.log('     ' + JSON.stringify(data).slice(0, 400))
    }

    await writeFile(path.join(OUT_DIR, 'results.json'), JSON.stringify(results, null, 2))
    ws.close()
    const failed = results.filter((r) => r.error)
    console.log(`\n采集 ${results.length} 张，失败 ${failed.length} 张，输出目录 ${OUT_DIR}`)
    if (failed.length) process.exitCode = 1
  } finally {
    child.kill()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})