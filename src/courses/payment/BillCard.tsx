import { yuan, type Bill, type BillType } from '../../data/payment'
import { BillIcon } from '../../components/icons'

type BillCardProps = {
  bill: Bill
  type: BillType | undefined
  accountNo: string
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className={strong ? 'text-lg font-bold text-ink' : 'text-base text-ink-muted'}>{label}</span>
      <span className={strong ? 'text-lg font-bold text-ink' : 'text-base font-medium text-ink'}>{value}</span>
    </div>
  )
}

/** 账单明细：练习里用来练“先看清楚再付钱”，金额全部是虚构数据。 */
export default function BillCard({ bill, type, accountNo }: BillCardProps) {
  const total = Math.round((bill.principal + bill.lateFee) * 100) / 100
  return (
    <div className="mt-4 overflow-hidden rounded-3xl border-2 border-brand-200 bg-white">
      <div className="flex items-center gap-3 bg-brand-50 px-4 py-3">
        <span className="h-6 w-6 shrink-0 text-brand-700">
          <BillIcon />
        </span>
        <div>
          <p className="text-base font-bold text-ink">{type ? `${type.name}账单 · ${bill.period}` : '费用账单'}</p>
          <p className="text-sm text-ink-muted">户号 {accountNo}（模拟单据）</p>
        </div>
      </div>
      <div className="divide-y divide-brand-100 px-4 py-1">
        <Row label={`用量${type ? `（${type.unit}）` : ''}`} value={bill.usageText} />
        <Row label="单价" value={bill.unitPriceText} />
        <Row label="本期费用" value={yuan(bill.principal)} />
        {bill.lateFee > 0 ? <Row label="逾期违约金" value={yuan(bill.lateFee)} /> : null}
        <Row label="上次缴费" value={bill.lastPaid} />
        <Row label="最后期限" value={bill.dueDate} />
        <Row label="应缴合计" value={yuan(total)} strong />
      </div>
      <p className="bg-amber-50 px-4 py-2 text-sm leading-relaxed text-amber-900">
        这是练习用的模拟账单，不会真的扣钱。真实缴费时，页面上同样要有这几项信息。
      </p>
    </div>
  )
}
