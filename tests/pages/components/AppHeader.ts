import { expect, type Page } from '@playwright/test';

export class AppHeader {
  constructor(private readonly page: Page) {}

  private get banner() {
    return this.page.getByRole('banner');
  }

  private get brandLink() {
    return this.banner.getByRole('link', { name: '메이플 조회' });
  }

  private get homeLink() {
    return this.banner.getByRole('link', { name: '홈' });
  }

  private get unionLink() {
    return this.banner.getByRole('link', { name: '유니온' });
  }

  private get themeToggleButton() {
    return this.banner.getByRole('button', { name: '테마 전환' });
  }

  async expectHeaderVisible(): Promise<this> {
    console.log('[AppHeader] 공통 헤더 표시 확인');
    await expect(this.brandLink, '브랜드 링크가 보여야 한다').toBeVisible();
    await expect(this.homeLink, '홈 링크가 보여야 한다').toBeVisible();
    await expect(this.unionLink, '유니온 링크가 보여야 한다').toBeVisible();
    await expect(this.themeToggleButton, '테마 전환 버튼이 보여야 한다').toBeVisible();
    return this;
  }

  async expectUnionLinkFor(nickname: string): Promise<this> {
    await expect(this.unionLink, '유니온 링크가 캐릭터 닉네임을 포함해야 한다').toHaveAttribute(
      'href',
      `union.html?name=${encodeURIComponent(nickname)}`
    );
    return this;
  }

  async goHome(): Promise<this> {
    console.log('[AppHeader] 홈으로 이동');
    await this.homeLink.click();
    return this;
  }

  async goUnion(): Promise<this> {
    console.log('[AppHeader] 유니온 페이지로 이동');
    await this.unionLink.click();
    return this;
  }

  async toggleTheme(): Promise<this> {
    console.log('[AppHeader] 테마 전환');
    await this.themeToggleButton.click();
    return this;
  }
}
