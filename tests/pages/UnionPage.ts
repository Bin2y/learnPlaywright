import { expect, type Page } from '@playwright/test';

import { AppHeader } from './components/AppHeader';

const UNION_LOAD_MS = 120_000;

export class UnionPage {
  readonly header: AppHeader;

  constructor(private readonly page: Page) {
    this.header = new AppHeader(page);
  }

  private get unionTablist() {
    return this.page.getByRole('tablist', { name: '유니온 탭' });
  }

  private get unionInfoTab() {
    return this.page.getByRole('tab', { name: '유니온 정보' });
  }

  private get artifactTab() {
    return this.page.getByRole('tab', { name: '아티팩트' });
  }

  private get championTab() {
    return this.page.getByRole('tab', { name: '챔피언' });
  }

  private characterHeading(nickname: string) {
    return this.page.getByRole('heading', { level: 1 }).filter({ hasText: nickname });
  }

  async gotoByNickname(nickname: string): Promise<this> {
    // console.log(`[UnionPage] 유니온 직접 진입: ${nickname}`);
    await this.page.goto(`/union.html?name=${encodeURIComponent(nickname)}`);
    await this.page.waitForURL(/union\.html\?name=/);
    return this;
  }

  private async settleLoadingOverlay(): Promise<void> {
    const loading = this.page.getByText('조회 중...');
    if ((await loading.count()) > 0) {
      await loading.first().waitFor({ state: 'hidden', timeout: UNION_LOAD_MS });
    }
  }

  async isLoaded(): Promise<boolean> {
    if (!this.page.url().includes('union.html')) {
      return false;
    }
    try {
      await this.settleLoadingOverlay();
    } catch {
      return false;
    }
    return await this.unionTablist.isVisible();
  }

  async expectLoaded(nickname: string): Promise<this> {
    // console.log(`[UnionPage] 로드 검증: ${nickname}`);
    await expect(this.page, '유니온 페이지 URL이어야 한다').toHaveURL(/\/union\.html\?name=/);
    await this.settleLoadingOverlay();
    await expect(this.characterHeading(nickname), '상단에 닉네임이 포함된 제목이 노출 되어야 한다').toBeVisible();
    await expect(this.unionTablist, '유니온 탭 리스트가 노출 되어야 한다').toBeVisible();
    await expect(this.unionInfoTab, '유니온 정보 탭이 선택되어 있어야 한다').toHaveAttribute('aria-selected', 'true');
    await expect(this.page.getByRole('heading', { name: '유니온 요약' }), '유니온 요약 영역이 노출 되어야 한다').toBeVisible();
    await expect(this.page.getByRole('heading', { name: '유니온 상세' }), '유니온 상세 영역이 노출 되어야 한다').toBeVisible();
    return this;
  }

  async expectHeaderAndBackLinks(nickname: string): Promise<this> {
    await this.header.expectUnionPageHeaderVisible();
    await expect(
      this.page.getByRole('link', { name: '캐릭터', exact: true }),
      '상단 캐릭터 링크가 닉네임 쿼리로 연결되어야 한다'
    ).toHaveAttribute('href', `character.html?name=${encodeURIComponent(nickname)}`);
    await expect(
      this.page.getByRole('link', { name: /← 캐릭터 페이지로/ }),
      '캐릭터 페이지로 링크가 닉네임 쿼리로 연결되어야 한다'
    ).toHaveAttribute('href', `character.html?name=${encodeURIComponent(nickname)}`);
    return this;
  }

  async openArtifactTab(): Promise<this> {
    // console.log('[UnionPage] 아티팩트 탭 열기');
    await this.artifactTab.click();
    await expect(this.artifactTab, '아티팩트 탭이 선택되어야 한다').toHaveAttribute('aria-selected', 'true');
    return this;
  }

  async expectArtifactTabReady(): Promise<this> {
    await expect(
      this.page.getByRole('heading', { name: '유니온 아티팩트' }),
      '유니온 아티팩트 영역이 노출 되어야 한다'
    ).toBeVisible();
    return this;
  }

  async openChampionTab(): Promise<this> {
    // console.log('[UnionPage] 챔피언 탭 열기');
    await this.championTab.click();
    await expect(this.championTab, '챔피언 탭이 선택되어야 한다').toHaveAttribute('aria-selected', 'true');
    return this;
  }

  async expectChampionTabReady(): Promise<this> {
    await expect(
      this.page.getByRole('heading', { name: '유니온 챔피언' }),
      '유니온 챔피언 영역이 노출 되어야 한다'
    ).toBeVisible();
    return this;
  }
}
