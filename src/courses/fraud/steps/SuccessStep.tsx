import { CheckIcon, ShieldIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import SuccessHeading from '../../../components/simulation/SuccessHeading'
import SummaryCard from '../../../components/simulation/SummaryCard'
import type { SummaryRow } from '../../../components/simulation/SummaryCard'
import { cluesFound, isActionCorrect, type FraudStepProps } from '../state'

export default function SuccessStep({ scenario, state }: FraudStepProps) {
  const rows: SummaryRow[] = [
    { label: '课程', value: `${scenario.lesson} ${scenario.title}` },
    { label: '骗局类型', value: scenario.overview.type },
    { label: '最安全的做法', value: scenario.overview.right },
    { label: '找出可疑点', value: `${cluesFound(state)} / ${scenario.clues.length} 处` },
    { label: '安全操作', value: `${state.drill.length} / ${scenario.drill.length} 步` },
    { label: '安全小测', value: `${Object.keys(state.answers).length} / ${scenario.quiz.length} 题答对` },
    { label: '这次选的做法', value: isActionCorrect(state, scenario) ? '安全做法' : '还没有选对' },
  ]

  return (
    <>
      <SuccessHeading title="防骗训练完成" lead="您识破了这段虚构骗局，也自己走了一遍安全操作。" />

      <SummaryCard rows={rows} title="防骗训练记录" code={state.certificate} />

      <section className="mt-4 rounded-2xl border-2 border-lagoon-200 bg-lagoon-50 px-4 py-3">
        <p className="flex items-center gap-2 text-lg font-bold text-lagoon-900">
          <span className="h-6 w-6 shrink-0">
            <ShieldIcon />
          </span>
          记住这几条
        </p>
        <ul className="mt-2 space-y-1.5">
          {scenario.takeaways.map((item) => (
            <li key={item} className="flex items-start gap-2 text-base leading-relaxed text-ink-soft">
              <span className="mt-1 h-4 w-4 shrink-0 text-lagoon-700">
                <CheckIcon />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <NoteCard
        tone="brand"
        title="以后再遇到"
        text="先挂断、不点链接、不转账。拿不准就拨 96110 咨询；已经转钱就打 110 报警，越快越好。"
      />

      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        这一课的电话、号码、链接全部是虚构的，只用来练习识别。想再练一遍，点下面的“再练一次”。
      </p>
    </>
  )
}