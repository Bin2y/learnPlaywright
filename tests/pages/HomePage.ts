import { expect, type Page } from '@playwright/test';

import { AppHeader } from './components/AppHeader';

/** 호스팅(Render 등) 콜드 스타트 시 로딩 화면이 길어질 수 있어 넉넉히 둔다. */
const APP_READY_MS = 120_000;

/**
 * 랜딩(검색) 페이지 — `index.html` / `/`
 */
export class HomePage {
  readonly header: AppHeader;

  constructor(private readonly page: Page) {
    this.header = new AppHeader(page);
  }

  private get nicknameField() {
    return this.page.getByRole('textbox', { name: '캐릭터 닉네임' });
  }

  private get searchSubmitButton() {
    return this.page.getByRole('button', { name: '조회' });
  }

  private get characterDetailTablist() {
    return this.page.getByRole('tablist', { name: '캐릭터 상세 정보' });
  }

  private get backToSearchLink() {
    return this.page.getByRole('link', { name: /다른 캐릭터 조회/ });
  }

  async goto(): Promise<this> {
    console.log('[HomePage] 랜딩 진입');
    await this.page.goto('/');
    return this;
  }

  async expectAppReady(): Promise<this> {
    await this.nicknameField.waitFor({
      state: 'visible',
      timeout: APP_READY_MS,
    });
    return this;
  }

  async expectEmptySearchState(): Promise<this> {
    console.log('[HomePage] 조회 전 초기 상태 검증');
    await expect(this.nicknameField, '닉네임 입력창이 보여야 한다').toBeVisible();
    await expect(this.nicknameField, '닉네임 입력창은 비어 있어야 한다').toBeEmpty();
    await expect(this.nicknameField, '닉네임 입력창은 편집 가능해야 한다').toBeEditable();
    await expect(this.searchSubmitButton, '조회 버튼이 보여야 한다').toBeVisible();
    await expect(this.characterDetailTablist, '상세 탭 리스트는 아직 보이지 않아야 한다').not.toBeVisible();
    await expect(this.backToSearchLink, '다른 캐릭터 조회 링크는 아직 보이지 않아야 한다').not.toBeVisible();
    return this;
  }

  async fillNickname(nickname: string): Promise<this> {
    await this.nicknameField.fill(nickname);
    return this;
  }

  async clearNickname(): Promise<this> {
    await this.nicknameField.clear();
    return this;
  }

  async submitSearchWithEnter(): Promise<this> {
    await this.nicknameField.press('Enter');
    return this;
  }

  /** 랜딩에서 닉네임 입력 후 Enter로 조회한다. */
  async searchFromLandingByEnter(nickname: string): Promise<this> {
    console.log(`[HomePage] 랜딩에서 조회(Enter): ${nickname}`);
    await this.fillNickname(nickname);
    await this.submitSearchWithEnter();
    return this;
  }

  async expectNicknameInlinePromptVisible(): Promise<this> {
    await expect(this.page.getByText('닉네임을 입력하세요.'), '빈 입력 안내 문구가 보여야 한다').toBeVisible();
    return this;
  }

  async expectToastShows(message: string): Promise<this> {
    const toast = this.page.locator('#appToast');
    await expect(toast, '토스트가 표시되어야 한다').toBeVisible({ timeout: 3000 });
    await expect(toast, '토스트 문구가 기대와 일치해야 한다').toHaveText(message);
    return this;
  }
}
