import { apps as catalog } from '../../data'
import type { FeedApp, FeedUpdate } from '../../features/feed/model'
import { profilesById } from '../../features/ecosystem/graph'
import publishers from '../../data/publishers.json'

const icons = new Set(Object.keys(import.meta.glob('/public/icons/*.jpg')).map(path => path.split('/').pop()?.slice(0, -4)))
const publisherByApp: Record<string, string> = {
  ...publishers,
  'kb-business': 'Kookmin Bank Co., Ltd.',
  'shinhan-super-sol': 'SHINHAN BANK',
  'shinhan-business': 'SHINHAN BANK',
  'woori-won': 'Woori Bank',
  'woori-business': 'Woori Bank',
}
const bankFeatures: Record<string, readonly string[]> = {
  'kakao-bank': ['계좌 조회·이체', '모임통장', '저금통'],
  'kb-business': ['기업 계좌·이체 관리', '기업 오픈뱅킹', '부동산 임대관리'],
  'shinhan-super-sol': ['계좌 조회·이체', '간편결제·주식매매', '보험청구'],
  'shinhan-business': ['기업 계좌 조회·이체', '급여이체', '통합 자금 관리'],
  'woori-won': ['개인 계좌 조회·이체', '자산·소비 현황', '금융상품 가입'],
  'woori-business': ['개인사업자·법인 뱅킹', '대량이체', '이용자 권한별 메뉴'],
}

export const apps: FeedApp[] = catalog.map(app => {
  const profile = profilesById.get(app.id)
  const listing = app.stores.find(store => store.platform === 'ios') ?? app.stores[0]
  return {
    id: app.id,
    developer: publisherByApp[app.id] ?? profile?.developer,
    name: profile?.name ?? app.name,
    category: app.id === 'kakao-bank' ? '은행' : profile?.category ?? app.category,
    bankFeatures: bankFeatures[app.id] ?? (profile?.category === '은행' ? profile.features : undefined),
    iconUrl: icons.has(app.id) ? '/icons/' + app.id + '.jpg' : listing?.iconUrl ?? '',
    storeUrl: listing?.storeUrl ?? '',
  }
})

export const releases = catalog.flatMap(app => app.stores.flatMap(store => store.releases.map(release => {
  const card: FeedUpdate = {
    id: release.id, appId: app.id, platform: store.platform, version: release.version ?? '미확인',
    releaseDate: release.updatedOn ?? '', releaseNotes: release.releaseNotes ?? '',
    notesAreExcerpt: release.notesAreExcerpt,
    added: release.added, changed: release.changed, improved: release.improved, sourceUrl: release.sourceUrl,
  }
  return { card, storeUrl: store.storeUrl, canVote: Boolean(release.version) }
})))

export const appIds = new Set(apps.map(app => app.id))
export const updates = releases.map(row => row.card)
