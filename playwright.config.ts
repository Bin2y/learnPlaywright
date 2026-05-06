import { defineConfig, devices } from '@playwright/test';

/** Ubuntu CI 등: 번들 Chromium. 로컬: 설치된 Chrome 채널. */
const desktopChromiumUse = {
  ...devices['Desktop Chrome'],
  ...(process.env.CI ? {} : { channel: 'chrome' as const }),
};

/**
 * CI(풀 매트릭스) 또는 로컬에서 `PLAYWRIGHT_ALL_PROJECTS=1` 일 때만 전 프로젝트 노출.
 * 그 외 로컬 기본은 desktop-chromium 단일.
 */
const useFullProjectMatrix =
  process.env.CI === 'true' || process.env.PLAYWRIGHT_ALL_PROJECTS === '1';

const fullProjects = [
  {
    name: 'desktop-chromium',
    use: desktopChromiumUse,
  },
  {
    name: 'desktop-firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  {
    name: 'desktop-webkit',
    use: { ...devices['Desktop Safari'] },
  },
  {
    name: 'mobile-pixel-chrome',
    grepInvert: /@desktop-only/,
    use: { ...devices['Pixel 5'] },
  },
  {
    name: 'mobile-iphone-webkit',
    grepInvert: /@desktop-only/,
    use: { ...devices['iPhone 12'] },
  },
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ??
      'https://learn-with-maplestory-api.onrender.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
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
  projects: useFullProjectMatrix
    ? fullProjects
    : [{ name: 'desktop-chromium', use: desktopChromiumUse }],
});
