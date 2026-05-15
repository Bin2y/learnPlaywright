# learnPlaywright

Playwright로 **메이플 캐릭터·장비 조회** 웹([배포 예시](https://learn-with-maplestory-api.onrender.com/))을 E2E 테스트하는 저장소입니다. 앱 소스보다 **테스트 설계·운영**에 초점을 둔 학습·포트폴리오 프로젝트입니다.

## 프로젝트 개요

- 기본 `baseURL`: `playwright.config.ts` (미설정 시 위 Render URL).
- 로컬 앱 연동: `PLAYWRIGHT_WEB_SERVER_COMMAND` + `PLAYWRIGHT_WEB_SERVER_URL` → `webServer` 기동.
- **로컬 기본**: `desktop-chromium`만. **풀 매트릭스**: `CI=true` 또는 `PLAYWRIGHT_ALL_PROJECTS=1`.
- **로컬 Chromium**: CI가 아니면 설치된 **Chrome 채널** 사용. CI는 번들 Chromium.

## 빠른 시작

**요구:** Node.js, npm

```bash
npm ci
npx playwright install
npm test
npm run report
```

Linux 의존성까지 CI에 맞추려면: `npx playwright install --with-deps`

## 실행 정책

| 실행 | 명령 | 범위 |
|------|------|------|
| 로컬 전체(기본) | `npm test` | Chromium 1프로젝트, **모든 스펙** |
| PR / 스모크 | `npm run test:smoke` | `--grep @smoke` + `desktop-chromium`만 |
| main·수동 CI | `npm run test:ci-matrix` | 위와 동일 스크립트, CI에서는 5프로젝트 매트릭스 |

> `test:ci-matrix` = `playwright test` 본체. 로컬에서 5브라우저를 돌리려면 `PLAYWRIGHT_ALL_PROJECTS=1` 또는 `CI=true`.

### 태그와 PR에 포함되는 테스트

| 태그 | PR (`test:smoke`) | 비고 |
|------|-------------------|------|
| `@smoke` | 포함 | `empty_state`, `nickname_lookup`, `character_lookup`, `union`, `error_state` 일부 |
| `@UI` | **미포함** | `UI_homePage.spec.ts` 전부 — **로컬 `npm test`·main 매트릭스에서만** |
| (무태그) | **미포함** | `api_mock.spec.ts`, `error_state`의 공백 입력 케이스 |

- **`@desktop-only`**: `playwright.config.ts`에서 모바일 `grepInvert`로 **예약**되어 있음. 현재 스펙에는 아직 미사용.
- 모바일 프로젝트는 describe 제목에 `@desktop-only`가 들어가면 제외됨(설정: `grepInvert: /@desktop-only/`).

## 테스트 매트릭스 (프로젝트)

- `desktop-chromium` · `desktop-firefox` · `desktop-webkit`
- `mobile-pixel-chrome` (`Pixel 5`) · `mobile-iphone-webkit` (`iPhone 12`) — 위 `grepInvert` 적용

## 디렉터리 구조

| 경로 | 역할 |
|------|------|
| `tests/*.spec.ts` | 스펙 |
| `tests/pages/` | POM: `HomePage`, `CharacterPage`, `UnionPage`, `CharacterNotFoundPage` |
| `tests/pages/components/` | `AppHeader` |
| `tests/smoke_lookup.ts` | 스모크용 닉네임 후보 순회·상세/유니온 진입 헬퍼 |
| `tests/nickname_lookup.data.ts` | CSV 로드, `NICKNAME_LIST` export |
| `tests/api_cache.ts` | `/api/**` 응답 캐시 (`character_lookup`, `union`) |

### 스펙 파일 요약

- **랜딩·검색 UI**: `empty_state.spec.ts`, `UI_homePage.spec.ts` (상단/빠른조회/공지·이벤트·업데이트, **롤링·`waitForResponse` 포함**)
- **스모크 조회**: `nickname_lookup.spec.ts` (랜딩→상세), `character_lookup.spec.ts`, `union.spec.ts`
- **오류·엣지**: `error_state.spec.ts`, `api_mock.spec.ts` (동일 출처 API 모킹)

## 데이터 · 환경 변수

**CSV:** [`Data/nicknames.csv`](./Data/nicknames.csv) — 컬럼 `nickname` / `닉네임` 우선, 없으면 첫 컬럼. `NICKNAME_CSV_PATH`로 경로 덮어쓰기.

| 변수 | 설명 |
|------|------|
| `PLAYWRIGHT_BASE_URL` | 베이스 URL |
| `PLAYWRIGHT_WEB_SERVER_COMMAND` | 로컬 서버 기동 명령 |
| `PLAYWRIGHT_WEB_SERVER_URL` | 헬스 체크 URL (기본 `http://localhost:3000`) |
| `PLAYWRIGHT_ALL_PROJECTS` | `1`이면 로컬에서 전 프로젝트 |
| `NICKNAME_CSV_PATH` | 닉네임 CSV 경로 |

## 안정성 · 운영 메모

- 실서비스/API·호스팅에 따라 실데이터 테스트는 간헐 실패 가능.
- `api_cache`: Firefox 등에서 `response.body()` 실패 시 해당 URL은 캐시 없이 실네트워크.
- CI: `retries: 2`, `workers` 상한. main 풀 매트릭스는 요청량 증가 → 429 가능성.
- 일부 스펙/훅: `test.setTimeout` 상향(예: 90s). `HomePage.expectAppReady`는 최대 **120s** 대기.
- `character_lookup`·`union`은 **serial + beforeAll**로 닉네임 해상·캐시 사용.

## CI ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml))

| 이벤트 | 브라우저 설치 | 실행 |
|--------|----------------|------|
| `pull_request` | chromium만 | `npm run test:smoke` |
| `push` main/master, `workflow_dispatch` | chromium·firefox·webkit | `npm run test:ci-matrix` |

- 아티팩트 `playwright-report/` 보관 7일
- `DISCORD_WEBHOOK_URL` 시크릿 시 Discord 알림

## 트러블슈팅

1. 브라우저 누락 → `npx playwright install` (또는 firefox webkit 추가)
2. 풀 매트릭스 미노출 → `PLAYWRIGHT_ALL_PROJECTS=1`
3. 닉네임 실패 → CSV 경로·컬럼
4. 대상 URL 불일치 → `PLAYWRIGHT_BASE_URL`
5. 플래키 → `npm run report` (trace / screenshot / video)

```bash
npm test
npm run test:smoke
npm run test:ci-matrix
npm run test:ui
npm run report
```

풀 매트릭스 (bash): `PLAYWRIGHT_ALL_PROJECTS=1 npm run test:ci-matrix`  
PowerShell: `$env:PLAYWRIGHT_ALL_PROJECTS='1'; npm run test:ci-matrix`

## 라이선스

개인 학습·포트폴리오 용도.
