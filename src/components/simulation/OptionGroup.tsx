import type { ReactNode } from 'react'
import ChoiceButton, { type ChoiceTag } from './ChoiceButton'

export type Option = {
  id: string
  title: string
  description?: string
  meta?: string
  icon?: ReactNode
  tag?: ChoiceTag
  /** 不能选的原因（例如已约满）：仍可聚焦，点下去会得到文字提醒而不是静默无反应。 */
  unavailable?: boolean
}

type OptionGroupProps = {
  options: Option[]
  selectedId: string | null
  onSelect: (id: string) => void
  onUnavailable?: (id: string) => void
  /** 传数字时显示为带序号的小标题，用于一步里有两件事的场景。 */
  index?: number
  text?: string
  /** 当前还不能选（例如还没选日期）时的说明。 */
  note?: string
}

/** 一步里要做两件以上的事时，用带序号的小标题分块。 */
export function GroupTitle({ index, text }: { index: number; text: string }) {
  return (
    <h3 className="mt-5 flex items-center gap-2 text-lg font-bold text-ink">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
        {index}
      </span>
      {text}
    </h3>
  )
}

export default function OptionGroup({
  options,
  selectedId,
  onSelect,
  onUnavailable,
  index,
  text,
  note,
}: OptionGroupProps) {
  return (
    <div>
      {text ? (index === undefined ? <h3 className="mt-5 text-lg font-bold text-ink">{text}</h3> : <GroupTitle index={index} text={text} />) : null}
      {note ? <p className="mt-2 text-lg leading-relaxed text-ink-soft">{note}</p> : null}
      <div className="mt-3 space-y-3" data-choice-group={text ?? 'options'}>
        {options.map((option) => (
          <ChoiceButton
            key={option.id}
            title={option.title}
            description={option.description}
            meta={option.meta}
            icon={option.icon}
            tag={option.tag}
            selected={selectedId === option.id}
            unavailable={option.unavailable}
            onClick={() => {
              if (option.unavailable) {
                onUnavailable?.(option.id)
                return
              }
              onSelect(option.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}
