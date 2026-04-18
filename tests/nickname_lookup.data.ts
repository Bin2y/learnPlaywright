import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

//환경 변수로 경로를 덮어쓰거나, 기본값으로 프로젝트 루트 `Data/nicknames.csv`를 사용
function resolveCsvPath(): string {
  const override = process.env.NICKNAME_CSV_PATH;
  if (override) return path.resolve(override);
  return path.join(process.cwd(), 'Data', 'nicknames.csv');
}

//CSV 한 행에서 닉네임 문자열을 꺼낸다. `nickname`/`닉네임` 컬럼이 없으면 첫 번째 컬럼 값을 쓴다
function pickNickname(row: Record<string, string>): string | undefined {
  const n = row.nickname ?? row['닉네임'];
  if (n?.trim()) return n.trim();
  const first = Object.values(row)[0];
  return first?.trim() || undefined;
}

//CSV 파일을 읽어 헤더 행을 컬럼명으로 파싱한 뒤, 유효한 닉네임만 배열로 모은다
export function loadNicknamesFromCsv(): string[] {
  const csvPath = resolveCsvPath();
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const nicknames: string[] = [];
  for (const row of records) {
    const v = pickNickname(row);
    if (v) nicknames.push(v);
  }
  return nicknames;
}

//스펙 import 시점에 한 번 로드되는 닉네임 목록(테스트 케이스 개수와 동일). 
export const NICKNAME_LIST: string[] = loadNicknamesFromCsv();
