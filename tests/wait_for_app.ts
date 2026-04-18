import type { Page } from '@playwright/test';

import { nicknameInput } from './locators';

/** 호스팅(Render 등) 콜드 스타트 시 로딩 화면이 길어질 수 있어 넉넉히 둔다. */
const APP_READY_MS = 120_000;

export async function waitForAppReady(page: Page): Promise<void> {
  await nicknameInput(page).waitFor({
    state: 'visible',
    timeout: APP_READY_MS,
  });
}
