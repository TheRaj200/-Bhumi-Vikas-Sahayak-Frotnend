import { useEffect, useState } from 'react'

// Tiny hash router (no library). Routes:
//   #/ask                      Ask the rules (F1, F2, F6, F7, F13)
//   #/cases                    Case list + new case
//   #/cases/:id                Case review = Visual Plan Inspector (F4, F5, F9, F10)
//   #/cases/:id/report         Review report + print (F8, F12)
//   #/rule-lab                 Encoded rules list (F3, F11)
//   #/rule-lab/:ruleId         One rule: checks, verification, tests
//   #/benchmark                17-question eval + lookup-time trials

export type Route =
  | { page: 'ask' }
  | { page: 'cases' }
  | { page: 'case'; id: string }
  | { page: 'report'; id: string }
  | { page: 'rule-lab' }
  | { page: 'rule'; ruleId: string }
  | { page: 'upload' }
  | { page: 'benchmark' }

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
  const [first, second, third] = parts
  if (first === 'cases' && second && third === 'report') return { page: 'report', id: second }
  if (first === 'cases' && second) return { page: 'case', id: second }
  if (first === 'cases') return { page: 'cases' }
  if (first === 'rule-lab' && second) return { page: 'rule', ruleId: second }
  if (first === 'rule-lab') return { page: 'rule-lab' }
  if (first === 'upload') return { page: 'upload' }
  if (first === 'benchmark') return { page: 'benchmark' }
  return { page: 'ask' }
}

export function hrefFor(route: Route): string {
  switch (route.page) {
    case 'ask':
      return '#/ask'
    case 'cases':
      return '#/cases'
    case 'case':
      return `#/cases/${encodeURIComponent(route.id)}`
    case 'report':
      return `#/cases/${encodeURIComponent(route.id)}/report`
    case 'rule-lab':
      return '#/rule-lab'
    case 'rule':
      return `#/rule-lab/${encodeURIComponent(route.ruleId)}`
    case 'upload':
      return '#/upload'
    case 'benchmark':
      return '#/benchmark'
  }
}

export function navigate(route: Route) {
  window.location.hash = hrefFor(route)
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
