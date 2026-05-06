import { test } from '@playwright/test';
import { HomePage } from './pages/HomePage';


test.describe('@UI 홈페이지 상단 컴포넌트트', () => {
    test.beforeEach(async ({ page }) => {
        const home = new HomePage(page);
        await home.goto();
        await home.expectAppReady();
    });

    test('eyebrow 컴포넌트 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectEyebrowVisible();
    });

    test('title 컴포넌트 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectMainTitleVisible();
    });
    
    test('description 컴포넌트 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectPageDecriptionVisible();
    });

    test('빠른 조회 섹션 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectQuickSearchSectionVisible();
    });

    test('최근 조회 목록 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectRecentSearchGroupVisible();
    });
    
    test('즐겨찾기 목록 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectFavoriteSearchGroupVisible();
    });

    test('공지사항 목록 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectNoticeGroupVisible();
    });

    test('이벤트 목록 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectEventGroupVisible();
    });
    
    test('업데이트 목록 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectUpdateGroupVisible();
    });
});