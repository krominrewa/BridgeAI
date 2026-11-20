import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type FontLevel = 'standard' | 'large' | 'xl'
export type ContrastLevel = 'standard' | 'high'

export type DisplaySettings = {
  font: FontLevel
  contrast: ContrastLevel
  reduceMotion: boolean
}

export const DEFAULT_SETTINGS: DisplaySettings = {
  font: 'standard',
  contrast: 'standard',
  reduceMotion: false,
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

  // 设置作用于整站根节点：字号、对比度、动画偏好全站统一生效
  useEffect(() => {
    const root = document.documentElement
    root.dataset.font = settings.font
    root.dataset.contrast = settings.contrast
    root.dataset.motion = settings.reduceMotion || systemReducedMotion ? 'reduce' : 'full'
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