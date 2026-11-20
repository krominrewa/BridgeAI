import { useEffect, useState } from 'react'

export type Route = 'home' | 'learning' | 'about' | 'simulation'

const PATHS: Record<Route, string> = {
  home: '#/',
  learning: '#/learning',
  about: '#/about',
  simulation: '#/simulation',
}

function parseHash(hash: string): Route {
  const key = hash.replace(/^#\/?/, '').split('?')[0]
  if (key === 'learning' || key === 'about' || key === 'simulation') return key
  return 'home'
}

export function hrefFor(route: Route): string {
  return PATHS[route]
}

export function navigate(route: Route): void {
  if (window.location.hash === PATHS[route]) return
  window.location.hash = PATHS[route]
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route])

  return route
}
