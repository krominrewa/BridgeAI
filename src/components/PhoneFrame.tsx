import type { ReactNode } from 'react'

type PhoneFrameProps = {
  title: string
  children: ReactNode
}

export default function PhoneFrame({ title, children }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="rounded-[2.75rem] bg-ink p-3 shadow-phone">
        <div className="overflow-hidden rounded-[2.25rem] bg-white">
          <div className="flex items-center justify-between bg-brand-50 px-5 py-3 text-sm font-medium text-ink-soft">
            <span>09:30</span>
            <span className="sr-only">{title}</span>
            <span className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-1.5 rounded-sm bg-brand-300" />
              <span className="h-3.5 w-1.5 rounded-sm bg-brand-400" />
              <span className="h-4 w-1.5 rounded-sm bg-brand-600" />
              <span className="ml-1 h-3 w-6 rounded-sm border border-brand-400" />
            </span>
          </div>
          <div className="min-h-[520px] bg-white">{children}</div>
          <div className="flex justify-center bg-white py-3" aria-hidden="true">
            <span className="h-1.5 w-28 rounded-full bg-brand-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
