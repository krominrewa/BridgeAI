import { yuan, type BillType } from '../../data/payment'
import type { SummaryRow } from '../../components/simulation/SummaryCard'
import { currentAmount, currentBill, type FlowState } from './state'
import { findAccount, findMethod, findType } from '../../data/payment'

export function typeText(type: BillType | undefined): string {
  return type ? `${type.name}（${type.company}）` : '未选择'
}

export function summaryRows(state: FlowState): SummaryRow[] {
  const type = findType(state.typeId)
  const account = findAccount(state.accountId)
  const bill = currentBill(state)
  const amount = currentAmount(state)
  const method = findMethod(state.methodId)

  return [
    { label: '缴费类型', value: typeText(type) },
    { label: '户号', value: account ? `${account.no}` : '未选择' },
    { label: '缴费地址', value: account?.address ?? '未选择' },
    { label: '户主', value: account?.holder ?? '未选择' },
    { label: '本期账单', value: bill ? `${bill.period} ${yuan(bill.principal + bill.lateFee)}` : '未选择' },
    { label: '本次缴费', value: amount ? amount.title : '未选择' },
    { label: '缴费方式', value: method ? `${method.name}（模拟，不扣钱）` : '未选择' },
  ]
}
