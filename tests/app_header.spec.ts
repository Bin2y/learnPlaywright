import { test, type Page } from '@playwright/test';

import { NICKNAME_LIST } from './nickname_lookup.data';
import { CharacterPage } from './pages/CharacterPage';
import { HomePage } from './pages/HomePage';
import { UnionPage } from './pages/UnionPage';
import {
  openAnyCharacterDetailFromLanding,
  openAnyUnionDetailWithTabs,
} from './smoke_lookup';

const NICKNAME_CANDIDATES = NICKNAME_LIST.slice(0, 5);

/** 헤더·네비게이션용 — 상세 전체 로드 검증 없이 탭리스트·헤더만 확인 */
async function openAnyCharacterForHeader(
  page: Page,
  candidates: string[]
): Promise<string | null> {
  const characterPage = new CharacterPage(page);

  for (const nickname of candidates) {
    await characterPage.gotoByNickname(nickname);
    if (!(await characterPage.isLoaded())) {
      continue;
    }

    try {
      await characterPage.header.expectCharacterDetailHeaderVisible();
      return nickname;
    } catch {
      // 다음 후보
    }
  }

  return null;
}

test.describe('@UI 헤더 — 랜딩', () => {
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAppReady();
  });

  test('랜딩 헤더 — 브랜드·홈·테마 노출', async ({ page }) => {
    const home = new HomePage(page);

    await test.step('랜딩 헤더 요소 노출 확인', async () => {
      await home.header.expectLandingHeaderVisible();
    });
  });
});

test.describe('@UI 헤더 — 캐릭터 상세', () => {
  test.setTimeout(90_000);

  let resolvedNickname: string | null = null;

  test.beforeEach(async ({ page }) => {
    resolvedNickname = await openAnyCharacterDetailFromLanding(page, NICKNAME_CANDIDATES);
    test.skip(!resolvedNickname, '상세 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');
  });

  test('캐릭터 상세 헤더 — 유니온 링크 노출', async ({ page }) => {
    const characterPage = new CharacterPage(page);

    await test.step('캐릭터 상세 헤더 요소 노출 확인', async () => {
      await characterPage.header.expectCharacterDetailHeaderVisible();
    });
  });

  test('캐릭터 상세 헤더 — 유니온 href 닉네임', async ({ page }) => {
    const characterPage = new CharacterPage(page);

    await test.step('유니온 링크 href에 닉네임이 포함되는지 확인', async () => {
      await characterPage.header.expectUnionLinkFor(resolvedNickname!);
    });
  });
});

test.describe('@UI 헤더 — 유니온', () => {
  test.setTimeout(90_000);

  let resolvedNickname: string | null = null;

  test.beforeEach(async ({ page }) => {
    resolvedNickname = await openAnyUnionDetailWithTabs(page, NICKNAME_CANDIDATES);
    test.skip(!resolvedNickname, '유니온 페이지를 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');
  });

  test('유니온 페이지 헤더 — 캐릭터 링크 노출', async ({ page }) => {
    const unionPage = new UnionPage(page);

    await test.step('유니온 컨텍스트 헤더 요소 노출 확인', async () => {
      await unionPage.header.expectUnionPageHeaderVisible();
    });
  });
});

test.describe('@UI 헤더 — 네비게이션', () => {
  test.setTimeout(90_000);

  test('홈 링크 클릭 — 랜딩 URL 이동', async ({ page }) => {
    const nickname = await openAnyCharacterForHeader(page, NICKNAME_CANDIDATES);
    test.skip(!nickname, '상세 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');

    const characterPage = new CharacterPage(page);
    const home = new HomePage(page);

    await test.step('캐릭터 상세에서 홈 링크 클릭', async () => {
      await characterPage.header.clickHomeLinkAndExpectLandingUrl();
    });

    await test.step('랜딩 UI 확인', async () => {
      await home.expectAppReady();
      await home.expectEmptySearchState();
    });
  });

  test('유니온 링크 클릭 — union.html URL 이동', async ({ page }) => {
    const nickname = await openAnyCharacterForHeader(page, NICKNAME_CANDIDATES);
    test.skip(!nickname, '상세 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');

    const characterPage = new CharacterPage(page);

    await test.step('캐릭터 상세에서 유니온 링크 클릭', async () => {
      await characterPage.header.clickUnionLinkAndExpectUnionUrl(nickname!);
    });
  });

  test('유니온 페이지 캐릭터 링크 클릭 — character.html URL 이동', async ({ page }) => {
    const nickname = await openAnyUnionDetailWithTabs(page, NICKNAME_CANDIDATES);
    test.skip(!nickname, '유니온 페이지를 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');

    const unionPage = new UnionPage(page);

    await test.step('유니온 페이지에서 캐릭터 링크 클릭', async () => {
      await unionPage.header.clickCharacterLinkAndExpectCharacterUrl(nickname!);
    });
  });
});
