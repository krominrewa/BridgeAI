import type { ReactNode } from 'react'
import { AlertIcon, QuestionIcon, ShieldIcon } from '../icons'

export type NoteTone = 'lagoon' | 'amber' | 'brand'

const TONES: Record<NoteTone, string> = {
  lagoon: 'border-lagoon-200 bg-lagoon-50 text-lagoon-700',
  amber: 'border-amber-400 bg-amber-50 text-amber-900',
  brand: 'border-brand-200 bg-brand-50 text-brand-700',
}

const DEFAULT_ICONS: Record<NoteTone, ReactNode> = {
  lagoon: <ShieldIcon />,
  amber: <AlertIcon />,
  brand: <QuestionIcon />,
}

type NoteCardProps = {
  text: string
  /** 卡片里的小标题，科普类提示用得上，例如“违约金是什么”。 */
  title?: string
  tone?: NoteTone
  icon?: ReactNode
}

/** 步骤内的知识补充与安全说明：与“请注意”提醒区分，只解释不纠错。 */
export default function NoteCard({ text, title, tone = 'lagoon', icon }: NoteCardProps) {
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-2xl border-2 px-4 py-3 ${TONES[tone]}`}>
      <span className={`mt-0.5 h-6 w-6 shrink-0 ${tone === 'amber' ? 'text-amber-900' : ''}`}>{icon ?? DEFAULT_ICONS[tone]}</span>
      <p className={`text-base leading-relaxed ${tone === 'amber' ? 'text-amber-900' : 'text-ink-soft'}`}>
        {title ? <span className="mr-1 font-bold text-ink">{title}</span> : null}
        {text}
      </p>
    </div>
  )
}
