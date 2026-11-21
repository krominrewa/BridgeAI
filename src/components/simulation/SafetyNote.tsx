import { ShieldIcon } from '../icons'

type SafetyNoteProps = {
  text: string
}

/** 练习安全说明：青绿色卡片，与琥珀色的“请注意”提醒分工明确。 */
export default function SafetyNote({ text }: SafetyNoteProps) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-lagoon-200 bg-lagoon-50 px-4 py-3">
      <span className="mt-0.5 h-6 w-6 shrink-0 text-lagoon-700">
        <ShieldIcon />
      </span>
      <p className="text-base leading-relaxed text-ink-soft">{text}</p>
    </div>
  )
}
