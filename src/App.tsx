import { useEffect, useState } from 'react'
import { Bookmark, ChartNoAxesColumn, House, Network } from 'lucide-react'
import { apps, appIds, releases, updates } from './components/common/catalog'
import ReleaseReview from './components/common/ReleaseReview'
import { UpdateFeed } from './features/feed/UpdateFeed'
import { UpdateDetail } from './features/updates/UpdateDetail'
import Reviews from './features/reviews'
import Ecosystem from './features/ecosystem'
import MyApps from './features/myapps'
import { useMyApps } from './features/myapps/useMyApps'

const tabs = [
  { id: 'feed', label: '홈', icon: House },
  { id: 'myapps', label: '내 앱', icon: Bookmark },
  { id: 'ecosystem', label: '관계도', icon: Network },
  { id: 'reviews', label: '평가', icon: ChartNoAxesColumn },
] as const

export default function App() {
  const [route, setRoute] = useState(() => location.hash.slice(1))
  const selection = useMyApps(appIds)
  useEffect(() => {
    function handleHash() { setRoute(location.hash.slice(1)); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])
  const active = tabs.find(item => item.id === route)?.id ?? 'feed'
  const release = route.startsWith('update/') && releases.find(item => item.card.id === route.slice(7))
  const app = release && apps.find(item => item.id === release.card.appId)
  const nav = tabs.map(({ id, label, icon: Icon }) => <a key={id} href={'#' + id} aria-current={active === id ? 'page' : undefined}><Icon size={19} /><span>{label}</span></a>)
  return <>
    <a className="skip" href="#content" onClick={event => { event.preventDefault(); document.getElementById('content')?.focus() }}>본문으로 이동</a>
    <header className="frame-header"><div><a className="brand" href="#feed"><img src="/appdate.svg" alt=""/>appdate</a><nav className="top-nav" aria-label="주 메뉴">{nav}</nav></div></header>
    <main id="content" tabIndex={-1} className="frame-main">
      <div hidden={active !== 'feed' || Boolean(release && app)}><UpdateFeed apps={apps} updates={updates} selectedAppIds={selection.selectedAppIds} onOpenUpdate={item => { location.hash = 'update/' + item.id }} /></div>
      {release && app && <UpdateDetail key={release.card.id} app={{...app, storeUrl: release.storeUrl}} update={release.card} history={updates} onBack={() => { location.hash = 'feed' }}
        review={release.canVote ? <ReleaseReview key={release.card.id} id={release.card.id} version={release.card.version} /> : <p className="pane">버전이 확인되면 평가할 수 있어요.</p>} />}
      {active === 'myapps' && <MyApps apps={apps} {...selection} />}
      {active === 'ecosystem' && <Ecosystem selectedAppIds={selection.selectedAppIds} />}
      {active === 'reviews' && <Reviews />}
    </main>
    <nav className="bottom-nav" aria-label="모바일 주 메뉴">{nav}</nav>
  </>
}
