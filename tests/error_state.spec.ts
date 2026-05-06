import { expect, test } from '@playwright/test';

import { CharacterNotFoundPage } from './pages/CharacterNotFoundPage';
import { CharacterPage } from './pages/CharacterPage';
import { HomePage } from './pages/HomePage';
import { NICKNAME_LIST } from './nickname_lookup.data';

const INVALID_NICKNAME = '존재하지않는닉네임_xyz_125126161261662423';
const BLANK = '        ';

test.describe('@smoke 오류 및 네거티브 상태', () => {
  test('존재하지 않는 닉네임 — 로드 실패 alert', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAppReady();

    await test.step('미존재 닉네임 조회', async () => {
      await home.searchFromLandingByEnter(INVALID_NICKNAME);
      await page.waitForURL(/character(?:_notFound)?\.html\?name=/);
    });

    if (page.url().includes('character_notFound.html')) {
      await new CharacterNotFoundPage(page).expectNotFoundUi();
      return;
    }

    await new CharacterPage(page).expectLoadErrorAlert();
  });

  test('빈 입력 후 Enter — 닉네임 입력 안내 문구', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAppReady();

    await test.step('빈 입력으로 Enter', async () => {
      await home.expectAppReady();
      await home.submitSearchWithEnter();
    });

    await home.expectNicknameInlinePromptVisible();
  });

  test('clear 후 새 닉네임 입력 시 값 갱신', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAppReady();

    const first = NICKNAME_LIST[0];
    test.skip(!first, 'CSV에 닉네임이 없음');

    await test.step('임시 입력 후 clear하고 CSV 닉네임 입력', async () => {
      await home.fillNickname('임시');
      await home.clearNickname();
      await home.fillNickname(first!);
    });

    await home.expectAppReady();
    const field = page.getByRole('textbox', { name: '캐릭터 닉네임' });
    await expect(field, '입력창 값이 새 닉네임이어야 한다').toHaveValue(first!);
  });
});

test.describe('오류 및 네거티브 상태', () => {
  test('닉네임 경계값 분석 : 공백 입력', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAppReady();

    await test.step('공백만 입력 후 Enter', async () => {
      await home.fillNickname(BLANK);
      await home.submitSearchWithEnter();
    });

    await home.expectToastShows('닉네임을 입력하세요.');
  });
});
