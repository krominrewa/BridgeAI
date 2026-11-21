import { findScene, findUser, yuan } from '../../data/insurance'
import type { SummaryRow } from '../../components/simulation/SummaryCard'
import type { FlowState } from './state'

export function summaryRows(state: FlowState): SummaryRow[] {
  const scene = findScene(state.sceneId)
  const user = findUser(state.userId)

  return [
    { label: '要做什么', value: scene?.name ?? '未选择' },
    { label: '在哪儿出示', value: scene?.where ?? '未选择' },
    { label: '给谁用', value: user ? `${user.name} · ${user.relation}` : '未选择' },
    { label: '参保地', value: user?.insuredPlace ?? '未选择' },
    { label: '账户尾号', value: user?.cardTail ?? '未选择' },
    { label: '验证方式', value: state.verifyMethod === 'face' ? '刷脸通过' : state.verifyMethod === 'sms' ? '短信验证码通过' : '未验证' },
  ]
}

export function balanceRows(state: FlowState): SummaryRow[] {
  const user = findUser(state.userId)
  if (!user) return []
  return [
    { label: '个人账户余额', value: user.personal > 0 ? yuan(user.personal) : '居民医保没有个人账户' },
    { label: '今年已由医保支付', value: yuan(user.usedThisYear) },
    { label: '凭证状态', value: '已激活（模拟）' },
  ]
}
