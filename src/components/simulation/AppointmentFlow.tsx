import { useEffect, useRef } from 'react'
import FlowActions from './FlowActions'
import FlowProgress from './FlowProgress'
import HelpPanel from './HelpPanel'
import NoticeBar from './NoticeBar'
import ConfirmStep from './steps/ConfirmStep'
import DepartmentStep from './steps/DepartmentStep'
import DoctorStep from './steps/DoctorStep'
import HospitalStep from './steps/HospitalStep'
import ScheduleStep from './steps/ScheduleStep'
import SuccessStep from './steps/SuccessStep'
import type { StepProps } from './stepProps'
import { BridgeBuddy, SettingsIcon } from '../icons'
import { SUCCESS_STEP } from '../../simulation/appointmentState'
import { useSettings } from '../../settings/SettingsContext'

const STEP_COMPONENTS = [HospitalStep, DepartmentStep, DoctorStep, ScheduleStep, ConfirmStep, SuccessStep]

export default function AppointmentFlow({ state, dispatch }: StepProps) {
  const StepComponent = STEP_COMPONENTS[state.step] ?? HospitalStep
  const finished = state.step === SUCCESS_STEP
  const lastStep = useRef(state.step)
  const noticeRef = useRef<HTMLDivElement>(null)
  const { setOpen } = useSettings()

  // 换步骤后把焦点交给新步骤的标题，键盘与读屏用户不用从头 Tab
  useEffect(() => {
    if (lastStep.current === state.step) return
    lastStep.current = state.step
    document.getElementById('step-heading')?.focus()
  }, [state.step])

  // 错误提示出现时焦点移到提示并滚进可视区域，键盘与读屏用户立刻感知反馈
  useEffect(() => {
    if (state.noticeSeq > 0 && state.notice) {
      noticeRef.current?.focus({ preventScroll: true })
      noticeRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [state.noticeSeq, state.notice])

  return (
    <>
      <div className="phone-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-3">
        <FlowProgress step={state.step} />

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
                onDismiss={() => {
                  dispatch({ type: 'dismissHelp' })
                  document.getElementById('help-button')?.focus()
                }}
              />
            ) : null}
          </>
        )}

        <StepComponent state={state} dispatch={dispatch} />

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
            onPrev={() => dispatch({ type: 'prev' })}
            onNext={() => dispatch({ type: 'next' })}
          />
        )}
      </div>
    </>
  )
}