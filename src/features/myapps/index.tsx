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
}

export default function MyApps({ apps, selectedAppIds, onToggleApp, storageMessage }: MyAppsProps) {
  const [query, setQuery] = useState('')
  const [mineOnly, setMineOnly] = useState(false)
  const results = searchApps(apps, query)
  const matches = apps.filter(app => results.has(app.id) && (!mineOnly || selectedAppIds.includes(app.id)))
  return <section className="library">
    <h1>내 앱</h1><p className="subtext">사용하는 앱을 등록하면 업데이트 피드에서 먼저 보여요.</p>
    <div className="library-controls"><label className="searchbox"><Search size={18} /><input aria-label="등록할 앱 검색" placeholder="지금 이름이나 예전 이름 검색" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <button className="pill" aria-pressed={mineOnly} onClick={() => setMineOnly(!mineOnly)}>등록한 앱 {selectedAppIds.length}</button></div>
    {storageMessage && <p role="status">{storageMessage}</p>}
    <div className="library-list">{matches.map(app => {
      const registered = selectedAppIds.includes(app.id)
      return <div key={app.id} className="library-item"><AppIcon app={app} /><div><strong>{app.name}</strong><small>{app.category}</small>{results.get(app.id)?.map(note => <p className="app-history-text" key={note}>{note}</p>)}</div>
        <button className="toggle" aria-label={app.name + (registered ? ' 해제' : ' 등록')} aria-pressed={registered} onClick={() => onToggleApp(app.id)}>
          {registered ? <Check size={16} /> : <Plus size={16} />}{registered ? '등록됨' : '등록'}</button></div>
    })}</div>
    {!matches.length && <p className="pane">{mineOnly && !query ? '아직 등록한 앱이 없어요.' : '검색한 앱이 없어요.'}</p>}
  </section>
}
