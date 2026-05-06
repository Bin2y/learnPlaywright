import type { Page } from '@playwright/test';

type CachedApiResponse = {
  status: number;
  headers: Record<string, string>;
  body: Buffer;
};

export type ApiCache = Map<string, CachedApiResponse>;

function isAppApi(url: string): boolean {
  return new URL(url).pathname.startsWith('/api/');
}

function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized = { ...headers };
  delete normalized['content-encoding'];
  delete normalized['content-length'];
  delete normalized['transfer-encoding'];
  return normalized;
}

export function collectApiResponses(page: Page, cache: ApiCache): () => Promise<void> {
  const pending: Promise<void>[] = [];

  page.on('response', (response) => {
    if (!isAppApi(response.url())) return;

    pending.push(
      (async () => {
        const body = await response.body();
        cache.set(response.url(), {
          status: response.status(),
          headers: normalizeHeaders(response.headers()),
          body,
        });
      })()
    );
  });

  return async () => {
    await Promise.allSettled(pending);
  };
}

export async function installApiCache(page: Page, cache: ApiCache): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const cached = cache.get(route.request().url());
    if (!cached) {
      console.log(`[ApiCache] 캐시 없음, 실제 API 요청 허용: ${route.request().url()}`);
      await route.continue();
      return;
    }

    console.log(`[ApiCache] 캐시 응답 사용: ${route.request().url()}`);
    await route.fulfill({
      status: cached.status,
      headers: cached.headers,
      body: cached.body,
    });
  });
}
