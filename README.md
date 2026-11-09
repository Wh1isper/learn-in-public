# 公开学习

从知识的由来出发，重走探索的道路。以理解与欣赏原理之美为目标，允许好奇自然发散，并及时留下学习笔记和思维导图。

网站：<https://learn.wh1isper.top/>

## 内容与目录

| 路径                              | 职责                                        |
| --------------------------------- | ------------------------------------------- |
| `AGENTS.md`                       | 学习方式、中文约定、主题边界与更新发布规则  |
| `topics/<主题标识>/index.md`      | 某个主题的独立入口，对应 `/<主题标识>/`     |
| `topics/<主题标识>/**/*.md`       | 该主题的笔记、导图、疑问与资料              |
| `topics/<主题标识>/demos/*.astro` | 该主题自己的交互演示                        |
| `src/`                            | 共享的网站布局、路由和样式，不存放学科知识  |
| `scripts/`、`tests/`              | 构建检查、主题边界检查、浏览器与线上验证    |
| `docs/`                           | 网站维护和部署文档                          |
| `.github/workflows/site.yml`      | 自动检查与发布流程                          |
| `wrangler.jsonc`                  | Cloudflare Worker、静态资源与自定义域名配置 |

每个主题自足，不跨主题引用内容或导入代码。首页只是主题目录，进入主题后只呈现当前主题的导航。

## 本地运行

使用 Node.js 24：

```bash
npm ci
npm run dev
```

开发地址为 `http://127.0.0.1:4321/`。

```bash
npm run verify
npx playwright install chromium
npx playwright test
```

`verify` 执行类型检查、路由单元测试、静态构建及内部链接、锚点和主题边界检查。浏览器测试通过本地 Wrangler 运行实际的静态资源配置，覆盖桌面、手机、导图绘制、交互演示、无脚本阅读与 404 响应。

## 新增主题

在 `topics/` 下创建独立目录，主题与文件标识使用小写英文、数字和连字符，以形成稳定的网址；所有面向人的内容使用中文。

入口 `index.md`：

```markdown
---
title: 主题的中文名称
description: 从哪个具体问题开始探索。
order: 0
---

## 最初的问题

从现象、困惑或需要开始，逐步展开探索。
```

其他 Markdown 文件同样需要 `title`、`description`，通过 `order` 决定主题内导航的顺序。`notes.md` 对应 `/<主题标识>/notes/`，嵌套文件也按目录形成路径；所有主题必须有 `index.md`。

- 内容内的站内链接使用当前主题的发布路径，例如 `/learning-method/notes/`，不要链接 `.md` 源文件。
- 图片放在当前主题目录并用相对路径引用，由 Astro 处理。
- 思维导图直接写为 Markdown 中的 `mermaid` 代码块；网页按需加载绘图代码，同时保留可展开的文字源稿。
- 交互页面在 Markdown 头部设置 `demo: recall`，即可加载同一主题下的 `demos/recall.astro`，不另存文字副本。
- 当前的“我们怎样学习”主题记录本仓库的学习约定；具体学科主题在出现真实问题时再创建。

## 发布

每次完成更新后，检查、提交并推送 `main`。GitHub Actions 检查通过后，自动部署至 Cloudflare Worker `learn-in-public`，绑定 `learn.wh1isper.top`。

学习文字以 Markdown 为唯一内容源；浏览器交互输入不会自动保存进笔记。密钥只保存在 GitHub Actions Secrets 或本地环境变量中。

部署权限、手动发布及故障排查见 [部署说明](docs/部署说明.md)。
