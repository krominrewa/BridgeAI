import { useEffect, useState } from 'react'
import { BridgeBuddy, SpeakerIcon } from './icons'
import { SPEECH_RATE_VALUES, useSettings } from '../settings/SettingsContext'
import { speak, speechSupported, stopSpeech } from '../speech/speechReader'

const INTRO =
  '欢迎来到数字桥梁。这里可以练习挂号、缴费、出行、医保和防诈骗。朗读随时可以在这里关闭。'

const SESSION_KEY = 'bridgeai:voice-intro:v1'

function markSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* 无法记录时最多多朗读一次，不影响使用 */
  }
}

function spokenThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

/** 首页语音条：默认开启朗读，进入即读欢迎语，并给出显眼的关闭按钮（参考《我的世界》Java 版）。 */
export default function VoiceWelcome() {
  const { settings, setVoiceGuide, setOpen } = useSettings()
  const [spokenOnce, setSpokenOnce] = useState(false)
  const rate = SPEECH_RATE_VALUES[settings.speechRate]

  useEffect(() => {
    if (!speechSupported || !settings.voiceGuide || spokenThisSession()) return
    const timer = setTimeout(() => {
      speak(INTRO, rate)
      markSession()
      setSpokenOnce(true)
    }, 700)
    return () => clearTimeout(timer)
    // 进入首页时只判断一次；语速变化由“再听一遍”使用最新值
  }, [])

  // 离开首页时停止欢迎语音，避免追着用户跑到下一页
  useEffect(() => () => stopSpeech(), [])

  const toggle = () => {
    if (settings.voiceGuide) {
      setVoiceGuide(false)
      stopSpeech()
      return
    }
    setVoiceGuide(true)
    speak(INTRO, rate)
    markSession()
    setSpokenOnce(true)
  }

  const replay = () => {
    if (!speechSupported) return
    if (!settings.voiceGuide) setVoiceGuide(true)
    speak(INTRO, rate)
    markSession()
    setSpokenOnce(true)
  }

  return (
    <section
      aria-label="语音朗读"
      className="border-b border-lagoon-200 bg-lagoon-50"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lagoon-700">
          <span className="h-5 w-5">
            <SpeakerIcon />
          </span>
        </span>
        <p className="min-w-[12rem] flex-1 text-base leading-relaxed text-lagoon-900">
          <span className="font-bold">
            {speechSupported ? (settings.voiceGuide ? '朗读已开启。' : '朗读已关闭。') : '这个浏览器不支持语音朗读。'}
          </span>
          {speechSupported
            ? '首页会自动读出欢迎语，练习中每一步也会读出来；不想听随时关掉。'
            : '可以用大字、高对比度和简洁模式；换用 Chrome 或 Edge 后可以使用朗读。'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {speechSupported ? (
            <>
              <button
                type="button"
                id="voice-welcome-toggle"
                onClick={toggle}
                aria-pressed={settings.voiceGuide}
                className="btn btn-secondary min-h-[44px] px-4 text-base"
              >
                {settings.voiceGuide ? '关闭朗读' : '开启朗读'}
              </button>
              <button
                type="button"
                id="voice-welcome-replay"
                onClick={replay}
                className="btn btn-ghost min-h-[44px] px-4 text-base"
              >
                {spokenOnce ? '再听一遍' : '听欢迎语'}
              </button>
            </>
          ) : null}
          <button
            type="button"
            id="voice-welcome-settings"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className="btn btn-help min-h-[44px] px-4 text-base"
          >
            <span className="h-5 w-5 shrink-0">
              <BridgeBuddy />
            </span>
            语音与辅助设置
          </button>
        </div>
      </div>
    </section>
  )
}