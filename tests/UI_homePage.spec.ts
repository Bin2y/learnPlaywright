import { test } from '@playwright/test';
import { HomePage } from './pages/HomePage';


//waitForResponse 조건 함수
const isNoticeResponse = (r: import('@playwright/test').Response) => {
    const u = new URL(r.url());
    return (
      r.request().method() === 'GET' &&
      u.pathname.startsWith('/api/') &&
      /notice|공지/i.test(u.pathname) &&
      r.ok()
    );
  };
  const isEventResponse = (r: import('@playwright/test').Response) => {
    const u = new URL(r.url());
    return (
      r.request().method() === 'GET' &&
      u.pathname.startsWith('/api/') &&
      /event|이벤트/i.test(u.pathname) &&
      r.ok()
    );
  };

// 홈페이지 상단 컴포넌트 UI 확인
test.describe('@UI 홈페이지 상단 컴포넌트', () => {
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

});

// 최근 조회 목록 & 즐겨찾기 목록 UI 확인
test.describe('@UI 빠른 조회 섹션', () => {
    test.beforeEach(async ({ page }) => {
        const home = new HomePage(page);
        await home.goto();
        await home.expectAppReady();
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
});

//공지사항 & 이벤트 & 업데이트 영역 UI 확인인
test.describe('@UI notice group 섹션', () => {
    test.beforeEach(async ({ page }) => {
        const home = new HomePage(page);
        await home.goto();
        await home.expectAppReady();
    });

    test('공지사항 목록 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectNoticeGroupVisible();
    });

    test('공지사항 토글 버튼 확인', async ({ page }) => {
        const home = new HomePage(page);

        await home.expectNoticeToggleBtnVisible();
    });

    test('이벤트 목록 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectEventGroupVisible();
    });

    test('이벤트 토글 버튼 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectEventToggleBtnVisible();
    });
    
    test('업데이트 목록 노출 확인', async ({ page }) => {
        const home = new HomePage(page);
        await home.expectUpdateGroupVisible();
    });
});

//공지사항 & 이벤트 롤링 여부 확인
test.describe('@UI 공지사항/이벤트 롤링 섹션', () => {
    test.beforeEach(async ({ page }) => {
      const home = new HomePage(page);
      await Promise.all([
        page.waitForResponse(isNoticeResponse, { timeout: 30_000 }),
        page.waitForResponse(isEventResponse, { timeout: 30_000 }),
        home.goto(),
      ]);
      await home.expectAppReady();
      test.setTimeout(30_000);
    });
    test('공지사항 롤링 자동 이동 확인', async ({ page }) => {
      const home = new HomePage(page);
      await home.expectNoticeTrackMoves();
    });
    test('이벤트 롤링 자동 이동 확인', async ({ page }) => {
      const home = new HomePage(page);
      await home.expectEventTrackMoves();
    });
  });