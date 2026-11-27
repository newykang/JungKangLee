import { useEffect, useRef } from 'react'
import { Bookmark, ExternalLink, Network, X } from 'lucide-react'
import { byId, isDirectional, kindLabels, verifiedOn } from './graph'
import type { GraphNode } from './graph'
import { NodeIcon, RelationLabel } from './RelationshipMap'
import type { Connection } from './RelationshipMap'

interface Props {
  center: GraphNode
  connection: Connection
  selectedAppIds: readonly string[]
  onClose: () => void
  onExplore: (id: string) => void
}

export default function RelationshipDetails({ center, connection, selectedAppIds, onClose, onExplore }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    const trigger = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [])
  const { node, reasons } = connection
  return <dialog ref={ref} className="rel-dialog" aria-labelledby="rel-detail-title"
    onCancel={e => { e.preventDefault(); onClose() }}>
    <div className="rel-dialog-frame">
      <header><h2 id="rel-detail-title">관계 자세히 보기</h2>
        <button type="button" onClick={onClose}><X aria-hidden="true"/>닫기</button></header>
      <div className="rel-dialog-content" tabIndex={0} role="region" aria-label="두 앱의 관계 설명">
        <h3>{center.name} · {node.name}</h3>
        <ul className="rel-reasons">{reasons.map(edge => <li key={edge.kind}>
          <RelationLabel kind={edge.kind}/>
          {isDirectional(edge.kind) && <p className="rel-direction">{byId.get(edge.from)!.name} → {byId.get(edge.to)!.name}</p>}
          <p>{edge.reason}</p>
          {edge.effective && <p>변경일 <time dateTime={edge.effective}>{edge.effective.replaceAll('-', '.')}</time></p>}
          <a href={edge.source} target="_blank" rel="noreferrer">공식 근거 보기 <ExternalLink size={18} aria-hidden="true"/></a>
        </li>)}</ul>
        <h3>기능 비교</h3>
        {[center, node].map(item => <article key={item.id} className="rel-profile">
          <div className="rel-profile-title"><NodeIcon node={item}/>
            <div><h4>{item.name}</h4><p>{item.operator} · {kindLabels[item.kind]}</p></div>
          </div>
          {selectedAppIds.includes(item.id) && <span className="rel-saved"><Bookmark size={16}/>내 앱</span>}
          <p>{item.purpose}</p><p>{item.features.join(' · ')}</p>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.kind === 'app' ? '공식 App Store' : item.kind === 'service' ? '서비스 안내' : '변경 공지'} <ExternalLink size={18} aria-hidden="true"/></a>
        </article>)}
        <p className="rel-caption">자료 확인일 <time dateTime={verifiedOn}>{verifiedOn.replaceAll('-', '.')}</time></p>
      </div>
      <footer><button type="button" onClick={() => onExplore(node.id)}><Network size={22} aria-hidden="true"/>{node.name} 중심으로 보기</button></footer>
    </div>
  </dialog>
}
