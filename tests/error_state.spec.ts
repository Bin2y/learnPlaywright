import { expect, test } from '@playwright/test';

import { loadErrorAlert, nicknameInput, nicknameToastAlert, notFoundHeading } from './locators';
import { NICKNAME_LIST } from './nickname_lookup.data';
import { waitForAppReady } from './wait_for_app';

const INVALID_NICKNAME = '존재하지않는닉네임_xyz_125126161261662423';
const BLANK = "        ";

test.describe('@smoke 오류 및 네거티브 상태', () => {
  test('존재하지 않는 닉네임 — 로드 실패 alert', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    await nicknameInput(page).fill(INVALID_NICKNAME);
    await nicknameInput(page).press('Enter');

    await page.waitForURL(/character(?:_notFound)?\.html\?name=/);
    // 현재 사이트는 invalid/rate-limit 시 character_notFound.html로 이동할 수 있다.
    if (page.url().includes('character_notFound.html')) {
      await expect(notFoundHeading(page)).toBeVisible();
      return;
    }
    await expect(loadErrorAlert(page)).toBeVisible({ timeout: 60_000 });
  });

  test('빈 입력 후 Enter — 닉네임 입력 안내 문구', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const input = nicknameInput(page);
    await expect(input).toBeEmpty();
    await input.press('Enter');

    await expect(page.getByText('닉네임을 입력하세요.')).toBeVisible();
  });

  test('clear 후 새 닉네임 입력 시 값 갱신', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const input = nicknameInput(page);
    const first = NICKNAME_LIST[0];
    test.skip(!first, 'CSV에 닉네임이 없음');

    await input.fill('임시');
    await input.clear();
    await input.fill(first!);

    await expect(input).toHaveValue(first);
  });
});

test.describe('오류 및 네거티브 상태', () => {
  test('닉네임 경계값 분석 : 공백 입력', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    //공백입력력
    await nicknameInput(page).fill(BLANK);
    await nicknameInput(page).press('Enter');

    await expect(nicknameToastAlert(page)).toHaveText('닉네임을 입력하세요.');
    await expect(nicknameToastAlert(page)).toBeVisible({ timeout: 3000 });
  });
});