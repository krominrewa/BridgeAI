/**
 * 桥桥朗读器：封装 Web Speech API 的中文朗读。
 * 语音引导开启时由流程自动朗读，也可以由用户点击触发；始终不使用麦克风。
 * 模块级单例：同一时刻最多一条语音，新朗读先取消旧朗读，防止叠加。
 */

export type SpeechState = 'idle' | 'speaking'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

export const speechSupported = Boolean(synth && typeof window.SpeechSynthesisUtterance === 'function')

let state: SpeechState = 'idle'
let current: SpeechSynthesisUtterance | null = null
let pendingTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<(next: SpeechState) => void>()

function setState(next: SpeechState): void {
  if (state === next) return
  state = next
  listeners.forEach((listener) => listener(next))
}

export function getSpeechState(): SpeechState {
  return state
}

export function subscribeSpeechState(listener: (next: SpeechState) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function pickChineseVoice(): SpeechSynthesisVoice | null {
  const voices = synth?.getVoices() ?? []
  const normalized = (voice: SpeechSynthesisVoice) => voice.lang.replace('_', '-').toLowerCase()
  return (
    voices.find((voice) => normalized(voice) === 'zh-cn') ??
    voices.find((voice) => normalized(voice).startsWith('zh')) ??
    null
  )
}

function clearPending(): void {
  if (pendingTimer !== null) {
    clearTimeout(pendingTimer)
    pendingTimer = null
  }
}

/** 朗读一段文字；重复调用会先停掉上一条，从头朗读新内容。 */
export function speak(text: string, rate = 0.92): void {
  if (!synth || !speechSupported || !text) return
  clearPending()
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  const voice = pickChineseVoice()
  if (voice) utterance.voice = voice
  utterance.rate = rate
  utterance.onend = () => {
    if (current === utterance) {
      current = null
      setState('idle')
    }
  }
  utterance.onerror = () => {
    if (current === utterance) {
      current = null
      setState('idle')
    }
  }
  current = utterance
  setState('speaking')
  // Chrome 在 cancel() 后立刻 speak() 偶尔会丢话音，留一帧间隔再送入
  pendingTimer = setTimeout(() => {
    pendingTimer = null
    if (current === utterance) synth.speak(utterance)
  }, 50)
}

export function stopSpeech(): void {
  clearPending()
  current = null
  if (synth) synth.cancel()
  setState('idle')
}

// 提前触发一次语音列表加载：部分浏览器的中文语音要等 voiceschanged 后才可用
if (synth) {
  synth.getVoices()
  synth.addEventListener?.('voiceschanged', () => {
    synth.getVoices()
  })
}