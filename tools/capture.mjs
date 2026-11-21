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
/** 每门课的存储键与确认按钮文案，供场景脚本按课程驱动流程。 */
const COURSES = {
  appointment: { key: 'bridgeai:appointment:v1', confirm: '确认预约' },
  payment: { key: 'bridgeai:payment:v1', confirm: '确认缴费' },
  transit: { key: 'bridgeai:transit:v1', confirm: '确认行程' },
  insurance: { key: 'bridgeai:insurance:v1', confirm: '出示凭证' },
}
const STORAGE_KEYS = Object.values(COURSES).map((course) => course.key)
const STORAGE_KEY = COURSES.appointment.key

const HELPERS = `
window.__qa = {
  wait: (ms) => new Promise((r) => setTimeout(r, ms)),
  all: () => Array.from(document.querySelectorAll('button, a')).filter((el) => !el.closest('dialog')),
  byText: (t) => window.__qa.all().find((b) => b.textContent.trim().startsWith(t)),
  click: async (t) => {
    const el = window.__qa.byText(t)
    if (!el) throw new Error('找不到可点击元素：' + t)
    el.click()
    await window.__qa.wait(140)
  },
  // 只取练习手机内容区的选项；导航的“朗读开/关”也用 aria-pressed，不能算课程选项
  choices: () =>
    Array.from(document.querySelectorAll('.phone-scroll button[aria-pressed]')).filter((el) => !el.closest('dialog')),
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
    sessionStorage.removeItem(window.__qa.storageKey())
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
  courseId: 'appointment',
  courses: ${JSON.stringify(COURSES)},
  storageKey: () => window.__qa.courses[window.__qa.courseId].key,
  confirmLabel: () => window.__qa.courses[window.__qa.courseId].confirm,
  setInput: (id, value) => {
    const el = document.getElementById(id)
    if (!el) throw new Error('找不到输入框：' + id)
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  },
  verifySms: async () => {
    if (!document.getElementById('send-code')) {
      await window.__qa.autoPick()
      await window.__qa.wait(140)
    }
    await window.__qa.click('获取验证码')
    await window.__qa.wait(140)
    const code = (document.getElementById('sms-code') || {}).textContent || ''
    if (!/^\\d{6}$/.test(code)) throw new Error('没读到模拟短信里的验证码：' + code)
    window.__qa.setInput('code-input', code)
    await window.__qa.wait(140)
    return code
  },
  /** 每个还没人选中、且允许选的选择组点第一项；依赖组（先日期后时段）下一轮补齐。 */
  autoPick: async (rounds = 5) => {
    for (let round = 0; round < rounds; round += 1) {
      const pending = Array.from(document.querySelectorAll('[data-choice-group]')).find((box) => {
        const buttons = Array.from(box.querySelectorAll('button[aria-pressed]'))
        return buttons.length > 0 && !buttons.some((b) => b.getAttribute('aria-pressed') === 'true')
      })
      if (!pending) return true
      const target = Array.from(pending.querySelectorAll('button[aria-pressed]')).find(
        (b) => b.getAttribute('aria-disabled') !== 'true',
      )
      if (!target) return false
      target.click()
      await window.__qa.wait(150)
    }
    return true
  },
  /** 通用推进：按当前课程的选项结构一路点到第 target 步。 */
  advance: async (target) => {
    sessionStorage.removeItem(window.__qa.storageKey())
    const btn = document.getElementById('start-simulation')
    if (!btn) throw new Error('欢迎页没有开始按钮')
    btn.click()
    await window.__qa.wait(200)
    for (let i = 0; i < target; i++) {
      await window.__qa.autoPick()
      if (document.getElementById('send-code')) await window.__qa.verifySms()
      await window.__qa.click('下一步')
      if (window.__qa.notice()) throw new Error('第 ' + i + ' 步推进被拦下：' + window.__qa.notice())
    }
    return window.__qa.heading()
  },
  finishAny: async () => {
    await window.__qa.advance(4)
    await window.__qa.click(window.__qa.confirmLabel())
    await window.__qa.wait(280)
    return window.__qa.heading()
  },
  id: (i) => document.getElementById(i),
  clickId: async (i) => {
    const el = document.getElementById(i)
    if (!el) throw new Error('找不到元素：' + i)
    el.click()
    await window.__qa.wait(180)
  },
  attrs: () => ({
    font: document.documentElement.dataset.font,
    contrast: document.documentElement.dataset.contrast,
    motion: document.documentElement.dataset.motion,
    simple: document.documentElement.dataset.simple,
    guided: document.documentElement.dataset.guided,
  }),
  settings: () => {
    try {
      return JSON.parse(localStorage.getItem('bridgeai:display:v1') || 'null')
    } catch {
      return null
    }
  },
  rootPx: () => getComputedStyle(document.documentElement).fontSize,
  dialogOpen: () => {
    const d = document.querySelector('dialog')
    return Boolean(d && d.open)
  },
  noticeFocus: () => {
    const alert = document.querySelector('[role="alert"]')
    return Boolean(alert && document.activeElement && document.activeElement.contains(alert))
  },
  noticePlacement: () => {
    const alert = document.querySelector('[role="alert"]')
    if (!alert) return null
    const r = alert.getBoundingClientRect()
    const bar = document.getElementById('flow-action-bar').getBoundingClientRect()
    return { aboveBar: r.bottom <= bar.top + 1, inViewport: r.top >= 0 && r.bottom <= window.innerHeight }
  },
  pickDisabled: async () => {
    const el = window.__qa.choices().find((b) => b.getAttribute('aria-disabled') === 'true')
    if (!el) throw new Error('没有约满的时间段可点')
    el.click()
    await window.__qa.wait(140)
  },
  pickDateWithFull: async () => {
    const dates = window.__qa.choices().slice(0, 5)
    for (const day of dates) {
      day.click()
      await window.__qa.wait(120)
      if (window.__qa.choices().some((b) => b.getAttribute('aria-disabled') === 'true')) return true
    }
    return false
  },
  speechLabel: () => {
    const el = document.getElementById('speech-toggle')
    return el ? el.textContent.trim() : null
  },
  speechStatus: () => {
    const el = document.getElementById('speech-status')
    return el ? el.textContent.trim() : null
  },
}
`

const SCENARIOS = [
  { name: 'home-desktop', width: 1440, height: 900, route: '#/', fullPage: true,
    script: `await __qa.wait(700); return { overflow: __qa.overflow() }` },
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
    clip: '.phone-shell',
    script: `sessionStorage.removeItem('${STORAGE_KEY}'); return { overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-hospital-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(0); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-error-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.start(); await __qa.click('下一步'); return { notice: __qa.notice(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-help-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(1); await __qa.click('我需要帮助'); return { heading: __qa.heading(), help: __qa.help(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-schedule-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(3); await __qa.pick(0); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-confirm-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(4); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-success-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.finish(); return { heading: __qa.heading(), report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-success-desktop',
    width: 1440,
    height: 900,
    route: '#/simulation',
    clip: '.phone-shell',
    fullPage: true,
    script: `await __qa.finish(); return { heading: __qa.heading(), report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-report-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
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
    clip: '.phone-shell',
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
    clip: '.phone-shell',
    script: `await __qa.finish(); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-keyboard-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
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
    clip: '.phone-shell',
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
    clip: '.phone-shell',
    script: `await __qa.finish(); await __qa.click('再练一次');
      return { heading: __qa.heading(), report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-refresh-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(2); return { headingBeforeReload: __qa.heading() }`,
    reload: true,
    check: `return { headingAfterReload: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-320-mobile',
    width: 320,
    height: 568,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(0);
      const bar = document.getElementById('flow-action-bar').getBoundingClientRect();
      return { heading: __qa.heading(), overflow: __qa.overflow(),
        outerOverflowY: document.documentElement.scrollHeight - window.innerHeight,
        barVisible: bar.bottom <= window.innerHeight + 1 && bar.top >= 0 }`,
  },
  {
    name: 'sim-414-mobile',
    width: 414,
    height: 896,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(3); await __qa.pick(0);
      return { heading: __qa.heading(), overflow: __qa.overflow(),
        outerOverflowY: document.documentElement.scrollHeight - window.innerHeight }`,
  },
  {
    name: 'sim-single-scroll-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(0);
      const bar = document.getElementById('flow-action-bar').getBoundingClientRect();
      const ps = document.querySelector('.phone-scroll');
      return { outerOverflowY: document.documentElement.scrollHeight - window.innerHeight,
        innerCanScroll: ps.scrollHeight > ps.clientHeight,
        barVisible: bar.bottom <= window.innerHeight + 1 && bar.top >= 0,
        overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-desktop-1280',
    width: 1280,
    height: 800,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.finish(); return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'home-320-mobile',
    width: 320,
    height: 568,
    mobile: true,
    route: '#/',
    fullPage: true,
    script: `return { overflow: __qa.overflow(), wide: __qa.wide() }`,
  },
  {
    name: 'learning-320-mobile',
    width: 320,
    height: 568,
    mobile: true,
    route: '#/learning',
    fullPage: true,
    script: `return { overflow: __qa.overflow(), wide: __qa.wide() }`,
  },
  {
    name: 'learning-details-desktop',
    width: 1440,
    height: 900,
    route: '#/learning',
    fullPage: true,
    script: `document.querySelector('details summary').click(); await __qa.wait(200);
      return { detailsOpen: document.querySelector('details').open, overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-stats-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.start();
      await __qa.click('下一步'); await __qa.click('下一步'); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(0); await __qa.pickLast(); await __qa.click('下一步');
      await __qa.click('确认预约'); await __qa.wait(260);
      const report = __qa.report();
      return { errorsDeduped: /错误操作\\s*1 次/.test(report), overflow: __qa.overflow() }`,
  },
  {
    name: 'settings-panel-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    script: `await __qa.clickId('settings-button-welcome');
      return { dialogOpen: __qa.dialogOpen(), attrs: __qa.attrs(), rootPx: __qa.rootPx(),
        labelledBy: document.querySelector('dialog').getAttribute('aria-labelledby') }`,
  },
  {
    name: 'settings-font-large-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('font-large'); await __qa.clickId('settings-done');
      await __qa.start();
      const ps = document.querySelector('.phone-scroll');
      return { rootPx: __qa.rootPx(), attrs: __qa.attrs(), overflow: __qa.overflow(),
        phoneOverflow: ps.scrollWidth - ps.clientWidth, wide: __qa.wide() }`,
  },
  {
    name: 'settings-font-xl-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('font-xl'); await __qa.clickId('settings-done');
      await __qa.start();
      const ps = document.querySelector('.phone-scroll');
      const bar = document.getElementById('flow-action-bar').getBoundingClientRect();
      const help = document.getElementById('help-button').getBoundingClientRect();
      return { rootPx: __qa.rootPx(), attrs: __qa.attrs(), overflow: __qa.overflow(),
        phoneOverflow: ps.scrollWidth - ps.clientWidth, wide: __qa.wide(),
        outerOverflowY: document.documentElement.scrollHeight - window.innerHeight,
        barVisible: bar.bottom <= window.innerHeight + 1 && bar.top >= 0,
        helpW: Math.round(help.width), helpH: Math.round(help.height) }`,
  },
  {
    name: 'settings-xl-welcome-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('font-xl'); await __qa.clickId('settings-done');
      const start = document.getElementById('start-simulation').getBoundingClientRect();
      const entry = document.getElementById('settings-button-welcome').getBoundingClientRect();
      return { rootPx: __qa.rootPx(), startW: Math.round(start.width), startH: Math.round(start.height),
        entryH: Math.round(entry.height), overflow: __qa.overflow(),
        outerOverflowY: document.documentElement.scrollHeight - window.innerHeight }`,
  },
  {
    name: 'settings-font-xl-home-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/',
    fullPage: true,
    script: `await __qa.clickId('settings-button-nav'); await __qa.clickId('font-xl'); await __qa.clickId('settings-done');
      return { rootPx: __qa.rootPx(), overflow: __qa.overflow(), wide: __qa.wide() }`,
  },
  {
    name: 'settings-contrast-high-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('contrast-high'); await __qa.clickId('settings-done');
      await __qa.start();
      return { attrs: __qa.attrs(),
        softColor: getComputedStyle(document.querySelector('.text-ink-soft')).color,
        primaryBg: getComputedStyle(document.querySelector('.btn-primary')).backgroundColor,
        overflow: __qa.overflow() }`,
  },
  {
    name: 'settings-contrast-high-desktop',
    width: 1440,
    height: 900,
    route: '#/',
    fullPage: true,
    script: `await __qa.clickId('settings-button-nav'); await __qa.clickId('contrast-high'); await __qa.clickId('settings-done');
      return { attrs: __qa.attrs(),
        softColor: getComputedStyle(document.querySelector('.text-ink-soft')).color,
        cardBorder: getComputedStyle(document.querySelector('.surface-card')).borderTopColor,
        overflow: __qa.overflow() }`,
  },
  {
    name: 'settings-persist-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('font-xl');
      await __qa.clickId('contrast-high'); await __qa.clickId('motion-switch'); await __qa.clickId('settings-done');
      return { before: __qa.attrs(), rootPx: __qa.rootPx() }`,
    reload: true,
    check: `return { after: __qa.attrs(), rootPx: __qa.rootPx(), dialogOpen: __qa.dialogOpen() }`,
  },
  {
    name: 'settings-reset-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('font-xl'); await __qa.clickId('contrast-high');
      const changed = __qa.attrs();
      await __qa.clickId('settings-reset');
      const reset = __qa.attrs();
      await __qa.clickId('settings-done');
      return { changed, reset, rootPx: __qa.rootPx() }`,
  },
  {
    name: 'settings-keyboard-desktop',
    width: 1440,
    height: 900,
    route: '#/',
    script: `document.getElementById('settings-button-nav').focus();
      return { focusedEntry: document.activeElement.id }`,
    keys: ['Enter', 'Tab', 'Tab', 'Enter'],
    check: `const el = document.activeElement;
      return { dialogOpen: __qa.dialogOpen(), activeId: el.id, trapped: Boolean(el.closest('dialog')), font: __qa.attrs().font }`,
  },
  {
    name: 'settings-esc-desktop',
    width: 1440,
    height: 900,
    route: '#/',
    script: `document.getElementById('settings-button-nav').focus();
      return { focusedEntry: document.activeElement.id }`,
    keys: ['Enter', 'Escape'],
    check: `return { dialogOpen: __qa.dialogOpen(), focusReturned: document.activeElement.id }`,
  },
  {
    name: 'settings-motion-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('motion-switch');
      const switchChecked = __qa.id('motion-switch').getAttribute('aria-checked');
      await __qa.clickId('settings-done'); await __qa.start();
      return { switchChecked, attrs: __qa.attrs(),
        animDuration: getComputedStyle(document.querySelector('.animate-fade-up')).animationDuration }`,
  },
  {
    name: 'settings-system-motion-mobile',
    width: 390,
    height: 844,
    mobile: true,
    reducedMotion: true,
    route: '#/simulation',
    script: `await __qa.start(); await __qa.clickId('settings-button-sim');
      const initial = __qa.id('motion-switch').getAttribute('aria-checked');
      if (initial === 'true') await __qa.clickId('motion-switch');
      return { attrs: __qa.attrs(), switchInitial: initial,
        switchChecked: __qa.id('motion-switch').getAttribute('aria-checked'),
        noteMentionsSystem: __qa.id('motion-switch-note').textContent.includes('系统') }`,
  },
  {
    name: 'error-1-before-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.start(); return { notice: __qa.notice(), heading: __qa.heading() }`,
  },
  {
    name: 'error-2-notice-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.start(); await __qa.click('下一步');
      return { notice: __qa.notice(), focusOnNotice: __qa.noticeFocus(), placement: __qa.noticePlacement() }`,
  },
  {
    name: 'error-3-corrected-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.start(); await __qa.click('下一步'); await __qa.pick(0);
      return { notice: __qa.notice(), selected: __qa.choices()[0].getAttribute('aria-pressed'), heading: __qa.heading() }`,
  },
  {
    name: 'sim-error-dept-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(1); await __qa.click('下一步');
      return { heading: __qa.heading(), notice: __qa.notice(), focusOnNotice: __qa.noticeFocus() }`,
  },
  {
    name: 'sim-error-doctor-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(2); await __qa.click('下一步');
      return { heading: __qa.heading(), notice: __qa.notice(), focusOnNotice: __qa.noticeFocus() }`,
  },
  {
    name: 'sim-error-time-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(3); await __qa.click('下一步');
      const dateNotice = __qa.notice();
      await __qa.pick(0); await __qa.click('下一步');
      return { dateNotice, slotNotice: __qa.notice(), focusOnNotice: __qa.noticeFocus() }`,
  },
  {
    name: 'sim-error-fullslot-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(3);
      const hasFull = await __qa.pickDateWithFull();
      await __qa.pickDisabled();
      return { hasFull, notice: __qa.notice(), focusOnNotice: __qa.noticeFocus(), placement: __qa.noticePlacement() }`,
  },
  {
    name: 'sim-correct-continue-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.start(); await __qa.click('下一步'); await __qa.pick(0); await __qa.click('下一步');
      const stepAfterCorrect = __qa.heading();
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(0); await __qa.pickLast(); await __qa.click('下一步');
      await __qa.click('确认预约'); await __qa.wait(260);
      return { stepAfterCorrect, final: __qa.heading(), errorsOne: /错误操作\\s*1 次/.test(__qa.report()) }`,
  },
  {
    name: 'sim-stats-multi-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.start();
      await __qa.click('下一步'); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      const hasFull = await __qa.pickDateWithFull();
      await __qa.pickDisabled(); await __qa.pickDisabled();
      await __qa.pickLast(); await __qa.click('下一步');
      await __qa.click('确认预约'); await __qa.wait(260);
      const report = __qa.report();
      return { hasFull, errorsThree: /错误操作\\s*3 次/.test(report), hintsZero: /使用提示\\s*0 次/.test(report),
        review1: report.includes('第 1 步'), review2: report.includes('第 2 步'), review4: report.includes('第 4 步'),
        review3Absent: !report.includes('第 3 步') }`,
  },
  {
    name: 'sim-xl-single-scroll-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('font-xl'); await __qa.clickId('settings-done');
      await __qa.start();
      const bar = document.getElementById('flow-action-bar').getBoundingClientRect();
      const ps = document.querySelector('.phone-scroll');
      return { outerOverflowY: document.documentElement.scrollHeight - window.innerHeight,
        innerCanScroll: ps.scrollHeight > ps.clientHeight,
        barVisible: bar.bottom <= window.innerHeight + 1 && bar.top >= 0,
        phoneOverflow: ps.scrollWidth - ps.clientWidth, overflow: __qa.overflow() }`,
  },
  {
    name: 'learning-xl-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/learning',
    fullPage: true,
    script: `await __qa.clickId('settings-button-nav'); await __qa.clickId('font-xl'); await __qa.clickId('settings-done');
      return { rootPx: __qa.rootPx(), overflow: __qa.overflow(), wide: __qa.wide() }`,
  },
  {
    name: 'sim-report-xl-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome'); await __qa.clickId('font-xl'); await __qa.clickId('settings-done');
      await __qa.finish();
      document.querySelector('[aria-labelledby="learning-report-title"]').scrollIntoView({ block: 'center' });
      await __qa.wait(200);
      const ps = document.querySelector('.phone-scroll');
      return { report: __qa.report(), phoneOverflow: ps.scrollWidth - ps.clientWidth, wide: __qa.wide() }`,
  },
  // ——— 第五阶段：语音朗读与智能教学助手 ———
  {
    name: 'sim-speech-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    script: `await __qa.toStep(1); await __qa.click('我需要帮助');
      document.getElementById('speech-toggle').click();
      await __qa.wait(80);
      const playing = { label: __qa.speechLabel(), status: __qa.speechStatus() };
      if (playing.label !== '停止朗读') throw new Error('朗读状态未切换：' + playing.label);
      if (playing.status !== '正在朗读提示内容') throw new Error('读屏状态未播报：' + playing.status);
      await __qa.wait(120);
      const engaged = { speaking: speechSynthesis.speaking, speaks: __speechCalls.speak, cancels: __speechCalls.cancel };
      if (!engaged.speaking) throw new Error('语音未送入引擎');
      await __qa.clickId('speech-replay');
      const replay = { label: __qa.speechLabel(), speaks: __speechCalls.speak, cancels: __speechCalls.cancel };
      if (replay.label !== '停止朗读' || replay.speaks !== 2) throw new Error('重新朗读异常：' + JSON.stringify(replay));
      if (replay.cancels < replay.speaks) throw new Error('重读前未取消旧语音，可能叠加');
      await __qa.clickId('speech-toggle');
      const stopped = { label: __qa.speechLabel(), status: __qa.speechStatus(), speaking: speechSynthesis.speaking };
      if (stopped.label !== '读给我听' || stopped.speaking) throw new Error('停止朗读异常：' + JSON.stringify(stopped));
      if (stopped.status !== '朗读已停止') throw new Error('停止后读屏状态未更新');
      return { playing, engaged, replay, stopped, overflow: __qa.overflow(), wide: __qa.wide() }`,
  },
  {
    name: 'sim-speech-speaking-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    script: `await __qa.toStep(1); await __qa.click('我需要帮助'); await __qa.clickId('speech-toggle');
      const indicator = document.body.innerText.includes('正在朗读，读完会自动停止');
      if (!indicator) throw new Error('缺少可见朗读状态');
      return { label: __qa.speechLabel(), status: __qa.speechStatus(), indicator }`,
  },
  {
    name: 'sim-speech-step-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    script: `await __qa.toStep(1); await __qa.click('我需要帮助'); await __qa.clickId('speech-toggle');
      if (!speechSynthesis.speaking) throw new Error('朗读未开始');
      await __qa.click('下一步');
      const afterNext = { speaking: speechSynthesis.speaking, heading: __qa.heading(), panel: Boolean(document.getElementById('help-panel')) };
      if (afterNext.speaking || afterNext.panel) throw new Error('切换步骤后旧语音未停止');
      await __qa.click('我需要帮助');
      const reopened = { label: __qa.speechLabel() };
      if (reopened.label !== '读给我听') throw new Error('新步骤朗读状态未复位');
      await __qa.clickId('speech-toggle');
      await __qa.click('我明白了，继续操作');
      const afterDismiss = { speaking: speechSynthesis.speaking, panel: Boolean(document.getElementById('help-panel')) };
      if (afterDismiss.speaking || afterDismiss.panel) throw new Error('关闭提示后语音未停止');
      return { afterNext, reopened, afterDismiss }`,
  },
  {
    name: 'sim-speech-replay-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    script: `await __qa.toStep(1); await __qa.click('我需要帮助');
      const toggle = document.getElementById('speech-toggle');
      const replay = document.getElementById('speech-replay');
      toggle.click(); replay.click(); replay.click();
      await __qa.wait(140);
      const burst = { speak: __speechCalls.speak, cancel: __speechCalls.cancel };
      if (burst.speak > 3 || burst.cancel < burst.speak) throw new Error('快速连点出现叠加：' + JSON.stringify(burst));
      if (!speechSynthesis.speaking) throw new Error('连点后应仍在朗读');
      await __qa.wait(80); replay.click(); await __qa.wait(140);
      const spaced = { speak: __speechCalls.speak, cancel: __speechCalls.cancel };
      if (spaced.speak !== burst.speak + 1) throw new Error('重读未产生新语音：' + JSON.stringify(spaced));
      if (spaced.cancel < spaced.speak) throw new Error('重读前未取消旧语音');
      const label = __qa.speechLabel();
      if (label !== '停止朗读') throw new Error('连点后状态异常：' + label);
      return { burst, spaced, label, texts: __speechCalls.texts }`,
  },
  {
    name: 'sim-speech-unsupported-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    noSpeech: true,
    script: `await __qa.toStep(1); await __qa.click('我需要帮助');
      const hasToggle = Boolean(document.getElementById('speech-toggle'));
      const note = (document.getElementById('speech-unavailable') || {}).textContent || null;
      const text = (document.getElementById('help-text') || {}).textContent || '';
      if (hasToggle) throw new Error('不支持时不应显示朗读按钮');
      if (!note || !note.includes('不支持朗读')) throw new Error('缺少不支持说明');
      if (!text.includes('科室')) throw new Error('文字提示丢失');
      return { hasToggle, note, textLen: text.length, overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-speech-keyboard-desktop',
    width: 1440,
    height: 900,
    route: '#/simulation',
    speechStub: true,
    script: `await __qa.toStep(1); await __qa.click('我需要帮助');
      document.getElementById('speech-toggle').focus();
      return { focused: document.activeElement.id }`,
    keys: ['Enter'],
    check: `const label = __qa.speechLabel();
      const active = document.activeElement.id;
      const status = __qa.speechStatus();
      if (label !== '停止朗读' || active !== 'speech-toggle') throw new Error('键盘朗读失败：' + label + '/' + active);
      return { label, active, status }`,
  },
  {
    name: 'sim-speech-real-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(1); await __qa.click('我需要帮助');
      const supported = Boolean(window.speechSynthesis) && typeof window.SpeechSynthesisUtterance === 'function';
      if (!supported) throw new Error('此浏览器应有 speechSynthesis');
      const orig = speechSynthesis.speak.bind(speechSynthesis);
      window.__realSpeak = { calls: 0, lang: null, voiceLang: null };
      speechSynthesis.speak = (u) => {
        window.__realSpeak.calls += 1; window.__realSpeak.lang = u.lang;
        window.__realSpeak.voiceLang = u.voice ? u.voice.lang : null;
        return orig(u)
      };
      document.getElementById('speech-toggle').click();
      await __qa.wait(140);
      const submitted = { ...window.__realSpeak };
      if (submitted.calls < 1) throw new Error('未向真实引擎提交朗读');
      if (submitted.lang !== 'zh-CN') throw new Error('朗读未设置中文：' + submitted.lang);
      const label = __qa.speechLabel();
      const status = __qa.speechStatus();
      if (label !== '停止朗读' && label !== '读给我听') throw new Error('朗读按钮状态异常：' + label);
      document.getElementById('speech-toggle').click();
      await __qa.wait(140);
      const textOk = (document.getElementById('help-text') || {}).textContent.includes('科室');
      if (!textOk) throw new Error('朗读过程中文字提示丢失');
      if (speechSynthesis.pending > 0) throw new Error('真实引擎出现排队叠加');
      return { supported, submitted, label, status, textOk, pending: speechSynthesis.pending,
        voices: speechSynthesis.getVoices().length, finalLabel: __qa.speechLabel() }`,
  },
  {
    name: 'sim-speech-xl-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    largeText: '24px',
    script: `await __qa.toStep(1); await __qa.click('我需要帮助'); await __qa.clickId('speech-toggle');
      const t = document.getElementById('speech-toggle').getBoundingClientRect();
      document.getElementById('speech-replay').scrollIntoView({ block: 'nearest' });
      await __qa.wait(150);
      const r = document.getElementById('speech-replay').getBoundingClientRect();
      const bar = document.getElementById('flow-action-bar').getBoundingClientRect();
      const ps = document.querySelector('.phone-scroll');
      const wide = __qa.wide();
      if (t.height < 52) throw new Error('特大字号下朗读按钮过小');
      if (r.bottom > bar.top + 1) throw new Error('朗读按钮被操作栏遮挡');
      if (wide.length) throw new Error('特大字号横向溢出：' + JSON.stringify(wide));
      return { label: __qa.speechLabel(), toggleW: Math.round(t.width), toggleH: Math.round(t.height),
        replayW: Math.round(r.width), reachable: r.bottom <= bar.top + 1, windowScrollY: Math.round(scrollY),
        phoneOverflow: ps.scrollWidth - ps.clientWidth, overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-speech-reduced-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    reducedMotion: true,
    script: `await __qa.toStep(1); await __qa.click('我需要帮助'); await __qa.clickId('speech-toggle');
      const dot = document.querySelector('#help-panel .animate-pulse-soft');
      const duration = dot ? getComputedStyle(dot).animationDuration : null;
      const motion = __qa.attrs().motion;
      if (motion !== 'reduce') throw new Error('减少动画未生效');
      if (duration !== '0.001ms' && duration !== '1e-06s') throw new Error('朗读指示动画未随减少动画关闭：' + duration);
      return { motion, label: __qa.speechLabel(), dotDuration: duration,
        indicatorText: document.body.innerText.includes('正在朗读，读完会自动停止') }`,
  },
  {
    name: 'sim-ai-help-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(1); await __qa.click('我需要帮助');
      const initial = __qa.help();
      if (initial.includes('不是实时 AI 回答')) return { skipped: 'AI 代理未配置，走本地规则' };
      await __qa.wait(150);
      const loading = __qa.help().includes('桥桥正在思考');
      let ready = false;
      for (let i = 0; i < 30; i++) { if (__qa.help().includes('AI 智能指导')) { ready = true; break } await __qa.wait(200) }
      if (!ready) throw new Error('AI 指导未返回：' + __qa.help().slice(0, 120));
      const text = document.getElementById('help-text').textContent;
      if (!text.includes('【智能桥桥】')) throw new Error('AI 文本未显示：' + text.slice(0, 80));
      const orig = speechSynthesis.speak.bind(speechSynthesis);
      window.__aiSpeakText = null;
      speechSynthesis.speak = (u) => { window.__aiSpeakText = u.text; return orig(u) };
      document.getElementById('speech-toggle').click();
      await __qa.wait(140);
      if (!window.__aiSpeakText || !window.__aiSpeakText.includes('【智能桥桥】')) throw new Error('AI 文本未送入朗读');
      const speechLabel = __qa.speechLabel();
      document.getElementById('speech-toggle').click();
      return { loading, badge: document.getElementById('help-source').textContent, text, speechLabel, overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-ai-error-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(3);
      const found = await __qa.pickDateWithFull();
      if (!found) throw new Error('没有约满时间段可构造错误');
      await __qa.pickDisabled();
      const notice = __qa.notice();
      await __qa.click('我需要帮助');
      const initial = __qa.help();
      if (initial.includes('不是实时 AI 回答')) return { skipped: 'AI 代理未配置' };
      let ready = false;
      for (let i = 0; i < 30; i++) { if (__qa.help().includes('AI 智能指导')) { ready = true; break } await __qa.wait(200) }
      if (!ready) throw new Error('AI 指导未返回');
      const text = document.getElementById('help-text').textContent;
      if (!text.includes('约满')) throw new Error('AI 指导未结合错误情况：' + text.slice(0, 100));
      document.getElementById('help-panel').scrollIntoView({ block: 'nearest' });
      await __qa.wait(200);
      return { notice, text, overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-ai-fallback-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.toStep(1); await __qa.click('我需要帮助');
      let outcome = null;
      for (let i = 0; i < 40; i++) {
        const t = __qa.help();
        if (t.includes('智能助手暂不可用')) { outcome = 'failed'; break }
        if (t.includes('AI 智能指导')) { outcome = 'ai'; break }
        if (t.includes('不是实时 AI 回答')) { outcome = 'local'; break }
        await __qa.wait(200)
      }
      if (outcome !== 'failed') return { skipped: '仅代理故障时验证降级', outcome };
      const text = document.getElementById('help-text').textContent;
      if (!text.includes('科室')) throw new Error('降级后本地提示丢失');
      if (!document.getElementById('speech-toggle')) throw new Error('降级后朗读按钮丢失');
      return { badge: document.getElementById('help-source').textContent, text: text.slice(0, 80), overflow: __qa.overflow() }`,
  },

  // ——— 第六阶段：缴费 / 出行 / 医保三门新课程 ———
  {
    name: 'learning-four-courses-desktop',
    width: 1440,
    height: 900,
    route: '#/learning',
    fullPage: true,
    script: `const cards = document.querySelectorAll('article.surface-card').length;
      const upcoming = document.body.innerText.includes('筹备中');
      const links = Array.from(document.querySelectorAll('a[href*="#/simulation/"]')).map((a) => a.getAttribute('href'));
      if (cards !== 4) throw new Error('学习中心应有 4 张课程卡，实际 ' + cards);
      if (upcoming) throw new Error('仍有“筹备中”占位文案');
      return { cards, links, overflow: __qa.overflow() }`,
  },
  {
    name: 'payment-welcome-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'payment',
    route: '#/simulation/payment',
    clip: '.phone-shell',
    script: `const start = document.getElementById('start-simulation');
      const text = document.querySelector('.phone-scroll').innerText.replace(/\\s+/g, ' ');
      if (!start) throw new Error('缴费课没有开始按钮');
      if (!text.includes('模拟缴费')) throw new Error('欢迎页没有课程名');
      return { overflow: __qa.overflow() }`,
  },
  {
    name: 'payment-bill-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'payment',
    route: '#/simulation/payment',
    clip: '.phone-shell',
    script: `await __qa.advance(2);
      const text = document.querySelector('.phone-scroll').innerText.replace(/\\s+/g, ' ');
      if (!text.includes('应缴合计')) throw new Error('账单页缺少合计金额');
      return { heading: __qa.heading(), hasTotal: text.includes('应缴合计'), overflow: __qa.overflow() }`,
  },
  {
    name: 'payment-error-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'payment',
    route: '#/simulation/payment',
    clip: '.phone-shell',
    script: `await __qa.start();
      await __qa.click('下一步');
      const notice = __qa.notice();
      if (!notice || !notice.includes('还没有选缴哪种费用')) throw new Error('漏选类型没有提醒：' + notice);
      return { notice, focusOnNotice: __qa.noticeFocus(), placement: __qa.noticePlacement() }`,
  },
  {
    name: 'payment-amount-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'payment',
    route: '#/simulation/payment',
    clip: '.phone-shell',
    script: `await __qa.advance(3);
      await __qa.autoPick();
      const pressed = __qa.choices().filter((b) => b.getAttribute('aria-pressed') === 'true').length;
      if (pressed < 2) throw new Error('金额与缴费方式应各有一项被选中，实际 ' + pressed);
      return { heading: __qa.heading(), selected: pressed, overflow: __qa.overflow() }`,
  },
  {
    name: 'payment-success-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'payment',
    route: '#/simulation/payment',
    clip: '.phone-shell',
    script: `await __qa.finishAny();
      const text = document.querySelector('.phone-scroll').innerText.replace(/\\s+/g, ' ');
      if (!text.includes('模拟缴费成功')) throw new Error('没有到达缴费成功页');
      if (!/JF\\d{8}-\\d{4}/.test(text)) throw new Error('缴费凭证号缺失');
      return { heading: __qa.heading(), receipt: (text.match(/JF\\d{8}-\\d{4}/) || [])[0], report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'payment-help-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'payment',
    route: '#/simulation/payment',
    clip: '.phone-shell',
    script: `await __qa.advance(1);
      await __qa.click('我需要帮助');
      const help = __qa.help();
      if (!help.includes('户号')) throw new Error('缴费课帮助未解释户号：' + help.slice(0, 60));
      return { heading: __qa.heading(), help: help.slice(0, 80), overflow: __qa.overflow() }`,
  },
  {
    name: 'payment-refresh-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'payment',
    route: '#/simulation/payment',
    clip: '.phone-shell',
    script: `await __qa.advance(3); return { beforeReload: __qa.heading() }`,
    reload: true,
    check: `return { afterReload: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'payment-xl-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'payment',
    largeText: '24px',
    route: '#/simulation/payment',
    clip: '.phone-shell',
    script: `await __qa.advance(3);
      const ps = document.querySelector('.phone-scroll');
      const wide = __qa.wide();
      if (wide.length) throw new Error('特大字号横向溢出：' + JSON.stringify(wide));
      return { heading: __qa.heading(), phoneOverflow: ps.scrollWidth - ps.clientWidth, overflow: __qa.overflow() }`,
  },
  {
    name: 'transit-taxi-success-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'transit',
    route: '#/simulation/transit',
    clip: '.phone-shell',
    script: `await __qa.finishAny();
      const text = document.querySelector('.phone-scroll').innerText.replace(/\\s+/g, ' ');
      if (!text.includes('叫车成功')) throw new Error('没有到达叫车成功页');
      if (!text.includes('上车前请核对')) throw new Error('缺少车牌核对提醒');
      return { heading: __qa.heading(), plate: (text.match(/模拟 [A-H]\\d{4}/) || [])[0], report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'transit-bus-success-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'transit',
    route: '#/simulation/transit',
    clip: '.phone-shell',
    script: `await __qa.start();
      await __qa.pick(1); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.autoPick();
      const routeNotice = __qa.notice();
      await __qa.click('下一步');
      await __qa.click('确认行程'); await __qa.wait(280);
      const text = document.querySelector('.phone-scroll').innerText.replace(/\\s+/g, ' ');
      if (routeNotice) throw new Error('线路选择被拦下：' + routeNotice);
      if (!text.includes('行程已生成')) throw new Error('没有到达公交完成页');
      if (!text.includes('坐过站')) throw new Error('缺少到站提醒');
      return { heading: __qa.heading(), firstLast: text.includes('首班') || text.includes('末班'), overflow: __qa.overflow() }`,
  },
  {
    name: 'transit-unsafe-pickup-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'transit',
    route: '#/simulation/transit',
    clip: '.phone-shell',
    script: `await __qa.advance(2);
      await __qa.pickDisabled();
      const notice = __qa.notice();
      if (!notice || !notice.includes('马路中间')) throw new Error('不安全上车点没有提醒：' + notice);
      return { heading: __qa.heading(), notice, focusOnNotice: __qa.noticeFocus() }`,
  },
  {
    name: 'transit-no-car-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'transit',
    route: '#/simulation/transit',
    clip: '.phone-shell',
    script: `await __qa.advance(3);
      await __qa.pickDisabled();
      const notice = __qa.notice();
      if (!notice || !notice.includes('没有同路的车主')) throw new Error('约不到的车没有提醒：' + notice);
      return { heading: __qa.heading(), notice, overflow: __qa.overflow() }`,
  },
  {
    name: 'transit-help-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'transit',
    route: '#/simulation/transit',
    clip: '.phone-shell',
    script: `await __qa.advance(2);
      await __qa.click('我需要帮助');
      const help = __qa.help();
      if (!help.includes('马路中间')) throw new Error('上车点帮助缺少安全说明：' + help.slice(0, 60));
      return { heading: __qa.heading(), help: help.slice(0, 80), overflow: __qa.overflow() }`,
  },
  {
    name: 'transit-switch-course-desktop',
    width: 1440,
    height: 900,
    course: 'transit',
    route: '#/simulation/transit',
    fullPage: true,
    script: `const links = Array.from(document.querySelectorAll('aside a[href*="#/simulation/"]')).map((a) => a.getAttribute('href'));
      if (links.length !== 3) throw new Error('侧栏换课链接应为 3 条，实际 ' + links.length);
      return { links, overflow: __qa.overflow() }`,
  },
  {
    name: 'insurance-intro-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'insurance',
    route: '#/simulation/insurance',
    clip: '.phone-shell',
    script: `await __qa.start();
      const text = document.querySelector('.phone-scroll').innerText.replace(/\\s+/g, ' ');
      if (!text.includes('都是骗子')) throw new Error('首页缺少防骗提醒');
      await __qa.click('下一步');
      return { heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'insurance-verify-sms-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'insurance',
    route: '#/simulation/insurance',
    clip: '.phone-shell',
    script: `await __qa.advance(3);
      const before = __qa.notice();
      await __qa.click('下一步');
      const notice = __qa.notice();
      if (!notice || !notice.includes('验证码')) throw new Error('未验证就放行：' + notice);
      await __qa.verifySms();
      await __qa.click('下一步');
      if (__qa.notice()) throw new Error('验证码正确仍被拦下：' + __qa.notice());
      return { before, notice, heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'insurance-wrong-code-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'insurance',
    route: '#/simulation/insurance',
    clip: '.phone-shell',
    script: `await __qa.advance(3);
      await __qa.verifySms();
      __qa.setInput('code-input', '000000');
      await __qa.wait(120);
      await __qa.click('下一步');
      const notice = __qa.notice();
      if (!notice || !notice.includes('不一致')) throw new Error('错填验证码没有纠错提示：' + notice);
      return { notice, focusOnNotice: __qa.noticeFocus(), overflow: __qa.overflow() }`,
  },
  {
    name: 'insurance-face-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'insurance',
    route: '#/simulation/insurance',
    clip: '.phone-shell',
    script: `await __qa.start();
      await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.pick(1);
      await __qa.click('下一步');
      const notice = __qa.notice();
      if (!notice || !notice.includes('刷脸')) throw new Error('未刷脸应提醒：' + notice);
      await __qa.click('开始刷脸');
      await __qa.click('下一步');
      if (__qa.notice()) throw new Error('刷脸后仍被拦下：' + __qa.notice());
      return { notice, heading: __qa.heading(), overflow: __qa.overflow() }`,
  },
  {
    name: 'insurance-evidence-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'insurance',
    route: '#/simulation/insurance',
    clip: '.phone-shell',
    script: `await __qa.finishAny();
      const text = document.querySelector('.phone-scroll').innerText.replace(/\\s+/g, ' ');
      const cells = document.querySelectorAll('svg rect').length;
      if (cells < 40) throw new Error('凭证二维码没有画出来，方块数 ' + cells);
      if (!text.includes('最近的使用记录')) throw new Error('缺少使用记录');
      return { heading: __qa.heading(), cells, code: (text.match(/H32\\d{8}/) || [])[0], report: __qa.report(), overflow: __qa.overflow() }`,
  },
  {
    name: 'insurance-unbound-user-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'insurance',
    route: '#/simulation/insurance',
    clip: '.phone-shell',
    script: `await __qa.advance(2);
      await __qa.pickDisabled();
      const notice = __qa.notice();
      if (!notice || !notice.includes('不能代出示')) throw new Error('未绑定家人没有提醒：' + notice);
      return { heading: __qa.heading(), notice, overflow: __qa.overflow() }`,
  },
  {
    name: 'insurance-help-mobile',
    width: 390,
    height: 844,
    mobile: true,
    course: 'insurance',
    route: '#/simulation/insurance',
    clip: '.phone-shell',
    script: `await __qa.advance(1);
      await __qa.click('我需要帮助');
      const help = __qa.help();
      if (!help.includes('药店买药')) throw new Error('场景帮助未列举场景：' + help.slice(0, 60));
      return { heading: __qa.heading(), help: help.slice(0, 80), overflow: __qa.overflow() }`,
  },

  // ——— 第八阶段：简洁模式、逐步操作、语音引导与全站设置 ———
  {
    name: 'home-voice-autoplay-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/',
    fullPage: true,
    speechStub: true,
    script: `for (let i = 0; i < 40 && !document.getElementById('voice-welcome-toggle'); i++) await __qa.wait(150);
      const bar = document.getElementById('voice-welcome-toggle');
      if (!bar) throw new Error('首页缺少朗读开关');
      await __qa.wait(900);
      if (bar.getAttribute('aria-pressed') !== 'true') throw new Error('朗读默认未开启');
      if (!__speechCalls || __speechCalls.speak < 1) throw new Error('进入首页没有自动朗读');
      if (!__speechCalls.texts.some((t) => t.includes('欢迎来到数字桥梁'))) throw new Error('欢迎语内容不对：' + JSON.stringify(__speechCalls.texts));
      const nav = document.getElementById('voice-toggle-nav');
      if (!nav || nav.getAttribute('aria-pressed') !== 'true') throw new Error('主导航朗读开关状态不对');
      return { speaks: __speechCalls.speak, texts: __speechCalls.texts, nav: nav.textContent.trim(), overflow: __qa.overflow() }`,
  },
  {
    name: 'home-voice-off-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/',
    speechStub: true,
    script: `await __qa.wait(1000); await __qa.clickId('voice-welcome-toggle');
      const btn = document.getElementById('voice-welcome-toggle');
      if (btn.getAttribute('aria-pressed') !== 'false') throw new Error('关闭后开关状态未更新');
      if (btn.textContent.trim() !== '开启朗读') throw new Error('关闭后按钮文案未更新：' + btn.textContent);
      if (speechSynthesis.speaking) throw new Error('关闭后语音未停止');
      const saved = __qa.settings();
      if (!saved || saved.voiceGuide !== false) throw new Error('关闭状态没有保存：' + JSON.stringify(saved));
      return { label: btn.textContent.trim(), saved: saved.voiceGuide, speaks: __speechCalls.speak }`,
  },
  {
    name: 'nav-voice-toggle-desktop',
    width: 1440,
    height: 900,
    route: '#/',
    speechStub: true,
    script: `await __qa.wait(900); await __qa.clickId('voice-toggle-nav');
      const off = { pressed: document.getElementById('voice-toggle-nav').getAttribute('aria-pressed'),
        text: document.getElementById('voice-toggle-nav').textContent.trim(), saved: __qa.settings().voiceGuide };
      if (off.pressed !== 'false' || off.text !== '朗读关') throw new Error('导航关闭朗读异常：' + JSON.stringify(off));
      await __qa.clickId('voice-toggle-nav');
      const on = { pressed: document.getElementById('voice-toggle-nav').getAttribute('aria-pressed'),
        text: document.getElementById('voice-toggle-nav').textContent.trim(), saved: __qa.settings().voiceGuide };
      if (on.pressed !== 'true' || on.text !== '朗读开') throw new Error('导航开启朗读异常：' + JSON.stringify(on));
      await __qa.wait(120);
      if (!speechSynthesis.speaking) throw new Error('开启后没有朗读确认');
      return { off, on, overflow: __qa.overflow() }`,
  },
  {
    name: 'settings-simple-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome');
      const before = __qa.id('simple-switch').getAttribute('aria-checked');
      await __qa.clickId('simple-switch');
      const after = __qa.id('simple-switch').getAttribute('aria-checked');
      await __qa.clickId('settings-done');
      await __qa.start();
      const meta = document.querySelector('.simple-hide');
      if (!meta) throw new Error('简洁模式下找不到被收起的次要信息');
      const hidden = getComputedStyle(meta).display === 'none';
      const heading = document.querySelector('#step-heading');
      const options = document.querySelectorAll('button[aria-pressed]').length;
      if (!hidden) throw new Error('简洁模式没有收起次要信息');
      if (!heading || options < 3) throw new Error('简洁模式误伤了主要选项');
      return { before, after, hidden, attrs: __qa.attrs(), options, overflow: __qa.overflow() }`,
  },
  {
    name: 'settings-guided-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    script: `await __qa.clickId('settings-button-welcome');
      await __qa.clickId('guided-switch');
      const checked = __qa.id('guided-switch').getAttribute('aria-checked');
      await __qa.clickId('settings-done');
      await __qa.start();
      const panel = document.querySelector('[aria-label="逐步操作引导"]');
      if (!panel) throw new Error('逐步操作模式没有显示引导');
      if (!panel.textContent.includes('0 / 1')) throw new Error('小动作完成计数不对：' + panel.textContent.slice(0, 50));
      await __qa.clickId('guided-done');
      const waiting = panel.textContent.includes('还没有选医院');
      if (!waiting) throw new Error('没做到就点“我做好了”缺少提醒');
      await __qa.pick(0);
      const doneText = document.querySelector('[aria-label="逐步操作引导"]').textContent;
      if (!doneText.includes('1 / 1') || !doneText.includes('小动作都做好了')) throw new Error('完成后状态不对：' + doneText.slice(0, 60));
      return { checked, waiting, attrs: __qa.attrs(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-voice-step-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    script: `await __qa.start();
      await __qa.wait(400);
      if (!__speechCalls.texts.some((t) => t.includes('选择医院'))) throw new Error('开始练习后没有朗读当前步骤：' + JSON.stringify(__speechCalls.texts));
      const first = __speechCalls.speak;
      await __qa.clickId('voice-step-button');
      await __qa.wait(150);
      if (__speechCalls.speak !== first + 1) throw new Error('“朗读”按钮没有重复当前步骤');
      await __qa.pick(0); await __qa.click('下一步');
      await __qa.wait(400);
      if (!__speechCalls.texts.some((t) => t.includes('选择科室'))) throw new Error('换步后没有朗读新步骤：' + JSON.stringify(__speechCalls.texts));
      return { speaks: __speechCalls.speak, texts: __speechCalls.texts, heading: __qa.heading() }`,
  },
  {
    name: 'sim-voice-off-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    script: `await __qa.clickId('settings-button-welcome');
      await __qa.clickId('voice-switch');
      if (__qa.id('voice-switch').getAttribute('aria-checked') !== 'false') throw new Error('语音开关没有关闭');
      await __qa.clickId('settings-done');
      await __qa.start();
      await __qa.wait(400);
      if (__speechCalls.speak !== 0) throw new Error('关闭语音后仍自动朗读：' + JSON.stringify(__speechCalls.texts));
      await __qa.click('下一步');
      await __qa.wait(400);
      if (__speechCalls.speak !== 0) throw new Error('关闭语音后提醒仍在朗读');
      const stepButton = Boolean(document.getElementById('voice-step-button'));
      if (!stepButton) throw new Error('手动朗读按钮应保留');
      return { speaks: __speechCalls.speak, stepButton, notice: __qa.notice(), overflow: __qa.overflow() }`,
  },
  {
    name: 'sim-voice-notice-mobile',
    width: 390,
    height: 844,
    mobile: true,
    route: '#/simulation',
    clip: '.phone-shell',
    speechStub: true,
    script: `await __qa.start();
      await __qa.wait(400);
      await __qa.click('下一步');
      await __qa.wait(400);
      const texts = __speechCalls.texts;
      const notice = __qa.notice();
      if (!texts.some((t) => t.includes('还没有选医院'))) throw new Error('纠错提醒没有优先朗读：' + JSON.stringify(texts));
      if (!texts[texts.length - 1].includes('还没有选医院')) throw new Error('最后一次朗读不是纠错提醒：' + JSON.stringify(texts));
      return { notice: notice.slice(0, 30), last: texts[texts.length - 1], speaks: __speechCalls.speak }`,
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

/** 开发服务器偶尔冷启动较慢：等 React 挂载出内容再执行场景脚本。 */
async function waitForApp(cdp) {
  await cdp.evaluate(`for (let i = 0; i < 50; i++) {
    if (document.getElementById('root') && document.getElementById('root').childElementCount > 0) return true
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return false`)
}

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
    // 每个场景都从干净的练习状态与默认显示设置开始，避免上一场景的状态干扰
    // 两个存储分开清理：任一存储抛异常不影响另一个的清理
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `if (!location.search.includes('reload=1')) {
        ${STORAGE_KEYS.map((key) => `try { sessionStorage.removeItem('${key}') } catch (e) {}`).join('\n        ')}
        try { localStorage.removeItem('bridgeai:display:v1') } catch (e) {}
        window.__storageCleared = true
      }
      if (location.search.includes('speechstub=1')) {
        const calls = { speak: 0, cancel: 0, texts: [] }
        window.__speechCalls = calls
        const fake = {
          speaking: false, pending: false, paused: false,
          getVoices: () => [],
          addEventListener: () => {}, removeEventListener: () => {},
          speak: (u) => { calls.speak += 1; calls.texts.push(String(u.text).slice(0, 30)); fake.speaking = true },
          cancel: () => { calls.cancel += 1; fake.speaking = false },
          pause: () => {}, resume: () => {},
        }
        Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true })
        window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1 } }
      }
      if (location.search.includes('nospeech=1')) {
        Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true })
        Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: undefined, configurable: true })
      }`,
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
      const speechFlags = `${scenario.speechStub ? '&speechstub=1' : ''}${scenario.noSpeech ? '&nospeech=1' : ''}`
      const course = scenario.course ?? 'appointment'
      await cdp.send('Page.navigate', { url: `${BASE}/?qa=${scenario.name}${speechFlags}${scenario.route}` })
      await loaded
      await sleep(700)
      await waitForApp(cdp)
      await cdp.evaluate(HELPERS)
      await cdp.evaluate(`window.__qa.courseId = '${course}'; return window.__qa.courseId`)
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
        await waitForApp(cdp)
        await cdp.evaluate(HELPERS)
        await cdp.evaluate(`window.__qa.courseId = '${course}'; return window.__qa.courseId`)
      }
      if (scenario.keys) {
        for (const key of scenario.keys) {
          const codes = { Tab: 9, Enter: 13, Escape: 27 }
          const code = codes[key] ?? 13
          // Enter 需要附带字符事件才会触发按钮默认激活行为
          const extra = key === 'Enter' ? { text: '\r', unmodifiedText: '\r' } : {}
          await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code, ...extra })
          await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code })
          await sleep(120)
        }
      }
      if (scenario.check) {
        const extra = await cdp.evaluate(scenario.check)
        data = { ...(data ?? {}), ...extra }
      }

      let clip = null
      if (scenario.clip) {
        clip = await cdp.evaluate(
          `scrollTo({ top: 0, left: 0, behavior: 'instant' });
           const el = document.querySelector('${scenario.clip}');
           if (!el) return null;
           const r = el.getBoundingClientRect();
           return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height, scale: 1 }`,
        )
        if (!clip) data = { ...(data ?? {}), clipMissing: scenario.clip }
      }
      const shot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: Boolean(scenario.fullPage || scenario.clip),
        ...(clip ? { clip } : {}),
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