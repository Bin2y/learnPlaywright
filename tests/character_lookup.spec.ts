import { test } from '@playwright/test';

import {
  collectApiResponses,
  installApiCache,
  type ApiCache,
} from './api_cache';
import { NICKNAME_LIST } from './nickname_lookup.data';
import { CharacterPage } from './pages/CharacterPage';
import { openAnyCharacterDetailWithEquipment } from './smoke_lookup';

test.describe('@smoke character.html 캐릭터 상세 E2E', () => {
  test.describe.configure({ mode: 'serial' });

  const apiCache: ApiCache = new Map();
  let resolvedNickname: string | null = null;

  test.beforeAll(async ({ browser }) => {
    const candidates = NICKNAME_LIST.slice(0, 5);
    if (candidates.length === 0) return;

    const page = await browser.newPage();
    const waitForApiCache = collectApiResponses(page, apiCache);
    try {
      resolvedNickname = await openAnyCharacterDetailWithEquipment(page, candidates);
      await waitForApiCache();
    } finally {
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!resolvedNickname, '상세 화면을 열 수 있는 닉네임을 찾지 못함(외부 API 변동)');

    const characterPage = new CharacterPage(page);
    await installApiCache(page, apiCache);
    await characterPage.gotoByNickname(resolvedNickname!);
    test.skip(!(await characterPage.isLoaded()), '확정 닉네임으로 상세 화면 진입 실패(외부 API 변동)');
    await characterPage.expectLoaded(resolvedNickname!);
  });

  test('상세 페이지 로드와 기본 탭 상태', async ({ page }) => {
    const characterPage = new CharacterPage(page);

    await test.step('상세 페이지가 정상 로드되었는지 확인', async () => {
      await characterPage.expectLoaded(resolvedNickname!);
    });
  });

  test('상단 액션과 공통 헤더 표시', async ({ page }) => {
    const characterPage = new CharacterPage(page);

    await test.step('헤더와 캐릭터 상단 액션이 표시되는지 확인', async () => {
      await characterPage.expectHeaderActionsVisible(resolvedNickname!);
    });
  });

  test('캐릭터 정보 탭 핵심 정보', async ({ page }) => {
    const characterPage = new CharacterPage(page);

    await test.step('캐릭터 정보 탭을 열고 핵심 항목을 확인', async () => {
      await characterPage.openInfoTab();
      await characterPage.expectInfoTabReady(resolvedNickname!);
    });
  });

  test('장비 탭 구조와 장비 카드', async ({ page }) => {
    const characterPage = new CharacterPage(page);

    await test.step('장비 탭을 열고 핵심 구조를 확인', async () => {
      await characterPage.openEquipmentTab();
      await characterPage.expectEquipmentTabReady();
    });

    await test.step('첫 번째 장비 카드 상세를 연다', async () => {
      await characterPage.openFirstEquipmentDetail();
    });
  });

  test('장비 검색 입력 유지', async ({ page }) => {
    const characterPage = new CharacterPage(page);

    await test.step('장비 탭에서 검색어를 입력하고 유지되는지 확인', async () => {
      await characterPage.openEquipmentTab();
      await characterPage.searchEquipment('무기');
    });
  });

  test('스탯 탭 핵심 그룹', async ({ page }) => {
    const characterPage = new CharacterPage(page);

    await test.step('스탯 탭을 열고 핵심 그룹을 확인', async () => {
      await characterPage.openStatsTab();
      await characterPage.expectStatsTabReady();
    });
  });
});