# learnPlaywright

Playwright로 **메이플 캐릭터·장비 조회** 웹([배포 예시](https://learn-with-maplestory-api.onrender.com/))을 E2E 테스트하는 저장소입니다. 앱 소스 자체보다 **테스트 설계/운영**에 초점을 둔 학습·포트폴리오 프로젝트입니다.

## 프로젝트 개요

- 기본 대상 URL은 `playwright.config.ts`의 `baseURL`을 사용합니다.
- 로컬 개발 서버를 붙이고 싶다면 `PLAYWRIGHT_WEB_SERVER_COMMAND`와 `PLAYWRIGHT_WEB_SERVER_URL`을 설정해 `webServer` 모드로 실행할 수 있습니다.
- 로컬 기본 실행 정책은 `desktop-chromium` 단일 프로젝트이며, CI 또는 `PLAYWRIGHT_ALL_PROJECTS=1`에서만 풀 매트릭스를 엽니다.

## 빠른 시작 (3분)

사전 요구 사항:

- Node.js
- npm

설치:

```bash
npm ci
npx playwright install
```

첫 실행:

```bash
npm test
npm run report
```

CI와 최대한 동일한 Linux 의존성까지 맞추려면:

```bash
npx playwright install --with-deps
```

## 실행 정책 (핵심)

- **로컬 기본**: `npm test`는 `desktop-chromium` 중심으로 실행
- **PR**: `npm run test:smoke`만 실행 (`@smoke` + `--project=desktop-chromium`)
- **main/master push, 수동 실행**: `npm run test:ci-matrix`로 풀 매트릭스

> `test:ci-matrix` 스크립트 자체는 `playwright test`입니다. 로컬에서 풀 매트릭스를 원하면 `PLAYWRIGHT_ALL_PROJECTS=1` 또는 `CI=true`가 필요합니다.

## 테스트 매트릭스와 태그 규칙

프로젝트:

- `desktop-chromium`
- `desktop-firefox`
- `desktop-webkit`
- `mobile-pixel-chrome` (`Pixel 5`)
- `mobile-iphone-webkit` (`iPhone 12`)

태그:

- `@smoke`: PR/빠른 검증용 핵심 시나리오
- `@UI`: UI 중심 시나리오 분류
- `@desktop-only`: 모바일 프로젝트에서 제외 (`grepInvert`)

모바일 프로젝트는 설정상 `grepInvert: /@desktop-only/`가 적용되어 데스크톱 전용 시나리오를 자동 제외합니다.

## 테스트 구조 안내

- `tests/`: 스펙 파일
- `tests/pages/`: Page Object Model (`HomePage`, `CharacterPage`, `UnionPage`, `CharacterNotFoundPage`)
- `tests/pages/components/`: 공통 컴포넌트(`AppHeader`)

대표 도메인:

- 랜딩/검색: `tests/empty_state.spec.ts`, `tests/UI_homePage.spec.ts`
- 캐릭터 상세: `tests/character_lookup.spec.ts`
- 유니온: `tests/union.spec.ts`
- 에러/검증 실패: `tests/error_state.spec.ts`, `tests/api_mock.spec.ts`

## 데이터/환경 변수 계약

테스트 데이터:

- 기본 CSV: [`Data/nicknames.csv`](./Data/nicknames.csv)
- 경로 override: `NICKNAME_CSV_PATH`
- CSV 컬럼 규칙: `nickname` 또는 `닉네임` 컬럼을 우선 사용하고, 없으면 첫 컬럼 값 사용

환경 변수:

| 변수 | 설명 |
|------|------|
| `PLAYWRIGHT_BASE_URL` | 테스트 대상 베이스 URL (미설정 시 호스팅 기본 URL) |
| `PLAYWRIGHT_WEB_SERVER_COMMAND` | 설정 시 `webServer.command`로 로컬 서버 기동 |
| `PLAYWRIGHT_WEB_SERVER_URL` | `webServer.url` 헬스 체크 URL (기본 `http://localhost:3000`) |
| `PLAYWRIGHT_ALL_PROJECTS` | `1`이면 로컬에서도 전 프로젝트(브라우저+모바일) 노출 |
| `NICKNAME_CSV_PATH` | 닉네임 CSV 파일 경로 |

## 안정성/제약사항 (운영 가이드)

- 실데이터 시나리오는 외부 API/호스팅 상태에 따라 간헐 실패할 수 있습니다.
- `tests/api_cache.ts`는 `/api/**` 응답을 캐시해 재사용합니다.
- Firefox 등 일부 환경에서는 `response.body()` 읽기가 실패할 수 있으며, 이 경우 해당 URL은 캐시 없이 실제 네트워크로 진행됩니다.
- 모바일 레이아웃 차이로 인해 일부 테스트는 `@desktop-only`로 분리해야 합니다.
- main 풀 매트릭스에서는 브라우저/프로젝트 수만큼 요청량이 증가해 429 가능성이 커질 수 있으며, CI에서 `workers` 상한으로 완화합니다.

## CI 동작 설명

[GitHub Actions](.github/workflows/playwright.yml) 요약:

| 이벤트 | 브라우저 설치 | 실행 |
|--------|----------------|------|
| `pull_request` | `chromium`만 | `npm run test:smoke` |
| `push` (`main`/`master`) | `chromium firefox webkit` | `npm run test:ci-matrix` |
| `workflow_dispatch` | `chromium firefox webkit` | `npm run test:ci-matrix` |

- 리포트 아티팩트 `playwright-report/`는 7일 보관
- `DISCORD_WEBHOOK_URL` 시크릿이 있으면 Discord 알림 전송

## 트러블슈팅

1. 브라우저 누락 오류가 나면 `npx playwright install` 또는 `npx playwright install firefox webkit` 실행
2. 로컬에서 풀 매트릭스가 안 돌면 `PLAYWRIGHT_ALL_PROJECTS=1` 설정 여부 확인
3. 닉네임 관련 실패가 나면 `Data/nicknames.csv` 또는 `NICKNAME_CSV_PATH` 경로/컬럼 확인
4. 환경 대상이 다르면 `PLAYWRIGHT_BASE_URL`을 명시해 재실행
5. flaky 분석은 `npm run report`로 trace/screenshot/video를 우선 확인

실행 명령 모음:

```bash
npm test
npm run test:smoke
npm run test:ci-matrix
npm run test:ui
npm run report
```

로컬 풀 매트릭스 예시:

```bash
npx playwright install firefox webkit
PLAYWRIGHT_ALL_PROJECTS=1 npm run test:ci-matrix
```

PowerShell:

```powershell
$env:PLAYWRIGHT_ALL_PROJECTS='1'; npm run test:ci-matrix
```

## 라이선스

개인 학습·포트폴리오 용도로 사용합니다.
