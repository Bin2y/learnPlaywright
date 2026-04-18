import { expect, test } from '@playwright/test';

import { loadErrorAlert, nicknameInput } from './locators';
import { waitForAppReady } from './wait_for_app';

/**
 * characterApp.js가 호출하는 동일 출처 API만 고정 응답으로 바꿉니다.
 * renderNexonErrorHtml + 넥슨 "Please input valid parameter" 분기 시
 * 제목이 "정보를 불러올 수 없습니다."가 됩니다.
 */
test.describe('네트워크 모킹 (외부 API 비의존)', () => {
  test('OCID API가 Nexon식 검증 오류를 반환하면 alert 표시', async ({ page }) => {
    await page.route('**/api/ocid*', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          message: 'Please input valid parameter.',
        }),
      });
    });

    await page.goto('/');
    await waitForAppReady(page);

    await test.step('검색 후 character.html로 이동', async () => {
      await nicknameInput(page).fill('모킹테스트');
      await nicknameInput(page).press('Enter');
      await page.waitForURL(/character\.html\?name=/);
    });

    await expect(loadErrorAlert(page)).toBeVisible({ timeout: 30_000 });
  });
});
