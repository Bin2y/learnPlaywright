import type { Page } from '@playwright/test';

/**
 * 앱 UI 로케이터 단일 정의.
 * 문구 및 역할이 바뀌면 이 파일만 수정하면 된다.
 */

export function nicknameInput(page: Page) {
  return page.getByRole('textbox', { name: '캐릭터 닉네임 입력' });
}

export function searchButton(page: Page) {
  return page.getByRole('button', { name: '조회' });
}

//조회 후 상단 탭 영역
export function characterDetailTablist(page: Page) {
  return page.getByRole('tablist', { name: '캐릭터 상세 정보' });
}

export function tabCharacterInfo(page: Page) {
  return page.getByRole('tab', { name: '캐릭터 정보' });
}

export function tabEquipment(page: Page) {
  return page.getByRole('tab', { name: '장비' });
}

export function tabStats(page: Page) {
  return page.getByRole('tab', { name: '스탯' });
}

//장비 탭 패널 (`hidden` 유지인 경우가 있어 테스트에서는 `toBeVisible` 대신 `toBeAttached` 등으로 판단)
export function equipmentPanel(page: Page) {
  return page.locator('#panelEquipment');
}

//상세 화면 h1 (예: "팡이 Lv. 285")
export function characterMainHeading(page: Page, nickname: string) {
  return page.getByRole('heading', { level: 1 }).filter({ hasText: nickname });
}

//API/데이터 오류 시 상세 탭 패널 내 alert
export function loadErrorAlert(page: Page) {
  return page.getByRole('alert').filter({ hasText: '정보를 불러올 수 없습니다.' });
}

export function backToSearchLink(page: Page) {
  return page.getByRole('link', { name: /다른 캐릭터 조회/ });
}
