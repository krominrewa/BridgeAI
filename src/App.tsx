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

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <button
        type="button"
        onClick={() => document.getElementById('main-content')?.focus()}
        className="skip-link"
      >
        跳到主要内容
      </button>
      <NavBar current={route} />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <div key={route} className="animate-fade-up">
          <Page />
        </div>
      </main>
      <Footer />
    </div>
  )
}
