import { findScene, findUser, recordsFor, yuan } from '../../../data/insurance'
import { CheckIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import SuccessHeading from '../../../components/simulation/SuccessHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { CourseStepProps } from '../../../simulation/courseFlow'
import QrCard from '../QrCard'
import { balanceRows } from '../summary'
import type { ExtraAction, FlowState } from '../state'

export default function SuccessStep({ state }: CourseStepProps<FlowState, ExtraAction>) {
  const user = findUser(state.userId)
  const scene = findScene(state.sceneId)
  const records = recordsFor(state.userId)

  return (
    <>
      <SuccessHeading title="凭证已出示" lead="挂号、买药、结算就是这一下，您已经会了！" />

      <QrCard code={state.evidence ?? '—'} holder={user?.name ?? '未选择'} scene={scene?.name ?? '未选择'} />

      <SummaryCard rows={balanceRows(state)} title="医保账户（模拟数据）" />

      <h3 className="mt-5 text-lg font-bold text-ink">最近的使用记录</h3>
      <ul className="mt-3 space-y-2">
        {records.map((record) => (
          <li
            key={`${record.date}-${record.place}`}
            className="flex items-center gap-3 rounded-2xl border-2 border-brand-100 bg-white px-4 py-3"
          >
            <span className="mt-0.5 h-5 w-5 shrink-0 text-lagoon-600" aria-hidden="true">
              <CheckIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-ink">
                {record.date} · {record.place}
              </span>
              <span className="block text-base text-ink-soft">
                {record.kind} · {yuan(record.amount)} · {record.result}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <NoteCard
        tone="brand"
        title="记录看不懂怎么办"
        text="每一行都是一次刷卡：日期、在哪家医院或药店、什么项目、多少钱、医保有没有结清。觉得某一笔不对，先问家里人，再带身份证去医保窗口或打官方电话核对，不要按陌生短信里的链接操作。"
      />
    </>
  )
}
