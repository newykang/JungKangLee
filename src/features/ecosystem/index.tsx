import { useState } from 'react'
import { Bookmark, ExternalLink, GitCompareArrows } from 'lucide-react'
import { edges, groups, profilesById, relationNames } from './graph'
import type { AppRelationship } from './graph'

export interface EcosystemProps { selectedAppIds: readonly string[] }

const strokes: Record<AppRelationship['kind'], { color: string; dash?: string }> = {
  company: { color: '#6150bd' }, group: { color: '#75570b', dash: '8 3' },
  link: { color: '#0c7573', dash: '5 4' }, similar: { color: '#536991', dash: '2 4' },
}

export default function Ecosystem({ selectedAppIds }: EcosystemProps) {
  const [group, setGroup] = useState(groups[0])
  const [selected, setSelected] = useState(group.ids[0])
  const [compare, setCompare] = useState(group.ids[1])
  const app = profilesById.get(selected)!
  const other = profilesById.get(compare)!
  const lines = edges.filter(edge => group.ids.includes(edge.from) && group.ids.includes(edge.to))
  const points = group.ids.length === 2 ? [[93, 100], [259, 100]] : [[176, 56], [77, 164], [275, 164]]
  function select(id: string) {
    if (id === compare) setCompare(selected)
    setSelected(id)
  }
  return <section className="ecosystem">
    <h1>앱 관계도</h1><p className="subtext">앱을 눌러 연결된 서비스와 각 앱이 잘하는 일을 살펴보세요.</p>
    <div className="group-tabs">{groups.map(item => <button className="pill" key={item.name} aria-pressed={item === group} onClick={() => {
      setGroup(item); setSelected(item.ids[0]); setCompare(item.ids[1])
    }}>{item.name}</button>)}</div>
    <div className="eco-columns"><section className="graph-pane">
      <div className="graph-heading"><h2>{group.name} 앱 관계</h2><small>앱 {group.ids.length}개</small></div>
      <svg className="app-graph" viewBox={'0 0 352 ' + (group.ids.length === 2 ? 190 : 230)} role="group" aria-label={group.name + ' 앱 노드'}>
        {lines.map(edge => {
          const [x1,y1] = points[group.ids.indexOf(edge.from)], [x2,y2] = points[group.ids.indexOf(edge.to)]
          const style = strokes[edge.kind]
          return <line key={edge.from + edge.to} {...{ x1, y1, x2, y2 }} strokeWidth="3" stroke={style.color} strokeDasharray={style.dash} />
        })}
        {group.ids.map((id, index) => {
          const node = profilesById.get(id)!
          const [x,y] = points[index]
          return <g key={id} role="button" tabIndex={0} aria-label={node.name + ' 선택'} aria-pressed={selected === id} className="graph-node"
            onClick={() => select(id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(id) } }}>
            <title>{node.name}{selectedAppIds.includes(id) ? ' · 내 앱' : ''}</title>
            <rect x={x-52} y={y-34} width="104" height="82" rx="16" fill="white" stroke={id === selected ? '#6650cc' : '#d9d8eb'} strokeWidth={id === selected ? 3 : 1} />
            <defs><clipPath id={'clip-' + id}><rect x={x-18} y={y-25} width="36" height="36" rx="9" /></clipPath></defs>
            <image href={node.iconUrl} x={x-18} y={y-25} width="36" height="36" clipPath={'url(#clip-' + id + ')'} />
            <text x={x} y={y+32} textAnchor="middle" fill="#28243f" fontSize="14" fontWeight="650">{node.name}</text>
            {selectedAppIds.includes(id) && <g aria-hidden="true"><circle cx={x+25} cy={y-18} r="8" fill="#5341b6"/><path d={`M${x+21} ${y-18}l3 3 5-6`} stroke="white" fill="none" strokeWidth="2"/></g>}
          </g>
        })}
      </svg>
      <ul className="edge-list">{lines.map(edge => <li key={edge.from + edge.to}>
        <span className="edge-label" style={{color:strokes[edge.kind].color}}>{relationNames[edge.kind]}</span>
        <span>{edge.description} <a href={edge.sourceUrl} target="_blank" rel="noreferrer" aria-label={edge.description + ' 근거 보기'}>근거 <ExternalLink size={13}/></a></span>
      </li>)}</ul>
    </section>
    <section className="compare-pane"><h2><GitCompareArrows size={20} /> 앱 기능 비교</h2>
      <label className="compare-select">비교할 앱<select value={compare} onChange={event => setCompare(event.target.value)}>
        {group.ids.filter(id => id !== selected).map(id => <option key={id} value={id}>{profilesById.get(id)?.name}</option>)}</select></label>
      {[app, other].map(item => <article key={item.id} className="profile">
        <div className="profile-heading"><img src={item.iconUrl} alt="" /><div><h3>{item.name}</h3><small>{item.category}</small></div>
          {selectedAppIds.includes(item.id) && <span className="saved"><Bookmark size={12} />내 앱</span>}</div>
        <p>{item.purpose}</p><ul className="features">{item.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
        <a href={item.storeUrl} target="_blank" rel="noreferrer">공식 App Store <ExternalLink size={14} /></a>
      </article>)}
    </section></div>
  </section>
}
