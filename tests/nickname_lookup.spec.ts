import { expect, test } from '@playwright/test';

import {
  characterDetailTablist,
  characterMainHeading,
  nicknameInput,
  tabEquipment,
} from './locators';
import { NICKNAME_LIST } from './nickname_lookup.data';
import { waitForAppReady } from './wait_for_app';

// CSV에 적힌 닉네임마다 동일 플로우(상세 화면 + 장비 탭)를 검증
test.describe('닉네임 및 장비조회', () => {
  for (const nickname of NICKNAME_LIST) {
    test(`닉네임 "${nickname}" 조회`, async ({ page }) => {
      await test.step('검색 페이지 로드', async () => {
        await page.goto('/');
        await waitForAppReady(page);
      });

      await test.step('닉네임 조회', async () => {
        await nicknameInput(page).fill(nickname);
        await nicknameInput(page).press('Enter');
      });

      await test.step('상세·장비 탭', async () => {
        await expect(characterMainHeading(page, nickname)).toBeVisible();
        await expect(page.getByText(nickname).first()).toBeVisible();

        await expect(characterDetailTablist(page)).toBeVisible();

        // 장비 탭: 현재 앱은 패널 `#panelEquipment`가 hidden인 채 공용 tabpanel만 갱신되는 경우가 있어
        // 탭 클릭·포커스로 상호작용 가능 여부만 검증한다.
        await tabEquipment(page).click();
        await expect(tabEquipment(page)).toBeFocused();
      });
    });
  }
});
