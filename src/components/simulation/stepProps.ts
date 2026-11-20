import type { Dispatch } from 'react'
import type { FlowAction, FlowState } from '../../simulation/appointmentState'

export type StepProps = {
  state: FlowState
  dispatch: Dispatch<FlowAction>
}
