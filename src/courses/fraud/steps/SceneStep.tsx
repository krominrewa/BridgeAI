import SafetyNote from '../../../components/simulation/SafetyNote'
import StepHeading from '../../../components/simulation/StepHeading'
import type { FraudStepProps } from '../state'
import Transcript from '../Transcript'

export default function SceneStep({ scenario }: FraudStepProps) {
  return (
    <>
      <StepHeading
        title={scenario.kind === '短信' ? '先看清这条短信' : '先听清这通电话'}
        hint="先不动手，完整读一遍。下一步我们一起找破绽。"
      />
      <Transcript scenario={scenario} />
      <SafetyNote
        text={`这段${scenario.kind}是虚构演练：公司、号码和链接都是编的，不会真的拨号，也没有任何可以点开的真实链接。`}
      />
    </>
  )
}