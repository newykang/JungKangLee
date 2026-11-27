import { useId } from 'react'
import { isDirectional, kindLabels, palette, relations } from './graph'
import type { Edge, GraphNode } from './graph'

type Connection = { node: GraphNode; reasons: Edge[] }
interface MapProps {
  center: GraphNode
  connections: Connection[]
  selectedAppIds: readonly string[]
  onExplore: (id: string) => void
}

export default function RelationshipMap({ center, connections, selectedAppIds, onExplore }: MapProps) {
  const uid = useId().replace(/:/g, '')
  const height = Math.max(165, connections.length * 57 + 22)
  const mid = height / 2
  const rightY = (index: number) => mid + (index - (connections.length - 1) / 2) * 57
  const families = new Set(connections.flatMap(({ reasons }) => reasons.map(edge => relations[edge.kind][1])))
  return <figure className="rel-map">
    <svg viewBox={`0 0 356 ${height}`} role="group" aria-label={center.name + ' 중심 관계도'}>
      <defs>{Object.entries(palette).map(([family, style], i) => <marker key={family} id={uid + '-arrow-' + i}
        viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L8 4 L0 8 Z" fill={style.color} /></marker>)}</defs>
      {connections.map(({ node, reasons }, i) => reasons.map((edge, j) => {
        const family = relations[edge.kind][1], style = palette[family]
        const offset = (j - (reasons.length - 1) / 2) * 8
        const y1 = mid + offset, y2 = rightY(i) + offset
        const marker = isDirectional(edge.kind) ? `url(#${uid}-arrow-${Object.keys(palette).indexOf(family)})` : undefined
        return <path key={node.id + edge.kind} d={`M119 ${y1} C165 ${y1},162 ${y2},207 ${y2}`}
          stroke={style.color} strokeWidth="2" strokeDasharray={style.dash} fill="none"
          markerStart={edge.from === node.id ? marker : undefined} markerEnd={edge.to === node.id ? marker : undefined}>
          <title>{[edge.from === center.id ? center.name : node.name, relations[edge.kind][0], edge.to === center.id ? center.name : node.name].join(' · ')}</title>
        </path>
      }))}
      <rect x="7" y={mid-47} width="110" height="94" rx="17" fill="#43358a"/>
      {center.iconUrl ? <image x="46" y={mid-36} width="32" height="32" href={center.iconUrl} /> : <text x="62" y={mid-13} textAnchor="middle" fill="#eeeaff" fontSize="13">{kindLabels[center.kind]}</text>}
      <text x="62" y={mid+16} textAnchor="middle" fill="white" fontSize={center.name.length > 9 ? 12 : 14} fontWeight="700">{center.name}</text>
      <text x="62" y={mid+34} textAnchor="middle" fill="#e0dafd" fontSize="12">{selectedAppIds.includes(center.id) ? '내 앱 · 기준' : '기준'}</text>
      {connections.map(({node, reasons}, i) => <g key={node.id} role="button" className="rel-node" tabIndex={0}
        aria-label={node.name + ' 중심으로 탐색'} onClick={() => onExplore(node.id)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExplore(node.id) } }}>
        <rect x="210" y={rightY(i)-23} width="141" height="46" rx="10" fill="white" stroke="#cfcadd" />
        <text x="280" y={rightY(i)-2} textAnchor="middle" fontSize="14" fontWeight="650" fill="#282138">{node.name}</text>
        <text x="280" y={rightY(i)+15} textAnchor="middle" fontSize="12" fill="#615a70">
          {selectedAppIds.includes(node.id) ? '내 앱 · ' : ''}{relations[reasons[0].kind][0]}{reasons.length > 1 && ' +' + (reasons.length - 1)}
        </text>
      </g>)}
    </svg>
    <figcaption>{[...families].map(family => <span key={family}><svg width="23" height="10" aria-hidden="true">
      <line x1="1" y1="5" x2="22" y2="5" stroke={palette[family].color} strokeWidth="2" strokeDasharray={palette[family].dash}/></svg>{family}</span>)}</figcaption>
  </figure>
}
