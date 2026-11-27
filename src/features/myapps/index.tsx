import { Check, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import type { FeedApp } from '../feed/model'
import { searchApps } from '../feed/search'
import { AppIcon } from '../feed/AppIcon'

export interface MyAppsProps {
  apps: readonly FeedApp[]
  selectedAppIds: readonly string[]
  onToggleApp: (id: string) => void
  storageMessage: string
  groupNames?: readonly string[]
  onboardingAppIds?: readonly string[]
}

export default function MyApps({ apps, selectedAppIds, onToggleApp, storageMessage, groupNames = [], onboardingAppIds = [] }: MyAppsProps) {
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState('')
  const registeredIds = new Set(selectedAppIds)
  const onboardingIds = new Set(onboardingAppIds)
  const results = searchApps(apps, query)
  const matches = apps
    .filter(app => results.has(app.id) && registeredIds.has(app.id) !== adding)
    .sort((a,b) => Number(onboardingIds.has(b.id)) - Number(onboardingIds.has(a.id)))
  return <section className="library">
    <h1>내 앱</h1><p className="subtext">사용하는 앱을 등록하면 업데이트 피드에서 먼저 보여요.</p>
    <div className="ad-my-groups">
      {groupNames.length > 0 && <p><strong>선택한 앱 그룹</strong> {groupNames.join(' · ')}</p>}
      <a className="ad-group-settings" href="#groups">앱 그룹 변경</a>
    </div>
    <div className="library-controls">
      <label className="searchbox"><Search size={18} /><input aria-label={adding ? '등록할 앱 검색' : '내 앱 검색'} placeholder="지금 이름이나 예전 이름 검색" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <button className="pill" onClick={() => { setQuery(''); setNotice(''); setAdding(!adding) }}>{adding ? '내 앱 목록으로' : <><Plus size={16} aria-hidden="true" /> 추가 등록</>}</button>
    </div>
    <h2 className="ad-library-heading">{adding ? '추가할 앱' : '등록된 앱 ' + selectedAppIds.length + '개'}</h2>
    {storageMessage && <p role="status">{storageMessage}</p>}
    <p className={notice ? 'subtext ad-library-notice' : 'sr-only'} role="status">{notice}</p>
    <div className="library-list">{matches.map(app => {
      const registered = registeredIds.has(app.id)
      return <div key={app.id} className="library-item"><AppIcon app={app} /><div><strong>{app.name}</strong><small>{app.category}</small>{results.get(app.id)?.map(note => <p className="app-history-text" key={note}>{note}</p>)}</div>
        <button className="toggle" aria-label={app.name + (registered ? ' 해제' : ' 등록')} aria-pressed={registered} onClick={() => {
          onToggleApp(app.id)
          setNotice(app.name + (registered ? ' 등록 해제' : ' 등록 완료'))
        }}>
          {registered ? <Check size={16} /> : <Plus size={16} />}{registered ? '등록됨' : '등록'}</button></div>
    })}</div>
    {!matches.length && <p className="pane">{query ? '검색한 앱이 없어요.' : adding ? '추가로 등록할 앱이 없어요.' : '추가 등록을 눌러 사용하는 앱을 고르세요.'}</p>}
  </section>
}
