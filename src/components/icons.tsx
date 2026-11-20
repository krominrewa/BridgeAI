type IconProps = {
  className?: string
}

const base = 'h-full w-full'

export function LogoMark({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bridge-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a73e0" />
          <stop offset="100%" stopColor="#14b495" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#bridge-gradient)" />
      <path
        d="M7 26c5.5-9 20.5-9 26 0"
        fill="none"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path d="M7 26h26" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M14 26v-5M20 26v-7M26 26v-5" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function PhoneIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10.5 5.5h3" strokeLinecap="round" />
      <path d="M9.5 18.5h5" strokeLinecap="round" />
    </svg>
  )
}

export function SparkIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3.5l1.9 4.6 4.6 1.9-4.6 1.9L12 16.5l-1.9-4.6L5.5 10l4.6-1.9z" strokeLinejoin="round" />
      <path d="M18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" strokeLinejoin="round" />
    </svg>
  )
}

export function ChartIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 19.5h16" strokeLinecap="round" />
      <rect x="5.5" y="12" width="3.6" height="5" rx="1.2" />
      <rect x="10.4" y="8" width="3.6" height="9" rx="1.2" />
      <rect x="15.3" y="4.5" width="3.6" height="12.5" rx="1.2" />
    </svg>
  )
}

export function CalendarIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5V6M16 3.5V6" strokeLinecap="round" />
      <path d="M8.5 14h3.2" strokeLinecap="round" />
    </svg>
  )
}

export function ShieldIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l7 2.6v5.6c0 4.4-2.9 7.6-7 9.2-4.1-1.6-7-4.8-7-9.2V5.6z" strokeLinejoin="round" />
      <path d="M9 12.2l2 2 4-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowRightIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M4.5 12h14" strokeLinecap="round" />
      <path d="M13.5 6.5L19 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowLeftIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M19.5 12h-14" strokeLinecap="round" />
      <path d="M10.5 6.5L5 12l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CheckIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AlertIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 4.2l8.4 15H3.6z" strokeLinejoin="round" />
      <path d="M12 9.6v4.2" strokeLinecap="round" />
      <path d="M12 16.6h.01" strokeLinecap="round" />
    </svg>
  )
}

export function QuestionIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" />
      <path d="M9.7 9.5a2.4 2.4 0 1 1 3.2 2.3c-.6.2-.9.8-.9 1.4v.3" strokeLinecap="round" />
      <path d="M12 16.7h.01" strokeLinecap="round" />
    </svg>
  )
}
