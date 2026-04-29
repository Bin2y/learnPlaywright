import { expect, test } from '@playwright/test';

import {
  characterDetailTablist,
  tabCharacterInfo,
  tabEquipment,
  tabStats,
} from './locators';
import { NICKNAME_LIST } from './nickname_lookup.data';
import {
  openAnyCharacterDetail,
  openCharacterDetailByNickname,
} from './smoke_lookup';

test.describe('@smoke 캐릭터 상세 조회 버튼 및 탭 상호작용', () => {
  let resolvedNickname: string | null = null;

  // 후보 중 상세 진입 가능한 닉네임을 1회만 해상한다.
  test.beforeAll(async ({ browser }) => {
    const candidates = NICKNAME_LIST.slice(0, 5);
    if (candidates.length === 0) return;

    const page = await browser.newPage();
    try {
      resolvedNickname = await openAnyCharacterDetail(page, candidates);
    } finally {
      await page.close();
    }
  });

  // 각 테스트는 새 page에서 확정 닉네임으로 단건 진입만 수행한다.
  test.beforeEach(async ({ page }) => {
    test.skip(!resolvedNickname, '상세 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');
    const opened = await openCharacterDetailByNickname(page, resolvedNickname!);
    test.skip(!opened, '확정 닉네임으로 상세 화면 진입 실패(외부 API 변동)');
    await expect(page).toHaveURL(/\/character\.html(\?|$)/);
    await expect(characterDetailTablist(page)).toBeVisible();
  });

  test('캐릭터 정보 탭 디폴트로 선택되어 있는지 확인', async ({ page }) => {
    await expect(tabCharacterInfo(page)).toHaveAttribute('aria-selected', 'true');
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
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      // 보조 검증: 포커스 이동은 브라우저별 편차가 있어 aria-selected를 우선한다.
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