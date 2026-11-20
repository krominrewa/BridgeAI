import { hrefFor } from '../router'
import { LogoMark } from './icons'

export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-br from-brand-800 via-brand-700 to-lagoon-700 text-white">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-center text-3xl font-bold leading-snug sm:text-4xl">
          科技向善，让每个人都能享受数字生活
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-brand-100">
          我们相信，一次安心的练习，就能减少一次现实中的慌张。
        </p>

        <div className="mt-9 flex flex-col items-center gap-4 border-t border-white/20 pt-8 text-brand-100">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9">
              <LogoMark />
            </span>
            <span className="text-xl font-semibold text-white">数字桥梁 BridgeAI</span>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            <li>
              <a href={hrefFor('home')} className="min-h-[48px] rounded-full px-5 py-3 text-lg hover:bg-white/15">
                首页
              </a>
            </li>
            <li>
              <a href={hrefFor('learning')} className="min-h-[48px] rounded-full px-5 py-3 text-lg hover:bg-white/15">
                学习中心
              </a>
            </li>
            <li>
              <a href={hrefFor('about')} className="min-h-[48px] rounded-full px-5 py-3 text-lg hover:bg-white/15">
                关于项目
              </a>
            </li>
          </ul>
          <p className="mt-2 text-center text-base text-brand-200">
            © 2026 数字桥梁 BridgeAI · 2026 Qoder 高校创造力大赛 · Hack4Good 技术向善赛道
          </p>
        </div>
      </div>
    </footer>
  )
}
