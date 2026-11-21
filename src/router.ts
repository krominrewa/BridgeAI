import { useEffect, useState } from 'react'

export type Route = 'home' | 'learning' | 'about' | 'simulation'

/** 课程 id 同时作为练习页的 hash 片段，便于分享直达某一课。 */
export type CourseId =
  | 'appointment'
  | 'payment'
  | 'transit'
  | 'insurance'
  | 'fraud-refund'
  | 'fraud-official'
  | 'fraud-subsidy'

export type Location = {
  route: Route
  /** 仅在 simulation 路由有意义，其他路由取默认课程。 */
  courseId: CourseId
}

const COURSE_IDS: CourseId[] = [
  'appointment',
  'payment',
  'transit',
  'insurance',
  'fraud-refund',
  'fraud-official',
  'fraud-subsidy',
]

const DEFAULT_COURSE: CourseId = 'appointment'

const PATHS: Record<'home' | 'learning' | 'about', string> = {
  home: '#/',
  learning: '#/learning',
  about: '#/about',
}

function parseCourseId(value: string): CourseId {
  return COURSE_IDS.includes(value as CourseId) ? (value as CourseId) : DEFAULT_COURSE
}

function parseHash(hash: string): Location {
  const segments = hash.replace(/^#\/?/, '').split('?')[0].split('/')
  const page = segments[0]
  if (page === 'simulation') return { route: 'simulation', courseId: parseCourseId(segments[1] ?? '') }
  if (page === 'learning' || page === 'about') return { route: page, courseId: DEFAULT_COURSE }
  return { route: 'home', courseId: DEFAULT_COURSE }
}

export function hrefFor(route: Route, course: CourseId = DEFAULT_COURSE): string {
  if (route !== 'simulation') return PATHS[route]
  return `#/simulation/${course}`
}

export function useLocation(): Location {
  const [location, setLocation] = useState<Location>(() => parseHash(window.location.hash))

  useEffect(() => {
    const sync = () => setLocation(parseHash(window.location.hash))
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.route, location.courseId])

  return location
}
