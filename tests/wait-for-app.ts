import type { Page } from '@playwright/test';

/** 호스팅(Render 등) 콜드 스타트 시 로딩 화면이 길어질 수 있어 넉넉히 둔다. */
const APP_READY_MS = 120_000;

export async function waitForAppReady(page: Page): Promise<void> {
  await page.getByRole('textbox', { name: '캐릭터 닉네임 입력' }).waitFor({
    state: 'visible',
    timeout: APP_READY_MS,
  });
}
