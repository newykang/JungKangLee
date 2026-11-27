import { useState } from 'react'
import { ArrowLeft, Bookmark, ExternalLink, History, Layers, Search } from 'lucide-react'
import RelationshipMap from './RelationshipMap'
import { byId, isDirectional, kindLabels, neighbors, nodes, palette, relations, topics, verifiedOn } from './graph'
import type { GraphNode, Filter } from './graph'
import './explorer.css'

export interface EcosystemProps { selectedAppIds: readonly string[] }

function Profile({ node, saved }: { node: GraphNode; saved: boolean }) {
  const Symbol = node.kind === 'service' ? Layers : History
  return <article className="profile">
    <div className="profile-heading">
      {node.iconUrl ? <img src={node.iconUrl} alt=""/> : <span className="rel-symbol"><Symbol size={21}/></span>}
      <div><h3>{node.name}</h3><small>{node.operator} · {kindLabels[node.kind]}</small></div>
      {saved && <span className="saved"><Bookmark size={12}/>내 앱</span>}
    </div>
    <p>{node.purpose}</p><ul className="features">{node.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
    <a href={node.sourceUrl} target="_blank" rel="noreferrer">{node.kind === 'app' ? '공식 App Store' : node.kind === 'service' ? '서비스 안내' : '변경 공지'} <ExternalLink size={14}/></a>
  </article>
}

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[\s·-]/g, '')

export default function Ecosystem({ selectedAppIds }: EcosystemProps) {
  const [trail, setTrail] = useState<string[]>(['kb-pay'])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('전체')
  const [compareId, setCompareId] = useState('')
  const center = byId.get(trail[trail.length - 1])!
  const all = neighbors(center.id, '전체')
  const connected = filter === '전체' ? all : neighbors(center.id, filter)
  const choice = connected.find(item => item.node.id === compareId) ?? connected[0]
  const available = new Set(all.flatMap(item => item.reasons.map(edge => relations[edge.kind][1])))
  const needle = normalize(query.trim())
  const matches = needle ? nodes.filter(node => [node.name, node.operator, ...(node.aliases ?? [])].some(value => normalize(value).includes(needle))) : []

  function explore(id: string) {
    setQuery(''); setFilter('전체'); setCompareId(center.id)
    if (id !== center.id) setTrail([...trail, id])
  }
  function back() {
    setFilter('전체'); setQuery(''); setCompareId(center.id); setTrail(trail.slice(0, -1))
  }
  return <section className="ecosystem rel-explorer">
    <h1>앱 관계도</h1><p className="subtext">앱 이름과 운영사, 예전 이름으로 연결된 서비스를 찾아보세요.</p>
    <div className="rel-controls"><div className="rel-search">
      <label className="searchbox"><Search size={18}/><input type="search" aria-label="앱·운영사·이전 이름 검색" placeholder="예: KB Pay, 리브메이트" value={query} onChange={e => setQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') setQuery('') }}/></label>
      {query.trim() && <div className="rel-results"><p role="status">{matches.length ? '검색 결과 ' + matches.length + '개' : '일치하는 앱이나 서비스가 없어요.'}</p>
        {matches.map(node => <button key={node.id} onClick={() => explore(node.id)}>{node.name} <small>{kindLabels[node.kind]} · {node.operator}</small></button>)}</div>}
    </div>
    <label className="rel-topic">주제별 탐색<select value={topics.some(([,id])=>id === center.id) ? center.id : ''} onChange={e=>explore(e.target.value)}>
      <option value="" disabled>주제 선택</option>{topics.map(([title,id])=><option key={id} value={id}>{title}</option>)}</select></label></div>

    <div className="eco-columns"><section className="graph-pane">
      {trail.length > 1 && <button className="rel-back" onClick={back}><ArrowLeft size={16}/>{byId.get(trail[trail.length-2])!.name}로 돌아가기</button>}
      <div className="graph-heading"><h2>{center.name} 관계도</h2><small>연결 {connected.length}개</small></div>
      <div className="rel-filters" role="group" aria-label="관계 유형">
        {(['전체', ...available] as Filter[]).map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <RelationshipMap center={center} connections={connected} selectedAppIds={selectedAppIds} onExplore={explore}/>
      <p className="rel-hint">연결된 항목을 누르면 그 항목을 중심으로 탐색해요.</p>
    </section>
    <section className="compare-pane"><h2>관계와 기능 비교</h2>
      {choice && <>
        <label className="compare-select">비교할 대상<select value={choice.node.id} onChange={e=>setCompareId(e.target.value)}>
          {connected.map(({node}) => <option key={node.id} value={node.id}>{node.name}</option>)}</select></label>
        <ul className="rel-evidence">{choice.reasons.map(edge => <li key={edge.kind}>
          <span className="edge-label" style={{color:palette[relations[edge.kind][1]].color}}>{relations[edge.kind][0]}</span>
          {edge.effective && <time dateTime={edge.effective}>{edge.effective.replaceAll('-','.')}</time>}
          {isDirectional(edge.kind) && <div className="rel-direction">{byId.get(edge.from)!.name} → {byId.get(edge.to)!.name}</div>}
          <p>{edge.reason} <a href={edge.source} target="_blank" rel="noreferrer">근거 <ExternalLink size={13}/></a></p>
        </li>)}</ul>
        {[center, choice.node].map(node=><Profile key={node.id} node={node} saved={selectedAppIds.includes(node.id)}/>)}
        <p className="rel-hint">자료 확인일 <time dateTime={verifiedOn}>{verifiedOn.replaceAll('-','.')}</time></p>
      </>}
    </section></div>
  </section>
}
