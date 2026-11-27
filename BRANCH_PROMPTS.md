# 팀원별 Codex 개발 프롬프트

공통 뼈대는 main의 PR #3에서 공유됐다. 아래에서 담당 역할 한 블록을 복사해 사용한다.

## feature/frontend · 홈과 상세

```text
appdate 프런트엔드 작업을 이어가줘. AGENTS.md, PROJECT_PLAN.md, src/features/feed/README.md를 읽고 로컬 변경을 보존해. origin/feature/frontend와 현재 브랜치를 확인하고 기존 작업에서 시작해. 해당 브랜치가 없을 때만 최신 공통 main에서 만들어.
src/features/feed/와 src/features/updates/를 담당해. UpdateFeed(apps, updates, selectedAppIds, onOpenUpdate)와 UpdateDetail(app, update, history, onBack, review)의 계약을 유지해. 콜백은 선택된 FeedUpdate 객체를 받는다. 이름 검색, 카테고리, 내 앱 우선·그룹 내부 최신순, 빈 상태 초기화, 공식 출처와 해당 플랫폼 스토어 링크를 검증해. 상세에서 추가·개선·변경 카드를 원문과 대조하고 버전 미확인, 원문 발췌, 긴 앱 이름을 처리해. 390px와 데스크톱을 확인해. 루트의 npm run build 및 기능 미리보기로 검증한 뒤 변경을 기능 브랜치에 커밋·푸시하고 PR에 테스트 결과를 적어.
```

## feature/data-review · 카탈로그와 평가

```text
appdate 데이터·평가 작업을 이어가줘. AGENTS.md, PROJECT_PLAN.md, src/data/README.md와 src/types/index.ts를 확인해. 기존 origin/feature/data-review의 작업을 보존하고 같은 기능 브랜치를 사용해.
src/data/와 src/features/reviews/에서 작업해. JSON의 앱, 스토어, 릴리스 식별자를 유지하고 공식 스토어의 플랫폼·버전·날짜·원문·발췌 여부를 대조해. 목표 15~20개의 실제 앱을 우선하고, 이미 수집한 기록을 보존해. 확인할 수 없는 값은 null로 둬. 통합 코드가 추가한 KB 릴리스는 같은 storeId로 재등록하지 않게 확인해.
버전 투표의 빈 상태, 변경·취소, 비율, 막대그래프, 새로고침 복원, 저장 실패를 확인해. 상세 화면에서도 votes.ts의 동일한 저장 키를 사용해. 로컬 투표 범위를 표시해. npm run build와 votes.test.mjs를 실행하고 데이터 출처와 검증 결과를 PR에 남겨. 공통 타입을 바꿔야 하면 통합 담당자와 먼저 조율해.
```

## feature/ecosystem · 관계도, 개인화와 통합

```text
appdate 통합 담당자의 작업을 이어가줘. AGENTS.md와 PROJECT_PLAN.md를 먼저 읽고 git status, 현재 브랜치, origin/main과 팀 기능 브랜치의 차이를 확인해. 기존 feature/ecosystem 작업을 보존하고 사용해.
src/features/ecosystem/과 src/features/myapps/를 담당해. 카카오, KB금융, 지도 그룹의 SVG 노드, 키보드 선택, 두 앱 비교, 기능·목적·등록 상태와 공식 스토어를 검증해. 기능 연동, 동일 법인, 같은 그룹, 유사 서비스의 근거 링크를 확인해. 신규 관계는 공식 근거가 확인된 경우에 추가해.
useMyApps의 selectedAppIds, onToggleApp, storageMessage와 화면 계약을 유지해. 등록·해제와 새로고침 복원, 손상된 localStorage, 피드 우선순위와 관계도 표시를 함께 확인해. 팀 기능은 최신 브랜치에서 통합하고, 원본 기능 파일은 보존해. npm ci와 npm run build 후 390px와 데스크톱에서 시연 경로를 시험해. PR에는 변경·검증 결과를 기록해. Vercel의 Production URL과 배포 커밋은 실제 배포에서 확인한 값만 기록해.
```
