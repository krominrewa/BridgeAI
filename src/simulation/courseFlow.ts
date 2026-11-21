import { useEffect, useReducer, type ComponentType, type Dispatch } from 'react'
import type { FlowActionBase, FlowBase } from './flowKit'
import { saveStoredFlow } from './flowKit'
import type { HelpRequest } from './helpRequest'

/** X 为课程自己的交互动作（选择、点击不可选项等），基础动作由通用引擎负责。 */
export type CourseStepProps<S, X extends { type: string }> = {
  state: S
  dispatch: Dispatch<FlowActionBase | X>
}

export type WelcomeContent = {
  /** 欢迎页大标题里的课程名，例如“模拟挂号”。 */
  name: string
  lead: string
  points: string[]
  note: string
}

export type CourseEngine<S extends FlowBase, X extends { type: string }> = {
  titles: string[]
  confirmStep: number
  successStep: number
  /** 确认那一步的主按钮文字，例如“确认预约”“确认缴费”。 */
  confirmLabel: string
  steps: ComponentType<CourseStepProps<S, X>>[]
  /** 交给教学代理的结构化上下文；本地提示文字由各课程自己生成。 */
  helpPayload: (state: S) => HelpRequest
}

export function useCourseFlow<S extends FlowBase, X extends { type: string }>(
  storageKey: string,
  load: () => S,
  reducer: (state: S, action: FlowActionBase | X) => S,
): { state: S; dispatch: Dispatch<FlowActionBase | X> } {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    saveStoredFlow(storageKey, state)
  }, [storageKey, state])

  return { state, dispatch }
}
