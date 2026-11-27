# API 및 UI 계약

[150분 개발 계획](plan.md) · [Vercel 및 QA 실행표](vercel-qa.md)

## HTTP 요청과 응답

- **요청** · `GET /api/updates`. 요청 본문, 인증, 쿼리 매개변수 없이 호출한다. 프론트엔드는 `fetch('/api/updates', { headers: { Accept: 'application/json' } })`처럼 동일 호스트의 상대 경로를 사용한다. 선택한 앱은 클라이언트에서 필터링한다.
- **성공** · `200 OK`, `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store`. 아래와 같은 객체를 반환한다. 데이터가 비어 있어도 `200`으로 빈 배열을 반환한다.
- **오류** · `POST` 등 지원하지 않는 메서드는 `405`와 `Allow: GET`, 코드 `METHOD_NOT_ALLOWED`를 반환한다. 데이터 오류나 처리 실패는 `500`과 `UPDATES_UNAVAILABLE`을 반환한다. JSON 오류 형식은 `{ "error": { "code": "UPDATES_UNAVAILABLE", "message": "업데이트를 불러올 수 없습니다." } }`이다. 오류 응답에도 같은 JSON 및 캐시 헤더를 사용한다. 클라이언트는 `response.ok`를 먼저 확인하고, HTTP 오류·네트워크 오류·JSON 해석 실패를 오류 화면과 재시도로 연결한다.

아래 JSON은 두 구현자가 같은 구조로 개발하기 위한 **가상 예시**다. 시연용 데이터는 B가 개발사 공식 출처와 대조한 기록을 사용한다.

```json
{
  "dataMode": "sample",
  "apps": [
    { "packageId": "com.example.reader", "name": "예시 리더" }
  ],
  "updates": [
    {
      "id": "com.example.reader:2.4.0",
      "packageId": "com.example.reader",
      "version": "2.4.0",
      "releasedOn": "2026-11-20",
      "observedOn": "2026-11-21",
      "summaryKo": "오프라인 읽기 기능이 추가되었습니다.",
      "sourceUrl": "https://example.com/releases/2.4.0"
    }
  ]
}
```

- `dataMode`는 시연 버전에서 항상 문자열 `sample`이다. `apps`와 `updates`는 필수 배열이다. `id`와 앱의 `packageId`는 각각 고유하며 모든 업데이트는 `apps`의 패키지 하나를 참조한다.
- `version`과 `releasedOn`은 값이 없으면 `null`이다. `observedOn`은 서비스가 처음 확인한 날짜이고 날짜는 `YYYY-MM-DD`를 사용한다. 나머지 텍스트 필드는 비어 있지 않은 문자열이며 `sourceUrl`은 공식 HTTPS 주소다. 서버는 `releasedOn ?? observedOn` 내림차순, 동률은 `id` 오름차순으로 반환한다.
- B는 데이터에 잘못된 필드·중복 ID·앱 참조 오류가 없는지 검증한다. A는 기대한 구조가 아니면 오류 화면을 띄운다. 이전·다음 페이지는 전체 데이터가 작은 시연 범위에서 생략한다.

## 프론트엔드와 UI 연결

- A의 HTML이 `#app-options`, `#feed`를 제공하고 `app.js`가 두 요소를 넘긴다. C의 `feed-view.js`는 다음 두 함수를 내보낸다.
  - `renderAppOptions(container, { apps, selectedPackageIds, onToggle })`는 선택 목록을 그린다. 사용자가 체크박스를 바꾸면 `onToggle(packageId)`를 호출한다. A가 상태를 갱신해 다시 전달한다.
  - `renderFeed(container, { apps, updates, dataMode, status, onRetry })`는 데이터를 표시한다. `status`는 `loading`, `ready`, `empty`, `error` 중 하나다. 성공 전에는 빈 배열과 `dataMode: null`을 넘길 수 있다. 오류 화면에서 재시도를 누르면 `onRetry()`를 호출한다.
- A는 먼저 전체 피드를 보여준다. 선택이 있으면 해당 앱의 카드만 표시하고, 선택을 모두 풀면 전체 피드로 돌아간다. 저장한 패키지가 응답에 사라졌으면 그 선택을 무시한다. C는 `releasedOn`이 없으면 `observedOn`을 “확인일”로 표시하고, `version`이 없으면 “버전 미확인”을 표시한다.
- A와 C는 위 예시 JSON을 개발 중 입력으로 사용할 수 있다. PR Preview에서 검증할 때는 기본 PR의 실제 Function을 호출하고, 최종 QA는 브라우저 네트워크에서 이 경로를 확인한다.
