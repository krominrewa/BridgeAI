import { buildLearningReport } from '../../simulation/learningReport'
import type { FlowState } from '../../simulation/appointmentState'
import { CheckIcon } from '../icons'

type LearningReportProps = {
  state: FlowState
}

export default function LearningReport({ state }: LearningReportProps) {
  const report = buildLearningReport(state)

  const rows = [
    { label: '完成情况', value: `${report.completedSteps} 个步骤全部完成（共 ${report.totalSteps} 步）` },
    { label: '完成时间', value: `用时 ${report.durationText} · ${report.finishedAtText} 完成` },
    { label: '错误操作次数', value: `${report.errors} 次` },
    { label: '使用提示次数', value: `${report.hints} 次` },
  ]

  return (
    <section
      aria-labelledby="learning-report-title"
      className="mt-6 rounded-2xl border-2 border-lagoon-100 bg-lagoon-50/60 px-4 py-4"
    >
      <h3 id="learning-report-title" className="text-xl font-bold text-ink">
        本次学习小结
      </h3>

      <dl className="mt-3 divide-y divide-lagoon-100">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-3 py-2">
            <dt className="text-base text-ink-soft">{row.label}</dt>
            <dd className="text-lg font-semibold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <h4 className="mt-4 text-lg font-bold text-ink">需要复习的步骤</h4>
      {report.review.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {report.review.map((item) => (
            <li key={item.title} className="rounded-2xl bg-white px-4 py-3">
              <p className="text-lg font-semibold text-ink">{item.title}</p>
              <p className="mt-0.5 text-base leading-relaxed text-ink-soft">{item.reason}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 flex items-start gap-2 rounded-2xl bg-white px-4 py-3 text-lg leading-relaxed text-ink">
          <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-700">
            <CheckIcon />
          </span>
          这次没有需要特别复习的步骤，做得很好！
        </p>
      )}

      <p className="mt-3 text-base leading-relaxed text-ink-muted">
        “错误操作”指漏选内容就点了“下一步”，或点了已约满的时间。练习中出错很正常，再练一次会更熟练。
      </p>
    </section>
  )
}