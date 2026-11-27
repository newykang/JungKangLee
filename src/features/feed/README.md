# appdate 피드와 카드뉴스

앱 셸에서 `UpdateFeed`에 공통 앱 목록 `apps`, 릴리스 목록 `updates`, 내 앱 상태 `selectedAppIds`를 전달한다. `onOpenUpdate(update)`에서 선택한 릴리스와 앱을 `UpdateDetail`로 전달한다. `onBack`은 피드 복귀, `history`는 버전 비교, `review`는 평가 담당 컴포넌트 연결에 사용한다. 필터 상태를 유지하려면 상세 화면이 열려 있는 동안 피드를 마운트한 채 숨긴다.

## 독립 실행

이 디렉터리에서 `npm ci`, `npm run dev`로 미리보기를 실행한다. `npm run build`는 타입 검사 후 `dist/`에 정적 앱을 생성한다. 미리보기는 한국 App Store 릴리스 7건과 아이콘을 로컬 파일로 읽는다. 내 앱 선택은 미리보기 전용 저장 키를 사용한다. 팀 통합 시 앱 셸에서 실제 상태와 데이터를 주입한다.
