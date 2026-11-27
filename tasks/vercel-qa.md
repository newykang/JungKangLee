# Vercel 배포와 시연 QA

[150분 개발 계획](plan.md) · [작업 체크리스트](todo.md)

## 개발 시작 직후 · A

1. Vercel에서 GitHub 프로젝트 `newykang/JungKangLee`를 가져오거나 기존 연결을 확인한다. Vercel GitHub App에 저장소 접근 권한이 있고 Production이 `main`을 추적하는지 확인한다. 정적 웹으로 시작하면 Framework Preset은 `Other`, Root Directory는 저장소 루트로 두고 커스텀 빌드·설치 명령은 비워 둔다. 첫 배포에서 `/`가 루트의 `index.html`을 제공하는지 확인한다.
2. 기본 PR의 Preview가 `Ready`가 되면 Vercel 배포 화면의 소스 SHA가 PR의 최신 커밋과 일치하는지 확인한다. 연결된 브랜치에 푸시하면 빌드가 시작되고, Production은 `main` 배포가 완료된 뒤 갱신된다. 각 기능 PR의 Preview는 해당 브랜치의 변경을 확인하는 데 사용하고 통합 결과는 `main` 배포에서 검증한다. [Vercel GitHub 배포](https://vercel.com/docs/git/vercel-for-github)
3. 평가자에게 보낼 URL을 로그아웃한 브라우저나 평가자와 같은 권한의 계정에서 열어 본다. 접근이 막히면 허용된 계정으로 접근 경로를 마련하고 재확인한다. Preview가 권한 문제로 생성되지 않으면 Vercel 프로젝트와 GitHub 계정 연결 및 커밋 작성자 권한을 확인한다. [Vercel 협업 문제 해결](https://vercel.com/docs/deployments/troubleshoot-project-collaboration) · [Vercel 배포 환경](https://vercel.com/docs/deployments/environments)

## 필수 QA · 실제 시연 URL에서 확인

| 담당 | 확인 방법 | 통과 조건 |
| --- | --- | --- |
| A | Vercel에서 배포 상세 확인 후 평가자 권한으로 `/` 열기 | `Ready`, 확인 대상 SHA 일치, 앱과 샘플 배지 표시 |
| B | 약 390px 모바일 화면과 데스크톱 화면에서 열기 | 가로 스크롤 없이 카드와 선택 조작 가능, 키보드로 선택과 링크 사용 가능 |
| B | 관심 앱 한 개 선택 → 새로고침 → 전부 해제 | 선택한 앱 카드만 표시, 선택 복원, 전체 피드 복귀 |
| C | 같은 앱의 과거 업데이트 확인 및 공식 링크 열기 | 신규 기록부터 표시, 버전·변경사항·출처 일치, 중복 카드 없음 |
| C | 버전 또는 배포일이 없는 샘플이나 브랜치 테스트 데이터 확인 | 미확인 버전과 서비스 확인 날짜가 명시되고 카드가 계속 표시됨 |

- **판정** · 각 항목을 `PASS`, `FAIL`, `미실행`으로 기록한다. 기록에 실제 Vercel URL, 소스 SHA, 시각, 브라우저, 실패 재현 절차를 포함한다. UI 렌더링이나 링크가 막히면 병합 전후에 같은 경로로 다시 확인한다.
- **배포 지연** · 먼저 Vercel의 배포 상태와 빌드 로그를 확인한다. 135분까지 최신 배포가 검증되지 않으면 앞서 실제로 테스트를 통과한 Vercel 배포 URL을 선택하고, 그 SHA와 기능 범위를 평가자에게 명시한다. Vercel URL 자체가 없다면 로컬 시연으로 진행할 수 있으며 Vercel 평가는 `미실행`으로 기록한다.
- **시연 순서** · 샘플 표시 확인 → 관심 앱 선택 → 새로고침으로 유지 확인 → 공식 변경사항 열기 → 전체 보기.
