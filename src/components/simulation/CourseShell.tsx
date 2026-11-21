import { useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import CourseWelcome from './CourseWelcome'
import FlowActions from './FlowActions'
import FlowProgress from './FlowProgress'
import HelpPanel from './HelpPanel'
import LearningReport from './LearningReport'
import NoticeBar from './NoticeBar'
import { BridgeBuddy, SettingsIcon } from '../icons'
import { hrefFor } from '../../router'
import type { CourseEngine, WelcomeContent } from '../../simulation/courseFlow'
import type { FlowActionBase, FlowBase } from '../../simulation/flowKit'
import { buildLearningReport } from '../../simulation/learningReport'
import { useSettings } from '../../settings/SettingsContext'
import { stopSpeech } from '../../speech/speechReader'

type CourseShellProps<S extends FlowBase, X extends { type: string }> = {
  engine: CourseEngine<S, X>
  welcome: WelcomeContent
  /** 各课程对“什么算一次错误操作”的说明，随学习小结显示。 */
  reportNote: string
  state: S
  dispatch: Dispatch<FlowActionBase | X>
}

/** 课程练习的统一外壳：欢迎页、步骤进度、帮助与提醒、底部操作栏都由这里编排。 */
export default function CourseShell<S extends FlowBase, X extends { type: string }>({
  engine,
  welcome,
  reportNote,
  state,
  dispatch,
}: CourseShellProps<S, X>) {
  const StepComponent = engine.steps[state.step] ?? engine.steps[0]
  const finished = state.step === engine.successStep
  const lastStep = useRef(state.step)
  const wasStarted = useRef(state.started)
  const noticeRef = useRef<HTMLDivElement>(null)
  const { setOpen } = useSettings()

  // 欢迎页与练习流程切换时，把焦点交给新出现的主要操作，避免键盘焦点丢回页面顶部
  useEffect(() => {
    const justStarted = !wasStarted.current && state.started
    const justExited = wasStarted.current && !state.started
    wasStarted.current = state.started
    if (justStarted) document.getElementById('step-heading')?.focus()
    if (justExited) document.getElementById('start-simulation')?.focus()
  }, [state.started])

  // 换步骤后停止旧朗读，并把焦点交给新步骤的标题，键盘与读屏用户不用从头 Tab
  useEffect(() => {
    if (lastStep.current === state.step) return
    lastStep.current = state.step
    stopSpeech()
    document.getElementById('step-heading')?.focus()
  }, [state.step])

  // 错误提示出现时焦点移到提示并滚进可视区域，键盘与读屏用户立刻感知反馈
  useEffect(() => {
    if (state.noticeSeq > 0 && state.notice) {
      noticeRef.current?.focus({ preventScroll: true })
      noticeRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [state.noticeSeq, state.notice])

  if (!state.started) {
    return <CourseWelcome welcome={welcome} onStart={() => dispatch({ type: 'start' })} />
  }

  return (
    <>
      <div className="phone-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-3">
        <FlowProgress step={state.step} titles={engine.titles} successStep={engine.successStep} />

        {finished ? null : (
          <>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                id="help-button"
                onClick={() => dispatch({ type: 'help' })}
                aria-expanded={Boolean(state.help)}
                aria-controls="help-panel"
                className="btn btn-help min-w-0 flex-1 basis-[12rem]"
              >
                <span className="h-6 w-6">
                  <BridgeBuddy />
                </span>
                我需要帮助
              </button>
              <button
                type="button"
                id="settings-button-sim"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                className="btn btn-help shrink-0 px-3"
              >
                <span className="h-6 w-6">
                  <SettingsIcon />
                </span>
                显示与辅助
              </button>
            </div>
            {state.help ? (
              <HelpPanel
                key={state.stats.hints}
                text={state.help}
                payload={engine.helpPayload(state)}
                onDismiss={() => {
                  dispatch({ type: 'dismissHelp' })
                  document.getElementById('help-button')?.focus()
                }}
              />
            ) : null}
          </>
        )}

        <StepComponent state={state} dispatch={dispatch} />

        {finished ? (
          <>
            <LearningReport
              report={buildLearningReport(state, {
                titles: engine.titles,
                confirmStep: engine.confirmStep,
                successStep: engine.successStep,
              })}
              note={reportNote}
            />
            <a href={hrefFor('learning')} className="btn btn-ghost mt-4 w-full">
              返回学习中心
            </a>
          </>
        ) : null}

        <div ref={noticeRef} tabIndex={-1} className="scroll-mb-4">
          {state.notice ? <NoticeBar key={state.noticeSeq} text={state.notice} /> : null}
        </div>
      </div>

      {/* 操作栏独立于滚动区：任何屏幕尺寸下都不覆盖内容，且始终可见 */}
      <div id="flow-action-bar" className="safe-bottom border-t border-brand-100 bg-white px-4 pt-3">
        {finished ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: 'restart' })}
              className="btn btn-primary min-h-[56px] flex-1 px-4 text-lg"
            >
              再练一次
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'prev' })}
              className="btn btn-secondary min-h-[56px] shrink-0 px-4 text-lg"
            >
              返回修改
            </button>
          </div>
        ) : (
          <FlowActions
            step={state.step}
            confirmStep={engine.confirmStep}
            confirmLabel={engine.confirmLabel}
            onPrev={() => dispatch({ type: 'prev' })}
            onNext={() => dispatch({ type: 'next' })}
          />
        )}
      </div>
    </>
  )
}
