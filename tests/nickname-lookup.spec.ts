import { expect, test } from '@playwright/test';

import { NICKNAME_LIST } from './nickname-lookup.data';

//CSV에 적힌 닉네임마다 동일 플로우(캐릭터 정보 + 장착 장비 UI)를 검증
test.describe('닉네임 및 장비조회', () => {
  for (const nickname of NICKNAME_LIST) {
    test(`닉네임 "${nickname}" 조회`, async ({ page }) => {
      await page.goto('/');

      //닉네임 입력 후 Enter로 조회 요청
      const input = page.getByRole('textbox', { name: '캐릭터 닉네임 입력' });
      await input.fill(nickname);
      await input.press('Enter');

      //캐릭터 기본 정보 영역에 조회 결과가 반영됐는지 확인
      await expect(page.getByRole('heading', { name: '캐릭터 기본 정보' })).toBeVisible();
      await expect(page.getByText(nickname).first()).toBeVisible();

      //장착 장비 섹션: 탭·장비 목록이 뜨고, 미조회 안내 문구는 사라져야 함
      const equipHeading = page.getByRole('heading', { name: '장착 장비' });
      await expect(equipHeading).toBeVisible();
      await expect(page.getByRole('tab', { name: '현재 장착' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '장비', exact: true })).toBeVisible();
      await expect(equipHeading.locator('..').getByText('(조회 후 표시)')).toHaveCount(0);
    });
  }
});
