import { expect, type Page } from '@playwright/test';

/** `character_notFound.html` — 닉네임 미존재·검증 오류 등 */
export class CharacterNotFoundPage {
  constructor(private readonly page: Page) {}

  async expectNotFoundUi(): Promise<this> {
    // console.log('[CharacterNotFoundPage] 미존재 안내 UI 검증');
    await expect(
      this.page.getByRole('heading', { name: '캐릭터 닉네임을 찾을 수 없어요' }),
      '미존재 안내 헤딩이 노출 되어야 한다'
    ).toBeVisible();
    await expect(
      this.page.getByRole('link', { name: '홈으로 이동' }),
      '홈으로 이동 링크가 노출 되어야 한다'
    ).toBeVisible();
    return this;
  }
}
