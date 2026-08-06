# Agent KG Hub — Agent Guide

> 本文件是**给 agent 看的稳定规则与约定**。进度、变更、计划见 [CHANGELOG.md](CHANGELOG.md) / [ROADMAP.md](ROADMAP.md)。本文件**不**记录历史与状态,只放跨 wave 适用的规则。

## Project

Agent × Knowledge Graph 技术资源导航 + 关键概念深度解读。Astro v6 静态站,部署到 GitHub Pages,中文为主 + 英文子路径。

- **Repo**: `LyuBailin/agent-kg-hub`
- **Live URL**: `https://lyubailin.github.io/agent-kg-hub/`
- **Base path**: `/agent-kg-hub` (Astro `base` + GitHub Pages sub-path)
- **Node**: `>=22.12.0`

## Tech Stack

- **Astro** `^6.4.2` (static output, MDX, sitemap, compress integrations)
- **Tailwind CSS** `^4.3.0` via `@tailwindcss/vite`
- **TypeScript** `^5.9.3` (strict)
- **AstroWind** theme (`vendor/integration.ts`)
- **Shiki** via `css-variables` (custom AA theme, see [references/astro-patterns.md](references/astro-patterns.md))
- **Pagefind** `^1.5.2` (dev-disabled, see [references/deploy-pages.md](references/deploy-pages.md))
- **astro-seo** for meta tags

## Commands

| 命令 | 用途 |
|---|---|
| `npm run dev` | 本地 dev server (HMR) |
| `npm run build` | 静态构建 → `dist/` |
| `npm run check` | astro check + eslint + prettier (CI gate) |
| `npm run check:astro` | 仅 TypeScript 类型检查 |
| `npm run check:eslint` | 仅 ESLint |
| `npm run check:prettier` | 仅 Prettier |
| `npm run fix` | eslint --fix + prettier -w |
| `npm run preview` | 本地预览 `dist/` |

**CI gate**: `npm run check` 必须 0 errors / 0 warnings 才能 commit。

## File Map (static structure)

```
agent-kg-hub/
├── astro.config.ts          # Astro + Vite + Shiki 配置,base=/agent-kg-hub
├── src/
│   ├── config.yaml          # site metadata + i18n + apps.* (theme 集成)
│   ├── content.config.ts    # content collections schema (post / post-en)
│   ├── types.d.ts           # MetaData / Post / Image / Taxonomy 等类型
│   ├── assets/
│   │   ├── images/          # local images (cover-*.png + default.png + OG 备用)
│   │   ├── styles/tailwind.css  # CSS variables, prefers-reduced-motion, Shiki
│   │   └── favicons/
│   ├── components/          # 按域分目录:blog/ common/ ui/ widgets/
│   ├── data/
│   │   ├── post/            # 中文文章 markdown (19 篇, zh-Hans)
│   │   └── post-en/         # 英文文章 markdown (19 篇, en)
│   ├── layouts/             # Layout.astro (基础) + PageLayout.astro (含 <main id="main-content">)
│   ├── navigation/          # 顶部导航: zh.ts / en.ts / index.ts
│   ├── pages/               # 文件路由
│   │   ├── [...blog]/index.astro              # zh 文章详情
│   │   ├── [...blog]/[...page].astro          # zh 列表/分页
│   │   ├── en/articles/[...post].astro        # en 文章详情 (独立实现, 见 references/i18n.md)
│   │   ├── en/articles/index.astro            # en 列表
│   │   ├── search.astro + en/search.astro     # 搜索页 (pagefind)
│   │   ├── learning-path.astro + en/...        # 学习路径
│   │   ├── category/, tag/, about/, 404.astro
│   │   └── rss.xml.ts                         # RSS feed
│   └── utils/               # blog / directories / frontmatter / images / locale / permalinks
├── vendor/integration.ts    # AstroWind theme 集成
├── scripts/                 # 一次性脚本 (image generation, OG, 临时工具)
├── .astro/                  # Astro 缓存 (gitignored)
├── dist/                    # build 输出 (gitignored)
├── public/                  # 直通静态资源 (favicon 等)
├── .github/workflows/       # pages.yml (deploy)
├── references/              # ★ agent 详细规则 (本目录的子目录)
├── README.md                # 项目介绍 (面向访客)
├── CHANGELOG.md             # 变更日志 (面向访客,volatile)
├── ROADMAP.md               # 路线图 (面向访客,volatile)
└── CONTRIBUTING.md          # 贡献指南
```

## Conventions

### Naming

| 类型 | 规则 | 示例 |
|---|---|---|
| Article slugs (zh) | 拼音 + 数字声调 | `concept-react-intro`, `he2-xin1-gai4-nian4` (category) |
| Article slugs (en) | kebab-case English | `concept-react-intro`, `core-concepts` (category) |
| Cover images | `cover-{category}-{slug}.png` | `cover-concept-react-intro.png`, `cover-resource-langgraph.png` |
| Branches | `feat/...` `fix/...` `docs/...` `chore/...` | (按需,不强制) |
| Commit subjects | Conventional Commits, 一行 | `feat(images): W20 - 19 unique article cover images` |
| Cron names | kebab-case alphanumeric only (no dots, no spaces) | `W20-cover-images-deploy-check` |
| File names (refs) | kebab-case `.md` | `images-pipeline.md`, `astro-patterns.md` |

### i18n routing

- **URL-based**: `/{en/...}*` → English, else Chinese
- **Detection**: `src/utils/locale.ts::detectLocale(pathname)` with regex `/(^|\/)en(\/|$)/` (segment-boundary)
- **Files**:
  - Chinese articles → `src/data/post/*.md`
  - English articles → `src/data/post-en/*.md` (parallel naming, same slug)
- **Pages**:
  - Chinese detail → `src/pages/[...blog]/index.astro` (uses content collections)
  - English detail → `src/pages/en/articles/[...post].astro` (uses `import.meta.glob`)
- 详细机制见 [references/i18n.md](references/i18n.md)

### Commits

- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`, `perf:`, `build:`, `ci:`
- **One `-m` per commit** (PowerShell 5.1 对 unquoted 多行字符串会断行)
- **Subject line only** in `-m`; 详情放 commit body via heredoc/PowerShell 变量
- **W{N} prefix** in subject for traceability (e.g., `feat(images): W20 - ...`)
- **Per-task commits preferred** for parallel subagent work (见下)

### Subagent 并行 (复杂任务)

- **Strict disjoint file scopes** — 每个 subagent 写**不重叠**的文件集,避免 conflict
- **Per-task commits** — 每个 subagent 独立 commit + push,不要 mega-bundle
- **Verify between commits** — `git status --short` + `git diff --stat` before `git add -A`
- **Subagent API 500 errors are tolerable** — verify via `git status`/`git diff`,接受 work

### a11y

- **Target**: WCAG 2 AA, axe-core 0 violations across all pages
- **Mandatory baseline** (W19 累计): skip-to-content, `prefers-reduced-motion`, dropdown ARIA, Shiki custom theme (AA contrast), kbd contrast, primary color AAA
- 详细模式见 [references/a11y.md](references/a11y.md)

## Pitfalls (brief, 详情见 references/)

| 现象 | 快速指引 |
|---|---|
| 新加的 cover image build 后不出现,hero 还是 `default.png` | [references/images-pipeline.md §Vite glob 缓存陷阱](references/images-pipeline.md) |
| PowerShell `[wildcard]` / `Remove-Item` / `Select-Object -Pattern` 报错 | [references/powershell.md](references/powershell.md) |
| `.astro` 文件里 inline `<script>` 顶层 `return` Rollup parse error | [references/astro-patterns.md §inline script](references/astro-patterns.md) |
| `import.meta.glob('~/...')` 找不到新加的资源 | [references/images-pipeline.md](references/images-pipeline.md) |
| en 文章 og:image 走 config.yaml default fallback | [references/i18n.md §metadata 必传 ImageMetadata](references/i18n.md) |
| `mavis` 在 shell 里直接调不工作 | 用 `mavis` tool,**不是** shell command |
| 部署后看不到变更 | 等 GH Pages 1-2 分钟,用 [references/deploy-pages.md](references/deploy-pages.md) 的 deploy check 流程验证 |

## References (按模块详细规则)

- [references/architecture.md](references/architecture.md) — Astro v6 路由模型 + content collections + 集成
- [references/images-pipeline.md](references/images-pipeline.md) — `findImage()` + Image 组件 + Vite glob 坑
- [references/i18n.md](references/i18n.md) — locale detection + en/zh 文件映射 + cross-language links
- [references/powershell.md](references/powershell.md) — PS 5.1 坑 + mavis tool 用法
- [references/astro-patterns.md](references/astro-patterns.md) — inline script / GoalGrid / SinglePost JSON-LD 等
- [references/deploy-pages.md](references/deploy-pages.md) — GitHub Pages + pagefind + 部署验证
- [references/a11y.md](references/a11y.md) — axe-core + ARIA + 颜色对比度模式

## Related Docs (本文件**不**复制其内容)

- [README.md](README.md) — 项目介绍,目标读者是访客/潜在贡献者
- [CHANGELOG.md](CHANGELOG.md) — 变更日志,**volatile**,每个 wave 加一段
- [ROADMAP.md](ROADMAP.md) — 路线图 + 维护节奏,**volatile**
- [CONTRIBUTING.md](CONTRIBUTING.md) — 贡献指南
- [LICENSE](LICENSE) — MIT
