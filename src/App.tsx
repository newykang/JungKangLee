import { useEffect, useState } from 'react'
import { Bookmark, ChartNoAxesColumn, House, Landmark, Network } from 'lucide-react'
import { apps, appIds, releases, updates } from './components/common/catalog'
import ReleaseReview from './components/common/ReleaseReview'
import { UpdateFeed } from './features/feed/UpdateFeed'
import { AppGroupLanding } from './features/feed/AppGroupLanding'
import { BankOverview } from './features/feed/BankOverview'
import { buildAppGroups, readAppGroups, saveAppGroups } from './features/feed/appGroups'
import { UpdateDetail } from './features/updates/UpdateDetail'
import Reviews from './features/reviews'
import Ecosystem from './features/ecosystem'
import MyApps from './features/myapps'
import { useMyApps } from './features/myapps/useMyApps'

const tabs = [
  { id: 'feed', label: '홈', icon: House },
  { id: 'banks', label: '은행 앱', icon: Landmark },
  { id: 'myapps', label: '내 앱', icon: Bookmark },
  { id: 'ecosystem', label: '관계도', icon: Network },
  { id: 'reviews', label: '평가', icon: ChartNoAxesColumn },
] as const
const appGroups = buildAppGroups(apps)

export default function App() {
  const [route, setRoute] = useState(() => location.hash.slice(1))
  const [groupSelection, setGroupSelection] = useState(readAppGroups)
  const selection = useMyApps(appIds)
  useEffect(() => {
    function handleHash() { setRoute(location.hash.slice(1)); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])
  const onboarding = route === 'groups' || (!route && !groupSelection && !selection.selectedAppIds.length)
  const [routeTab, detailId] = route.split('/')
  const active = tabs.find(item => item.id === routeTab)?.id ?? 'feed'
  const release = (routeTab === 'update' || routeTab === 'banks') && detailId && releases.find(item => item.card.id === detailId)
  const app = release && apps.find(item => item.id === release.card.appId)
  const nav = tabs.map(({ id, label, icon: Icon }) => <a key={id} href={'#' + id} aria-current={active === id ? 'page' : undefined}><Icon size={19} /><span>{label}</span></a>)
  return <>
    <a className="skip" href="#content" onClick={event => { event.preventDefault(); document.getElementById('content')?.focus() }}>본문으로 이동</a>
    <header className="frame-header"><div><a className="brand" href="#feed"><img src="/appdate.svg" alt=""/>appdate</a>{!onboarding && <nav className="top-nav" aria-label="주 메뉴">{nav}</nav>}</div></header>
    <main id="content" tabIndex={-1} className="frame-main">
      {onboarding && <AppGroupLanding groups={appGroups} selected={groupSelection?.groups ?? []} onSave={ids => {
        const next = saveAppGroups(appGroups, ids, groupSelection, selection.selectedAppIds)
        setGroupSelection(next.preferences)
        selection.saveSelectedApps(next.selected)
        location.hash = 'feed'
      }} />}
      <div hidden={onboarding || active !== 'feed' || Boolean(release && app)}><UpdateFeed apps={apps} updates={updates} selectedAppIds={selection.selectedAppIds} onOpenUpdate={item => { location.hash = 'update/' + item.id }} /></div>
      {active === 'banks' && !release && <BankOverview apps={apps} updates={updates} onOpenUpdate={item => { location.hash = 'banks/' + item.id }} />}
      {release && app && <UpdateDetail key={release.card.id} app={{...app, storeUrl: release.storeUrl}} update={release.card} history={updates} onBack={() => { location.hash = active === 'banks' ? 'banks' : 'feed' }}
        backLabel={active === 'banks' ? '은행 앱 한눈에 보기' : undefined}
        review={release.canVote ? <ReleaseReview key={release.card.id} id={release.card.id} version={release.card.version} /> : <p className="pane">버전이 확인되면 평가할 수 있어요.</p>} />}
      {active === 'myapps' && <><a className="ad-group-settings" href="#groups">앱 그룹 변경</a><MyApps apps={apps} {...selection} /></>}
      {active === 'ecosystem' && <Ecosystem selectedAppIds={selection.selectedAppIds} />}
      {active === 'reviews' && <Reviews />}
    </main>
    {!onboarding && <nav className="bottom-nav" aria-label="모바일 주 메뉴">{nav}</nav>}
  </>
}
