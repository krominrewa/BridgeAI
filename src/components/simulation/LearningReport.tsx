import type { LearningReportData } from '../../simulation/learningReport'
import { hrefFor } from '../../router'
import { CheckIcon } from '../icons'

type LearningReportProps = {
  report: LearningReportData
  /** 各课程对“什么算一次错误操作”的说明，口径要和本课的实际提醒一致。 */
  note: string
}

export default function LearningReport({ report, note }: LearningReportProps) {
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

      <p
        id="report-encouragement"
        className="mt-3 rounded-xl bg-lagoon-50 px-4 py-3 text-lg font-bold leading-relaxed text-lagoon-900"
      >
        桥桥说：{report.encouragement}
      </p>

      <p className="mt-3 flex items-start gap-2 text-lg font-semibold leading-relaxed text-ink">
        <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-700">
          <CheckIcon />
        </span>
        {report.completedSteps} 个步骤全部完成（共 {report.totalSteps} 步）
      </p>

      <p className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-lg font-bold text-brand-800">
        本次用时 {report.durationText} · {report.finishedAtText} 完成
      </p>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-paper px-2 py-3 text-center">
          <dt className="text-base text-ink-soft">错误操作</dt>
          <dd className="mt-0.5 text-xl font-bold text-ink">{report.errors} 次</dd>
        </div>
        <div className="rounded-xl bg-paper px-2 py-3 text-center">
          <dt className="text-base text-ink-soft">使用提示</dt>
          <dd className="mt-0.5 text-xl font-bold text-ink">{report.hints} 次</dd>
        </div>
        <div className="rounded-xl bg-paper px-2 py-3 text-center">
          <dt className="text-base text-ink-soft">主动提醒</dt>
          <dd className="mt-0.5 text-xl font-bold text-ink">{report.autoHints} 次</dd>
        </div>
      </dl>

      {report.deepHintSteps.length > 0 ? (
        <div id="report-deep-hints" className="mt-4">
          <h4 className="text-lg font-bold text-ink">用到手把手提示的步骤</h4>
          <ul className="mt-2 space-y-1.5">
            {report.deepHintSteps.map((item) => (
              <li key={item} className="rounded-xl border border-brand-100 bg-paper px-3 py-2 text-base leading-relaxed text-ink">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-base leading-relaxed text-ink-soft">这几步下次可以先自己试，实在不行再点“说得再具体一点”。</p>
        </div>
      ) : null}

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

      {report.takeaways.length > 0 ? (
        <div id="report-takeaways" className="mt-4">
          <h4 className="text-lg font-bold text-ink">本课记住这几条</h4>
          <ul className="mt-2 space-y-2">
            {report.takeaways.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-xl border border-lagoon-200 bg-lagoon-50 px-3 py-2.5 text-base leading-relaxed text-ink">
                <span className="mt-0.5 h-5 w-5 shrink-0 text-lagoon-700">
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div id="report-next" className="mt-4 rounded-xl border border-brand-100 bg-paper px-3 py-3">
        <p className="text-base font-semibold leading-relaxed text-ink">接下来：{report.nextSuggestion.text}</p>
        {report.nextSuggestion.courseId ? (
          <a href={hrefFor('simulation', report.nextSuggestion.courseId)} className="btn btn-primary mt-2.5 w-full text-lg">
            接着练下一课
          </a>
        ) : null}
      </div>

      <p className="mt-3 text-base leading-relaxed text-ink-soft">{note}</p>
    </section>
  )
}