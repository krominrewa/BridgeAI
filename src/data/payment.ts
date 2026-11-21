/**
 * 生活缴费课程的虚构数据：缴费类型、户号、账单、金额与渠道。
 * 账单金额由户号确定性生成，同一个户号刷新后金额不变。
 */

export type BillTypeId = 'electric' | 'water' | 'gas'

export type BillType = {
  id: BillTypeId
  name: string
  hint: string
  company: string
  /** 户号在真实生活里去哪里找。 */
  where: string
  cycle: string
  unit: string
  unitPrice: number
  baseUsage: number
}

export type Account = {
  id: string
  typeId: BillTypeId
  label: string
  address: string
  /** 展示用的户号，全部为虚构编号。 */
  no: string
  holder: string
}

export type Bill = {
  period: string
  usageText: string
  unitPriceText: string
  principal: number
  lateFee: number
  dueDate: string
  lastPaid: string
}

export type AmountChoice = {
  id: string
  title: string
  description: string
  /** 本次要付的金额（元）。 */
  value: number
}

export type PayMethod = {
  id: string
  name: string
  hint: string
}

export const BILL_TYPES: BillType[] = [
  {
    id: 'electric',
    name: '电费',
    hint: '每月出账，用电量多时金额会高一些',
    company: '模拟国家电网',
    where: '纸质电费单右上角，或供电公司的缴费短信里',
    cycle: '每月 1 日出账',
    unit: '度',
    unitPrice: 0.52,
    baseUsage: 118,
  },
  {
    id: 'water',
    name: '水费',
    hint: '一般两个月缴一次，按用水量算',
    company: '模拟自来水公司',
    where: '水费通知单上“用户编号”那一行',
    cycle: '每两个月 5 日出账',
    unit: '吨',
    unitPrice: 2.8,
    baseUsage: 9,
  },
  {
    id: 'gas',
    name: '燃气费',
    hint: '做饭和取暖用的气，按立方米算',
    company: '模拟燃气集团',
    where: '燃气卡背面，或抄表员留下的通知单',
    cycle: '每季度 10 日出账',
    unit: '立方米',
    unitPrice: 2.6,
    baseUsage: 26,
  },
]

export const ACCOUNTS: Account[] = [
  {
    id: 'el-home',
    typeId: 'electric',
    label: '自家 · 阳光里 3 栋 502',
    address: '模拟市阳光里 3 栋 502',
    no: '0012 3456 7890',
    holder: '张淑芬（虚构）',
  },
  {
    id: 'el-parents',
    typeId: 'electric',
    label: '爸妈家 · 健康路 12 号',
    address: '模拟市健康路 12 号',
    no: '0012 8866 3355',
    holder: '李长顺（虚构）',
  },
  {
    id: 'wa-home',
    typeId: 'water',
    label: '自家 · 阳光里 3 栋 502',
    address: '模拟市阳光里 3 栋 502',
    no: '0571 2233 4455',
    holder: '张淑芬（虚构）',
  },
  {
    id: 'wa-rent',
    typeId: 'water',
    label: '出租的小屋 · 安康街 6 号',
    address: '模拟市安康街 6 号',
    no: '0571 7788 1122',
    holder: '张淑芬（虚构）',
  },
  {
    id: 'ga-home',
    typeId: 'gas',
    label: '自家 · 阳光里 3 栋 502',
    address: '模拟市阳光里 3 栋 502',
    no: '8800 4567 1230',
    holder: '张淑芬（虚构）',
  },
  {
    id: 'ga-parents',
    typeId: 'gas',
    label: '爸妈家 · 健康路 12 号',
    address: '模拟市健康路 12 号',
    no: '8800 9911 2244',
    holder: '李长顺（虚构）',
  },
]

export const PAY_METHODS: PayMethod[] = [
  { id: 'balance', name: '账户余额', hint: '先扣户号里已经存着的钱' },
  { id: 'bank', name: '银行卡', hint: '从绑定的银行卡扣款' },
  { id: 'wallet', name: '手机钱包', hint: '微信或支付宝里常用的那一种' },
]

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function hash(text: string): number {
  let value = 0
  for (let index = 0; index < text.length; index += 1) {
    value = (value * 31 + text.charCodeAt(index)) >>> 0
  }
  return value
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function yuan(value: number): string {
  return `${value.toFixed(2)} 元`
}

export function findType(id: BillTypeId | null): BillType | undefined {
  return BILL_TYPES.find((item) => item.id === id)
}

export function findAccount(id: string | null): Account | undefined {
  return ACCOUNTS.find((item) => item.id === id)
}

export function accountsOfType(typeId: BillTypeId | null): Account[] {
  return ACCOUNTS.filter((item) => item.typeId === typeId)
}

export function findMethod(id: string | null): PayMethod | undefined {
  return PAY_METHODS.find((item) => item.id === id)
}

function dateText(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAYS[date.getDay()]}`
}

/** 账单为虚构数据：同一户号每次生成结果一致，方便反复练习同一个场景。 */
export function billOf(accountId: string, base: Date = new Date()): Bill | undefined {
  const account = findAccount(accountId)
  if (!account) return undefined
  const type = findType(account.typeId)
  if (!type) return undefined

  const seed = hash(`bill|${accountId}`)
  const usage = type.baseUsage + (seed % 9)
  const principal = round2(usage * type.unitPrice)
  // 少数账单模拟为逾期，用来练习“违约金是什么”
  const lateFee = seed % 4 === 0 ? round2(principal * 0.02) : 0

  const period = new Date(base.getFullYear(), base.getMonth() - 1, 1)
  const due = new Date(base.getFullYear(), base.getMonth(), 20)
  const lastPaid = new Date(base.getFullYear(), base.getMonth() - 2, 18)

  return {
    period: `${period.getFullYear()}年${period.getMonth() + 1}月`,
    usageText: `${usage} ${type.unit}`,
    unitPriceText: `${type.unitPrice.toFixed(2)} 元/${type.unit}`,
    principal,
    lateFee,
    dueDate: dateText(due),
    lastPaid: dateText(lastPaid),
  }
}

export function amountChoices(bill: Bill | undefined): AmountChoice[] {
  if (!bill) return []
  const total = round2(bill.principal + bill.lateFee)
  return [
    {
      id: 'full',
      title: `全额缴纳 ${yuan(total)}`,
      description: bill.lateFee > 0 ? `含违约金 ${yuan(bill.lateFee)}，缴完本期就结清了` : '本期账单的全部金额',
      value: total,
    },
    { id: 'prepaid100', title: '预存 100.00 元', description: '多出来的钱留在户号里，下次账单自动抵扣', value: 100 },
    { id: 'prepaid200', title: '预存 200.00 元', description: '适合一次多存一点，几个月都不用再缴', value: 200 },
  ]
}

export function findAmountChoice(bill: Bill | undefined, id: string | null): AmountChoice | undefined {
  if (!id) return undefined
  return amountChoices(bill).find((item) => item.id === id)
}

export function makeReceiptCode(accountId: string, amountId: string): string {
  const serial = (hash(`receipt|${accountId}|${amountId}`) % 9000) + 1000
  const now = new Date()
  const stamp = `${now.getFullYear()}${`${now.getMonth() + 1}`.padStart(2, '0')}${`${now.getDate()}`.padStart(2, '0')}`
  return `JF${stamp}-${serial}`
}
