import { CheckIcon, PhoneIcon } from '../icons'

const LEARN_POINTS = ['学会选择医院和科室', '学会选择医生与看病时间', '看懂预约成功的提示']

type WelcomeScreenProps = {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="px-6 py-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-lagoon-500 text-white">
        <span className="h-8 w-8">
          <PhoneIcon />
        </span>
      </div>
      <h2 className="mt-5 text-3xl font-bold leading-snug text-ink">
        欢迎使用
        <br />
        模拟挂号
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        这是一部练习手机。一共 6 步，约 10 分钟，我们会带您从头到尾挂一次号。
      </p>
      <ul className="mt-6 space-y-3">
        {LEARN_POINTS.map((point) => (
          <li key={point} className="flex items-start gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-lg text-ink">
            <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-600">
              <CheckIcon />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <button type="button" id="start-simulation" onClick={onStart} className="btn btn-primary mt-7 w-full">
        开始模拟
      </button>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        全程使用虚构的医院和医生，不需要账号，也不会扣钱。
      </p>
    </div>
  )
}
