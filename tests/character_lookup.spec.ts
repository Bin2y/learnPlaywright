import { expect, test } from '@playwright/test';

import {
  characterDetailTablist,
  tabCharacterInfo,
  tabEquipment,
  tabStats,
} from './locators';
import { NICKNAME_LIST } from './nickname_lookup.data';
import { openAnyCharacterDetail } from './smoke_lookup';

test.describe('@smoke 장비 탭 상호작용', () => {
  //모든 테스트는 캐릭터 상세 진입 후 진행됨됨
  test.beforeEach(async ({ page }) => {
    const candidates = NICKNAME_LIST.slice(0, 3);
    test.skip(candidates.length === 0, 'CSV에 닉네임이 없음');
    const opened = await openAnyCharacterDetail(page, candidates);
    test.skip(!opened, '상세 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');
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
