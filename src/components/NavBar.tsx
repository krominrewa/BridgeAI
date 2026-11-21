import { LogoMark, SettingsIcon, SpeakerIcon } from './icons'
import { hrefFor, type Route } from '../router'
import { SPEECH_RATE_VALUES, useSettings } from '../settings/SettingsContext'
import { speak, speechSupported, stopSpeech } from '../speech/speechReader'

const NAV_ITEMS: { route: Route; label: string }[] = [
  { route: 'home', label: '首页' },
  { route: 'learning', label: '学习中心' },
  { route: 'about', label: '关于项目' },
]

type NavBarProps = {
  current: Route
}

export default function NavBar({ current }: NavBarProps) {
  const activeKey: Route = current === 'simulation' ? 'learning' : current
  const { settings, setOpen, setVoiceGuide } = useSettings()

  // 朗读开关放在主导航里：视力障碍用户不必先找到设置面板
  const toggleVoice = () => {
    const next = !settings.voiceGuide
    setVoiceGuide(next)
    if (next) speak('朗读已开启', SPEECH_RATE_VALUES[settings.speechRate])
    else stopSpeech()
  }

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <nav
        aria-label="主导航"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2 sm:px-5 sm:py-3"
      >
        <a
          href={hrefFor('home')}
          className="flex shrink-0 items-center gap-2 rounded-2xl px-1 py-1 text-xl font-bold text-ink sm:gap-3 sm:text-2xl"
        >
          <span className="h-9 w-9 sm:h-11 sm:w-11">
            <LogoMark />
          </span>
          <span>
            数字桥梁<span className="ml-2 hidden text-brand-600 md:inline">BridgeAI</span>
          </span>
        </a>

        <ul className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.route === activeKey
            return (
              <li key={item.route}>
                <a
                  href={hrefFor(item.route)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[44px] items-center rounded-full px-3 text-base font-semibold transition-colors sm:min-h-[52px] sm:px-5 sm:text-lg ${
                    isActive
                      ? 'bg-brand-700 text-white'
                      : 'text-ink-soft hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
          {speechSupported ? (
            <li>
              <button
                type="button"
                id="voice-toggle-nav"
                onClick={toggleVoice}
                aria-pressed={settings.voiceGuide}
                aria-label={settings.voiceGuide ? '关闭自动朗读' : '开启自动朗读'}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-2 text-base font-semibold transition-colors sm:min-h-[52px] sm:px-4 sm:text-lg ${
                  settings.voiceGuide
                    ? 'bg-lagoon-50 text-lagoon-800 hover:bg-lagoon-100'
                    : 'bg-paper text-ink-soft hover:bg-brand-50'
                }`}
              >
                <span className="h-5 w-5 shrink-0 sm:h-6 sm:w-6">
                  <SpeakerIcon />
                </span>
                朗读{settings.voiceGuide ? '开' : '关'}
              </button>
            </li>
          ) : null}
          <li>
            <button
              type="button"
              id="settings-button-nav"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-label="显示与辅助设置"
              className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-brand-50 px-2 text-base font-semibold text-brand-700 transition-colors hover:bg-brand-100 sm:min-h-[52px] sm:px-4 sm:text-lg"
            >
              <span className="h-5 w-5 shrink-0 sm:h-6 sm:w-6">
                <SettingsIcon />
              </span>
              <span className="sm:hidden">辅助设置</span>
              <span className="hidden sm:inline">显示与辅助</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}