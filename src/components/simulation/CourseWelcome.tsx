import { BridgeBuddy, CheckIcon, SettingsIcon } from '../icons'
import type { WelcomeContent } from '../../simulation/courseFlow'
import { useSettings } from '../../settings/SettingsContext'

type CourseWelcomeProps = {
  welcome: WelcomeContent
  /** 上次完成的摘要，例如“11 月 20 日 · 错误 1 次 · 用时 2 分钟”。 */
  lastPractice?: string | null
  onStart: () => void
}

export default function CourseWelcome({ welcome, lastPractice, onStart }: CourseWelcomeProps) {
  const { setOpen } = useSettings()

  return (
    <>
      <div className="phone-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="flex items-center gap-4">
          <span className="h-16 w-16 shrink-0">
            <BridgeBuddy />
          </span>
          <h2 className="text-[26px] font-bold leading-snug text-ink">
            欢迎使用
            <br />
            {welcome.name}
          </h2>
        </div>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{welcome.lead}</p>
        {lastPractice ? (
          <p
            id="last-practice"
            className="mt-4 rounded-xl border border-lagoon-200 bg-lagoon-50 px-3 py-2.5 text-base leading-relaxed text-lagoon-900"
          >
            上次练习：{lastPractice}。再走一遍，会比上次更熟。
          </p>
        ) : null}
        <ul className="simple-hide mt-5 space-y-2.5">
          {welcome.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3 text-lg text-ink"
            >
              <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-700">
                <CheckIcon />
              </span>
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">{welcome.note}</p>
      </div>

      <div className="safe-bottom flex flex-wrap gap-2 border-t border-brand-100 bg-white px-4 pt-3">
        <button
          type="button"
          id="start-simulation"
          onClick={onStart}
          className="btn btn-primary min-h-[56px] min-w-0 flex-1 basis-[9rem] px-4 text-lg"
        >
          开始模拟
        </button>
        <button
          type="button"
          id="settings-button-welcome"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="btn btn-help min-h-[56px] shrink-0 px-3 text-lg"
        >
          <span className="h-6 w-6">
            <SettingsIcon />
          </span>
          显示与辅助
        </button>
      </div>
    </>
  )
}
