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

export function HospitalIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4.5 20V8.5l7.5-4 7.5 4V20" strokeLinejoin="round" />
      <path d="M3 20h18" strokeLinecap="round" />
      <path d="M12 9v6M9 12h6" strokeLinecap="round" />
      <path d="M9.5 20v-3.5h5V20" strokeLinejoin="round" />
    </svg>
  )
}

export function PlusCircleIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 8.4v7.2M8.4 12h7.2" strokeLinecap="round" />
    </svg>
  )
}

export function UserIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M5 19.4c1.2-3.4 3.8-5.1 7-5.1s5.8 1.7 7 5.1" strokeLinecap="round" />
    </svg>
  )
}

export function ClockIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3.1 2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LockIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" strokeLinecap="round" />
      <path d="M12 14.2v2.2" strokeLinecap="round" />
    </svg>
  )
}

export function TicketIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v2a2 2 0 0 0 0 4v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2 2 0 0 0 0-4z"
        strokeLinejoin="round"
      />
      <path d="M14 7v11" strokeDasharray="2.4 2.6" strokeLinecap="round" />
    </svg>
  )
}

/** 引导助手「桥桥」：桥拱作眉、圆眼微笑，几何造型与品牌色一致 */
export function BridgeBuddy({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="buddy-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a73e0" />
          <stop offset="100%" stopColor="#0d9078" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="16" fill="url(#buddy-gradient)" />
      <path d="M10 21c6.5-8.5 21.5-8.5 28 0" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="27.5" r="2.4" fill="white" />
      <circle cx="30" cy="27.5" r="2.4" fill="white" />
      <path d="M19 34c3.2 2.6 6.8 2.6 10 0" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}
