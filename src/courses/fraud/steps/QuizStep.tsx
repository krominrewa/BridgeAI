import { CheckIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import StepHeading from '../../../components/simulation/StepHeading'
import type { FraudStepProps } from '../state'
import { isQuizComplete } from '../state'

export default function QuizStep({ scenario, state, dispatch }: FraudStepProps) {
  const complete = isQuizComplete(state, scenario)

  return (
    <>
      <StepHeading
        title="最后两道小测"
        hint="选一个您认为最对的答案。答错会解释原因，可以重新选。"
      />

      {scenario.quiz.map((question, index) => {
        const chosen = state.answers[question.id]
        return (
          <section key={question.id} className="mt-5">
            <h3 className="text-xl font-bold leading-snug text-ink">
              第 {index + 1} 题 · {question.question}
            </h3>
            <div className="mt-3 space-y-3" data-choice-group={question.id}>
              {question.options.map((option) => {
                const selected = chosen === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    id={`quiz-${question.id}-${option.id}`}
                    aria-pressed={selected}
                    onClick={() => dispatch({ type: 'answer', questionId: question.id, optionId: option.id })}
                    className={`flex min-h-[64px] w-full items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all duration-150 ${
                      selected
                        ? 'border-lagoon-500 bg-lagoon-50'
                        : 'border-brand-100 bg-white hover:border-brand-400 hover:shadow-card'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-lagoon-600 bg-lagoon-600 text-white' : 'border-brand-300 bg-white text-transparent'
                      }`}
                    >
                      <span className="h-4 w-4">
                        <CheckIcon />
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold leading-relaxed text-ink">{option.text}</span>
                      {selected ? (
                        <span className="mt-1 block text-base leading-relaxed text-lagoon-900">{option.explain}</span>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      {complete ? (
        <NoteCard
          tone="brand"
          title="都答对了"
          text="两道题都答对了。点最下面的“完成训练”，看看这次练习的小结和安全清单。"
        />
      ) : null}
    </>
  )
}