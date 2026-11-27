# JungKangLee

## appdate

[appdate 바로가기](https://appdate-qa.sleekbeacon8.chatgpt.site/)

모바일에서 앱 업데이트를 읽고, 관련 앱의 기능과 버전별 반응을 확인한다. 스토어 스냅샷과 아이콘을 포함하므로 핵심 화면은 외부 API 없이 동작한다.

### 실행

Node.js 22.12 이상과 npm을 설치한 환경에서 실행한다.

```sh
npm ci
npm run dev
```

`npm run build`로 타입 검사와 프로덕션 빌드를 실행한다. `npm run preview`로 빌드 결과를 확인한다. Vercel은 저장소 루트, Vite 프리셋, 빌드 명령 `npm run build`, 출력 디렉터리 `dist`를 사용한다.

### 화면 연결 계약

| 화면 | 진입점과 입력 |
| --- | --- |
| 홈 | UpdateFeed가 apps, updates, selectedAppIds, onOpenUpdate(update)를 받는다. 콜백은 상세 해시를 연다. |
| 상세 | UpdateDetail이 app, update, history, onBack, review를 받는다. 선택한 플랫폼의 스토어 URL과 버전별 평가를 주입한다. |
| 내 앱 | MyApps가 apps, selectedAppIds, onToggleApp(id), storageMessage를 받는다. useMyApps가 브라우저의 선택을 저장한다. |
| 관계도 | Ecosystem이 selectedAppIds를 받고, 검증된 프로필·관계 스냅샷에서 SVG와 비교 화면을 만든다. |
| 평가 | Reviews는 공통 appCatalog를 읽는다. 상세 평가와 평가 탭은 votes.ts의 같은 릴리스 저장 키를 사용한다. |

- [프로젝트 요구사항과 일정](PROJECT_PLAN.md)
- [공통 개발 규칙](AGENTS.md)
- [팀원용 브랜치별 프롬프트](BRANCH_PROMPTS.md)
- [공유된 카탈로그 타입](src/types/index.ts) · [화면 변환](src/components/common/catalog.ts)
- [데이터 수집 기록](src/data/README.md) · [관계도 출처](src/features/ecosystem/graph.ts)

사이트의 평가는 브라우저별로 기록한다. 계정이나 공유 DB는 사용하지 않는다. 같은 기기·브라우저에서 새로고침하면 앱 등록과 평가가 유지된다.

### 로컬 검증 기록

2026-11-27에 npm ci와 npm run build를 실행하고, 프로덕션 빌드를 Chrome의 390px·1280px 화면에서 확인했다. 외부 요청을 막은 상태에서 21개 앱의 릴리스 47건을 열었다. 검색·필터·상세 새로고침, 등록·해제와 우선 정렬, SVG 노드의 키보드 선택, 두 앱 비교, 상세 투표 변경과 평가 탭의 그래프를 확인했다. 저장 차단 시 세션 중 선택, 손상된 저장값, 탭 간 변경 동기화도 확인했다. 관계도의 공식 앱 스토어 링크 7개는 HTTP 200으로 응답했다. 공개 배포 검증은 별도 단계다.
