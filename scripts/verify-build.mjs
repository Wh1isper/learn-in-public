import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

const root = resolve('dist');
const pages = new Map();
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await visit(path);
    else if (entry.name.endsWith('.html')) {
      const key = '/' + relative(root, path).replace(/index\.html$/, '');
      pages.set(key, load(await readFile(path, 'utf8')));
    }
  }
}
await visit(root);
assert(pages.has('/'), '缺少首页');
assert(pages.has('/404.html'), '缺少 404 页面');

for (const [path, $] of pages) {
  assert.equal($('html').attr('lang'), 'zh-CN', `${path} 缺少中文语言声明`);
  assert.equal($('h1').length, 1, `${path} 应只有一个一级标题`);
  assert($('main#main').length, `${path} 缺少主内容区`);
  const topic = $('.topic-sidebar').length ? path.split('/')[1] : undefined;
  for (const element of $('[href], [src]').toArray()) {
    const raw = $(element).attr('href') ?? $(element).attr('src');
    if (!raw || /^(mailto:|tel:|data:)/.test(raw)) continue;
    const url = new URL(raw, `https://learn.wh1isper.top${path}`);
    if (url.origin !== 'https://learn.wh1isper.top') continue;
    const targetPath = decodeURIComponent(url.pathname);
    assert(
      !targetPath.endsWith('.md'),
      `${path} 误链接到未发布的 Markdown：${raw}`,
    );
    if (
      topic &&
      $(element).closest('article, nav').length &&
      $(element).is('a')
    ) {
      assert(
        targetPath.startsWith(`/${topic}/`),
        `${path} 不得引用其他主题：${raw}`,
      );
    }
    const target = pages.get(targetPath);
    if (target) {
      if (url.hash) {
        const id = decodeURIComponent(url.hash.slice(1));
        assert(
          target('[id]')
            .toArray()
            .some((element) => target(element).attr('id') === id),
          `${path} 的锚点不存在：${raw}`,
        );
      }
    } else {
      const file = resolve(root, '.' + targetPath);
      assert(file.startsWith(root + '/'), `资源路径越界：${raw}`);
      assert(
        (await stat(file).catch(() => null))?.isFile(),
        `${path} 的本地链接不存在：${raw}`,
      );
    }
  }
}
console.log(
  `已检查 ${pages.size} 个页面：中文声明、标题、内部链接、锚点、静态资源与主题边界均通过。`,
);
