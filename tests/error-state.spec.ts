import { expect, test } from '@playwright/test';

import { NICKNAME_LIST } from './nickname-lookup.data';
import { waitForAppReady } from './wait-for-app';

const INVALID_NICKNAME = '존재하지않는닉네임_xyz_125126161261662423';

test.describe('오류·네거티브 상태', () => {
  test('존재하지 않는 닉네임 — 캐릭터 정보 미노출', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const input = page.getByRole('textbox', { name: '캐릭터 닉네임 입력' });
    await input.fill(INVALID_NICKNAME);
    await input.press('Enter');

    await page.waitForLoadState('networkidle');

    //alert가 보여야함
    await expect(page.getByRole('alert').filter({ hasText: '캐릭터를 찾을 수 없습니다.' })).toBeVisible();
  });

  test('빈 입력 후 Enter — 닉네임 입력 안내 문구', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const input = page.getByRole('textbox', { name: '캐릭터 닉네임 입력' });
    await expect(input).toBeEmpty();
    await input.press('Enter');

    await expect(page.getByText('닉네임을 입력하세요.')).toBeVisible();
  });

  test('clear 후 새 닉네임 입력 시 값 갱신', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const input = page.getByRole('textbox', { name: '캐릭터 닉네임 입력' });
    const first = NICKNAME_LIST[0];
    test.skip(!first, 'CSV에 닉네임이 없음');

    await input.fill('임시');
    await input.clear();
    await input.fill(first!);

    await expect(input).toHaveValue(first);
  });
});
