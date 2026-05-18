import type { Page } from '@playwright/test';

import { CharacterPage } from './pages/CharacterPage';
import { HomePage } from './pages/HomePage';
import { UnionPage } from './pages/UnionPage';

export async function openAnyCharacterDetailWithEquipment(
  page: Page,
  candidates: string[]
): Promise<string | null> {
  const characterPage = new CharacterPage(page);

  for (const nickname of candidates) {
    // console.log(`[SmokeLookup] 장비 탭 가능 후보 확인: ${nickname}`);
    await characterPage.gotoByNickname(nickname);
    if (!(await characterPage.isLoaded())) {
      continue;
    }

    try {
      await characterPage.expectLoaded(nickname);
      await characterPage.openEquipmentTab();
      await characterPage.expectEquipmentTabReady();
      await characterPage.openStatsTab();
      await characterPage.expectStatsTabReady();
      return nickname;
    } catch {
      // console.log(`[SmokeLookup] character.html 필수 구조 검증 실패 후보 제외: ${nickname}`);
    }
  }

  return null;
}

//조회 시 어떤 방식으로 조회할지 선택하는 타입 변수
type LandingSearchMode = 'enter' | 'click';

export async function openAnyCharacterDetailFromLanding(
  page: Page,
  candidates: string[],
  mode: LandingSearchMode = 'enter'
): Promise<string | null> {
  const home = new HomePage(page);

  for (const nickname of candidates) {
    await home.goto();
    await home.expectAppReady();

    if (mode === 'enter') {
      await home.searchFromLandingByEnter(nickname);
    } else {
      await home.searchFromLandingByClick(nickname);
    }

    await page.waitForURL(/character(?:_notFound)?\.html\?name=/);

    const characterPage = new CharacterPage(page);
    if (await characterPage.isLoaded()) {
      await characterPage.expectLoaded(nickname);
      return nickname;
    }
  }
  return null;
}


/** 유니온 페이지에서 기본·아티팩트·챔피언 탭을 모두 검증 가능한 닉네임 해상 */
export async function openAnyUnionDetailWithTabs(page: Page, candidates: string[]): Promise<string | null> {
  const unionPage = new UnionPage(page);

  for (const nickname of candidates) {
    // console.log(`[SmokeLookup] 유니온 탭 후보 확인: ${nickname}`);
    await unionPage.gotoByNickname(nickname);
    if (!(await unionPage.isLoaded())) {
      continue;
    }

    try {
      await unionPage.expectLoaded(nickname);
      await unionPage.openArtifactTab();
      await unionPage.expectArtifactTabReady();
      await page.waitForResponse(
        (res) => res.url().includes('/api/character/union-artifact'),
        { timeout: 120_000 }
      );
      await unionPage.openChampionTab();
      await unionPage.expectChampionTabReady();
      await page.waitForResponse(
        (res) => res.url().includes('/api/character/union-champion'),
        { timeout: 120_000 }
      );
      return nickname;
    } catch {
      // console.log(`[SmokeLookup] union.html 필수 구조 검증 실패 후보 제외: ${nickname}`);
    }
  }

  return null;
}
