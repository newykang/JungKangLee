import { useState } from 'react'
import {
  Archive, ArrowLeftRight, BookOpen, Bookmark, Building2, ChartNoAxesColumn,
  CreditCard, Fingerprint, FolderTree, GitMerge, History, Landmark, Layers,
  Link2, PencilLine, Shapes, Smartphone, Tag, Users, Wallet,
} from 'lucide-react'
import { kindLabels, palette, relations } from './graph'
import type { Edge, GraphNode, Relation } from './graph'

const relationIcons = {
  group: FolderTree, operator: Building2, brand: Tag, overlap: Layers, specialization: Users,
  similarName: PencilLine, includes: Shapes, interop: Link2, merged: GitMerge, renamed: ArrowLeftRight,
} satisfies Record<Relation, typeof Layers>

const relationText: Record<Relation, string> = {
  group: '같은 그룹', operator: '같은 운영사', brand: '같은 브랜드', overlap: '비슷한 기능',
  specialization: '다른 이용 대상', similarName: '비슷한 이름', includes: '앱 안의 서비스',
  interop: '서비스 연결', merged: '서비스 통합', renamed: '이름 변경',
}

export function RelationLabel({ kind, label }: { kind: Relation; label?: string }) {
  const Icon = relationIcons[kind]
  return <span className="rel-label" style={{ color: palette[relations[kind][1]].color }}>
    <Icon size={21} aria-hidden="true"/>{label ?? relationText[kind]}
  </span>
}

function cardLabel(edge: Edge, node: GraphNode) {
  const isSource = edge.from === node.id
  if (edge.kind === 'renamed') return isSource ? '예전 이름' : '바뀐 이름'
  if (edge.kind === 'merged') return isSource ? kindLabels[node.kind] + ' 통합' : '통합된 곳'
  if (edge.kind === 'includes') return isSource ? '여기서 이용' : '앱 안의 서비스'
  return relationText[edge.kind]
}

const categoryIcons: Record<string, typeof Layers> = {
  '은행': Landmark, '증권': ChartNoAxesColumn, '카드': CreditCard, '공공 인증': Fingerprint,
  '자산·혜택': Wallet, '훈련': BookOpen, '통신': Smartphone,
}

export function NodeIcon({ node }: { node: GraphNode }) {
  const [failedUrl, setFailedUrl] = useState('')
  if (node.iconUrl && node.iconUrl !== failedUrl) {
    return <img className="rel-art" src={node.iconUrl} alt="" onError={() => setFailedUrl(node.iconUrl!)} />
  }
  const Icon = categoryIcons[node.category] ?? (node.kind === 'legacyService' ? Archive : node.kind === 'legacy' ? History : Layers)
  return <span className={'rel-art rel-fallback ' + node.kind} aria-hidden="true"><Icon/></span>
}

export interface Connection { node: GraphNode; reasons: Edge[] }

interface MapProps {
  center: GraphNode
  connections: Connection[]
  selectedAppIds: readonly string[]
  onSelect: (connection: Connection) => void
}
export default function RelationshipMap({ center, connections, selectedAppIds, onSelect }: MapProps) {
  return <div className="rel-map" role="group" aria-label={center.name + ' 중심 관계도'}>
    <div className="rel-origin">
      <NodeIcon node={center}/>
      <div><span className="rel-caption">기준 {center.kind === 'app' ? '앱' : kindLabels[center.kind]}</span>
        <h2 id="rel-center" tabIndex={-1}>{center.name}</h2>
        {selectedAppIds.includes(center.id) && <span className="rel-saved"><Bookmark size={16}/>내 앱</span>}
      </div>
    </div>
    <div className="rel-branch"><span>연결된 앱·서비스 {connections.length}개</span></div>
    <ul className="rel-grid">
      {connections.map(connection => {
        const { node, reasons } = connection
        return <li key={node.id}><button className="rel-card" type="button" aria-haspopup="dialog"
          onClick={() => onSelect(connection)}>
          <NodeIcon node={node}/>
          <strong>{node.name}</strong>
          <span className="rel-labels">{reasons.map(edge => <RelationLabel key={edge.kind} kind={edge.kind} label={cardLabel(edge, node)}/>)}</span>
          {selectedAppIds.includes(node.id) && <span className="rel-saved"><Bookmark size={16}/>내 앱</span>}
        </button></li>
      })}
    </ul>
  </div>
}
