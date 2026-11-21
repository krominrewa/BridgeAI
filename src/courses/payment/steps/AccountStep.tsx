import { accountsOfType, findType } from '../../../data/payment'
import { PinIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import type { ExtraAction, FlowState } from '../state'

export default function AccountStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  const type = findType(state.typeId)
  return (
    <>
      <StepHeading
        title={`选择${type?.name ?? '这笔费用'}的户号`}
        hint="下面几个户号都是练习用的。点一个，看地址对不对。"
      />
      <OptionGroup
        options={accountsOfType(state.typeId).map((account) => ({
          id: account.id,
          title: account.label,
          description: `户号 ${account.no}`,
          meta: `户主 ${account.holder}`,
          icon: <PinIcon />,
        }))}
        selectedId={state.accountId}
        onSelect={(id) => dispatch({ type: 'select', field: 'accountId', value: id })}
      />
      <NoteCard
        tone="brand"
        title="户号在哪里找"
        text={`真实生活里，${type?.name ?? '这笔费用'}的户号在${type?.where ?? '缴费单上'}。它不是身份证号，也不是手机号；缴之前对一下地址和户主，避免缴到别人家。`}
      />
    </>
  )
}
