import { test, expect } from '@playwright/test';

test('首页在手机、平板和桌面保持可读布局', async ({ page }) => {
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(
      page.getByRole('navigation', { name: '网站导航' }),
    ).toBeVisible();
    await expect(page.locator('.topic-cover').first()).toBeVisible();
    const cover = await page.locator('.topic-cover').first().boundingBox();
    const content = await page.locator('.card-content').first().boundingBox();
    expect(cover).not.toBeNull();
    expect(content).not.toBeNull();
    if (width <= 720) {
      expect(content!.y).toBeGreaterThanOrEqual(cover!.y + cover!.height);
    } else {
      expect(content!.x).toBeGreaterThanOrEqual(cover!.x + cover!.width);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test('首页进入主题，主题导航保持独立', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '先有问题',
  );
  await page.locator('.topic-card').first().click();
  await expect(page).toHaveURL('/learning-method/');
  const links = page
    .getByRole('navigation', { name: '主题内导航' })
    .getByRole('link');
  await expect(links).toHaveCount(4);
  for (const href of await links.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('href')),
  )) {
    expect(href).toMatch(/^\/learning-method\//);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('导图绘制成功，文字源稿可以展开', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/learning-method/mindmap/');
  await expect(page.locator('.mindmap svg')).toBeVisible({ timeout: 30000 });
  await page.getByText('查看导图文字源稿', { exact: true }).click();
  await expect(page.locator('.mindmap pre')).toContainText('一个好奇的问题');
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('复习交互提供反馈，刷新后不保留输入', async ({ page }) => {
  await page.goto('/learning-method/practice/');
  await page.getByRole('button', { name: '整理复习线索' }).click();
  await expect(page.locator('output')).toContainText('先写下一个');
  await page
    .getByLabel('我的理解')
    .fill('问题在前，概念是为了解决问题才出现的。');
  await page.getByRole('button', { name: '整理复习线索' }).click();
  await expect(page.locator('output')).toContainText('现在展开提示');
  await page.reload();
  await expect(page.getByLabel('我的理解')).toHaveValue('');
});

test('未知路径返回真正的 404，缺少尾斜杠会规范化', async ({
  page,
  request,
}) => {
  const response = await page.goto('/does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '还没有留下脚印',
  );
  const redirect = await request.get('/learning-method', { maxRedirects: 0 });
  expect([301, 307, 308]).toContain(redirect.status());
  expect(redirect.headers().location).toBe('/learning-method/');
});

test('禁用脚本时笔记与导图源稿仍可阅读', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8787/learning-method/mindmap/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('思维导图');
  await expect(page.locator('pre code')).toContainText('一个好奇的问题');
  await context.close();
});
