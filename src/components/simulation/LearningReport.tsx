import { buildLearningReport } from '../../simulation/learningReport'
import type { FlowState } from '../../simulation/appointmentState'
import { CheckIcon } from '../icons'

type LearningReportProps = {
  state: FlowState
}

export default function LearningReport({ state }: LearningReportProps) {
  const report = buildLearningReport(state)

  return (
    <section
      aria-labelledby="learning-report-title"
      className="mt-5 rounded-2xl border-2 border-lagoon-200 bg-white px-4 py-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="learning-report-title" className="text-xl font-bold text-ink">
          本次学习小结
        </h3>
        <span className="badge bg-lagoon-50 text-lagoon-800">
          <span className="h-4 w-4">
            <CheckIcon />
          </span>
          已完成
        </span>
      </div>

      <p className="mt-2 flex items-start gap-2 text-lg font-semibold leading-relaxed text-ink">
        <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-700">
          <CheckIcon />
        </span>
        {report.completedSteps} 个步骤全部完成（共 {report.totalSteps} 步）
      </p>

      <p className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-lg font-bold text-brand-800">
        本次用时 {report.durationText} · {report.finishedAtText} 完成
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-paper px-3 py-3 text-center">
          <dt className="text-base text-ink-soft">错误操作</dt>
          <dd className="mt-0.5 text-2xl font-bold text-ink">{report.errors} 次</dd>
        </div>
        <div className="rounded-xl bg-paper px-3 py-3 text-center">
          <dt className="text-base text-ink-soft">使用提示</dt>
          <dd className="mt-0.5 text-2xl font-bold text-ink">{report.hints} 次</dd>
        </div>
      </dl>

      <h4 className="mt-4 text-lg font-bold text-ink">需要复习的步骤</h4>
      {report.review.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {report.review.map((item) => (
            <li key={item.title} className="rounded-xl border border-brand-100 bg-paper px-3 py-2.5">
              <p className="text-lg font-semibold leading-snug text-ink">{item.title}</p>
              <p className="mt-0.5 text-base leading-relaxed text-ink-soft">{item.reason}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 flex items-start gap-2 rounded-xl border border-lagoon-200 bg-lagoon-50 px-3 py-2.5 text-lg leading-relaxed text-ink">
          <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-700">
            <CheckIcon />
          </span>
          这次没有需要特别复习的步骤，做得很好！
        </p>
      )}

      <p className="mt-3 text-base leading-relaxed text-ink-soft">
        “错误操作”指漏选内容就点了“下一步”，或点了已约满的时间。练习中出错很正常，再练一次会更熟练。
      </p>
    </section>
  )
}