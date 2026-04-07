import { expect, test } from '@playwright/test';

import { NICKNAME_LIST } from './nickname-lookup.data';

test.describe('닉네임 및 장비조회', () => {
  for (const nickname of NICKNAME_LIST) {
    test(`닉네임 "${nickname}" 조회`, async ({ page }) => {
      await page.goto('/');

      const input = page.getByRole('textbox', { name: '캐릭터 닉네임 입력' });
      await input.fill(nickname);
      await input.press('Enter');

      await expect(page.getByRole('heading', { name: '캐릭터 기본 정보' })).toBeVisible();
      await expect(page.getByText(nickname).first()).toBeVisible();

      const equipHeading = page.getByRole('heading', { name: '장착 장비' });
      await expect(equipHeading).toBeVisible();
      await expect(page.getByRole('tab', { name: '현재 장착' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '장비', exact: true })).toBeVisible();
      await expect(equipHeading.locator('..').getByText('(조회 후 표시)')).toHaveCount(0);
    });
  }
});
