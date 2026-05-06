import type { Page } from '@playwright/test';

import { CharacterPage } from './pages/CharacterPage';

/**
 * 호스팅 환경에서 닉네임별로 400/429 응답 편차가 있어,
 * 후보를 순회하며 실제 상세 탭이 뜨는 닉네임 하나를 찾는다.
 */
export async function openAnyCharacterDetail(
  page: Page,
  candidates: string[]
): Promise<string | null> {
  const characterPage = new CharacterPage(page);

  for (const nickname of candidates) {
    console.log(`[SmokeLookup] 상세 진입 후보 확인: ${nickname}`);
    await characterPage.gotoByNickname(nickname);
    if (await characterPage.isLoaded()) {
      await characterPage.expectLoaded(nickname);
      return nickname;
    }
  }

  return null;
}

export async function openAnyCharacterDetailWithEquipment(
  page: Page,
  candidates: string[]
): Promise<string | null> {
  const characterPage = new CharacterPage(page);

  for (const nickname of candidates) {
    console.log(`[SmokeLookup] 장비 탭 가능 후보 확인: ${nickname}`);
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
      console.log(`[SmokeLookup] character.html 필수 구조 검증 실패 후보 제외: ${nickname}`);
    }
  }

  return null;
}

/**
 * 이미 확정된 닉네임으로 상세 페이지에 단건 진입한다.
 * (후보 순회 로직 없이 1회 호출)
 */
export async function openCharacterDetailByNickname(
  page: Page,
  nickname: string
): Promise<boolean> {
  console.log(`[SmokeLookup] 확정 닉네임 단건 진입: ${nickname}`);
  const characterPage = new CharacterPage(page);
  await characterPage.gotoByNickname(nickname);
  if (!(await characterPage.isLoaded())) {
    return false;
  }

  await characterPage.expectLoaded(nickname);
  return true;
}
