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

export function SettingsIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 7h9M19 7h1M4 17h3M13 17h7" strokeLinecap="round" />
      <circle cx="16" cy="7" r="2.4" />
      <circle cx="10" cy="17" r="2.4" />
    </svg>
  )
}

export function SpeakerIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" strokeLinejoin="round" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.6 7.6 0 0 1 0 11" strokeLinecap="round" />
    </svg>
  )
}

export function StopIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" strokeLinejoin="round" />
    </svg>
  )
}

export function RepeatIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" strokeLinecap="round" />
      <path d="M20 4.5v4h-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" strokeLinecap="round" />
      <path d="M4 19.5v-4h4" strokeLinecap="round" strokeLinejoin="round" />
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

export function BoltIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M13.5 3L6 13.5h5L10 21l7.5-10.5h-5z" strokeLinejoin="round" />
    </svg>
  )
}

export function WaterDropIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3.5c3.6 4 5.6 6.6 5.6 9.2a5.6 5.6 0 1 1-11.2 0c0-2.6 2-5.2 5.6-9.2z" strokeLinejoin="round" />
      <path d="M9.6 14.4a2.6 2.6 0 0 0 2.4 2.4" strokeLinecap="round" />
    </svg>
  )
}

export function FlameIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3.5c1.2 3 4.2 4.2 4.2 8.2a4.2 4.2 0 1 1-8.4 0c0-1.6.6-2.4 1.2-3.2" strokeLinejoin="round" />
      <path d="M12 20.5a2.6 2.6 0 0 1-2.6-2.6c0-1.6 2.6-2.8 2.6-2.8s2.6 1.2 2.6 2.8a2.6 2.6 0 0 1-2.6 2.6z" strokeLinejoin="round" />
    </svg>
  )
}

export function BillIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z" strokeLinejoin="round" />
      <path d="M9.5 8h5M9.5 12h5" strokeLinecap="round" />
    </svg>
  )
}

export function WalletIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3.5" y="6.5" width="17" height="12" rx="3" />
      <path d="M3.5 10.5h17" />
      <circle cx="16" cy="14.5" r="1.4" />
    </svg>
  )
}

export function BankCardIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2.6" />
      <path d="M3 10h18" />
      <path d="M6.5 14.5h4" strokeLinecap="round" />
    </svg>
  )
}

export function QrIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.6" />
      <rect x="14" y="4" width="6" height="6" rx="1.6" />
      <rect x="4" y="14" width="6" height="6" rx="1.6" />
      <path d="M14 14h2.4v2.4H14zM17.6 17.6H20V20h-2.4z" strokeLinejoin="round" />
    </svg>
  )
}

export function PinIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21c4.4-5 6.4-7.8 6.4-10.6A6.4 6.4 0 1 0 5.6 10.4C5.6 13.2 7.6 16 12 21z" strokeLinejoin="round" />
      <circle cx="12" cy="10.2" r="2.4" />
    </svg>
  )
}

export function CarIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 15.5h16M5.5 15.5V13l2-4.5h9L18.5 13v2.5" strokeLinejoin="round" />
      <path d="M4 15.5v2.5h16v-2.5" strokeLinejoin="round" />
      <circle cx="8" cy="18.4" r="1.4" />
      <circle cx="16" cy="18.4" r="1.4" />
    </svg>
  )
}

export function BusIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="4" width="14" height="13" rx="3" />
      <path d="M5 11h14" />
      <path d="M8 20.5v-3M16 20.5v-3" strokeLinecap="round" />
      <path d="M8.5 14.2h1.4M14.1 14.2h1.4" strokeLinecap="round" />
    </svg>
  )
}

export function WalkIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="13" cy="4.6" r="1.8" />
      <path d="M12.6 9l-2.4 3.2 2.6 1.4.8 5.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.2 12.2L7.6 15M13.6 13.6l2.6 1.6" strokeLinecap="round" />
    </svg>
  )
}

export function MedicalIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3.5" y="6.5" width="17" height="12" rx="3" />
      <path d="M12 9.8v5.4M9.3 12.5h5.4" strokeLinecap="round" />
    </svg>
  )
}

export function IdCardIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="2.8" />
      <circle cx="8.6" cy="11.4" r="2" />
      <path d="M5.8 16c.6-1.5 1.7-2.2 2.8-2.2s2.2.7 2.8 2.2" strokeLinecap="round" />
      <path d="M14.4 10h3.4M14.4 13.4h3.4" strokeLinecap="round" />
    </svg>
  )
}

export function FaceIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M20 8.5V6a2 2 0 0 0-2-2h-2.5M4 15.5V18a2 2 0 0 0 2 2h2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5" strokeLinecap="round" />
      <path d="M9.6 10.6h.01M14.4 10.6h.01" strokeLinecap="round" />
      <path d="M9.8 14.4c.6.8 1.4 1.2 2.2 1.2s1.6-.4 2.2-1.2" strokeLinecap="round" />
    </svg>
  )
}

export function ShareIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="17.6" cy="6" r="2.6" />
      <circle cx="6.4" cy="12" r="2.6" />
      <circle cx="17.6" cy="18" r="2.6" />
      <path d="M8.7 10.7l6.6-3.4M8.7 13.3l6.6 3.4" strokeLinecap="round" />
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
