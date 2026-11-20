import type { ReactNode } from 'react'
import { ArrowLeftIcon } from './icons'

type PhoneFrameProps = {
  title: string
  children: ReactNode
  onExit?: () => void
  preview?: boolean
}

function clockText(): string {
  const now = new Date()
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export default function PhoneFrame({ title, children, onExit, preview = false }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-full max-w-[380px]">
      <div className="rounded-[2.5rem] bg-ink p-[10px] shadow-phone">
        <div className="flex h-[640px] max-h-[74vh] flex-col overflow-hidden rounded-[2rem] bg-paper">
          <div className="flex items-center justify-between bg-white px-5 pb-1 pt-2.5 text-[13px] font-semibold text-ink">
            <span aria-hidden="true">{clockText()}</span>
            <span className="sr-only">{title}</span>
            <span className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2 w-1 rounded-sm bg-ink/30" />
              <span className="h-2.5 w-1 rounded-sm bg-ink/50" />
              <span className="h-3 w-1 rounded-sm bg-ink/70" />
              <span className="h-3.5 w-1 rounded-sm bg-ink" />
              <span className="ml-1 flex h-3.5 w-7 items-center rounded-[4px] border border-ink/40 p-[2px]">
                <span className="h-full w-3/4 rounded-[2px] bg-ink/70" />
              </span>
            </span>
          </div>

          <div className="flex items-center gap-[6px] border-b border-brand-100 bg-white px-[10px] py-2">
            {onExit ? (
              <button
                type="button"
                onClick={onExit}
                aria-label="退出练习，回到欢迎页"
                className="flex min-h-[44px] items-center gap-[4px] rounded-full px-[10px] text-[16px] font-semibold text-ink-soft hover:bg-brand-50 hover:text-brand-700"
              >
                <span className="h-[18px] w-[18px]">
                  <ArrowLeftIcon />
                </span>
                退出
              </button>
            ) : (
              <span className="min-h-[44px] w-[76px]" aria-hidden="true" />
            )}
            <p className="flex-1 text-center text-[17px] font-bold text-ink">模拟挂号</p>
            <span className="badge bg-lagoon-50 px-[10px] text-[15px] text-lagoon-800">{preview ? '界面预览' : '练习模式'}</span>
          </div>

          <div className="phone-scroll flex-1 overflow-y-auto">{children}</div>

          <div className="flex justify-center bg-white pb-2 pt-1.5" aria-hidden="true">
            <span className="h-1 w-24 rounded-full bg-ink/20" />
          </div>
        </div>
      </div>
    </div>
  )
}