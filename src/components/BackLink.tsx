import { ArrowLeftIcon } from './icons'
import { hrefFor, type Route } from '../router'

type BackLinkProps = {
  to: Route
  label: string
}

export default function BackLink({ to, label }: BackLinkProps) {
  return (
    <a href={hrefFor(to)} className="btn btn-ghost -ml-3 text-brand-700">
      <span className="h-5 w-5">
        <ArrowLeftIcon />
      </span>
      {label}
    </a>
  )
}
