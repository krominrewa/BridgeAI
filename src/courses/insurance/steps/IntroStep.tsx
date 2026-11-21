import { MedicalIcon, QrIcon, WalletIcon } from '../../../components/icons'
import NoteCard from '../../../components/simulation/NoteCard'
import StepHeading from '../../../components/simulation/StepHeading'

const POINTS = [  { icon: <QrIcon />, title: '一个二维码就能看病买药', text: '电子凭证和手里那张实体卡作用一样，忘带卡也不耽误挂号。' },
  { icon: <WalletIcon />, title: '能查余额和记录', text: '个人账户还剩多少钱、哪一天在哪家药店刷过，App 里都查得到。' },
  { icon: <MedicalIcon />, title: '家人可以代出示', text: '绑定了“亲情账户”的老人、小孩，可以由您帮忙出示凭证。' },
]

export default function IntroStep() {
  return (
    <>
      <StepHeading title="医保电子凭证是什么" hint="这一页不用选，看完点“下一步”，我们实际出示一次。" />
      <div className="mt-4 space-y-3">
        {POINTS.map((point) => (
          <div key={point.title} className="flex items-start gap-3 rounded-2xl border-2 border-brand-100 bg-white px-4 py-3">
            <span className="mt-1 h-6 w-6 shrink-0 text-brand-600" aria-hidden="true">
              {point.icon}
            </span>
            <p className="text-base leading-relaxed text-ink-soft">
              <span className="mr-1 text-lg font-bold text-ink">{point.title}</span>
              {point.text}
            </p>
          </div>
        ))}
      </div>
      <NoteCard
        tone="amber"
        title="先记住一条"
        text="医保凭证等于您的医保账户。任何人——自称医保局、银行、公检法都不行——打电话向您要验证码、密码或让您把二维码截图发过去，都是骗子。真实的医保部门不会这样要。"
      />
    </>
  )
}
