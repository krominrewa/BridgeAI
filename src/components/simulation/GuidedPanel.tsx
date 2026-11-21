import { useState } from 'react'
import { BridgeBuddy, CheckIcon } from '../icons'
import type { MicroTask } from '../../simulation/courseFlow'

type GuidedPanelProps<S> = {
  state: S
  tasks: MicroTask<S>[]
}

/** 逐步操作模式：一次只提示一个未完成的小动作，完成即自动打勾。 */
export default function GuidedPanel<S>({ state, tasks }: GuidedPanelProps<S>) {
  const [collapsed, setCollapsed] = useState(false)
  const [waiting, setWaiting] = useState<string | null>(null)

  if (tasks.length === 0) return null

  if (collapsed) {
    return (
      <button
        type="button"
        id="guided-expand"
        onClick={() => setCollapsed(false)}
        className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-lagoon-300 bg-white px-3 text-base font-semibold text-lagoon-800 hover:bg-lagoon-50"
      >
        <span className="h-5 w-5 shrink-0">
          <BridgeBuddy />
        </span>
        展开逐步引导
      </button>
    )
  }

  const doneCount = tasks.filter((task) => task.done(state)).length
  const current = tasks.find((task) => !task.done(state))

  return (
    <section
      aria-label="逐步操作引导"
      aria-live="polite"
      className="mt-3 rounded-2xl border-2 border-lagoon-200 bg-lagoon-50 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-lg font-bold text-lagoon-800">
          <span className="h-6 w-6 shrink-0">
            <BridgeBuddy />
          </span>
          桥桥带您做
          <span className="text-base font-semibold text-lagoon-700">
            {doneCount} / {tasks.length}
          </span>
        </p>
        <button
          type="button"
          id="guided-collapse"
          onClick={() => setCollapsed(true)}
          className="min-h-[44px] shrink-0 rounded-full px-3 text-base font-semibold text-lagoon-800 hover:bg-lagoon-100"
        >
          收起
        </button>
      </div>

      <ol className="mt-2 space-y-1.5">
        {tasks.map((task, index) => {
          const done = task.done(state)
          const isCurrent = task.id === current?.id
          return (
            <li
              key={task.id}
              className={`flex items-start gap-2 rounded-xl px-2.5 py-2 text-lg leading-relaxed ${
                isCurrent ? 'bg-white font-semibold text-ink ring-2 ring-lagoon-300' : 'text-ink-soft'
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done ? 'bg-lagoon-600 text-white' : 'border-2 border-lagoon-300 bg-white text-lagoon-800'
                }`}
              >
                {done ? (
                  <span className="h-4 w-4">
                    <CheckIcon />
                  </span>
                ) : (
                  index + 1
                )}
              </span>
              <span className="min-w-0 flex-1">
                {task.text}
                <span className="sr-only">{done ? '，已完成' : isCurrent ? '，正在进行' : ''}</span>
              </span>
            </li>
          )
        })}
      </ol>

      {current ? (
        <>
          <button
            type="button"
            id="guided-done"
            onClick={() => setWaiting(current.waiting)}
            className="btn btn-secondary mt-3 min-h-[52px] w-full text-lg"
          >
            我做好了，下一步
          </button>
          <p role="status" className="mt-2 text-base leading-relaxed text-lagoon-900">
            {waiting ?? ''}
          </p>
        </>
      ) : (
        <p className="mt-2 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-lg font-semibold text-lagoon-900">
          <span className="h-5 w-5 shrink-0 text-lagoon-700">
            <CheckIcon />
          </span>
          这一步的小动作都做好了，点下方按钮继续。
        </p>
      )}
    </section>
  )
}