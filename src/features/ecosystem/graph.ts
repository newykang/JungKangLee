import profiles from './profiles.json'

export const groups = [
  { name: '카카오', ids: ['kakaotalk', 'kakao-pay', 'kakao-map'] },
  { name: 'KB금융', ids: ['kb-star', 'kb-pay', 'kb-mable'] },
  { name: '지도', ids: ['kakao-map', 'naver-map'] },
]
export const profilesById = new Map(profiles.map(app => [app.id, {
  ...app,
  iconUrl: import.meta.env.BASE_URL + app.iconUrl.slice(1),
}]))
export const relationNames = { company: '동일 개발사', link: '기능 연동', similar: '유사 서비스', group: '같은 그룹' }
export interface AppRelationship {
  from: string
  to: string
  kind: keyof typeof relationNames
  description: string
  sourceUrl: string
}
export const edges: AppRelationship[] = [
  { from: 'kakaotalk', to: 'kakao-pay', kind: 'link', description: '카카오톡에서 카카오페이로 친구에게 송금할 수 있어요.', sourceUrl: 'https://contents.kakaopay.com/contents/2325' },
  { from: 'kakaotalk', to: 'kakao-map', kind: 'company', description: '카카오톡과 카카오맵의 App Store 개발사는 모두 Kakao Corp.예요.', sourceUrl: 'https://itunes.apple.com/lookup?id=362057947,304608425&country=kr' },
  { from: 'kb-star', to: 'kb-pay', kind: 'link', description: 'KB스타뱅킹은 앱 안에서 KB Pay 서비스를 제공해요.', sourceUrl: 'https://apps.apple.com/kr/app/id373742138' },
  { from: 'kb-star', to: 'kb-mable', kind: 'group', description: 'KB국민은행과 KB증권은 KB금융그룹의 계열사예요.', sourceUrl: 'https://www.kbfg.com/kor/about/group/info.htm' },
  { from: 'kakao-map', to: 'naver-map', kind: 'similar', description: '두 앱 모두 장소 검색과 길찾기를 제공해요.', sourceUrl: 'https://itunes.apple.com/lookup?id=304608425,311867728&country=kr' },
]
