import { expect, test } from '@playwright/test';

import {
  characterDetailTablist,
  nicknameInput,
  tabCharacterInfo,
  tabEquipment,
  tabStats,
} from './locators';
import { NICKNAME_LIST } from './nickname_lookup.data';
import { waitForAppReady } from './wait_for_app';

test.describe('장비 탭 상호작용', () => {
  test.beforeEach(async ({ page }) => {
    const nickname = NICKNAME_LIST[0];
    test.skip(!nickname, 'CSV에 닉네임이 없음');

    await page.goto('/');
    await waitForAppReady(page);
    await nicknameInput(page).fill(nickname!);
    await nicknameInput(page).press('Enter');

    await expect(characterDetailTablist(page)).toBeVisible();
  });

  test('장비 탭 클릭 시 포커스 이동', async ({ page }) => {
    await tabEquipment(page).click();
    await expect(tabEquipment(page)).toBeFocused();
  });

  test('캐릭터 상세 탭 전체 클릭 순회', async ({ page }) => {
    const tablist = characterDetailTablist(page);
    const tabs = tablist.getByRole('tab');
    const count = await tabs.count();
    test.skip(count < 2, '탭이 2개 미만이면 종료');

    for (let i = 0; i < count; i++) {
      const tab = tabs.nth(i);
      const label = await tab.textContent();
      await tab.click();
      await expect(tab).toBeFocused();
      expect(label?.length).toBeGreaterThan(0);
    }
  });

  test('캐릭터 정보·장비·스탯 탭 라벨 존재', async ({ page }) => {
    await expect(tabCharacterInfo(page)).toBeVisible();
    await expect(tabEquipment(page)).toBeVisible();
    await expect(tabStats(page)).toBeVisible();
  });
});
