type StepHeadingProps = {
  title: string
  hint: string
}

export default function StepHeading({ title, hint }: StepHeadingProps) {
  return (
    <div className="mt-5">
      <h2 id="step-heading" tabIndex={-1} className="text-2xl font-bold leading-snug text-ink">
        {title}
      </h2>
      <p className="mt-2 text-lg leading-relaxed text-ink-soft">{hint}</p>
    </div>
  )
}
