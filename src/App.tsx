import { useEffect, useState } from 'react'
import { Activity, Compass, Heart, LayoutGrid, Sparkles, Star } from 'lucide-react'
import Feed from './features/feed'
import Updates from './features/updates'
import Reviews from './features/reviews'
import Ecosystem from './features/ecosystem'
import MyApps from './features/myapps'

const tabs = [
  { id: 'feed', label: '피드', icon: LayoutGrid, Page: Feed },
  { id: 'updates', label: '업데이트', icon: Activity, Page: Updates },
  { id: 'reviews', label: '평가', icon: Star, Page: Reviews },
  { id: 'ecosystem', label: '관계도', icon: Compass, Page: Ecosystem },
  { id: 'myapps', label: '내 앱', icon: Heart, Page: MyApps },
] as const

function getActiveTab() {
  return tabs.find(({ id }) => location.hash === `#${id}`) ?? tabs[0]
}

export default function App() {
  const [active, setActive] = useState(getActiveTab)
  const { Page } = active

  useEffect(() => {
    const onHashChange = () => setActive(getActiveTab())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="min-h-dvh">
      <a href="#main-content" onClick={event => {
        event.preventDefault()
        document.getElementById('main-content')?.focus()
      }} className="sr-only focus:not-sr-only focus:fixed focus:z-20 focus:rounded-lg focus:bg-white focus:p-3">본문으로 건너뛰기</a>
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4 sm:px-8">
          <a href="#feed" className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="grid size-8 place-items-center rounded-xl bg-indigo-600 text-white"><Sparkles size={17} aria-hidden="true" /></span>
            appdate
          </a>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:px-8 sm:pt-10">
        <Page />
      </main>
      <nav aria-label="주 내비게이션" className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <a key={id} href={`#${id}`} aria-current={active.id === id ? 'page' : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-medium ${active.id === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Icon size={19} aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
