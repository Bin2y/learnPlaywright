import { expect, test } from '@playwright/test';

import { waitForAppReady } from './wait-for-app';

test.describe('초기(Empty) 상태', () => {
  test('페이지 진입 시 조회 전 UI', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const input = page.getByRole('textbox', { name: '캐릭터 닉네임 입력' });
    await expect(input).toBeVisible();
    await expect(input).toBeEmpty();
    await expect(input).toBeEditable();

    const equipHeading = page.getByRole('heading', { name: '장착 장비' });
    await expect(equipHeading).toBeVisible();
    await expect(equipHeading.locator('..').getByText('(조회 후 표시)')).toHaveCount(1);

    await expect(page.getByRole('tab', { name: '현재 장착' })).not.toBeVisible();
  });
});
