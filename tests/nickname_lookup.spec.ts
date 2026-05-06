import { expect, test } from '@playwright/test';

import { CharacterPage } from './pages/CharacterPage';
import { NICKNAME_LIST } from './nickname_lookup.data';
import { openAnyCharacterDetailFromLanding } from './smoke_lookup';

const SMOKE_NICKNAMES = NICKNAME_LIST.slice(0, 5);

test.describe('@smoke 닉네임 및 장비조회', () => {
  test('대표 닉네임 1건 조회', async ({ page }) => {
    const nickname = await openAnyCharacterDetailFromLanding(page, SMOKE_NICKNAMES);
    test.skip(!nickname, '상세 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');

    const characterPage = new CharacterPage(page);

    await test.step('상세·장비 탭', async () => {
      await characterPage.expectLoaded(nickname!);
      await expect(page.getByText(nickname!).first(), '본문에 닉네임이 표시되어야 한다').toBeVisible();
      await characterPage.openEquipmentTab();
    });
  });
});
