import { useEffect, useState } from 'react'
import { Bookmark, ChartNoAxesColumn, House, Landmark, Network } from 'lucide-react'
import { apps, appIds, releases, updates } from './components/common/catalog'
import ReleaseReview from './components/common/ReleaseReview'
import { UpdateFeed } from './features/feed/UpdateFeed'
import { usePlatformFeed } from './features/feed/usePlatformFeed'
import { AppGroupLanding } from './features/feed/AppGroupLanding'
import { BankOverview } from './features/feed/BankOverview'
import { buildAppGroups, readAppGroups, saveAppGroups } from './features/feed/appGroups'
import { UpdateDetail } from './features/updates/UpdateDetail'
import { AppTimeline } from './features/updates/AppTimeline'
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
  const { platform, savePlatform, feedUpdates } = usePlatformFeed(updates)
  useEffect(() => {
    function handleHash() { setRoute(location.hash.slice(1)); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])
  const onboarding = route === 'groups' || (!route && !groupSelection && !selection.selectedAppIds.length)
  const [routeTab, pathId, timelineReleaseId] = route.split('/')
  const active = tabs.find(item => item.id === routeTab)?.id ?? 'feed'
  const timelineApp = routeTab === 'app' ? apps.find(item => item.id === pathId) : undefined
  const detailId = timelineApp ? timelineReleaseId : routeTab === 'app' ? undefined : pathId
  const release = detailId && releases.find(item => item.card.id === detailId && (!timelineApp || item.card.appId === timelineApp.id))
  const app = release && apps.find(item => item.id === release.card.appId)
  const detailRoute = timelineApp ? 'app/' + timelineApp.id + '/' : active === 'banks' ? 'banks/' : 'update/'
  const nav = tabs.map(({ id, label, icon: Icon }) => <a key={id} href={'#' + id} aria-current={active === id ? 'page' : undefined}><Icon size={19} /><span>{label}</span></a>)
  return <>
    <a className="skip" href="#content" onClick={event => { event.preventDefault(); document.getElementById('content')?.focus() }}>본문으로 이동</a>
    <header className="frame-header"><div><a className="brand" href="#feed"><img src="/appdate.svg" alt=""/>appdate</a>{!onboarding && <nav className="top-nav" aria-label="주 메뉴">{nav}</nav>}</div></header>
    <main id="content" tabIndex={-1} className="frame-main">
      {onboarding && <AppGroupLanding groups={appGroups} selected={groupSelection?.groups ?? []} platform={platform} onSave={(ids, nextPlatform) => {
        savePlatform(nextPlatform)
        const next = saveAppGroups(appGroups, ids, groupSelection, selection.selectedAppIds)
        setGroupSelection(next.preferences)
        selection.saveSelectedApps(next.selected)
        location.hash = 'feed'
      }} />}
      <div hidden={onboarding || active !== 'feed' || Boolean(timelineApp || release && app)}><UpdateFeed apps={apps} platform={platform} updates={feedUpdates} selectedAppIds={selection.selectedAppIds} onOpenUpdate={item => { location.hash = 'app/' + item.appId }} /></div>
      {timelineApp && !release && <AppTimeline app={timelineApp} updates={feedUpdates} onOpenUpdate={item => { location.hash = detailRoute + item.id }} onBack={() => { location.hash = 'feed' }} />}
      {active === 'banks' && !release && <BankOverview apps={apps} updates={updates} onOpenUpdate={item => { location.hash = 'banks/' + item.id }} />}
      {release && app && <UpdateDetail key={release.card.id} app={{...app, storeUrl: release.storeUrl}} update={release.card} history={timelineApp ? feedUpdates : updates} onBack={() => { location.hash = timelineApp ? 'app/' + timelineApp.id : active === 'banks' ? 'banks' : 'feed' }}
        onOpenUpdate={item => { location.hash = detailRoute + item.id }}
        backLabel={timelineApp ? '앱 업데이트 기록' : active === 'banks' ? '은행 앱 한눈에 보기' : undefined}
        review={release.canVote ? <ReleaseReview key={release.card.id} id={release.card.id} version={release.card.version} /> : <p className="pane">버전이 확인되면 평가할 수 있어요.</p>} />}
      {active === 'myapps' && <MyApps apps={apps} {...selection}
        onboardingAppIds={groupSelection?.autoAdded}
        groupNames={appGroups.filter(group => groupSelection?.groups.includes(group.id)).map(group => group.name)} />}
      {active === 'ecosystem' && <Ecosystem selectedAppIds={selection.selectedAppIds} />}
      {active === 'reviews' && <Reviews />}
    </main>
    {!onboarding && <nav className="bottom-nav" aria-label="모바일 주 메뉴">{nav}</nav>}
  </>
}
