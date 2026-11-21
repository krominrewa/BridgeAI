import type { ReactNode } from 'react'
import { ArrowLeftIcon } from './icons'

type PhoneFrameProps = {
  /** 顶栏中间显示的课程名，例如“模拟挂号”。 */
  label: string
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

export default function PhoneFrame({ label, title, children, onExit, preview = false }: PhoneFrameProps) {
  return (
    <div className="phone-shell mx-auto flex w-full min-h-0 flex-1 flex-col lg:max-w-[380px] lg:flex-none lg:min-h-[auto]">
      {/* 桌面：精致手机外框；移动：去外框的全屏应用布局（首页预览保留轻卡片边） */}
      <div
        className={`flex min-h-0 flex-1 flex-col lg:block lg:rounded-[2.5rem] lg:bg-ink lg:p-[10px] lg:shadow-phone ${
          preview ? 'overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card lg:border-0' : ''
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper lg:h-[640px] lg:max-h-[74vh] lg:flex-none lg:rounded-[2rem]">
          <div className="hidden items-center justify-between bg-white px-5 pb-1 pt-2.5 text-[13px] font-semibold text-ink lg:flex">
            <span aria-hidden="true">{clockText()}</span>
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
            <p className="flex-1 text-center text-[17px] font-bold text-ink">{label}</p>
            <span className="badge bg-lagoon-50 px-[10px] text-[15px] text-lagoon-800">{preview ? '界面预览' : '练习模式'}</span>
          </div>
          <span className="sr-only">{title}</span>

          <div className="flex min-h-0 flex-1 flex-col">{children}</div>

          <div className="hidden justify-center bg-white pb-2 pt-1.5 lg:flex" aria-hidden="true">
            <span className="h-1 w-24 rounded-full bg-ink/20" />
          </div>
        </div>
      </div>
    </div>
  )
}