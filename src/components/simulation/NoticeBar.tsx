import { AlertIcon } from '../icons'

type NoticeBarProps = {
  text: string
}

export default function NoticeBar({ text }: NoticeBarProps) {
  return (
    <div
      role="alert"
      className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3"
    >
      <span className="mt-0.5 h-6 w-6 shrink-0 text-amber-700">
        <AlertIcon />
      </span>
      <p className="text-lg font-medium leading-relaxed text-amber-900">{text}</p>
    </div>
  )
}
