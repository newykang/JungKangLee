# 앱 데이터 스냅샷

`apps.json`에는 2026-11-27 한국 스토어에서 확인한 앱 18개의 정보를 담았습니다. `src/data/index.ts`는 전체 스냅샷 `appCatalog`, 카테고리별로 표시할 수 있는 `apps`, 앱과 플랫폼이 붙은 평면 목록 `updates`를 내보냅니다. `added`, `improved`, `changed`는 공식 변경사항에서 확인한 한국어 요약입니다. 확인할 내용이 없으면 배열을 비워 둡니다.

- iOS 최신 버전은 한국 App Store의 [Apple Search API](https://performance-partners.apple.com/search-api)에서 확인했습니다. 추가 이력은 각 앱의 App Store 버전 기록에서 확인했습니다. API 시각은 한국 날짜로 변환했습니다.
- Android는 각 앱의 한국 Google Play 페이지에서 앱 이름과 게시자를 대조합니다. 변경사항 또는 해당 목록의 현재 버전 메타데이터에서 확인한 버전을 기록하고, 확인할 수 없으면 `version: null`로 표시합니다. 날짜와 원문도 같은 Google Play 목록에서 가져옵니다.
- `sourceUrl`은 해당 정보를 확인한 페이지 또는 API입니다. `storeUrl`은 사용자용 스토어 링크입니다. `iconUrl`은 스토어가 제공한 이미지 주소입니다. 스토어에서 버전을 대조해서 확보한 원문은 전체를 저장합니다. 일부만 확보할 수 있는 원문은 `notesAreExcerpt: true`로 표시합니다.
- 2026-11-27 기준 통합 카탈로그의 46개 앱 모두 iOS와 Android의 업데이트 기록이 있습니다. 은행·금융 앱의 스토어별 기록은 `bank-catalog.json`과 `../features/ecosystem/banking.json`에 있습니다. `public/release-captures/`의 이미지는 버전이나 게시일이 일치하는 공개 스토어 기록을 캡처한 자료입니다.
- 화면은 저장소에 포함된 JSON을 읽습니다. 외부 스토어가 응답하지 않아도 앱 목록과 변경사항이 표시됩니다. 이후 스냅샷을 갱신할 때 확인에 실패한 항목은 마지막으로 검증한 기록을 보존합니다.
- 평가에 사용하는 릴리스 ID는 스토어와 버전을 포함합니다. 공개 버전 번호가 없는 변경사항은 시각만으로 평가를 합산하지 않습니다.
