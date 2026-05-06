import { test } from '@playwright/test';

import {
  collectApiResponses,
  installApiCache,
  type ApiCache,
} from './api_cache';
import { NICKNAME_LIST } from './nickname_lookup.data';
import { UnionPage } from './pages/UnionPage';
import { openAnyUnionDetailWithTabs } from './smoke_lookup';

test.describe('@smoke union.html 유니온 E2E', () => {
  test.describe.configure({ mode: 'serial' });

  const apiCache: ApiCache = new Map();
  let resolvedNickname: string | null = null;

  test.beforeAll(async ({ browser }) => {
    const candidates = NICKNAME_LIST.slice(0, 5);
    if (candidates.length === 0) return;

    const page = await browser.newPage();
    const waitForApiCache = collectApiResponses(page, apiCache);
    try {
      resolvedNickname = await openAnyUnionDetailWithTabs(page, candidates);
      await waitForApiCache();
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!resolvedNickname, '유니온 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');

    await installApiCache(page, apiCache);
    const unionPage = new UnionPage(page);
    await unionPage.gotoByNickname(resolvedNickname!);
    test.skip(!(await unionPage.isLoaded()), '확정 닉네임으로 유니온 진입 실패(외부 API 변동)');
    await unionPage.expectLoaded(resolvedNickname!);
  });

  test('유니온 페이지 로드와 기본 탭', async ({ page }) => {
    const unionPage = new UnionPage(page);
    await test.step('유니온 기본 탭 상태 확인', async () => {
      await unionPage.expectLoaded(resolvedNickname!);
    });
  });

  test('헤더와 캐릭터 복귀 링크', async ({ page }) => {
    const unionPage = new UnionPage(page);
    await test.step('유니온 헤더·캐릭터 링크 href', async () => {
      await unionPage.expectHeaderAndBackLinks(resolvedNickname!);
    });
  });

  test('아티팩트 탭', async ({ page }) => {
    const unionPage = new UnionPage(page);
    await test.step('아티팩트 탭 전환', async () => {
      await unionPage.openArtifactTab();
      await unionPage.expectArtifactTabReady();
    });
  });

  test('챔피언 탭', async ({ page }) => {
    const unionPage = new UnionPage(page);
    await test.step('챔피언 탭 전환', async () => {
      await unionPage.openChampionTab();
      await unionPage.expectChampionTabReady();
    });
  });
});
