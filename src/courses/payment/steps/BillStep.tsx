import { findAccount, findType, yuan } from '../../../data/payment'
import NoteCard from '../../../components/simulation/NoteCard'
import StepHeading from '../../../components/simulation/StepHeading'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import { currentBill, type ExtraAction, type FlowState } from '../state'
import BillCard from '../BillCard'

export default function BillStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  const bill = currentBill(state)
  const type = findType(state.typeId)
  const account = findAccount(state.accountId)

  if (!bill || !account) {
    return (
      <>
        <StepHeading title="查看账单" hint="还没有户号，所以看不到账单。" />
        <NoteCard tone="amber" title="需要回去选户号" text="点最下面的“上一步”，先选一个户号，再回来看账单。" />
      </>
    )
  }

  return (
    <>
      <StepHeading title={`${bill.period}的账单`} hint="这一页不用选，先看清楚，再点“下一步”。" />
      <BillCard bill={bill} type={type} accountNo={account.no} />
      {bill.lateFee > 0 ? (
        <NoteCard
          tone="amber"
          title="违约金是什么"
          text={`这笔账单超过了最后期限 ${bill.dueDate}，所以多出 ${yuan(bill.lateFee)} 违约金。金额不大，但一直拖会越滚越多。收到账单先看“最后期限”，在那之前缴掉就不会有这一项。`}
        />
      ) : (
        <NoteCard
          tone="brand"
          title="怎么看出用得多不多"
          text={`本期用了 ${bill.usageText}，单价 ${bill.unitPriceText}，所以费用是 ${yuan(bill.principal)}。这个账单在期限内，没有违约金。想省电省水，可以看下个月同一项数字有没有变小。`}
        />
      )}
    </>
  )
}
