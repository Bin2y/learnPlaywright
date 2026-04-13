import { expect, test } from '@playwright/test';

import {
  backToSearchLink,
  characterDetailTablist,
  nicknameInput,
  searchButton,
} from './locators';
import { waitForAppReady } from './wait-for-app';

test.describe('초기(Empty) 상태', () => {
  test('페이지 진입 시 조회 전 UI', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const input = nicknameInput(page);
    await expect(input).toBeVisible();
    await expect(input).toBeEmpty();
    await expect(input).toBeEditable();

    await expect(searchButton(page)).toBeVisible();
    // 상세 화면(탭·뒤로가기)은 아직 없어야 함
    await expect(characterDetailTablist(page)).not.toBeVisible();
    await expect(backToSearchLink(page)).not.toBeVisible();
  });
});
