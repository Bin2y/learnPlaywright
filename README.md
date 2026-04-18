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

## 실행

```bash
npm test
```

UI 모드(디버깅·단계 실행):

```bash
npm run test:ui
```

HTML 리포트 보기:

```bash
npm run report
```

## CI

`main` / `master`에 push 또는 PR 시 [GitHub Actions](.github/workflows/playwright.yml)에서 `npm test`를 실행합니다. 실패하지 않은 경우 워크플로 아티팩트로 `playwright-report`를 7일 보관합니다. Discord 웹훅이 있으면 `DISCORD_WEBHOOK_URL` 시크릿으로 알림을 보냅니다.

## 테스트 설계 메모

- **로케이터**: `getByRole` 위주로 잡아 접근성 이름과 연동하고, UI 문구 변경 시 실패 위치를 좁히기 쉽게 했습니다.
- **초기 로딩**: Render 등 콜드 스타트를 위해 [`tests/wait_for_app.ts`](./tests/wait_for_app.ts)에서 닉네임 입력란이 보일 때까지 긴 타임아웃으로 대기합니다.
- **실데이터 한계**: 닉네임별 시나리오는 넥슨 Open API와 배포 서버에 의존하므로, **외부 요인으로 간헐 실패**할 수 있습니다.
- **보완**: `page.route`로 `/api/ocid` 응답을 고정한 테스트([`tests/api_mock.spec.ts`](./tests/api_mock.spec.ts))는 외부 API와 무관하게 **오류 UI(alert 문구)** 계약만 검증합니다.

## 라이선스

개인 학습·포트폴리오 용도로 사용합니다.
