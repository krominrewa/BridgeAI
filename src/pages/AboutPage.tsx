import BackLink from '../components/BackLink'
import { hrefFor } from '../router'

const VALUES = [
  {
    title: '先敢点，再会点',
    description: '很多长辈不是学不会，而是不敢学。我们把“点错”的代价降为零，练习从心态开始。',
  },
  {
    title: '说人话，不说术语',
    description: '引导文案避免“入口”“鉴权”等词汇，用日常说法解释每一步在做什么。',
  },
  {
    title: '学得慢也没关系',
    description: '同一个场景可以反复重来，节奏由学习者自己掌握，不催促、不打断。',
  },
]

const PLAN = [
  { stage: '第 1–3 天', detail: '项目初始化、首页与页面骨架、模拟手机外壳（已完成）' },
  { stage: '第 4–7 天', detail: '完整挂号模拟流程、分步教学提示、学习成果小结（已完成）' },
  { stage: '第 8–10 天', detail: '视觉与交互升级、引导助手「桥桥」与中文朗读、适老化打磨；补齐缴费、出行、医保与三节防骗训练，七课全部开放（已完成）；持续更新发布到 Qoder Sites（由组长统一安排）' },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:py-16">
      <BackLink to="home" label="返回首页" />

      <header className="mt-4">
        <h1 className="text-4xl font-bold text-ink sm:text-5xl">关于项目</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-soft">
          数字桥梁 BridgeAI 是一款面向老年人及数字技能基础薄弱群体的 AI 情景式数字技能学习平台。
        </p>
      </header>

      <section className="surface-card mt-10 bg-gradient-to-br from-brand-50 to-lagoon-50">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">我们想解决什么问题</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          挂号、缴费、出行、查询医保——这些对年轻人来说只是“点几下”的操作，
          对不少长辈却是一道实实在在的门槛：怕点错、怕被骗、怕扣钱、怕麻烦子女。
          真正缺失的不是意愿，而是一个可以安心试错的环境。
        </p>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          BridgeAI 用仿真的手机界面还原真实应用场景，让学习发生在“操作”里，而不是说明书里。
          全程无需真实账户、不涉及真实支付，练习多少次都可以。
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">三条设计原则</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {VALUES.map((value) => (
            <article key={value.title} className="surface-card h-full hover:-translate-y-1 hover:shadow-card-hover">
              <h3 className="text-xl font-bold text-brand-700">{value.title}</h3>
              <p className="mt-3 text-lg leading-relaxed text-ink-soft">{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">10 天开发计划</h2>
        <ol className="mt-6 space-y-4">
          {PLAN.map((item, index) => (
            <li key={item.stage} className="surface-card flex items-start gap-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-xl font-bold text-ink">{item.stage}</p>
                <p className="mt-1 text-lg leading-relaxed text-ink-soft">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="surface-card mt-12">
        <h2 className="text-2xl font-bold text-ink">当前实现</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">
          首页、学习中心、关于页与七节 6 步情景课已全部完成：模拟预约挂号、数字生活缴费（水电燃气）、出行打车与公交查询、
          医保与电子凭证查询，以及三节独立的 AI 防骗训练——识破冒充客服退款、识破冒充公检法、识破补贴短信链接。
          防骗课里所有对话、号码和链接都是虚构的，只练识别与应对，不提供任何可点击的外部链接；医保一课还专门练习了“验证码谁要都不能给”。
          每课都支持返回修改、遗漏提示与刷新续练，医院、户号、车辆、账户全部是虚构数据，不连接任何真实系统，也不会扣钱。
          全站辅助设置提供字号、高对比、简洁模式、逐步操作、语音引导与语速调节；语音引导默认开启，进入首页即朗读欢迎语，
          并可在首屏、导航栏和练习工具栏随时关闭，方便视力障碍用户。
          每一步都有“我需要帮助”按钮，由引导助手「桥桥」按当前状态给出大白话提示：默认使用稳定的本地规则提示，
          也可以在服务器端接入真实大模型后换成 AI 回答（比赛版本计划接入 Qoder API），密钥只留在服务器，不会下发到您的浏览器；完成后生成学习小结，
          包含完成情况、用时、错误操作次数、使用提示次数、需要复习的步骤与再次练习入口。
          项目采用 React + TypeScript + Vite + Tailwind CSS 构建，页面使用简体中文，
          支持电脑与手机屏幕，为老年用户提供了更大的字号与按钮，主要操作可用键盘完成，
          提示与错误提醒可被读屏软件感知。
        </p>
        <div className="mt-7">
          <a href={hrefFor('learning')} className="btn btn-primary">
            去学习中心体验
          </a>
        </div>
      </section>
    </div>
  )
}
