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
//타이틀 컴포넌트
  private get eyebrow() {
    return this.page.getByText('NEXON OPEN API');
  }

  private get mainTitle() {
    return this.page.getByRole('heading', { name: '메이플 캐릭터 · 장비 조회' });
  }

  private get pageDecription() {
    return this.page.getByText('닉네임으로 기본 정보·장비·스탯을 빠르게 확인합니다')
  }

//닉네임 조회 컴포넌트
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

  //빠른조회 섹션
  private get quickSearchSection() {
    return this.page.getByRole('region', { name: '빠른 조회' });
  }

  private get recentSearchGroup() {
    const group = this.quickSearchSection
    return group.getByRole('heading', { name: '최근 조회', level: 2 }).locator('..');
  }

  private get favoriteSearchGroup() {  
    const group = this.quickSearchSection
    return group.getByRole('heading', { name: '즐겨찾기', level: 2 }).locator('..');
  }

  //공지사항 이벤트 섹션
  private get noticeGroup() {
    return this.page.getByRole('region', { name: '공지사항' });
  }

  private get noticeToggleBtn() {
    return this.noticeGroup.getByRole('button', { name: '펼치기' });
  }

  private get eventGroup() {
    return this.page.getByRole('region', { name: '이벤트' })
  }

  private get eventToggleBtn() {
    return this.eventGroup.getByRole('button', { name: '펼치기' });
  }

  private get updateGroup() {
    return this.page.getByRole('region', { name: '업데이트' })
  }

  async goto(): Promise<this> {
    // console.log('[HomePage] 랜딩 진입');
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
  
  //상단 텍스트 컴포넌트 노출
  async expectEyebrowVisible(): Promise<this> {
    await expect(this.eyebrow, 'eyebrow 컴포넌트가 노출되어야 한다').toBeVisible();
    return this;
  }

  async expectMainTitleVisible(): Promise<this> {
    await expect(this.mainTitle, 'mainTitle 컴포넌트가 노출되어야 한다').toBeVisible();
    return this;
  }

  async expectPageDecriptionVisible(): Promise<this> {
    await expect(this.pageDecription, 'pageDecription 컴포넌트가 노출되어야 한다').toBeVisible();
    return this;
  }

  //빠른 조회 섹션 노출 확인
  async expectQuickSearchSectionVisible(): Promise<this> {
    await expect(this.quickSearchSection, '빠른 조회 섹션이 노출되어야 한다').toBeVisible();
    return this;
  }

  async expectRecentSearchGroupVisible(): Promise<this> {
    await expect(this.recentSearchGroup, '최근 조회 목록이 노출되어야 한다').toBeVisible();
    return this;
  }
  
  async expectFavoriteSearchGroupVisible(): Promise<this> {
    await expect(this.favoriteSearchGroup, '즐겨찾기 목록이 노출되어야 한다').toBeVisible();
    return this;
  }

  //공지사항, 이벤트, 업데이트 영역
  async expectNoticeGroupVisible(): Promise<this> {
    await expect(this.noticeGroup, '공지사항 목록이 노출되어야 한다').toBeVisible();
    return this;
  }

  async expectNoticeToggleBtnVisible(): Promise<this> {
    await expect(this.noticeToggleBtn, '공지사항 토글 버튼이 노출되어야 한다').toBeVisible();
    return this;
  }

  async expectEventGroupVisible(): Promise<this> {
    await expect(this.eventGroup, '이벤트 목록이 노출되어야 한다').toBeVisible();
    return this;
  } 

  async expectEventToggleBtnVisible(): Promise<this> {
    await expect(this.eventToggleBtn, '이벤트 토글 버튼이 노출되어야 한다').toBeVisible();
    return this;
  }

  async expectUpdateGroupVisible(): Promise<this> {
    await expect(this.updateGroup, '업데이트 목록이 노출되어야 한다').toBeVisible();
    return this;
  }

  //공지사항&이벤트 롤링 확인
  async expectNoticeTrackMoves(): Promise<this> {
    const track = this.page.locator('#noticeTrack');
    await expect(track, '공지사항 롤링 트랙이 보여야 한다').toBeVisible();
    const before = await track.evaluate((el) => getComputedStyle(el).transform);
    await expect
      .poll(
        async () => track.evaluate((el) => getComputedStyle(el).transform),
        {
          timeout: 15_000,
          intervals: [500, 1000, 1500],
          message: '공지사항 롤링 트랙 transform 값이 변경되어야 한다',
        }
      )
      .not.toBe(before);
    return this;
  }
  async expectEventTrackMoves(): Promise<this> {
    const track = this.page.locator('#noticeEventTrack');
    await expect(track, '이벤트 롤링 트랙이 보여야 한다').toBeVisible();
    const before = await track.evaluate((el) => getComputedStyle(el).transform);
    await expect
      .poll(
        async () => track.evaluate((el) => getComputedStyle(el).transform),
        {
          timeout: 15_000,
          intervals: [500, 1000, 1500],
          message: '이벤트 롤링 트랙 transform 값이 변경되어야 한다',
        }
      )
      .not.toBe(before);
    return this;
  }


  async expectEmptySearchState(): Promise<this> {
    // console.log('[HomePage] 조회 전 초기 상태 검증');
    await expect(this.nicknameField, '닉네임 입력창이 노출되어야 한다').toBeVisible();
    await expect(this.nicknameField, '닉네임 입력창은 비어 있어야 한다').toBeEmpty();
    await expect(this.nicknameField, '닉네임 입력창은 편집 가능해야 한다').toBeEditable();
    await expect(this.searchSubmitButton, '조회 버튼이 노출되어야 한다').toBeVisible();
    await expect(this.characterDetailTablist, '상세 탭 리스트는 미노출되어야야 한다').not.toBeVisible();
    await expect(this.backToSearchLink, '다른 캐릭터 조회 링크는 미노출되어야 한다').not.toBeVisible();
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
    // console.log(`[HomePage] 랜딩에서 조회(Enter): ${nickname}`);
    await this.fillNickname(nickname);
    await this.submitSearchWithEnter();
    return this;
  }

  async expectNicknameInlinePromptVisible(): Promise<this> {
    await expect(this.page.getByText('닉네임을 입력하세요.'), '빈 입력 안내 문구가 노출되어야 한다').toBeVisible();
    return this;
  }

  async expectToastShows(message: string): Promise<this> {
    const toast = this.page.locator('#appToast');
    await expect(toast, '토스트가 표시되어야 한다').toBeVisible({ timeout: 3000 });
    await expect(toast, '토스트 문구가 기대와 일치해야 한다').toHaveText(message);
    return this;
  }
}
