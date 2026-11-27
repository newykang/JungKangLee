# JungKangLee 150분 개발 계획

## 시연 범위

- 모바일 웹에서 Google Play 관심 앱을 선택하고, 최신 업데이트의 한국어 요약과 공식 출처를 확인한다. 선택은 새로고침 후 같은 브라우저에 복원된다.
- 개발사 공식 출처와 대조한 앱 3개, 업데이트 4건 이상을 사용한다. 화면에 “검증된 시연용 샘플”을 표시한다. 계정·DB·푸시 알림·네이티브 앱은 후속 범위다. 실시간 수집은 필수 QA가 끝나고 시간이 남으면 독립 브랜치에서 검토한다.
- 정적 HTML·CSS·JavaScript는 `public/`에 두고 백엔드는 같은 Vercel 프로젝트의 Node.js Function으로 제공한다. 사용자는 한 URL에서 화면과 `/api/updates`를 사용한다. [Vercel Node.js 런타임](https://vercel.com/docs/functions/runtimes/node-js) · [정적 파일 배포 설정](https://vercel.com/docs/builds/configure-a-build)

## 세 사람의 작업 경계

| 역할 | 기능 브랜치 | 전담 파일과 완료 조건 |
| --- | --- | --- |
| A · 프론트엔드 / 통합 | `feat/frontend` | `public/index.html`, `public/app.js` 및 필요한 경우 루트 배포 설정. API 호출, 화면 상태, 관심 앱 선택·저장·필터, UI 모듈 연결. Vercel 연결과 병합 진행 담당. |
| B · 백엔드 | `feat/backend` | `api/updates.mjs`, `server/demo-data.mjs`. 샘플 데이터 검증 및 정렬, JSON 응답, HTTP 오류 처리. 공식 출처와 버전·날짜·요약 대조. |
| C · UI | `feat/ui` | `public/styles.css`, `public/feed-view.js`, `public/assets/**` 및 QA 기록 `tasks/qa-results.md`. 모바일·데스크톱 카드, 샘플 표시, 출처 링크, 로딩·빈 상태·오류 화면, 접근성 확인. |

- [API·UI 계약](api-contract.md)을 먼저 확인한다. A는 `feat/demo-base`에서 각 전담 파일의 최소 구현을 한 번에 연결한다. 첫 Preview에 카드 한 건과 실제 `GET /api/updates` 응답이 함께 보여야 한다. B는 공식 출처 확인과 Function 초안을, C는 계약 예시에 맞춘 화면 초안을 병렬로 진행한다.
- 기본 PR을 병합한 시점의 `main`에서 세 기능 브랜치를 시작한다. 초안을 먼저 만들었다면 담당 파일만 가져온다. 초기 뼈대가 들어간 뒤에는 각자 전담 경로를 수정한다. 공통 HTML 변경은 A에게 요청하고, 계약 변경은 세 사람이 확인한 단일 PR에서 반영한다.
- PR에는 담당 파일, 확인 절차·결과, Vercel Preview URL·커밋 SHA를 남긴다. 작성자 외 한 명이 검토한다. 기본 병합 순서는 **기본 → 백엔드 → UI → 프론트엔드**다. A가 하나씩 병합하고, 최신 `main` 반영이나 충돌 해결은 PR 작성자가 자신의 브랜치에서 진행한다. 갱신 후 Preview를 다시 확인한다.
- 내 PR의 Preview에는 다른 미병합 PR이 들어오지 않는다. 프론트엔드가 샘플 응답으로 개발했더라도 통합 QA는 같은 배포 URL에서 실제 Function을 호출해 확인한다.

## 150분 운영표

| 경과 | 완료 기준 |
| --- | --- |
| 0–15분 | 담당 이름과 계약 확정. A는 Vercel과 GitHub 연결, `main` 추적, 평가자 접근 경로 확인. B와 C는 출처·화면 준비 시작. |
| 15–35분 | 기본 PR의 Preview에서 API `200`과 카드 한 건 확인. 승인 후 병합하고 Production URL과 배포 SHA 기록. |
| 35–85분 | 세 역할 병렬 구현. 준비된 PR부터 Preview에서 검증. |
| 85–110분 | 기능 PR 순차 병합. 110분에 기능 동결 및 통합 Production 배포 확인. |
| 110–135분 | [Vercel 및 QA 실행표](vercel-qa.md)의 필수 경로 실행. 시연을 막는 결함만 수정하고 재배포 확인. |
| 135–150분 | 평가자용 Production URL, 실제 QA한 배포 SHA 및 결과 고정. 검증된 예비 Vercel URL을 준비하고 리허설. |

[담당별 작업 체크리스트](todo.md)
