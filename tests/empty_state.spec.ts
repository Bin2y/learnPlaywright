import { test } from '@playwright/test';

import { HomePage } from './pages/HomePage';

test.describe('@smoke 초기(Empty) 상태', () => {
  test('페이지 진입 시 조회 전 UI', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAppReady();

    await test.step('조회 전 랜딩 UI', async () => {
      await home.expectEmptySearchState();
      await home.header.expectLandingHeaderVisible();
    });
  });
});
