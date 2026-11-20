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
import { QuestionIcon } from '../icons'
import { SUCCESS_STEP } from '../../simulation/appointmentState'

const STEP_COMPONENTS = [HospitalStep, DepartmentStep, DoctorStep, ScheduleStep, ConfirmStep, SuccessStep]

export default function AppointmentFlow({ state, dispatch }: StepProps) {
  const StepComponent = STEP_COMPONENTS[state.step] ?? HospitalStep
  const finished = state.step === SUCCESS_STEP
  const lastStep = useRef(state.step)
  const noticeRef = useRef<HTMLDivElement>(null)

  // 换步骤后把焦点交给新步骤的标题，键盘与读屏用户不用从头 Tab
  useEffect(() => {
    if (lastStep.current === state.step) return
    lastStep.current = state.step
    document.getElementById('step-heading')?.focus()
  }, [state.step])

  // 错误提示在列表下方，出现时滚进可视区域，保证用户立刻看见反馈
  useEffect(() => {
    if (state.noticeSeq > 0) noticeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [state.noticeSeq])

  return (
    <div className="flex min-h-full flex-col px-4 pt-4">
      <FlowProgress step={state.step} />

      {finished ? null : (
        <>
          <button
            type="button"
            id="help-button"
            onClick={() => dispatch({ type: 'help' })}
            aria-expanded={Boolean(state.help)}
            aria-controls="help-panel"
            className="btn btn-help mt-3 w-full"
          >
            <span className="h-6 w-6">
              <QuestionIcon />
            </span>
            我需要帮助
          </button>
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

      <div ref={noticeRef} className="scroll-mb-24">
        {state.notice ? <NoticeBar key={state.noticeSeq} text={state.notice} /> : null}
      </div>

      {/* 主操作固定在屏幕底部：长列表里也始终看得见、点得到 */}
      <div className="sticky bottom-0 -mx-4 mt-auto border-t border-brand-100 bg-white/95 px-4 py-3 backdrop-blur">
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
    </div>
  )
}