import { SparkIcon } from '../icons'

type HelpPanelProps = {
  text: string
  onDismiss: () => void
}

export default function HelpPanel({ text, onDismiss }: HelpPanelProps) {
  return (
    <div id="help-panel" role="status" className="mt-4 rounded-2xl border-2 border-lagoon-200 bg-lagoon-50 px-4 py-4">
      <p className="flex items-center gap-2 text-lg font-bold text-lagoon-800">
        <span className="h-6 w-6 shrink-0">
          <SparkIcon />
        </span>
        我来帮您
      </p>
      <p className="mt-2 text-lg leading-relaxed text-ink">{text}</p>
      <button type="button" onClick={onDismiss} className="btn btn-secondary mt-4 w-full text-lg">
        我明白了，继续操作
      </button>
    </div>
  )
}