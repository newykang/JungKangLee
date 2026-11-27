# appdate 작업 가이드

이 파일은 React 앱 작업에 적용된다. 이전 정적 웹 및 API 계획은 `tasks/`에 보관되어 있다. 공통 타입은 `src/types/index.ts`이며 화면은 기능별 디렉터리의 기본 내보내기로 연결한다.

| 담당 영역 | 소유 경로 |
| --- | --- |
| 공통 뼈대와 통합 | `src/App.tsx`, `src/styles.css`, `src/components/`, `src/types/`, 루트 앱·배포 설정 |
| 데이터 및 평가 | `src/data/`, `src/features/reviews/` |
| 나머지 기능 | 팀이 합의한 `src/features/feed/`, `src/features/updates/`, `src/features/ecosystem/`, `src/features/myapps/` 담당자가 각 경로를 관리한다. |

- 공통 뼈대 브랜치의 커밋을 기준으로 각자 기능 브랜치를 만들고 PR을 연다. 공통 파일 변경이 필요하면 담당자와 먼저 조율한다. 기존 작업과 섞지 않고 기능 브랜치에는 담당 경로만 넣는다.
- 데이터는 `AppCatalog`에 맞춘 JSON 스냅샷을 기본으로 사용한다. 버전·날짜·원문을 확인하지 못하면 `null`을 둔다. iOS와 Android의 버전 및 평가 키를 분리하고 스토어 링크를 유지한다.
- UI는 한국어, 390px 화면 우선, 흰색 배경과 인디고 강조색을 사용한다. 미구현 화면은 “준비 중”이라고 표시한다.
- `npm ci`, `npm run dev`, `npm run build`를 사용한다. 기능 PR은 Vercel Preview에서 검증하고, `main` 병합 후 Production 배포의 SHA와 평가자 접근을 확인한다.
- Vercel 프로젝트는 저장소 루트, Vite 프리셋, `npm run build`, 출력 `dist`를 사용한다. Git 연동 배포가 완료되면 고정 Production URL에서 결과를 확인한다.
