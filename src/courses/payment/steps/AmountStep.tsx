import { amountChoices, findMethod, PAY_METHODS, yuan } from '../../../data/payment'
import { BankCardIcon, WalletIcon, PhoneIcon } from '../../../components/icons'
import type { ReactNode } from 'react'
import NoteCard from '../../../components/simulation/NoteCard'
import OptionGroup from '../../../components/simulation/OptionGroup'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import { currentBill, type ExtraAction, type FlowState } from '../state'

const METHOD_ICONS: Record<string, ReactNode> = {
  balance: <WalletIcon />,
  bank: <BankCardIcon />,
  wallet: <PhoneIcon />,
}

export default function AmountStep({ state, dispatch }: CourseStepProps<FlowState, ExtraAction>) {
  const bill = currentBill(state)
  const total = bill ? bill.principal + bill.lateFee : 0

  return (
    <>
      <StepHeading title="选缴多少钱、怎么缴" hint="这一步有两件事：先点金额，再点缴费方式。" />
      <OptionGroup
        index={1}
        text="选一个金额"
        options={amountChoices(bill).map((choice) => ({
          id: choice.id,
          title: choice.title,
          description: choice.description,
        }))}
        selectedId={state.amountId}
        onSelect={(id) => dispatch({ type: 'select', field: 'amountId', value: id })}
      />
      <OptionGroup
        index={2}
        text="选一种缴费方式"
        options={PAY_METHODS.map((method) => ({
          id: method.id,
          title: method.name,
          description: method.hint,
          icon: METHOD_ICONS[method.id],
        }))}
        selectedId={state.methodId}
        onSelect={(id) => dispatch({ type: 'select', field: 'methodId', value: id })}
        note={findMethod(state.methodId) ? undefined : '练习里选哪个都一样，不会真的扣钱。'}
      />
      <NoteCard
        tone="brand"
        title="“全额”和“预存”的区别"
        text={`全额就是把本期该缴的 ${yuan(total)} 一次结清。预存是先多存一点在户号里，下期出账单时自动抵扣，适合不想每月操作的人。拿不准就选全额。`}
      />
    </>
  )
}
