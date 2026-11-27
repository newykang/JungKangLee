# Vercel 배포와 시연 QA

[150분 개발 계획](plan.md) · [작업 체크리스트](todo.md) · [API·UI 계약](api-contract.md)

## 0–35분 · GitHub 연동과 첫 배포

1. A는 Vercel 프로젝트에 GitHub 저장소 `newykang/JungKangLee`가 연결되고 Production이 `main`을 추적하는지 확인한다. 정적 프론트는 Framework Preset `Other`, Root Directory는 저장소 루트로 설정한다. 첫 Preview에서 `public/index.html`이 `/`로 열리고 `api/updates.mjs`가 `/api/updates`로 응답하는지 확인한다. [빌드 설정](https://vercel.com/docs/builds/configure-a-build) · [Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)
2. 각 기능 브랜치의 푸시는 Vercel Preview 배포를 시작한다. 작성자는 PR의 최신 커밋과 Preview의 소스 SHA가 일치하고 상태가 `Ready`인지 확인한 뒤 동료에게 리뷰를 요청한다. 병합하면 `main`의 Production 빌드가 시작되며, 성공한 뒤 고정 Production URL에 변경 사항이 반영된다. 시연 중 이미 열려 있는 브라우저는 새로고침해서 확인한다. [GitHub 자동 배포](https://vercel.com/docs/git/vercel-for-github)
3. A는 로그아웃 창이나 평가자와 동일한 권한에서 Production URL을 확인한다. Preview가 생성되지 않으면 GitHub App의 저장소 접근과 Vercel 팀의 커밋 작성자 권한을 점검한다. [Vercel 협업 문제 해결](https://vercel.com/docs/deployments/troubleshoot-project-collaboration)

## 110–135분 · 최종 URL의 필수 QA

| 담당 | 확인 방법 | 통과 조건 |
| --- | --- | --- |
| A | 평가자 조건에서 Production `/` 열기 | `Ready`, 배포가 포함한 커밋 SHA 일치, 첫 카드와 샘플 표시 |
| A | 브라우저 네트워크와 `/api/updates` 직접 확인 | 같은 호스트의 실제 `GET`에 `200` JSON, `dataMode: sample`, 앱 3개와 업데이트 4건 이상 |
| B | API 응답 순서·식별자 및 출처와 화면 대조 | 최신순, 중복 없음, 공식 원문과 일치, 날짜·버전 미확인 표기 확인 |
| C | 390px 모바일 화면과 데스크톱에서 사용 | 가로 스크롤 없이 카드 조회. 키보드로 앱 선택, 재시도와 출처 링크 사용 가능 |
| C | 관심 앱 선택 → 새로고침 → 전부 해제 | 선택한 앱만 표시, 다시 열어도 선택 유지, 전체 피드 복귀 |
| A/C | 브라우저에서 API 요청 차단 → 차단을 풀고 재시도 | 오류 상태에서 재시도할 수 있고 정상 데이터가 다시 표시됨 |

- **증거** · `tasks/qa-results.md`에 실제 URL, 배포 SHA, 확인 시각, 브라우저, 항목별 `PASS` / `FAIL` / `미실행`을 기록한다. 이후 QA 기록 커밋이 있어도 실제로 확인한 배포 SHA를 유지한다.
- **배포 지연** · 135분까지 최신 배포를 검증할 수 없으면 가장 최근에 확인한 Vercel 배포 URL과 그 SHA를 사용한다. 확인이 끝난 시연 범위를 함께 밝힌다. Vercel URL을 확보하지 못하면 로컬 시연을 준비하고 Vercel 평가는 `미실행`으로 기록한다.
- **시연** · 샘플 표시 → 관심 앱 선택 → 새로고침 후 복원 → 공식 출처 열기 → 전체 보기.
