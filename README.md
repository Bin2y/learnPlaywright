# learnPlaywright

Playwright로 **메이플 캐릭터·장비 조회** 웹앱([배포 예시](https://learn-with-maplestory-api.onrender.com/))을 E2E 테스트하는 저장소입니다. 학습·포트폴리오용으로 유지합니다.

## 사전 요구 사항

- Node.js
- npm

## 설치

```bash
npm ci
npx playwright install
```

CI와 동일하게 맞추려면 브라우저에 시스템 의존성까지 포함합니다.

```bash
npx playwright install --with-deps
```

## 테스트 데이터

기본값은 프로젝트 루트 [`Data/nicknames.csv`](./Data/nicknames.csv)입니다. 다른 경로를 쓰려면 환경 변수로 지정합니다.

| 변수 | 설명 |
|------|------|
| `NICKNAME_CSV_PATH` | 닉네임 CSV 파일의 절대 또는 상대 경로 |

## 환경 변수 (선택)

| 변수 | 설명 |
|------|------|
| `PLAYWRIGHT_BASE_URL` | 테스트 대상 베이스 URL (미설정 시 `playwright.config.ts`의 기본 호스팅 URL) |
| `PLAYWRIGHT_WEB_SERVER_COMMAND` | 예: 로컬 프론트 `npm run dev` — 설정 시 `webServer`로 기동 |
| `PLAYWRIGHT_WEB_SERVER_URL` | webServer 헬스 체크 URL (기본 `http://localhost:3000`) |
| `PLAYWRIGHT_ALL_PROJECTS` | `1`이면 로컬에서도 Firefox·WebKit·모바일 등 **전 프로젝트**가 `playwright.config.ts`에 노출됨 (기본은 Chromium 단일 프로젝트만) |

## 실행

로컬 기본값은 **`desktop-chromium`(Chrome 채널 또는 번들 Chromium)** 한 프로젝트만 사용합니다.

```bash
npm test
```

`@smoke`만 Chromium에서 돌립니다 (스크립트에 `--project=desktop-chromium` 포함).

```bash
npm run test:smoke
```

로컬에서 **전 브라우저·모바일 매트릭스**를 맞추려면 Firefox/WebKit 바이너리를 설치한 뒤:

```bash
npx playwright install firefox webkit
PLAYWRIGHT_ALL_PROJECTS=1 npm run test:ci-matrix
```

Windows PowerShell 예: `$env:PLAYWRIGHT_ALL_PROJECTS='1'; npm run test:ci-matrix`

UI 모드(디버깅·단계 실행):

```bash
npm run test:ui
```

HTML 리포트 보기:

```bash
npm run report
```

## CI

[GitHub Actions](.github/workflows/playwright.yml) 동작 요약:

| 이벤트 | 브라우저 설치 | 실행 |
|--------|----------------|------|
| **PR** (`pull_request`) | `chromium`만 | `npm run test:smoke` (`@smoke`, **`desktop-chromium`만**) |
| **main/master push**, **수동** | `chromium`, `firefox`, `webkit` | `npm run test:ci-matrix` (데스크톱·모바일 전 프로젝트) |

워크플로에서 GitHub의 `CI=true`가 설정되므로 설정 파일에는 풀 매트릭스 프로젝트가 로드됩니다. 실패하지 않은 경우 아티팩트로 `playwright-report`를 7일 보관합니다. Discord 웹훅이 있으면 `DISCORD_WEBHOOK_URL` 시크릿으로 알림을 보냅니다.

**참고**: 모바일 뷰포트와 데스크톱 레이아웃이 다를 수 있습니다. 데스크톱 전용 시나리오에는 `@desktop-only` 태그를 두면 모바일 프로젝트에서 제외됩니다(`grepInvert`). **main 전체 매트릭스**에서는 브라우저·프로젝트 수만큼 네트워크 요청이 늘어 호스트/API **429** 가능성이 커질 수 있어, CI에서는 `workers` 상한 등으로 완화합니다.

## 테스트 설계 메모

- **로케이터**: `getByRole` 위주로 잡아 접근성 이름과 연동하고, UI 문구 변경 시 실패 위치를 좁히기 쉽게 했습니다.
- **브라우저 매트릭스**: Chromium·Firefox·WebKit·Pixel 5·iPhone 12 프로젝트는 **CI main·수동**과 로컬 `PLAYWRIGHT_ALL_PROJECTS=1`에서 사용합니다.
- **초기 로딩**: Render 등 콜드 스타트를 위해 [`tests/pages/HomePage.ts`](./tests/pages/HomePage.ts)의 `expectAppReady()`에서 닉네임 입력란이 보일 때까지 긴 타임아웃으로 대기합니다.
- **실데이터 한계**: 닉네임별 시나리오는 넥슨 Open API와 배포 서버에 의존하므로, **외부 요인으로 간헐 실패**할 수 있습니다.
- **보완**: `page.route`로 `/api/ocid` 응답을 고정한 테스트([`tests/api_mock.spec.ts`](./tests/api_mock.spec.ts))는 외부 API와 무관하게 **오류 UI(alert 문구)** 계약만 검증합니다.
- **API 캐시**: [`tests/api_cache.ts`](./tests/api_cache.ts)는 응답 본문을 모아 재사용합니다. Firefox 등에서는 일부 응답에 대해 `response.body()` 읽기가 실패할 수 있어 해당 URL은 캐시에서 빠지고 **실제 네트워크로 이어질 수 있습니다**.

## 라이선스

개인 학습·포트폴리오 용도로 사용합니다.
