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

  private get characterLink() {
    return this.banner.getByRole('link', { name: '캐릭터' });
  }

  private get unionLink() {
    return this.banner.getByRole('link', { name: '유니온' });
  }

  /** 앱은 라벨을 `다크 모드` / `라이트 모드` 등으로 노출한다. */
  private get themeToggleButton() {
    return this.banner.getByRole('button', { name: /다크 모드|라이트 모드|테마 전환/ });
  }

  private get characterNavLink() {
    return this.banner.getByRole('link', { name: '캐릭터', exact: true });
  }

  /** 랜딩 등 유니온 네비가 없는 화면 */
  //index.hmtl, 조회 전
  async expectLandingHeaderVisible(): Promise<this> {
    // console.log('[AppHeader] 랜딩 헤더 표시 확인');
    await expect(this.brandLink, '브랜드 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.homeLink, '홈 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.characterLink, '캐릭터 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.unionLink, '유니온 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.themeToggleButton, '테마 토글 버튼이 노출 되어야 한다').toBeVisible();
    return this;
  }



  /** 캐릭터 상세 등 유니온 링크가 있는 화면 */
  //character.html, 조회 후
  async expectHeaderVisible(): Promise<this> {
    // console.log('[AppHeader] 공통 헤더 표시 확인');
    await expect(this.brandLink, '브랜드 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.homeLink, '홈 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.unionLink, '유니온 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.themeToggleButton, '테마 토글 버튼이 노출 되어야 한다').toBeVisible();
    return this;
  }

  /** 유니온 페이지 — 상단은 `캐릭터` 링크로 돌아간다. */
  //union.html, 유니온 페이지
  async expectUnionContextHeaderVisible(): Promise<this> {
    // console.log('[AppHeader] 유니온 컨텍스트 헤더 표시 확인');
    await expect(this.brandLink, '브랜드 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.homeLink, '홈 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.characterNavLink, '캐릭터 링크가 노출 되어야 한다').toBeVisible();
    await expect(this.themeToggleButton, '테마 토글 버튼이 노출 되어야 한다').toBeVisible();
    return this;
  }

  async clickHomeLink(): Promise<this> {
    await this.homeLink.click();
    return this;
  }

  async clickCharacterLink(): Promise<this> {
    await this.characterLink.click();
    return this;
  }

  async clickUnionLink(): Promise<this> {
    await this.unionLink.click();
    return this;
  }

  async clickHomeLinkAndExpectLandingUrl(): Promise<this> {
    await Promise.all([
      this.page.waitForURL(/\/(index\.html)?\/?$/),
      this.homeLink.click(),
    ]);
    await expect(
      this.page,
      '홈 링크 클릭 후 홈 페이지 정상 이동 되어야 한다'
    ).toHaveURL(/\/(index\.html)?\/?$/);
    return this;
  }

  async clickUnionLinkAndExpectUnionUrl(nickname: string): Promise<this> {
    const nameParam = encodeURIComponent(nickname);
    const urlPattern = new RegExp(`/union\\.html\\?name=${nameParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    await Promise.all([this.page.waitForURL(urlPattern), this.unionLink.click()]);
    await expect(this.page, '유니온 링크 클릭 후 유니온 페이지로 이동되어야 한다').toHaveURL(
      urlPattern
    );
    return this;
  }

  async clickCharacterLinkAndExpectCharacterUrl(nickname: string): Promise<this> {
    const nameParam = encodeURIComponent(nickname);
    const urlPattern = new RegExp(
      `/character\\.html\\?name=${nameParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
    );
    await Promise.all([this.page.waitForURL(urlPattern), this.characterNavLink.click()]);
    await expect(this.page, '캐릭터 링크 클릭 후 캐릭터 상세 페이지로 이동되어야 한다').toHaveURL(
      urlPattern
    );
    return this;
  }

  async expectUnionLinkFor(nickname: string): Promise<this> {
    await expect(this.unionLink, '유니온 링크가 캐릭터 닉네임을 포함해야 한다').toHaveAttribute(
      'href',
      `union.html?name=${encodeURIComponent(nickname)}`
    );
    return this;
  }

}
