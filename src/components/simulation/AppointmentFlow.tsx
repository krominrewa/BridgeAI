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

  // 换步骤后把焦点交给新步骤的标题，键盘与读屏用户不用从头 Tab
  useEffect(() => {
    if (lastStep.current === state.step) return
    lastStep.current = state.step
    document.getElementById('step-heading')?.focus()
  }, [state.step])

  return (
    <div className="px-5 pb-6 pt-5">
      <FlowProgress step={state.step} />

      {finished ? null : (
        <>
          <button
            type="button"
            id="help-button"
            onClick={() => dispatch({ type: 'help' })}
            aria-expanded={Boolean(state.help)}
            aria-controls="help-panel"
            className="btn btn-secondary mt-4 w-full text-lg"
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

      {state.notice ? <NoticeBar key={state.noticeSeq} text={state.notice} /> : null}

      {finished ? null : (
        <>
          <FlowActions
            step={state.step}
            onPrev={() => dispatch({ type: 'prev' })}
            onNext={() => dispatch({ type: 'next' })}
          />
          <button
            type="button"
            onClick={() => dispatch({ type: 'exit' })}
            className="btn btn-ghost mt-3 w-full text-base"
          >
            退出练习，回到欢迎页
          </button>
        </>
      )}
    </div>
  )
}