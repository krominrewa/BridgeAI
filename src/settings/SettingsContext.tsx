import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type FontLevel = 'standard' | 'large' | 'xl'
export type ContrastLevel = 'standard' | 'high'
export type SpeechRate = 'slow' | 'normal' | 'fast'

export const SPEECH_RATE_VALUES: Record<SpeechRate, number> = {
  slow: 0.8,
  normal: 0.92,
  fast: 1.05,
}

export type DisplaySettings = {
  font: FontLevel
  contrast: ContrastLevel
  reduceMotion: boolean
  /** 简洁模式：只显示当前要做的事，次要信息收起。 */
  simple: boolean
  /** 逐步操作模式：把一步拆成小动作，桥桥逐条带做。 */
  guided: boolean
  /** 语音引导：默认开启，进入首页即朗读欢迎语。 */
  voiceGuide: boolean
  speechRate: SpeechRate
  /** 桥桥主动提示：停太久或连续出错时主动问一句。 */
  proactive: boolean
}

export const DEFAULT_SETTINGS: DisplaySettings = {
  font: 'standard',
  contrast: 'standard',
  reduceMotion: false,
  simple: false,
  guided: false,
  voiceGuide: true,
  speechRate: 'normal',
  proactive: true,
}

const STORAGE_KEY = 'bridgeai:display:v1'

function readSettings(): DisplaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>
    return {
      font: parsed.font === 'large' || parsed.font === 'xl' ? parsed.font : 'standard',
      contrast: parsed.contrast === 'high' ? 'high' : 'standard',
      reduceMotion: parsed.reduceMotion === true,
      simple: parsed.simple === true,
      guided: parsed.guided === true,
      // 旧版本存档没有这两个字段，按“默认开启”处理
      voiceGuide: parsed.voiceGuide !== false,
      speechRate: parsed.speechRate === 'slow' || parsed.speechRate === 'fast' ? parsed.speechRate : 'normal',
      proactive: parsed.proactive !== false,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function storageAvailable(): boolean {
  try {
    const probe = '__bridgeai_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

type SettingsContextValue = {
  settings: DisplaySettings
  setFont: (font: FontLevel) => void
  setContrast: (contrast: ContrastLevel) => void
  setReduceMotion: (value: boolean) => void
  setSimple: (value: boolean) => void
  setGuided: (value: boolean) => void
  setVoiceGuide: (value: boolean) => void
  setSpeechRate: (rate: SpeechRate) => void
  setProactive: (value: boolean) => void
  reset: () => void
  open: boolean
  setOpen: (open: boolean) => void
  canPersist: boolean
  systemReducedMotion: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(readSettings)
  const [open, setOpen] = useState(false)
  const [canPersist] = useState(storageAvailable)
  const [systemReducedMotion, setSystemReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => setSystemReducedMotion(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // 设置作用于整站根节点：字号、对比度、动画、简洁与逐步模式全站统一生效
  useEffect(() => {
    const root = document.documentElement
    root.dataset.font = settings.font
    root.dataset.contrast = settings.contrast
    root.dataset.motion = settings.reduceMotion || systemReducedMotion ? 'reduce' : 'full'
    root.dataset.simple = settings.simple ? 'on' : 'off'
    root.dataset.guided = settings.guided ? 'on' : 'off'
    if (!canPersist) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* 存储写入失败时设置仍在本次会话生效 */
    }
  }, [settings, systemReducedMotion, canPersist])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setFont: (font) => setSettings((prev) => ({ ...prev, font })),
      setContrast: (contrast) => setSettings((prev) => ({ ...prev, contrast })),
      setReduceMotion: (reduceMotion) => setSettings((prev) => ({ ...prev, reduceMotion })),
      setSimple: (simple) => setSettings((prev) => ({ ...prev, simple })),
      setGuided: (guided) => setSettings((prev) => ({ ...prev, guided })),
      setVoiceGuide: (voiceGuide) => setSettings((prev) => ({ ...prev, voiceGuide })),
      setSpeechRate: (speechRate) => setSettings((prev) => ({ ...prev, speechRate })),
      setProactive: (proactive) => setSettings((prev) => ({ ...prev, proactive })),
      reset: () => setSettings(DEFAULT_SETTINGS),
      open,
      setOpen,
      canPersist,
      systemReducedMotion,
    }),
    [settings, open, canPersist, systemReducedMotion],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings 必须在 SettingsProvider 内使用')
  return context
}