import { LogoMark } from './icons'
import { hrefFor, type Route } from '../router'

const NAV_ITEMS: { route: Route; label: string }[] = [
  { route: 'home', label: '首页' },
  { route: 'learning', label: '学习中心' },
  { route: 'about', label: '关于项目' },
]

type NavBarProps = {
  current: Route
}

export default function NavBar({ current }: NavBarProps) {
  const activeKey: Route = current === 'simulation' ? 'learning' : current

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <nav
        aria-label="主导航"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2 sm:px-5 sm:py-3"
      >
        <a
          href={hrefFor('home')}
          className="flex shrink-0 items-center gap-2 rounded-2xl px-1 py-1 text-xl font-bold text-ink sm:gap-3 sm:text-2xl"
        >
          <span className="h-9 w-9 sm:h-11 sm:w-11">
            <LogoMark />
          </span>
          <span>
            数字桥梁<span className="ml-2 hidden text-brand-600 md:inline">BridgeAI</span>
          </span>
        </a>

        <ul className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.route === activeKey
            return (
              <li key={item.route}>
                <a
                  href={hrefFor(item.route)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[44px] items-center rounded-full px-3 text-base font-semibold transition-colors sm:min-h-[52px] sm:px-5 sm:text-lg ${
                    isActive
                      ? 'bg-brand-700 text-white'
                      : 'text-ink-soft hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}