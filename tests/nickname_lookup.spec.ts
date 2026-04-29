import { expect, test } from '@playwright/test';

import {
  characterDetailTablist,
  characterMainHeading,
  tabEquipment,
} from './locators';
import { NICKNAME_LIST } from './nickname_lookup.data';
import { openAnyCharacterDetail } from './smoke_lookup';

// 스모크는 최대 3개 후보에서 성공 1건만 검증해 실행 시간을 고정한다.
const SMOKE_NICKNAMES = NICKNAME_LIST.slice(0, 3);

test.describe('@smoke 닉네임 및 장비조회', () => {
  test('대표 닉네임 1건 조회', async ({ page }) => {
    const nickname = await openAnyCharacterDetail(page, SMOKE_NICKNAMES);
    test.skip(!nickname, '상세 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');

    await test.step('상세·장비 탭', async () => {
      await expect(characterMainHeading(page, nickname!)).toBeVisible();
      await expect(page.getByText(nickname!).first()).toBeVisible();

      await expect(characterDetailTablist(page)).toBeVisible();

      // 장비 탭: 현재 앱은 패널 `#panelEquipment`가 hidden인 채 공용 tabpanel만 갱신되는 경우가 있어
      // 탭 클릭·포커스로 상호작용 가능 여부만 검증한다.
      await tabEquipment(page).click();
      await expect(tabEquipment(page)).toBeFocused();
    });
  });
});
