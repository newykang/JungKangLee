import { useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import RelationshipMap, { NodeIcon } from './RelationshipMap'
import type { Connection } from './RelationshipMap'
import RelationshipDetails from './RelationshipDetails'
import { byId, kindLabels, nameHistoryFor, neighbors, nodes, relations, topics } from './graph'
import type { Filter } from './graph'
import { searchApps } from '../feed/search'
import './explorer.css'

export interface EcosystemProps { selectedAppIds: readonly string[] }


const searchIndex = nodes.map(node => ({ ...node, developer: node.operator, nameHistory: nameHistoryFor(node.id) }))

export default function Ecosystem({ selectedAppIds }: EcosystemProps) {
  const [trail, setTrail] = useState<string[]>(['kb-pay'])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('전체')
  const [detail, setDetail] = useState<Connection | null>(null)
  const center = byId.get(trail[trail.length - 1])!
  const all = neighbors(center.id, '전체')
  const connected = filter === '전체' ? all : neighbors(center.id, filter)
  const available = new Set(all.flatMap(item => item.reasons.map(edge => relations[edge.kind][1])))
  const results = query.trim() ? searchApps(searchIndex, query) : new Map<string, string[]>()
  const matches = nodes.filter(node => results.has(node.id))

  function changeCenter(nextTrail: string[]) {
    setTrail(nextTrail)
    setDetail(null)
    setFilter('전체')
    setQuery('')
    requestAnimationFrame(() => document.getElementById('rel-center')?.focus())
  }
  function explore(id: string) {
    changeCenter(id === center.id ? trail : [...trail, id])
  }

  return <section className="ecosystem rel-explorer">
    <h1>앱 관계도</h1><p className="rel-intro">아이콘을 누르면 두 앱이 어떻게 연결되는지 볼 수 있어요.</p>
    <div className="rel-controls">
      <div className="rel-search">
        <label className="searchbox"><Search size={22} aria-hidden="true"/><input type="search" aria-label="앱·운영사·이전 이름 검색"
          placeholder="앱 이름이나 운영사 검색" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setQuery('') }}/></label>
        {query.trim() && <div className="rel-results"><p role="status">{matches.length ? '검색 결과 ' + matches.length + '개' : '일치하는 앱이나 서비스가 없어요.'}</p>
          {matches.map(node => <button type="button" key={node.id} onClick={() => explore(node.id)}><NodeIcon node={node}/>
            <span><strong>{node.name}</strong><small>{kindLabels[node.kind]} · {node.operator}</small>{results.get(node.id)?.map(note => <small key={note}>{note}</small>)}</span></button>)}</div>}
      </div>
      <label className="rel-select">주제별 탐색<select value={topics.some(([,id])=>id === center.id) ? center.id : ''} onChange={e=>explore(e.target.value)}>
        <option value="" disabled>주제 선택</option>{topics.map(([title,id])=><option key={id} value={id}>{title}</option>)}</select></label>
      <label className="rel-select">관계 유형<select value={filter} onChange={e=>setFilter(e.target.value as Filter)}>
        <option>전체</option>{[...available].map(item=><option key={item}>{item}</option>)}</select></label>
    </div>
    {trail.length > 1 && <button type="button" className="rel-back" onClick={() => changeCenter(trail.slice(0, -1))}>
      <ArrowLeft size={20} aria-hidden="true"/>{byId.get(trail[trail.length-2])!.name}로 돌아가기</button>}
    <RelationshipMap center={center} connections={connected} selectedAppIds={selectedAppIds} onSelect={setDetail}/>
    {detail && <RelationshipDetails center={center} connection={detail} selectedAppIds={selectedAppIds} onClose={()=>setDetail(null)} onExplore={explore}/>}
  </section>
}
