# GitHub Pages 部署 + Pagefind + 验证

> 部署到 GitHub Pages,build 后跑 Pagefind 索引生成,部署后用 cron + web_fetch 验证。

## Workflow

`.github/workflows/pages.yml` (用 `astro/action`):

```yaml
- name: Build
  run: npm run build

- name: Add Pagefind
  run: npx pagefind --site dist --output-subdir pagefind

- name: Deploy
  uses: actions/deploy-pages@v4
  with:
  artifact_name: github-pages
```

## Build 产物

- `dist/index.html` (zh 首页)
- `dist/en/index.html` (en 首页)
- `dist/{slug}/index.html` (每篇文章 + 分类页 + 标签页)
- `dist/_astro/*.{webp,jpg,png,css,js}` (Astro 静态资源,**hash 化命名**)
- `dist/pagefind/pagefind.js` + 索引文件

**重要**:
- **Astro hash 化资源名**:不要 hard-code 资源 URL,永远走 `<Image />` 或 `getImage()`
- **不要 `git add dist/`** — `.gitignore` 排除,deploy 由 Actions 处理

## Pagefind 索引

- **dev 模式不生成** Pagefind 索引,所以 `/search` 页在 `npm run dev` 时会 404
- **dev 模式 fallback**:UI 写代码要兼容 `/pagefind/pagefind.js` 不存在,显示静态搜索 fallback
- **CI 模式生成**:`npx pagefind --site dist --output-subdir pagefind` (post-build step)

## Deploy 验证流程

每个 wave 推完后,设个 self-reminder cron 自动验证:

```yaml
# 模板 (mavis cron self)
cron_name: W{N}-{topic}-deploy-check
every: 5m
prompt: |
  Check that GitHub Pages deploy finished successfully and changes render live.

  1. gh api repos/LyuBailin/agent-kg-hub/actions/runs?per_page=1
     - status: completed
     - conclusion: success
     - head_sha: <commit sha short> (匹配本次 commit)
  2. web_fetch https://lyubailin.github.io/agent-kg-hub/<url>/
     - 检查 og:image / hero <img> / 关键内容
  3. 如验证通过 → 删除此 cron
  4. 失败 → 输出 fail reason (保留 cron 继续监控)
```

**Key check API**: `gh api` 在 PowerShell 里要用 `$env:GH_TOKEN` (用户 profile 已设,见 [AGENTS.md](../../AGENTS.md))。

**deployments API 失效**:`gh api repos/.../pages/deployments` 返回 404,改用 `actions/runs` 看 GitHub Actions run。

## 关键文件

- `.github/workflows/pages.yml` — deploy workflow
- `src/pages/search.astro` + `src/pages/en/search.astro` — 搜索页 (Pagefind 客户端)
- `src/pages/rss.xml.ts` — RSS feed (不走 pagefind)

## Live URL 验证清单

| 检查项 | 工具 | 期望 |
|---|---|---|
| Deploy 状态 | `gh api .../actions/runs?per_page=1` | `conclusion=success` |
| 文章页 200 | `web_fetch URL` | HTML 包含 `<h1>` + hero `<img>` |
| og:image 正确 | `web_fetch URL` 后 `grep og:image` | URL 含 `cover-{slug}` 而非 `default` |
| Hero img 正确 | `web_fetch URL` 后 `grep src=` | URL 含 `cover-{slug}` |
| JSON-LD image | `web_fetch URL` 后 grep `application/ld+json` | 对象形式含 `src/width/height/format` |
| RSS feed | `web_fetch /rss.xml` | 200 + 含最新文章 |
| Sitemap | `web_fetch /sitemap-index.xml` | 200 + 列出所有页面 |

## 常见问题

| 现象 | 原因 + 解决 |
|---|---|
| Deploy 失败 "Build error" | 看 Actions log,通常是 `npm run check` 不通过 |
| 部署后页面还是旧版本 | GitHub Pages CDN 缓存,~5min 内会更新 |
| 部署后 cover 还是 default | 见 [references/images-pipeline.md §Vite glob 缓存陷阱](images-pipeline.md) |
| `/search` 404 | dev 模式无 Pagefind,生产部署后才有 |
| og:image 是 `default.png` | en 端 metadata bug,见 [references/i18n.md](i18n.md) |
| 部署成功但访问 404 | `Astro.url.pathname` 处理 base path,看 [references/astro-patterns.md §路由 base path](astro-patterns.md) |

## Cron 配置 (kebab-case only!)

`mavis cron` 工具,`cron_name` **kebab-case alphanumeric**,**no dots, no spaces**:

- ✅ `W20-cover-images-deploy-check`
- ❌ `W20.cover-images` (含点)
- ❌ `W20 cover images` (含空格)
- ❌ `W20_deploy_check` (含下划线虽然不严格禁止但 prefer kebab)
