import { BridgeBuddy } from '../icons'

type BuddyNudgeProps = {
  text: string
  onHelp: () => void
  onDismiss: () => void
}

/** 桥桥主动提示：停太久或连续出错时轻轻问一句，不抢焦点、不自动展开帮助。 */
export default function BuddyNudge({ text, onHelp, onDismiss }: BuddyNudgeProps) {
  return (
    <section
      id="buddy-nudge"
      role="status"
      aria-live="polite"
      className="mt-3 rounded-2xl border-2 border-brand-200 bg-brand-50 px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <span className="h-8 w-8 shrink-0">
          <BridgeBuddy />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-brand-800">桥桥在旁边提醒</p>
          <p className="mt-1 text-lg leading-relaxed text-ink">{text}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          id="nudge-help"
          onClick={onHelp}
          className="btn btn-secondary min-h-[48px] min-w-0 flex-1 basis-[9rem] px-3 text-base"
        >
          看看提示
        </button>
        <button
          type="button"
          id="nudge-dismiss"
          onClick={onDismiss}
          className="btn btn-help min-h-[48px] min-w-0 flex-1 basis-[9rem] px-3 text-base"
        >
          我自己再试试
        </button>
      </div>
    </section>
  )
}