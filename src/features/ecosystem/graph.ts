import profiles from './profiles.json'
import extraApps from './apps.json'

// The feed uses these established publisher and category overrides.
export const profilesById = new Map(profiles.map(app => [app.id, { ...app, iconUrl: import.meta.env.BASE_URL + app.iconUrl.slice(1) }]))

export const kindLabels = { app: '설치 앱', service: '서비스', legacy: '이전 앱', legacyService: '이전 서비스' }
export interface GraphNode {
  id: string
  name: string
  kind: keyof typeof kindLabels
  operator: string
  category: string
  purpose: string
  features: string[]
  sourceUrl: string
  iconUrl?: string
  aliases?: string[]
}
const sources = {
  kbGroup: 'https://www.kbfg.com/kor/about/group/info.htm',
  kbHistory: 'https://card.kbcard.com/CMN/DVIEW/HSEMCXCRSCTC0001?ARTICLE_SERIAL=10396&ROUTE_TYPE=VIEW',
  shinhanHistory: 'https://www.shinhancard.com/pconts/html/helpdesk/dataRoom/MOBFM164N/1225648_1119.html',
  mobileId: 'https://www.mobileid.go.kr/mip/hps/pro/svcEntryPath.do',
  pass: 'https://www.passauth.co.kr/',
  uplus: 'https://www.lguplus.com/support/service/notice/2000046538',
  work: 'https://moel.go.kr/news/cardinfo/view.do?bbs_seq=20250900029',
  tossBank: 'https://www.tossbank.com/articles/busy-worker-account',
  tossInvest: 'https://support.toss.im/faq/3405',
}
const publicServices: GraphNode[] = [
  { id: 'mobile-id', name: '모바일 신분증', kind: 'service', operator: '행정안전부', category: '공공 인증', purpose: '민간 앱에서도 모바일 신분증을 발급하거나 제시할 때', features: ['신원 확인', '민간 앱 연계'], sourceUrl: sources.mobileId },
  { id: 'toss-bank', name: '토스뱅크', kind: 'service', operator: '토스뱅크', category: '은행', purpose: '토스 앱에서 통장을 개설하고 관리할 때', features: ['계좌 개설', '송금'], sourceUrl: sources.tossBank },
  { id: 'toss-invest', name: '토스증권', kind: 'service', operator: '토스증권', category: '증권', purpose: '토스 앱의 증권 메뉴에서 투자 계좌를 관리할 때', features: ['주식 투자', '계좌 관리'], sourceUrl: sources.tossInvest },
  { id: 'kb-home', name: 'KB국민카드 홈앱', kind: 'legacy', operator: 'KB국민카드', category: '카드', purpose: '카드 이용 내역과 금융상품을 관리하던 앱', features: ['카드 관리', '이용 내역'], aliases: ['기존 국민카드', 'KB국민카드앱'], sourceUrl: sources.kbHistory },
  { id: 'liiv', name: '리브메이트', kind: 'legacy', operator: 'KB국민카드', category: '자산·혜택', purpose: '자산과 포인트리 혜택을 관리하던 앱', features: ['자산 관리', '포인트 혜택'], aliases: ['Liiv Mate'], sourceUrl: sources.kbHistory },
  { id: 'shinhan-play', name: '신한플레이', kind: 'legacy', operator: '신한카드', category: '카드', purpose: '신한 SOL페이의 이전 앱 이름', features: ['간편 결제'], aliases: ['신한 Play', '신한pLay'], sourceUrl: sources.shinhanHistory },
  { id: 'your-u', name: '당신의 U+', kind: 'legacy', operator: 'LG유플러스', category: '통신', purpose: 'U+one의 이전 앱 이름', features: ['요금 조회'], aliases: ['당신의 유플러스'], sourceUrl: sources.uplus },
  { id: 'u-members', name: 'U+멤버십', kind: 'legacy', operator: 'LG유플러스', category: '멤버십', purpose: '유플러스 멤버십 혜택을 이용하던 앱', features: ['멤버십 혜택'], sourceUrl: sources.uplus },
  { id: 'worknet', name: '워크넷', kind: 'legacyService', operator: '고용노동부·한국고용정보원', category: '취업', purpose: '구직 정보와 일자리를 찾던 서비스', features: ['구직 신청'], sourceUrl: sources.work },
  { id: 'hrd', name: 'HRD-Net', kind: 'legacyService', operator: '고용노동부·한국고용정보원', category: '훈련', purpose: '직업훈련 정보와 훈련 과정을 찾던 서비스', features: ['직업훈련'], aliases: ['직업훈련포털', 'HRD넷'], sourceUrl: sources.work },
]
const icons = import.meta.glob<string>('./icons/*.jpg', { eager: true, import: 'default' })
export const nodes: GraphNode[] = [
  ...[...profilesById.values()].map(app => ({ ...app, kind: 'app' as const, sourceUrl: app.storeUrl })),
  ...extraApps.map(app => ({ ...app, kind: 'app' as const, iconUrl: app.iconUrl.startsWith('/') ? import.meta.env.BASE_URL + app.iconUrl.slice(1) : icons['./icons/' + app.iconUrl] })),
  ...publicServices,
]
export const byId = new Map(nodes.map(node => [node.id, node]))
export const topics = [
  ['KB금융', 'kb-pay'], ['신한금융', 'shinhan-pay'], ['NH농협', 'nh-all'], ['토스', 'toss'],
  ['카카오', 'kakaotalk'], ['지도', 'kakao-map'], ['모바일 신분증', 'mobile-id'],
  ['공공 민원', 'gov24'], ['고용24', 'work24'], ['PASS', 'pass-skt'], ['LG유플러스', 'uplus'],
] as const

export const relations = {
  group: ['같은 그룹', '소속·브랜드'], operator: ['같은 운영사', '소속·브랜드'], brand: ['같은 브랜드', '소속·브랜드'],
  overlap: ['기능 중복', '기능·용도'], specialization: ['대상별 특화', '기능·용도'], similarName: ['이름 유사', '기능·용도'],
  includes: ['서비스 제공', '서비스 연결'], interop: ['서비스 연동', '서비스 연결'],
  merged: ['서비스 통합', '변경 이력'], renamed: ['명칭 변경', '변경 이력'],
} as const
export type Relation = keyof typeof relations
export type Filter = '전체' | typeof relations[Relation][1]
export const palette: Record<Exclude<Filter, '전체'>, { color: string; dash?: string }> = {
  '소속·브랜드': { color: '#6453b6' }, '기능·용도': { color: '#36798c', dash: '3 4' },
  '서비스 연결': { color: '#116f57', dash: '8 3' }, '변경 이력': { color: '#9a5823', dash: '9 3 2 3' },
}
export interface Edge {
  from: string
  to: string
  kind: Relation
  reason: string
  source: string
  effective?: string
}
function edge(from: string, to: string, kind: Relation, reason: string, source: string, effective?: string): Edge {
  return { from, to, kind, reason, source, effective }
}
function listings(...ids: number[]) {
  return 'https://itunes.apple.com/lookup?country=kr&id=' + ids.join(',')
}
export const edges = [
  edge('kb-star','kb-pay','group','KB국민은행과 KB국민카드는 KB금융그룹 계열사예요.',sources.kbGroup),
  edge('kb-star','kb-pay','includes','KB스타뱅킹 안에서 KB Pay 결제를 이용할 수 있어요.',byId.get('kb-star')!.sourceUrl),
  edge('kb-pay','kb-mable','group','카드 결제는 KB국민카드, 주식 매매는 같은 그룹의 KB증권이 담당해요.',sources.kbGroup),
  edge('kb-star','kb-mable','group','KB국민은행과 KB증권은 같은 금융그룹에 속해요.',sources.kbGroup),
  edge('kb-star','kb-business','operator','두 앱 모두 KB국민은행이 제공해요.',listings(373742138,660616512)),
  edge('kb-star','kb-business','specialization','개인 금융 업무와 기업 자금 관리를 각각 지원해요.',listings(373742138,660616512)),
  edge('kb-home','kb-pay','merged','홈앱의 카드 이용·결제와 금융 메뉴가 KB Pay로 통합됐어요.',sources.kbHistory,'2022-09-30'),
  edge('liiv','kb-pay','merged','리브메이트의 자산 관리와 포인트 혜택이 KB Pay로 통합됐어요.',sources.kbHistory,'2022-12-06'),
  edge('kb-pay','shinhan-pay','overlap','두 카드사 앱 모두 카드 이용 내역 확인과 간편 결제를 제공해요.',listings(695436326,572462317)),
  edge('shinhan-play','shinhan-pay','renamed','신한플레이의 앱 이름과 로고가 SOL페이로 변경됐어요.',sources.shinhanHistory,'2023-12-18'),
  edge('shinhan-super-sol','shinhan-pay','brand','같은 SOL 브랜드를 사용하며, 슈퍼SOL은 그룹 금융 업무를 모아 제공해요.',listings(357484932,572462317)),
  edge('shinhan-super-sol','shinhan-pay','overlap','슈퍼SOL과 SOL페이 모두 결제를 지원해요.',listings(357484932,572462317)),
  edge('nh-all','nh-cok','overlap','모두 계좌 조회와 송금을 지원해요. 올원은 농협은행, 콕은 농협 상호금융 서비스예요.',listings(1641628055,1131147442)),
  edge('toss','toss-bank','includes','토스 앱에서 토스뱅크 통장 개설과 이체를 할 수 있어요.',sources.tossBank),
  edge('toss','toss-invest','includes','토스 앱의 증권 탭에서 투자 계좌에 접근해요.',sources.tossInvest),
  edge('toss','kakao-pay','overlap','두 앱 모두 개인 간 송금을 지원해요.',listings(839333328,1464496236)),
  edge('kakaotalk','kakao-pay','interop','카카오톡에서 카카오페이로 친구에게 송금할 수 있어요.','https://contents.kakaopay.com/contents/2325'),
  edge('kakaotalk','kakao-map','operator','두 앱의 스토어에 같은 개발사인 카카오가 표시돼요.',listings(362057947,304608425)),
  edge('kakao-map','naver-map','overlap','두 지도 앱 모두 장소 검색과 길찾기를 지원해요.',listings(304608425,311867728)),
  ...['kb-star','nh-all','toss'].map(id => edge(id,'mobile-id','includes',byId.get(id)!.name+'에서 정부 모바일 신분증을 이용할 수 있어요.',sources.mobileId)),
  edge('gov24','work24','similarName','정부24는 행정 민원, 고용24는 취업과 직업훈련을 다뤄요.',listings(586454505,6478366140)),
  edge('gov24','safety','operator','행정안전부가 민원 서류 발급과 안전 신고를 각각 별도 앱으로 제공해요.',listings(586454505,963555704)),
  edge('safety','petition','similarName','안전신문고는 위험 요소 신고, 국민신문고는 행정 민원과 제안을 접수해요.',listings(963555704,495869152)),
  edge('worknet','work24','merged','워크넷의 구직 서비스를 고용24에서 이용할 수 있어요.',sources.work,'2024-09'),
  edge('hrd','work24','merged','HRD-Net의 직업훈련 서비스가 고용24로 통합됐어요.',sources.work,'2024-09'),
  edge('pass-skt','pass-kt','brand','같은 PASS 브랜드의 본인확인 앱을 각 통신사가 제공해요.',sources.pass),
  edge('pass-kt','pass-u','brand','가입한 통신망에 맞는 PASS 앱에서 인증해요.',sources.pass),
  edge('pass-u','pass-skt','brand','LG유플러스와 SK텔레콤은 PASS 앱을 각각 제공해요.',sources.pass),
  edge('pass-u','uplus','operator','LG유플러스가 본인확인 앱과 통신 고객용 앱을 각각 제공해요.',listings(1147394645,945578864)),
  edge('your-u','uplus','renamed','당신의 U+가 업데이트되면서 이름과 아이콘이 바뀌었어요.',sources.uplus,'2025-10-27'),
  edge('u-members','uplus','merged','멤버십 앱의 혜택 기능이 U+one 혜택 메뉴에 통합됐어요.',sources.uplus),
]
export const verifiedOn = '2026-11-27'
export function isDirectional(kind: Relation) { return kind === 'includes' || kind === 'merged' || kind === 'renamed' }

export function neighbors(id: string, filter: Filter) {
  const result = new Map<string, Edge[]>()
  for (const edge of edges) {
    if (filter !== '전체' && relations[edge.kind][1] !== filter) continue
    const other = edge.from === id ? edge.to : edge.to === id ? edge.from : undefined
    if (other) result.set(other, [...(result.get(other) ?? []), edge])
  }
  return [...result].map(([id, reasons]) => ({ node: byId.get(id)!, reasons }))
}

export function nameHistoryFor(appId: string) {
  return edges.flatMap(edge => {
    if (edge.to !== appId || (edge.kind !== 'renamed' && edge.kind !== 'merged')) return []
    const previous = byId.get(edge.from)!
    const message = edge.kind === 'renamed'
      ? `${previous.name}의 현재 이름은 ${byId.get(appId)!.name}입니다.`
      : edge.reason
    return [{ name: previous.name, aliases: previous.aliases ?? [], message }]
  })
}
