import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import BuddyNudge from './BuddyNudge'
import CourseWelcome from './CourseWelcome'
import FlowActions from './FlowActions'
import FlowProgress from './FlowProgress'
import GuidedPanel from './GuidedPanel'
import HelpPanel from './HelpPanel'
import LearningReport from './LearningReport'
import NoticeBar from './NoticeBar'
import { BridgeBuddy, SettingsIcon, SpeakerIcon } from '../icons'
import { hrefFor, type CourseId } from '../../router'
import type { CourseEngine, WelcomeContent } from '../../simulation/courseFlow'
import type { FlowActionBase, FlowBase } from '../../simulation/flowKit'
import { buildLearningReport } from '../../simulation/learningReport'
import { getPracticeRecord, practiceSummary, savePracticeRecord } from '../../simulation/practiceHistory'
import { SPEECH_RATE_VALUES, useSettings } from '../../settings/SettingsContext'
import { speak, speechSupported, stopSpeech } from '../../speech/speechReader'

const IDLE_NUDGE_MS = 20_000

type CourseShellProps<S extends FlowBase, X extends { type: string }> = {
  courseId: CourseId
  engine: CourseEngine<S, X>
  welcome: WelcomeContent
  /** 各课程对“什么算一次错误操作”的说明，随学习小结显示。 */
  reportNote: string
  state: S
  dispatch: Dispatch<FlowActionBase | X>
}

/** 课程练习的统一外壳：欢迎页、步骤进度、帮助与提醒、底部操作栏都由这里编排。 */
export default function CourseShell<S extends FlowBase, X extends { type: string }>({
  courseId,
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
  const savedCompletion = useRef(false)
  const noticeRef = useRef<HTMLDivElement>(null)
  const [activityTick, setActivityTick] = useState(0)
  const { settings, setOpen, open } = useSettings()
  const speechRate = SPEECH_RATE_VALUES[settings.speechRate]
  const voiceLine =
    engine.voiceLine?.(state) ?? `第 ${state.step + 1} 步，共 ${engine.titles.length} 步：${engine.titles[state.step]}。`
  const tasks = engine.tasks?.(state) ?? []
  const report = finished
    ? buildLearningReport(state, {
        titles: engine.titles,
        confirmStep: engine.confirmStep,
        successStep: engine.successStep,
        takeaways: engine.takeaways,
        nextCourse: engine.nextCourse,
      })
    : null
  const lastPractice = state.started ? null : getPracticeRecord(courseId)
  const stepErrors = state.stats.byStep[state.step]?.errors ?? 0

  // 欢迎页与练习流程切换时，把焦点交给新出现的主要操作，避免键盘焦点丢回页面顶部
  useEffect(() => {
    const justStarted = !wasStarted.current && state.started
    const justExited = wasStarted.current && !state.started
    wasStarted.current = state.started
    if (justStarted) document.getElementById('step-heading')?.focus()
    if (justExited) {
      stopSpeech()
      document.getElementById('start-simulation')?.focus()
    }
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

  // 语音引导：开启后换步自动朗读；只依赖步骤与开始状态，选选项时不会反复出声
  useEffect(() => {
    if (!settings.voiceGuide || !speechSupported || !state.started || finished) return
    speak(voiceLine, speechRate)
  }, [state.step, state.started])

  // 纠错提醒比步骤说明更急，出现时优先朗读提醒
  useEffect(() => {
    if (!settings.voiceGuide || !speechSupported || !state.started || !state.notice) return
    speak(state.notice, speechRate)
  }, [state.noticeSeq])

  // 打开帮助面板时停止自动朗读，避免和面板里的“读给我听”抢声音
  useEffect(() => {
    if (state.help) stopSpeech()
  }, [state.help])

  // 记录用户的点击与按键，用于重置“停太久”的计时
  useEffect(() => {
    const bump = () => setActivityTick((value) => value + 1)
    window.addEventListener('pointerdown', bump, true)
    window.addEventListener('keydown', bump, true)
    return () => {
      window.removeEventListener('pointerdown', bump, true)
      window.removeEventListener('keydown', bump, true)
    }
  }, [])

  // 主动引导·停太久：同一屏 20 秒没有操作，桥桥轻问一句（每步最多一次）
  useEffect(() => {
    if (!settings.proactive || !state.started || finished || state.help || state.nudge || open) return
    const timer = window.setTimeout(() => dispatch({ type: 'nudge', kind: 'idle' }), IDLE_NUDGE_MS)
    return () => window.clearTimeout(timer)
  }, [settings.proactive, state.started, state.step, state.help, state.nudge, finished, open, activityTick])

  // 主动引导·连续出错：本步累计 2 次纠错提醒后主动出现，不记为用户求助
  useEffect(() => {
    if (!settings.proactive || !state.started || finished) return
    if (stepErrors >= 2) dispatch({ type: 'nudge', kind: 'errors' })
  }, [stepErrors, state.step, state.started, settings.proactive, finished])

  // 主动提示出现时朗读一次，内容由课程提供
  useEffect(() => {
    if (!settings.voiceGuide || !speechSupported || !state.nudge) return
    speak(state.nudge, speechRate)
  }, [state.nudgeSeq])

  // 完成时把本次结果写进跨标签页的练习历史，欢迎页据此显示“上次练习”
  useEffect(() => {
    if (!finished) {
      savedCompletion.current = false
      return
    }
    if (savedCompletion.current || !report) return
    savedCompletion.current = true
    const finishedAt = state.stats.finishedAt ?? Date.now()
    const startedAt = state.stats.startedAt
    savePracticeRecord({
      courseId,
      finishedAt,
      durationMs: startedAt !== null ? Math.max(0, finishedAt - startedAt) : 0,
      errors: state.stats.errors,
      hints: state.stats.hints,
      autoHints: state.stats.autoHints,
      deepHints: report.deepHintSteps.length,
    })
  }, [finished, courseId])

  if (!state.started) {
    return (
      <CourseWelcome
        welcome={welcome}
        lastPractice={lastPractice ? practiceSummary(lastPractice) : null}
        onStart={() => dispatch({ type: 'start' })}
      />
    )
  }

  return (
    <>
      <div className="phone-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-3">
        <FlowProgress step={state.step} titles={engine.titles} successStep={engine.successStep} />

        {settings.guided && !finished && tasks.length > 0 ? (
          <GuidedPanel key={state.step} state={state} tasks={tasks} />
        ) : null}

        {!finished && state.nudge ? (
          <BuddyNudge
            text={state.nudge}
            onHelp={() => dispatch({ type: 'help' })}
            onDismiss={() => dispatch({ type: 'dismissNudge' })}
          />
        ) : null}

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
              {speechSupported ? (
                <button
                  type="button"
                  id="voice-step-button"
                  onClick={() => speak(voiceLine, speechRate)}
                  aria-label="朗读当前这一步"
                  className="btn btn-help shrink-0 px-3"
                >
                  <span className="h-6 w-6">
                    <SpeakerIcon />
                  </span>
                  朗读
                </button>
              ) : null}
            </div>
            {state.help ? (
              <HelpPanel
                key={state.stats.hints}
                text={state.help}
                tier={state.helpTier}
                payload={{ ...engine.helpPayload(state), tier: state.helpTier }}
                onMore={() => dispatch({ type: 'help', tier: state.helpTier === 1 ? 2 : 3 })}
                onDismiss={() => {
                  dispatch({ type: 'dismissHelp' })
                  document.getElementById('help-button')?.focus()
                }}
              />
            ) : null}
          </>
        )}

        <StepComponent state={state} dispatch={dispatch} />

        {finished && report ? (
          <>
            <LearningReport report={report} note={reportNote} />
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
