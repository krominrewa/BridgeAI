import { AlertIcon } from '../icons'

type NoticeBarProps = {
  text: string
}

export default function NoticeBar({ text }: NoticeBarProps) {
  return (
    <div role="alert" className="mb-4 mt-4 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3">
      <p className="flex items-center gap-2 text-lg font-bold text-amber-900">
        <span className="h-6 w-6 shrink-0">
          <AlertIcon />
        </span>
        请注意
      </p>
      <p className="mt-1 text-lg leading-relaxed text-amber-900">{text}</p>
    </div>
  )
}