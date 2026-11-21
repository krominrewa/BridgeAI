import { CheckIcon } from '../../components/icons'
import type { FraudScenario } from '../../data/fraud'

type TranscriptProps = {
  scenario: FraudScenario
  /** 传入时每一句都可点，用于找出可疑点。 */
  marked?: string[]
  onInspect?: (lineId: string) => void
}

/** 虚构通话/短信记录：只看不点时是普通对话，可点时整句就是一个按钮。 */
export default function Transcript({ scenario, marked, onInspect }: TranscriptProps) {
  const interactive = Boolean(onInspect)

  return (
    <div className="mt-4 rounded-2xl border-2 border-brand-100 bg-white px-4 py-4">
      <p className="text-base font-semibold text-ink-soft">{scenario.sender}</p>
      <p className="mt-1 text-base leading-relaxed text-ink-muted">{scenario.transcriptLead}</p>

      <ul className="mt-4 space-y-3">
        {scenario.lines.map((line) => {
          const mine = line.from === '您'
          const isMarked = line.clueId ? marked?.includes(line.clueId) ?? false : false
          const bubble = (
            <>
              <span className="block text-sm font-semibold text-ink-muted">{line.from}</span>
              <span
                className={`mt-1 flex items-start gap-2 rounded-2xl border-2 px-3 py-2 text-lg leading-relaxed ${
                  mine
                    ? 'border-brand-100 bg-brand-50 text-brand-900'
                    : isMarked
                      ? 'border-lagoon-400 bg-lagoon-50 text-ink'
                      : 'border-paper bg-paper text-ink'
                }`}
              >
                <span className="min-w-0 flex-1">{line.text}</span>
                {isMarked ? (
                  <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-700" aria-hidden="true">
                    <CheckIcon />
                  </span>
                ) : null}
              </span>
            </>
          )

          return (
            <li key={line.id} className={mine ? 'pl-7' : 'pr-7'}>
              {interactive ? (
                <button
                  type="button"
                  id={`clue-${line.id}`}
                  aria-pressed={isMarked}
                  onClick={() => onInspect?.(line.id)}
                  className="w-full rounded-2xl text-left transition-transform duration-150 active:scale-[0.995]"
                >
                  {bubble}
                  <span className="mt-1 block text-sm font-semibold text-brand-700">
                    {isMarked ? '已标为可疑' : '点一下，标出可疑的句子'}
                  </span>
                </button>
              ) : (
                bubble
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}