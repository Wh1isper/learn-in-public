import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import { load } from 'cheerio';

const base = process.env.SITE_URL ?? 'https://learn.wh1isper.top';
async function check(path, expectedStatus, marker) {
  let lastError;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const response = await fetch(new URL(path, base), {
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.text();
      assert.equal(response.status, expectedStatus, `${path} 响应状态不符`);
      assert(body.includes(marker), `${path} 缺少预期内容`);
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < 7) await setTimeout(5000);
    }
  }
  throw lastError;
}
const home = load(await check('/', 200, '探索中的主题'));
for (const link of home('.topic-card').toArray()) {
  const path = home(link).attr('href');
  const page = load(await check(path, 200, '主题内导航'));
  for (const note of page('nav[aria-label="主题内导航"] a').toArray()) {
    await check(page(note).attr('href'), 200, 'zh-CN');
  }
}
await check('/__nonexistent-note__/', 404, '这里还没有留下脚印');
console.log('公开站点首页、各主题与笔记、404 响应检查通过。');
