import { BridgeBuddy, CheckIcon } from '../icons'

const LEARN_POINTS = ['学会选择医院和科室', '学会选择医生与看病时间', '看懂预约成功的提示']

type WelcomeScreenProps = {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-4">
        <span className="h-16 w-16 shrink-0">
          <BridgeBuddy />
        </span>
        <div>
          <h2 className="text-[26px] font-bold leading-snug text-ink">
            欢迎使用
            <br />
            模拟挂号
          </h2>
        </div>
      </div>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        这是一部练习手机，我是引导助手桥桥。一共 6 步，约 10 分钟，我会带您从头到尾挂一次号。
      </p>
      <ul className="mt-5 space-y-2.5">
        {LEARN_POINTS.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 rounded-2xl border border-brand-100 bg-white px-4 py-3 text-lg text-ink"
          >
            <span className="mt-1 h-5 w-5 shrink-0 text-lagoon-700">
              <CheckIcon />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <button type="button" id="start-simulation" onClick={onStart} className="btn btn-primary mt-6 w-full">
        开始模拟
      </button>
      <p className="mt-3 text-base leading-relaxed text-ink-muted">
        全程使用虚构的医院和医生，不需要账号，也不会扣钱。
      </p>
    </div>
  )
}