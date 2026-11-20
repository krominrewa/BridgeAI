import type { ComponentType } from 'react'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LearningCenterPage from './pages/LearningCenterPage'
import AboutPage from './pages/AboutPage'
import SimulationPage from './pages/SimulationPage'
import { useRoute, type Route } from './router'

const PAGES: Record<Route, ComponentType> = {
  home: HomePage,
  learning: LearningCenterPage,
  about: AboutPage,
  simulation: SimulationPage,
}

export default function App() {
  const route = useRoute()
  const Page = PAGES[route]
  // 练习页在移动端占满视口、隐藏页脚，避免外层网页与模拟器双重滚动
  const immersive = route === 'simulation'

  return (
    <div
      className={
        immersive
          ? 'flex h-dvh flex-col overflow-hidden bg-white lg:h-auto lg:min-h-dvh lg:overflow-visible'
          : 'flex min-h-dvh flex-col bg-white'
      }
    >
      <button
        type="button"
        onClick={() => document.getElementById('main-content')?.focus()}
        className="skip-link"
      >
        跳到主要内容
      </button>
      <NavBar current={route} />
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 focus:outline-none ${immersive ? 'flex min-h-0 flex-col lg:block lg:min-h-[auto]' : ''}`}
      >
        <div
          key={route}
          className={`animate-fade-up ${immersive ? 'flex min-h-0 flex-1 flex-col lg:block lg:flex-none lg:min-h-[auto]' : ''}`}
        >
          <Page />
        </div>
      </main>
      <div className={immersive ? 'hidden lg:block' : undefined}>
        <Footer />
      </div>
    </div>
  )
}