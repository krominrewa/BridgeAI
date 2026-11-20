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
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/90 backdrop-blur">
      <nav
        aria-label="主导航"
        className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <a
          href={hrefFor('home')}
          className="flex shrink-0 items-center gap-3 rounded-2xl px-1 py-1 text-2xl font-bold text-ink"
        >
          <span className="h-11 w-11">
            <LogoMark />
          </span>
          <span>
            数字桥梁<span className="ml-2 text-brand-600">BridgeAI</span>
          </span>
        </a>

        <ul className="flex flex-wrap items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.route === activeKey
            return (
              <li key={item.route}>
                <a
                  href={hrefFor(item.route)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[52px] items-center rounded-full px-5 text-lg font-semibold transition-colors ${
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
