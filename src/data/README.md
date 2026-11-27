# 앱 데이터 스냅샷

`apps.json`에는 2026-11-27 한국 스토어에서 확인한 앱 18개의 정보를 담았습니다. `src/data/index.ts`는 전체 스냅샷 `appCatalog`, 카테고리별로 표시할 수 있는 `apps`, 앱과 플랫폼이 붙은 평면 목록 `updates`를 내보냅니다. `added`, `improved`, `changed`는 공식 변경사항에서 확인한 한국어 요약입니다. 확인할 내용이 없으면 배열을 비워 둡니다.

- iOS 최신 버전은 한국 App Store의 [Apple Search API](https://performance-partners.apple.com/search-api)에서 확인했습니다. 추가 이력은 각 앱의 App Store 버전 기록에서 확인했습니다. API 시각은 한국 날짜로 변환했습니다.
- Android는 각 앱의 Google Play 한국 공개 목록을 확인했습니다. 개발사가 변경사항에 버전 번호를 명시한 경우만 기록했습니다. 버전 정보가 없는 변경사항은 `version: null`로 표시합니다.
- `sourceUrl`은 해당 정보를 확인한 페이지 또는 API입니다. `storeUrl`은 사용자용 스토어 링크입니다. `iconUrl`은 스토어가 제공한 이미지 주소입니다. 긴 릴리스 노트는 발췌하고 `notesAreExcerpt: true`로 표시합니다.
- 화면은 저장소에 포함된 JSON을 읽습니다. 외부 스토어가 응답하지 않아도 앱 목록과 변경사항이 표시됩니다. 이후 스냅샷을 갱신할 때 확인에 실패한 항목은 마지막으로 검증한 기록을 보존합니다.
- 평가에 사용하는 릴리스 ID는 스토어와 버전을 포함합니다. 공개 버전 번호가 없는 변경사항은 시각만으로 평가를 합산하지 않습니다.
