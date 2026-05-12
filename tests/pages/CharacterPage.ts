import { expect, type Locator, type Page } from '@playwright/test';

import { AppHeader } from './components/AppHeader';

const APP_READY_MS = 120_000;

export class CharacterPage {
  readonly header: AppHeader;

  constructor(private readonly page: Page) {
    this.header = new AppHeader(page);
  }

  private get backToSearchLink() {
    return this.page.getByRole('link', { name: /다른 캐릭터 조회/ });
  }

  private get shareButton() {
    return this.page.getByRole('button', { name: '공유' });
  }

  private get favoriteButton() {
    return this.page.getByRole('button', { name: '즐겨찾기 추가' });
  }

  private get unionInfoLink() {
    return this.page.getByRole('link', { name: '유니온 정보 보기' });
  }

  private get detailTablist() {
    return this.page.getByRole('tablist', { name: '캐릭터 상세 정보' });
  }

  private get infoTab() {
    return this.page.getByRole('tab', { name: '캐릭터 정보' });
  }

  private get equipmentTab() {
    return this.page.getByRole('tab', { name: '장비' });
  }

  private get statsTab() {
    return this.page.getByRole('tab', { name: '스탯' });
  }

  private get equipmentSearchBox() {
    return this.page.getByRole('searchbox', { name: '장비 이름/부위 검색' });
  }

  private get equipmentCards() {
    return this.page.getByRole('button', { name: '장비 상세 보기' });
  }

  private get optionDetailHeading() {
    return this.page.getByRole('heading', { name: '옵션 상세' });
  }

  private get optionDetailPlaceholder() {
    return this.page.getByText('장비 카드를 클릭하면 여기에서 상세 옵션을 볼 수 있습니다.');
  }

  private characterHeading(nickname: string) {
    return this.page.getByRole('heading', { level: 1 }).filter({ hasText: nickname });
  }

  private characterImage(nickname: string) {
    return this.page.getByRole('img', { name: nickname });
  }

  async expectAppReady(): Promise<this> {
    await this.infoTab.waitFor({
      state: 'visible',
      timeout: APP_READY_MS,
    });
    return this;
  }

  async gotoByNickname(nickname: string): Promise<this> {
    // console.log(`[CharacterPage] 캐릭터 상세 직접 진입: ${nickname}`);
    await this.page.goto(`/character.html?name=${encodeURIComponent(nickname)}`);
    await this.page.waitForURL(/character(?:_notFound)?\.html\?name=/);
    return this;
  }

  async isLoaded(): Promise<boolean> {
    if (this.page.url().includes('character_notFound.html')) {
      return false;
    }
    return await this.detailTablist.isVisible();
  }

  async expectLoaded(nickname: string): Promise<this> {
    // console.log(`[CharacterPage] 상세 페이지 로드 검증: ${nickname}`);
    await expect(this.page, '캐릭터 상세 페이지 URL이어야 한다').toHaveURL(/\/character\.html\?name=/);
    await expect(this.characterHeading(nickname), '상단 h1에 닉네임이 포함되어야 한다').toBeVisible();
    await expect(
      this.page.getByRole('heading', { level: 1 }).filter({ hasText: 'Lv.' }),
      '상단 h1에 레벨 정보가 포함되어야 한다'
    ).toBeVisible();
    await expect(this.detailTablist, '캐릭터 상세 정보 탭리스트가 보여야 한다').toBeVisible();
    await expect(this.infoTab, '기본 선택 탭은 캐릭터 정보여야 한다').toHaveAttribute(
      'aria-selected',
      'true'
    );
    return this;
  }

  async expectHeaderActionsVisible(nickname: string): Promise<this> {
    // console.log('[CharacterPage] 상단 액션 및 링크 검증');
    await this.header.expectHeaderVisible();
    await this.header.expectUnionLinkFor(nickname);
    await expect(this.backToSearchLink, '다른 캐릭터 조회 링크가 보여야 한다').toBeVisible();
    await expect(this.backToSearchLink, '다른 캐릭터 조회 링크는 index.html로 연결되어야 한다').toHaveAttribute(
      'href',
      'index.html'
    );
    await expect(this.shareButton, '공유 버튼이 보여야 한다').toBeVisible();
    await expect(this.shareButton, '공유 버튼이 활성화되어야 한다').toBeEnabled();
    await expect(this.favoriteButton, '즐겨찾기 추가 버튼이 보여야 한다').toBeVisible();
    await expect(this.favoriteButton, '즐겨찾기 추가 버튼이 활성화되어야 한다').toBeEnabled();
    await expect(this.unionInfoLink, '유니온 정보 보기 링크가 보여야 한다').toBeVisible();
    await expect(this.unionInfoLink, '유니온 정보 보기 링크는 닉네임을 포함해야 한다').toHaveAttribute(
      'href',
      `union.html?name=${encodeURIComponent(nickname)}`
    );
    return this;
  }

  async openInfoTab(): Promise<this> {
    // console.log('[CharacterPage] 캐릭터 정보 탭 열기');
    await this.infoTab.click();
    await expect(this.infoTab, '캐릭터 정보 탭이 선택되어야 한다').toHaveAttribute('aria-selected', 'true');
    return this;
  }

  async openEquipmentTab(): Promise<this> {
    // console.log('[CharacterPage] 장비 탭 열기');
    await this.equipmentTab.click();
    if (!(await this.equipmentSearchBox.isVisible())) {
      await this.equipmentTab.press('Enter');
    }
    // 현재 앱은 장비 상위 탭의 aria-selected를 갱신하지 않는 경우가 있어
    // 실제 전환 신호인 장비 검색창 노출을 주 검증으로 사용한다.
    await expect(this.equipmentSearchBox, '장비 탭 클릭 후 장비 검색창이 보여야 한다').toBeVisible();
    return this;
  }

  async openStatsTab(): Promise<this> {
    // console.log('[CharacterPage] 스탯 탭 열기');
    await this.statsTab.click();
    if (!(await this.page.getByText('전투력', { exact: true }).isVisible())) {
      await this.openEquipmentTab();
      await this.statsTab.click();
    }
    if (!(await this.page.getByText('전투력', { exact: true }).isVisible())) {
      await this.statsTab.press('Enter');
    }
    await expect(this.page.getByText('전투력', { exact: true }), '스탯 탭 클릭 후 전투력 항목이 보여야 한다').toBeVisible();
    return this;
  }

  async expectInfoTabReady(nickname: string): Promise<this> {
    // console.log('[CharacterPage] 캐릭터 정보 탭 내용 검증');
    await expect(this.characterImage(nickname), '캐릭터 이미지의 접근성 이름은 닉네임이어야 한다').toBeVisible();
    await expect(this.page.getByRole('heading', { name: '상세 정보' }), '상세 정보 heading이 보여야 한다').toBeVisible();
    for (const label of ['월드', '직업', '성별', '길드', '데이터 기준일']) {
      await expect(this.page.getByText(label, { exact: true }), `${label} 항목이 보여야 한다`).toBeVisible();
    }
    return this;
  }

  async expectEquipmentTabReady(): Promise<this> {
    // console.log('[CharacterPage] 장비 탭 내용 검증');
    await expect(this.equipmentSearchBox, '장비 검색창이 보여야 한다').toBeVisible();
    await expect(this.page.getByRole('heading', { name: '칭호' }), '칭호 영역이 보여야 한다').toBeVisible();
    await expect(this.page.getByRole('heading', { name: '장비' }), '장비 heading이 보여야 한다').toBeVisible();
    await expect(this.optionDetailHeading, '옵션 상세 영역 heading이 보여야 한다').toBeVisible();
    await expect(this.optionDetailPlaceholder, '옵션 상세 초기 안내 문구가 보여야 한다').toBeVisible();

    for (const preset of ['현재 장착', '프리셋 1', '프리셋 2', '프리셋 3']) {
      await expect(
        this.page.getByRole('tab', { name: preset }),
        `${preset} 장비 프리셋 탭이 보여야 한다`
      ).toBeVisible();
    }

    const cardCount = await this.equipmentCards.count();
    expect(cardCount, '장비 상세 보기 카드가 1개 이상 있어야 한다').toBeGreaterThan(0);
    return this;
  }

  async searchEquipment(keyword: string): Promise<this> {
    // console.log(`[CharacterPage] 장비 검색: ${keyword}`);
    await this.equipmentSearchBox.fill(keyword);
    await expect(this.equipmentSearchBox, '장비 검색어가 입력창에 유지되어야 한다').toHaveValue(keyword);
    return this;
  }

  async openFirstEquipmentDetail(): Promise<this> {
    // console.log('[CharacterPage] 첫 번째 장비 카드 상세 열기');
    const firstCard = this.equipmentCards.first();
    await expect(firstCard, '첫 번째 장비 카드가 보여야 한다').toBeVisible();
    await firstCard.click();
    await expect(this.optionDetailHeading, '장비 상세 클릭 후에도 옵션 상세 영역이 유지되어야 한다').toBeVisible();
    return this;
  }

  async expectStatsTabReady(): Promise<this> {
    // console.log('[CharacterPage] 스탯 탭 내용 검증');
    await expect(this.page.getByText('전투력', { exact: true }), '전투력 항목이 보여야 한다').toBeVisible();
    await expect(this.page.getByText('주스탯:'), '주스탯 항목이 보여야 한다').toBeVisible();

    for (const groupName of ['공격 / 마력', '기본 스탯', '데미지', '크리티컬', '방어 / 기타', '이동', '포스']) {
      await expect(this.statGroup(groupName), `${groupName} 스탯 그룹이 보여야 한다`).toBeVisible();
    }
    return this;
  }

  /** API·검증 오류로 상세 데이터를 못 불러온 경우의 alert */
  async expectLoadErrorAlert(options?: { timeout?: number }): Promise<this> {
    const timeout = options?.timeout ?? 60_000;
    await expect(
      this.page.getByRole('alert').filter({ hasText: '정보를 불러올 수 없습니다.' }),
      '로드 실패 시 안내 alert가 보여야 한다'
    ).toBeVisible({ timeout });
    return this;
  }

  private statGroup(name: string): Locator {
    return this.page.getByRole('group').filter({ hasText: name }).first();
  }
}
