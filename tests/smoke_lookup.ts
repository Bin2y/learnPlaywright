import { expect, type Page } from '@playwright/test';

import { characterDetailTablist, nicknameInput } from './locators';
import { waitForAppReady } from './wait_for_app';

/**
 * 호스팅 환경에서 닉네임별로 400/429 응답 편차가 있어,
 * 후보를 순회하며 실제 상세 탭이 뜨는 닉네임 하나를 찾는다.
 */
export async function openAnyCharacterDetail(
  page: Page,
  candidates: string[]
): Promise<string | null> {
  for (const nickname of candidates) {
    await page.goto('/');
    await waitForAppReady(page);
    await nicknameInput(page).fill(nickname);
    await nicknameInput(page).press('Enter');
    await page.waitForURL(/character(?:_notFound)?\.html\?name=/, {
      timeout: 20_000,
    });

    if (page.url().includes('character_notFound.html')) {
      continue;
    }

    const tablist = characterDetailTablist(page);
    const visible = await tablist.isVisible();
    if (visible) {
      await expect(tablist).toBeVisible();
      return nickname;
    }
  }

  return null;
}
