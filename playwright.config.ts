import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // 로컬에서만 쓰려면: PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ??
      'https://learn-with-maplestory-api.onrender.com',
    trace: 'on-first-retry',
  },
  // 로컬에서 앱을 직접 띄울 때만: PLAYWRIGHT_WEB_SERVER_COMMAND="npm run dev" 등
  ...(process.env.PLAYWRIGHT_WEB_SERVER_COMMAND
    ? {
        webServer: {
          command: process.env.PLAYWRIGHT_WEB_SERVER_COMMAND,
          url:
            process.env.PLAYWRIGHT_WEB_SERVER_URL ?? 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
        },
      }
    : {}),
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        // CI(ubuntu)에서는 시스템 Chrome 설치 대신 Playwright 번들 Chromium 사용
        ...(process.env.CI ? {} : { channel: 'chrome' }),
      },
    },
  ],
});
