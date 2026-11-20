import { BridgeBuddy } from '../icons'

type HelpPanelProps = {
  text: string
  onDismiss: () => void
}

export default function HelpPanel({ text, onDismiss }: HelpPanelProps) {
  return (
    <div id="help-panel" role="status" className="mt-3 rounded-2xl border-2 border-lagoon-200 bg-lagoon-50 px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 shrink-0">
          <BridgeBuddy />
        </span>
        <div>
          <p className="text-lg font-bold leading-snug text-lagoon-800">桥桥来帮您</p>
          <p className="text-base leading-snug text-ink-soft">本地规则提示 · 不是实时 AI 回答</p>
        </div>
      </div>
      <p className="mt-3 text-lg leading-relaxed text-ink">{text}</p>
      <button type="button" onClick={onDismiss} className="btn btn-secondary mt-4 min-h-[52px] w-full text-lg">
        我明白了，继续操作
      </button>
    </div>
  )
}