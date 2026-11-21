import { CheckIcon } from '../icons'

type SuccessHeadingProps = {
  title: string
  lead: string
}

/** 完成页标题：焦点落在这里，换步骤时读屏会先念出“成功了什么”。 */
export default function SuccessHeading({ title, lead }: SuccessHeadingProps) {
  return (
    <div className="mt-5 flex flex-col items-center text-center">
      <span className="flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-lagoon-600 text-white shadow-card">
        <span className="h-9 w-9">
          <CheckIcon />
        </span>
      </span>
      <h2 id="step-heading" tabIndex={-1} className="mt-3 text-[26px] font-bold leading-snug text-ink">
        {title}
      </h2>
      <p className="mt-1 text-lg leading-relaxed text-ink-soft">{lead}</p>
    </div>
  )
}
