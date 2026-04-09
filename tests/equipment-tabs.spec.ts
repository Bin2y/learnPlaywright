import { expect, test } from '@playwright/test';

import { NICKNAME_LIST } from './nickname-lookup.data';
import { waitForAppReady } from './wait-for-app';

test.describe('장비 탭 상호작용', () => {
  test.beforeEach(async ({ page }) => {
    const nickname = NICKNAME_LIST[0];
    test.skip(!nickname, 'CSV에 닉네임이 없음');

    await page.goto('/');
    await waitForAppReady(page);
    const input = page.getByRole('textbox', { name: '캐릭터 닉네임 입력' });
    await input.fill(nickname!);
    await input.press('Enter');

    const tab = page.getByRole('tab', { name: '현재 장착' });
    await expect(tab).toBeVisible();
  });

  test('현재 장착 탭 클릭', async ({ page }) => {
    const tab = page.getByRole('tab', { name: '현재 장착' });
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: '장비', exact: true })).toBeVisible();
  });

  test('모든 장비 탭 동작 클릭', async ({ page }) => {
    const tablist = page.getByRole('tablist');
    const tabs = tablist.getByRole('tab');
    const count = await tabs.count();
    test.skip(count < 2, '탭이 2개 미만 테스트 종료');

    for(let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      const label = await tab.textContent();
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      expect(label?.length).toBeGreaterThan(0);
    }
  });
});
