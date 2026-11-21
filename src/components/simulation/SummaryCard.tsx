import { TicketIcon } from '../icons'

export type SummaryRow = {
  label: string
  value: string
}

type SummaryCardProps = {
  rows: SummaryRow[]
  title?: string
  code?: string | null
}

/** 核对页与凭证页共用的信息清单：标签在上、内容在下，长文字换行也不挤。 */
export default function SummaryCard({ rows, title, code }: SummaryCardProps) {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border-2 border-brand-100 bg-white">
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 bg-brand-50 px-4 py-2.5">
          <p className="flex items-center gap-2 text-lg font-bold text-brand-800">
            <span className="h-6 w-6 shrink-0">
              <TicketIcon />
            </span>
            {title}
          </p>
          <span className="badge bg-white text-brand-800">练习专用</span>
        </div>
      ) : null}
      {code ? (
        <p className="border-b border-dashed border-brand-200 px-4 py-3 text-[22px] font-bold tracking-wide text-ink">
          {code}
        </p>
      ) : null}
      <dl className="divide-y divide-brand-50">
        {rows.map((row) => (
          <div key={row.label} className="px-4 py-2.5">
            <dt className="text-base text-ink-muted">{row.label}</dt>
            <dd className="mt-0.5 text-lg font-semibold leading-snug text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
