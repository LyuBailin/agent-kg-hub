# 更新日志

所有对本项目的显著变更都记录在此文件。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [W21] - 2026-08-06

### 新增 — Agent 操作手册

建立 `AGENTS.md` + `references/` 模块文档,给后续 agent turn 用的**稳定规则**索引(不写进度,所有 volatile 内容走 CHANGELOG/ROADMAP):

- **`AGENTS.md`**(项目入口):技术栈、命令、文件 map、命名约定、i18n 路由、commit 规范、subagent 并行规则、a11y baseline、坑的快速索引
- **`references/powershell.md`**:PS 5.1 坑(`mavis-trash` / `Select-String` / CRLF / git commit 单行) + mavis tool 用法
- **`references/images-pipeline.md`**:`findImage()` 流程 + **Vite glob 缓存陷阱**(W20 教训,新加图 build 不出现)
- **`references/i18n.md`**:locale 检测 `/(^|\/)en(\/|$)/` + zh/en 文件映射 + en 端 metadata 必传 ImageMetadata(W20 教训)
- **`references/astro-patterns.md`**:inline `<script>` 不能顶层 return(W18 教训) + GoalGrid 导入 + Shiki 自定义主题
- **`references/deploy-pages.md`**:GH Pages workflow + Pagefind dev-disabled + deploy check cron 模板
- **`references/a11y.md`**:axe-core baseline + skip-link / dropdown ARIA / 颜色对比度 / Shiki 4.5:1 模式

### 设计原则(按用户反馈)

**AGENTS.md 只放跨 wave 适用的规则**,不放:
- 当前进度 / commit hash / "上周干了啥" — 走 [CHANGELOG.md](CHANGELOG.md) (本文件)
- 长期计划 — 走 [ROADMAP.md](ROADMAP.md)
- 项目介绍 — 走 [README.md](README.md)
- 贡献方式 — 走 [CONTRIBUTING.md](CONTRIBUTING.md)

这样 AGENTS.md 几乎不需要随 wave 更新,`references/` 里的规则也按需增量。

### Agent memory 跨项目沉淀(写到 `memory` tool,不入 git)

- **Vite `import.meta.glob('~/...')` 不可靠** → 用相对路径
- **Astro inline `<script>` 顶层不能 `return`** → 用 `if (x) { ... }` 块
- **多 subagent 并行 = strict disjoint file scopes + per-task commit**
- **User meta-corrections 是 hard constraint** → 立即 re-plan,不坚持原方案

## [W11.1] - 2026-07-30

### 修复

- **W11 搜索分类筛选不生效**:
  - 根因:`/search` 和 `/en/search` 用 `pagefind.search(query, { filters: { category } })` 过滤,但没有任何 HTML 元素带 `data-pagefind-filter="category"`,所以 Pagefind 索引里根本没有这个 filter 字段 — 点分类 tab 后永远返回 0 结果
  - 修复:在 `src/components/blog/SinglePost.astro` 加隐藏 `<span data-pagefind-filter="category" data-pagefind-meta="category">`,每篇文章关联到 frontmatter 里的 `category` 字段
  - 中文文章分类值:核心概念 / 核心项目 / 教程博客 / 论文综述
  - 英文文章分类值:Core Concepts / Core Projects / Tutorials & Blogs / Papers & Surveys
- **W11 搜索结果 category pill 不显示**:
  - 根因:`search.astro` 用 `d.meta?.category?.title` 取值,但 `data-pagefind-meta` 抓的是字符串,不是对象 — `.title` 永远 undefined,pill 条件永远 false
  - 修复:同时加 `data-pagefind-meta="category"` 到 SinglePost.astro,JS 侧把 `d.meta?.category?.title` / `d.meta.category.title` 改为 `d.meta?.category` / `d.meta.category`
- **W11 搜索结果 title 字段访问链冗余**:`d.meta?.title?.title` 简化为 `d.meta?.title`(fallback chain 已经在,只是多余嵌套)

## [W13] - 2026-07-30

### 新增
- **2 篇新概念长文(中英双语,共 4 文件)**:
  - `concept-rag-vs-graphrag-selection.md`(zh 14KB / en 16KB)
    - 工程师视角的 RAG vs GraphRAG 选型决策框架
    - 4 维评分:问题类型 / 语料规模 / 关系密度 / 查询模式
    - 5 个真实场景对比(电商 FAQ / 医疗文献 / 法律合同 / 客服工单 / 内部 wiki)
    - 混合架构(向量召回 + 图精排)适用条件
    - 7 条避坑清单("不要为简单 FAQ 上 GraphRAG" 等)
  - `concept-kg-schema-design.md`(zh 23KB / en 26KB)
    - KG Schema 设计从零到一实战
    - 3 个常见错误:直接复制通用 KG / 粒度太粗 / 关系过载
    - 5 步设计流程(用例分析 → 实体候选 → 关系 → 属性 → 验证)
    - 3 种 Schema 风格对比(OWL / Neo4j 属性图 / LightRAG 轻量)
    - Schema 演进路径(MVP → 实战 → 收敛)
    - 真实案例走完 7 步(科技公司知识库)
- 文章总数:17 → 19 篇(中英各 +2)

## [W14] - 2026-07-30

### 新增
- **Giscus 评论系统**:
  - 新 `src/components/blog/Comments.astro`:基于 GitHub Discussions 的嵌入式评论组件,暗色模式自动同步,noscript 降级到 GitHub Discussions
  - `src/layouts/PageLayout.astro` 注入:URL pattern 智能检测单篇文章页(中英),列表页/首页/about/learning-path 等不显示
  - 修复:`/agent-kg-hub/en/` 英文首页被误判为文章导致评论显示的 bug
  - 占位符 `R_PLACEHOLDER_REPLACE_ME` / `DIC_PLACEHOLDER_REPLACE_ME` — 用户去 https://giscus.app/ 配置后替换

### 改进
- **PR/Issue 模板优化**:
  - `config.yml` 追加 🌐 参与翻译 contact link(指向 i18n label issues)
  - `bug_report.yml` 新增 expected / actual / network 字段,环境字段重命名
  - `content_suggestion.yml` 新增 direction / audience / detail-outline 字段
  - `resource_suggestion.yml` 新增 license / already-listed 字段(帮助去重)
  - `PULL_REQUEST_TEMPLATE.md` 新增 📝 新增概念长文(≥ 2000 字) 选项,加 i18n 提示和截图规范

## [W15] - 2026-07-30

### 改进
- **RSS 全文输出**(`src/pages/rss.xml.ts`):
  - 每条 item 加 `<content:encoded><![CDATA[...]]></content:encoded>` CDATA 包装的完整文章 HTML(RSS reader 可直接读全文)
  - 加 `author` 字段(取自 `post.author`,默认 `LyuBailin`)
  - 加 `categories` 数组(包含 `post.category.title` + 所有 tag.title)
  - 加稳定 `guid`(等于 permalink)
  - 加 `xmlns:content` 命名空间声明让 reader 识别
  - 实现自包含的 minimal markdown→HTML 转换器(无外部依赖,`marked` / `markdown-it` 都不在 package.json)
  - 覆盖:fenced code / ATX heading / blockquote / ul / ol / hr / paragraph / inline code / image / link / bold / italic
  - 严格 XML 转义 + `]]>` 安全切分(避免 CDATA 提前终止)
  - 容错:找不到 .md 源时 fallback 到 excerpt,build 不会因 RSS 生成挂掉

## [W16] - 2026-07-30

### 改进
- **首页 GoalGrid 加"按学习路径"卡片**(`src/pages/index.astro`):
  - 7 个目标卡片 → 新增第 1 张:`我想按学习路径 0→1 系统学`(icon `tabler:walk`,rose 色),直接链到 `/agent-kg-hub/learning-path/`
  - 把"按目标浏览"段副标题从 "6 个最常见的 Agent × KG 场景" 改为 "7 个最常见的 Agent × KG 场景,每个卡片都直接链到对应深度文章或学习路径入口"
  - 让 learning-path 页成为首页最显眼的入口(放第一张卡片),新用户不再迷路

## [W16.2] - 2026-07-30

### 修复
- **W16 后第二轮链接审计 — 修复 3 个 en 侧硬编码的跨语言 / stale 链接**(W16.1 已修 zh nav,本次聚焦 en):
  - **`src/navigation/en.ts:18`** `Three Fusion Paradigms` 链接 `/agent-kg-hub/#paradigms` → `/en/#paradigms` — en 用户点会跳到中文首页的 paradigms 区块,应该跳到英文首页同区块
  - **`src/pages/en/learning-path.astro:244`** 底部 "homepage goal grid" 链接 `/agent-kg-hub/` → `/en/` — en 用户点会跳到中文首页,应该跳到英文首页
  - **en GoalGrid parity(W16 只改了 zh)**:
    - 副标题 `Six of the most common` → `Seven of the most common`(与 zh "7 个" 对齐)
    - `goals` 数组补第 1 张 learning path 卡片(`tabler:walk` / rose / 链 `/en/learning-path/`),让 en 首页也展示 7 个目标,不再比 zh 少 1 个
- **触发原因**:用户反馈 "资源导航下面的链接都不对" → 上一轮修了 zh nav pinyin 之后,我自己系统扫了一遍所有硬编码 `/agent-kg-hub/` 路径,发现 en 侧有 3 处类似问题
- **验证**:`npm run build` 0 错误 0 警告 / en home 实际渲染 7 张 "I want" 卡片 / en nav `Three Fusion Paradigms` 指向 `/en/#paradigms`(英文首页 anchor 存在)

## [W12] - 2026-07-30

### 新增

- **学习路径页(Learning Paths)**:
  - 中文 `/learning-path/` + 英文 `/en/learning-path/`
  - 4 条精心策划的阅读路径,串联 17 篇文章,无重复
  - 路径一:零基础入门(3 篇) — ReAct → GraphRAG → Hello-Agents
  - 路径二:GraphRAG 工程实战(4 篇) — Microsoft GraphRAG → LightRAG → llm-graph-builder → Peng 综述
  - 路径三:Agent 能力构建(5 篇) — Agent Memory → Cognee → LangGraph → smolagents → Agent 评估
  - 路径四:KG 增强 LLM 深入(5 篇) — GLA → KG 推理 → QA-GNN → KG 质量 → IEEE 综述
  - 每条路径有:icon / 名称 / 标签(推荐起点 / 工程师路线 等) / 描述 / 适合人群 / 编号文章列表 / 预计时间 / "开始这条路径" CTA
  - 每篇文章显示:标题(链原文) + 一句话说明 + 分类 pill + 阅读时长
  - 用 4 种 accent color (indigo/sky/violet/emerald) 视觉区分路径
  - 顶部 Note 提示"怎么选路径",底部 Note 提示"自定义路径"用 tag/category 浏览
  - 用 `findPostsBySlugs` 校验所有文章存在 — 漏一篇直接 build 失败,不会出现 404 链接

### 改进

- 导航 (zh/en):Header "概念解读"/"Concepts" 下拉菜单首位加入"学习路径"/"Learning paths" 入口
- 静态页面数:186 → 188 (+2)

## [Unreleased]

## [W19.5] - 2026-08-05

### 修复 — axe-core 审计 0 violations

跑 axe-core 4.12 全站扫描,从 W19 主菜前的 **50+ issues** 全部清到 **0**:

| 页面 | W19 修前 | W19 修后 |
|---|---|---|
| `/` (Home) | 1 (btn-primary 5.5:1) | **0** |
| `/en/` (Home) | 1 (btn-primary) | **0** |
| `/concept-react-intro/` (Article) | 8 (Shiki 代码高亮 token) | **0** |
| `/learning-path/` | 38 (slate-500/400 muted text) | **0** |
| `/search/` | 4 (kbd contrast + link color-only) | **0** |
| `/404.html` | 5 (no main landmark + region) | **0** |
| `/articles/`, `/category/`, `/tag/`, `/about/`, `/privacy/`, `/terms/`, `/en/learning-path/`, `/en/search/`, `/en/concept-react-intro/` | n/a | **0** |

### 关键改动

- **Custom Shiki theme via CSS variables** (`astro.config.ts` + `src/assets/styles/tailwind.css`):
  - `shikiConfig: { theme: 'css-variables' }` 替代默认的 `github-dark`/`github-light`
  - 在 `tailwind.css` 定义 12 个 `--astro-code-*` 变量,light 模式 + dark 模式都通过 WCAG AA 4.5:1
  - Shiki 编译期 emit `<span style="color:var(--astro-code-token-...)">`,CSS 接管颜色
  - 之前 `github-dark` 蓝灰 token (#79b8ff) 在 #24292e 上只有 3.2:1 — axe 必报
- **404 页 a11y** (`src/pages/404.astro`):
  - 之前用 `Layout` 没有 `<main>` landmark,触发 `landmark-one-main` + 4 个 `region`
  - 现在用 `<main id="main-content" tabindex="-1">` 包裹,skip-link 也能用
  - 顺手把 `text-muted` → `text-slate-700 dark:text-slate-300`,链接默认 `underline`
- **Announcement bar landmark** (`src/components/widgets/Announcement.astro`):
  - 加 `role="region" aria-label="站点公告"`,不再"飘"在所有 landmark 之外
  - badge "NEW" 标 `aria-hidden="true"`(纯装饰,屏幕阅读器跳过)
- **404 之前用 Layout,现在用 Layout(继承 main 包装)+ 单独 main** — 修复了之前 404 在 PageLayout 嵌套 main 的错误

### 验证方法

```bash
# 1. 安装 ChromeDriver
npx browser-driver-manager install chrome

# 2. 启动 build serve
python -m http.server 4321 --directory dist

# 3. axe-core 扫描全站
npx @axe-core/cli http://localhost:4321/ http://localhost:4321/concept-react-intro/ ...
```

## [W20] - 2026-08-06

### 新增 — 19 张唯一文章封面

之前所有 19 篇文章共用一张 `default.png` 抽象渐变图,`og:image` 缺乏辨识度。这波给每篇文章生成 16:9 抽象技术插画(1K,indigo-sky-violet 渐变 + 网格/光晕/几何元素),**zh + en 共用同一张**(文章本体是同一份,翻译不动图)。

**封面列表**(按 frontmatter 命名 `cover-{category}-{slug}.png`):

| # | Concept 类(9) | Resource 类(10) |
|---|---|---|
| 1 | `cover-concept-react-intro` | `cover-resource-microsoft-graphrag` |
| 2 | `cover-concept-graphrag-intro` | `cover-resource-lightrag` |
| 3 | `cover-concept-rag-vs-graphrag-selection` | `cover-resource-cognee` |
| 4 | `cover-concept-kg-schema-design` | `cover-resource-langgraph` |
| 5 | `cover-concept-kg-quality` | `cover-resource-smolagents` |
| 6 | `cover-concept-kg-reasoning` | `cover-resource-hello-agents` |
| 7 | `cover-concept-graph-augmented-agents` | `cover-resource-llm-graph-builder` |
| 8 | `cover-concept-agent-memory` | `cover-resource-qa-gnn` |
| 9 | `cover-concept-agent-evaluation` | `cover-resource-graphrag-survey` |
|   |   | `cover-resource-graphrag-survey-peng` |

**改动文件**:
- 新增:`src/assets/images/cover-*.png` × 19(每张约 700KB,总 13MB)
- 修改:`src/data/post/*.md` + `src/data/post-en/*.md` × 38(frontmatter `image: ~/assets/images/cover-{category}-{slug}.png`)
- 修改:`src/utils/images.ts`(`import.meta.glob` 改用相对路径 + key 转换修正)
- 修改:`src/pages/en/articles/[...post].astro`(传 ImageMetadata 而非 raw string)
- 修改:`src/types.d.ts`(`MetaDataImage.url` 拓宽为 `string | ImageMetadata`)

### 修复 — `import.meta.glob` 缓存陷阱

**问题**:build 完 article HTML 里的 hero `<img>` 和 og:image 还是默认 `default.3bEXcqA9_*.jpg`,新 cover 全部没被引用。

**根因**:
- `src/utils/images.ts` 的 `findImage()` 用 `import.meta.glob('~/assets/images/...')` 解析 `~/assets/images/cover-*.png`
- Vite 的静态 glob 在 build 时确定模块图,**新加的图片没出现在 glob 结果里**(Vite 缓存了 glob 求值)
- 即使文件已在 `dist/_astro/cover-*.png` 出现(被 Vite 静态资源管线处理了),glob map 里没有对应 key,`findImage` 返回 `null`

**修复**:
- glob 改用相对路径:`'../assets/images/**/*.{...}'`(从 `src/utils/` 出发)
- key 转换改为 `imagePath.replace(/^~\//, '../')`,与相对 glob key 对齐
- 老 `~/` 别名形式已被观察多次不可靠(本次又踩坑),相对路径是 canonical

### 修复 — en 端 og:image 走 default fallback + JSON-LD 路径错误

**问题**:`/en/articles/{slug}/` 的 og:image 走 `src/config.yaml` 的 `default.png` 而非文章自己的封面;JSON-LD `image` 字段是 raw `~/assets/images/...` 路径,不是优化后的 URL。

**根因**:`src/pages/en/articles/[...post].astro` 的 metadata 构造用了 `imageUrl = typeof image === 'string' ? image : ''` —— 对 ImageMetadata 走 `''` 分支,导致 `openGraph.images = {}`,fallback 到 config.yaml;同时 `shapedPost.image` 传的是 `frontmatter.image`(raw string),JSON-LD 拿到的就是 `~/assets/...`。

**修复**:跟 zh 端 `[...blog]/index.astro` 对齐 —— 直接把 `findImage()` 返回的 `ImageMetadata` 传进 `openGraph.images[0].url` 和 `shapedPost.image`,由 `adaptOpenGraphImages()` 在 `Metadata.astro` 渲染阶段统一调 Astro image service 出优化图。

**结果**:
- zh + en 双端 og:image 都用每篇文章自己的 cover 1200×626 jpg 优化版
- JSON-LD `image` 也用优化后的 URL(对象形态,含 src/width/height/format)
- `src/types.d.ts` 把 `MetaDataImage.url` 从 `string` 拓宽为 `string | ImageMetadata`,消除 TS 报错

## [W19] - 2026-08-05

## [W19] - 2026-08-05

### 改进 — A11Y 深入

- **`prefers-reduced-motion` 全局尊重**(`src/assets/styles/tailwind.css`):
  - WCAG 2.3.3 推荐的全站规则:`@media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }`
  - 偏好减少动效的用户 → 几乎所有 transition / animation 自动缩短到 0.01ms,scroll 改成瞬时
  - 已经显式用 `motion-safe:` 标记的地方保持原样,这条规则只是兜底
- **Skip-link 真正移动焦点**(`src/layouts/Layout.astro` + `src/layouts/PageLayout.astro`):
  - `<main id="main-content">` 加 `tabindex="-1"`,键盘 / 屏幕阅读器用户能 programmatic focus 到 main
  - skip-link 链接的 click handler 在 hash change 之后用 `main.focus({ preventScroll: true })` 移动焦点(光跳到锚点不会移动焦点)
  - `tabindex="-1"` 的 `:focus-visible` 样式用主题色描边,让用户看到 focus 状态
- **搜索 a11y**(`src/pages/search.astro` + `src/pages/en/search.astro`):
  - `<input>` 加 `<label class="sr-only">` + `aria-label` + `aria-describedby` 指向 status div
  - status div 加 `role="status" aria-live="polite" aria-atomic="true"` — 屏幕阅读器会播报"找到 N 个结果"
  - results div 加 `role="tabpanel" aria-live="polite" aria-busy` — 搜索时 aria-busy=true,完成时 false
  - filter `<button>` 加 `id` + `aria-controls="search-results"` + 同步 `aria-labelledby` 给 tabpanel
  - filter 图标加 `aria-hidden="true"`
- **Header 下拉菜单 ARIA**(`src/components/widgets/Header.astro` + `src/components/common/BasicScripts.astro`):
  - 触发按钮加 `aria-haspopup="menu" aria-expanded="false"`
  - 菜单 `<ul>` 加 `role="menu"`,`<li>` 加 `role="none"`,菜单项 `<a>` 加 `role="menuitem"`
  - 跟随 `.dropdown:hover, .dropdown:focus-within` 同步 `aria-expanded`(用 mouseenter/mouseleave/focusin/focusout)
  - 键盘用户 Tab 进去时下拉展开 + 屏幕阅读器报"expanded",Tab 出去自动收起
- **复制代码按钮 a11y**(`src/components/blog/SinglePost.astro`):
  - 加 `aria-label="复制代码到剪贴板"`
  - 加 `<span class="sr-only" role="status" aria-live="polite">` live region,成功时填"已复制代码",失败时填"复制失败"
  - SVG 图标加 `aria-hidden="true"`
  - `transition-opacity` 改成 `motion-safe:transition-opacity`(尊重 reduce-motion)
- **TOC a11y**(`src/components/blog/SinglePost.astro`):
  - 滚动时同步 `aria-current="location"` 给当前章节(屏幕阅读器可以知道当前在看哪节)
  - `<nav id="toc-nav">` 加 `aria-label="文章目录"`
- **SocialShare 按钮 a11y**(`src/components/common/SocialShare.astro`):
  - 容器 `<div>` 升级成 `<div role="group" aria-label="分享文章到社交媒体">`
  - 每个按钮加 `type="button"`(之前缺,form 嵌入时会有问题)
  - `title` 属性保留(鼠标 hover)+ 加 `aria-label` 同义(屏幕阅读器稳定报)
- **装饰元素标注**:
  - reading-progress bar 加 `aria-hidden="true"`(纯装饰,屏幕阅读器忽略)
  - hero SVG 容器 `aria-hidden="true"`(已经是)
  - paradigm-map SVG `role="img" aria-label`(已经是)
- **Article hero image**:
  - `alt={post?.excerpt || ''}` → `alt=""`(因为所有文章用同一个 default.png 当装饰背景,alt 用 excerpt 反而误导屏幕阅读器;空 alt 才是正确的"装饰"标记)

### 已知但未修的项(留个 W20+ 的口子)
- **代码高亮对比度** — 8 个 issues 在 `pre > code > .line > span`(Shiki github-dark 主题),改主题色或加 brightening filter 可以消除
- **btn-primary 边界对比** — home 页 1 个 issue,`#4F46E5` 白字 5.5:1 刚刚过 AA,改成 `#4338CA` (indigo-700) 可以到 6.5:1 (AAA)
- A11Y 自动化测试 — 没装 axe-core 进 CI,可以加 `pnpm dlx @axe-core/cli` 到 PR check
- Anchor links for headings — 文章章节没有"复制锚点"按钮,GitHub 风格,做起来不难

## [W19.3] - 2026-08-05

### 修复
- **Learning path 页面对比度**(axe-core 报告 38 violations,清掉):
  - `text-slate-500 dark:text-slate-400`(描述、"适合:") → `text-slate-700 dark:text-slate-300`(白底 4.5:1 起步,黑底 12:1)
  - `text-slate-400 dark:text-slate-500`("min" / "X 分钟" / 描述) → `text-slate-600 dark:text-slate-400`
  - 分类 pill `bg-slate-100 dark:bg-slate-700/60` + 默认 slate-400 文本 → `bg-slate-200 dark:bg-slate-700` + `text-slate-800 dark:text-slate-200` 显式设字色
  - 同步 zh + en 两个版本

## [W18] - 2026-08-05

## [W18] - 2026-08-05

### 改进
- **⌘K / Ctrl+K 全局搜索快捷键**(`src/components/common/BasicScripts.astro`):
  - 在任何页面按 `Cmd+K`(Mac)或 `Ctrl+K`(Win/Linux)直接打开站内搜索
  - 在搜索页:直接 focus 并 select 搜索输入框
  - 不在搜索页:跳转到 `/agent-kg-hub/search/`(en 路径下会跳 `/en/search/`)
  - 不劫持其他 input/textarea/contenteditable 里的快捷键(只在用户没在打字时触发)
  - 同样监听 `astro:after-swap`,View Transitions 切换页面后还能用
- **搜索页加 ⌘K 提示**(`src/pages/search.astro` + `src/pages/en/search.astro`):
  - 标题下面显示 "按 ⌘K / Ctrl K 直接唤起",带 kbd 样式元素,新用户一眼能看到快捷键
- **Skip-to-content 链接(A11Y)**(`src/layouts/Layout.astro` + `src/layouts/PageLayout.astro`):
  - `<body>` 开头加一个 `sr-only focus:not-sr-only` 的 "跳到主要内容" 链接
  - 键盘用户按 Tab 第一个就能看到,可以跳到 `<main id="main-content">`
  - 中英双语标签 ("跳到主要内容 / Skip to main content")

### 清理
- **删除 partytown 死代码**(`astro.config.ts` + `package.json`):
  - 之前 `hasExternalScripts = false` 一直为 false,`partytown()` 集成从来没真正被加载
  - 删:`import partytown from '@astrojs/partytown'`、`whenExternalScripts` helper、`hasExternalScripts` 常量、未用的 `AstroIntegration` 类型 import
  - 删:`@astrojs/partytown` 从 devDependencies
  - `npm install` 清掉 lockfile 里的 partytown
- **Analytics 脚本条件渲染**(`src/components/common/Analytics.astro`):
  - 之前即使没配 GA id,也会渲染一个空 `<script>` 块(虽然里面有 `if (id)` 守卫,但脚本还是加载了)
  - 现在用 `{id && <Fragment>...</Fragment>}` 包裹,完全没 id 时不渲染任何标签
  - 移除 `partytown` 相关的 `scriptType` 逻辑(已删 partytown 集成)

## [W17] - 2026-08-05

### 改进
- **README 导航同步**(`README.md`):
  - 删掉"工具与框架"分类引用 — W16.1 已删 nav 项,README 之前还残留,这次彻底清掉
  - 在"内容导航"段新增"🧭 学习路径"入口(4 条 0→1 路线,系统化串联 17 篇文章)
  - 微调"概念解读"描述,补几个代表文章名
- **Giscus 评论配置友好提示**(`src/components/blog/Comments.astro`):
  - 当 `dataRepoId` / `dataCategoryId` 还是 `*_PLACEHOLDER_REPLACE_ME` 时,显示"评论系统暂未启用"提示卡片,不再渲染会 404 的 giscus iframe
  - 提示卡里给出 giscus.app 链接 + 编辑 `Comments.astro` 的具体行号说明
  - 用户填好真实 repo id 后,自动切回真实评论组件(无需改其他文件)

### 清理
- 删 `W1-INIT-LOG.md` — 项目已成型,初始搭建日志没用了,历史在 git 里

## [W17.1] - 2026-08-05

### 修复
- **12 个 ESLint 错误清零**(`npm run check:eslint` 现在 0 错误 0 警告):
  - `src/utils/posts-en.ts`:`mod: any` → 引入 `EnPostFrontmatter` interface + `EnPostModule`,所有字段类型化,`fm.tags.map((t) => ...)` 自动推断 `t: string` 不再是 `any`
  - `src/pages/en/articles/index.astro`:同模式(独立 frontmatter interface,`fm` 显式 anchor 到该 interface,避免 TS 把 `EnPostFrontmatter | {}` 折叠到 `{}`)
  - `src/pages/en/articles/[...post].astro`:
    - 5 处 `as any` 全清:`postLoader as () => Promise<any>` → `() => Promise<EnPostModuleData>`,`shapedPost as any` × 2 → `shapedPost: Post`,`Content: Content as any` → `Content: Content`
    - 新增 `EnPostModuleData` interface,导出 `AstroComponentFactory` 类型供 `Content` 字段
  - `src/pages/en/category/[category]/[...page].astro`:`Astro.props as any` → 定义 `interface Props { page: Page<Post>; category: Taxonomy }` 后 `Astro.props as Props`
  - `src/pages/en/tag/[tag]/[...page].astro`:同上,引入 `Props` interface
  - `src/pages/rss.xml.ts`:`renderInline` 里的 NUL byte 哨兵字符(`\x00CODE0\x00`)触犯 `no-control-regex` — 换成 PUA 区字符 U+2E00 / U+2E01(同样不可能出现在正文,且不被任何 markdown 语法命中)
  - `src/components/common/Image.astro`:`{...({...} as unknown as Parameters<...>[0])}` 行内展开 + 强转被 `astro-eslint-parser` 报 "Parsing error: Unknown token" — 抽到 frontmatter 顶部的 `const astroImageProps`,加详细注释解释为什么 cast 一次就够
- 所有 `publishDate` / `updateDate` 现在严格 `string | Date | undefined`,缺日期时 fallback 到 `new Date(0)`,build 不会因缺日期静默出 Invalid Date
- 类型安全深度:从 22 个 astro check 错误(W17 已修)→ 0;从 12 个 ESLint 错误 → 0

## [W17.2] - 2026-08-05

### 改进
- **Prettier 全量格式化**(`npm run check:prettier` 现在 0 错误):
  - 86 个源文件(`src/components`、`src/layouts`、`src/utils`、`src/pages`、`src/navigation`)被 prettier 重新格式化,主要是 object 单行 → 多行 / 引号统一 / 尾随逗号
  - 21 个文件有真实内容变更,533 insertions / 236 deletions
  - 改 `.prettierignore` 排除:
    - 自动生成 / 手工编辑内容:`package-lock.json`、`.prettierrc.mjs`、`.prettierignore`、`CHANGELOG.md`、`README.md`、`CONTRIBUTING.md`、`CITATION.cff`
    - 配置 / 手工调整:`package.json`、`tsconfig.json`、`astro.config.ts`、`eslint.config.js`、`sandbox.config.json`、`vscode.tailwind.json`
    - CMS / 静态资源:`public/decapcms/`
    - **文章 markdown(`src/data/`)**:核心 — 19 篇文章有手工调整的代码块、引用、callout 间距,prettier 会重排中文段落,影响阅读体验,显式忽略
    - 第三方 vendor 代码:`vendor/`
- **`npm run check`(astro + eslint + prettier)三关全绿**,符合项目最初 `package.json` 定义的 CI-quality 链

## [W11] - 2026-07-30

### 改进

- **Pagefind 搜索分类筛选**:`/search` 和 `/en/search` 加 4 个分类 tab(全部 / 核心概念 / 核心项目 / 教程博客 / 论文综述)
  - 点击 tab 立即过滤,无需重新输入关键词
  - URL 参数 `?category=核心概念` 支持深链接
  - 状态文本显示当前分类范围
  - 英文版用对应英文分类名
- **关键词高亮**:Pagefind `<mark>` 标签加 amber 配色(浅色 amber-200/amber-800,深色 amber-800/50% + amber-200)
- **搜索结果元信息**:每条结果额外显示 category pill(高亮 primary 色),方便快速识别文章分类
- 搜索 UX 整体改善:空状态文案带"试试其他关键词或换个分类"提示

## [W10] - 2026-07-30

### 新增

- **4 篇新资源点评(中英双语)**:
  - `resource-cognee.md`(zh + en)— 核心项目:给 AI Agent 装上长期记忆的 ECL 流水线框架
  - `resource-lightrag.md`(zh + en)— 核心项目:港大 HKUDS 出品的轻量级 GraphRAG 工程实现
  - `resource-graphrag-survey-peng.md`(zh + en)— 论文综述:Peng et al. 2024 的 GraphRAG 综述(arXiv 2408.08921)
  - `resource-llm-graph-builder.md`(zh + en)— 教程博客:Neo4j Labs 官方的无代码知识图谱构建工具
- 文章总数:13 → 17 篇(中英各 +4)
- 静态页面数:158 → 186 页(+28,新增 4 篇文章 × 7 个衍生页面)
- 覆盖 ROADMAP W7 计划项"3-5 篇新资源(核心项目 +2、论文综述 +1、教程博客 +1)"

## [W9] - 2026-07-29

### 修复

- **Note 组件 description 不插值**:`/category` `/tag` 索引页改用模板字符串,让 `{categories.length}` 等变量正确插入
- **Features2 卡片标题不渲染 HTML 实体**:title 改用 `set:html`,让 `(N)` 文章计数括号正常显示
- **英文版 Header/Footer/Announcement 仍是中文**:
  - 拆 `src/navigation.ts` 为 `src/navigation/{zh,en,index}.ts`,提供 `getHeaderData / getFooterData / getAnnouncement(locale)` 工具
  - `PageLayout` 根据当前 URL 自动选择 zh/en 文案
- **英文版 `<html lang>` 与 `og:locale` 错配 zh-CN**:
  - 新增 `src/utils/locale.ts`,提供 `detectLocale(pathname)` + `localeToBcp47(locale)`
  - `Layout` / `Metadata` 用 URL 推断 locale,设置正确的 `lang` 与 `og:locale`
  - 关键修复:detectLocale 用 segment-boundary 正则 `/(^|\/)en(\/|$)/`,兼容 GitHub Pages 的 base path(`/agent-kg-hub/en/...`)

### 改进

- 英文版顶部公告条 / 4 个 footer 分区 / Header 下拉菜单 全部英文化
- 英文版"EN ↔ 中文"切换按钮互相跳转到正确语言首页

## [W8] - 2026-07-29

### 修复

- **ParadigmMap 锚点死链**:section `id` 从 `paradigm-map` 改为 `paradigms`,对齐 `navigation.ts` 的 `/#paradigms` 锚点跳转(原 nav 链接跳不到正确位置)

### 改进

- **ParadigmMap 移动端 fallback 完整化**:从只有 1 句简介升级到展示完整 `desc` + `subtitle` + `examples` 列表(桌面端一直有,现在移动端也对齐)
- **ParadigmMap SVG 深色模式适配**:
  - 节点文字深色模式用 indigo-300 / sky-300 / violet-300 替换原深色
  - 节点描边深色模式用 indigo-400 / sky-400 / violet-400 加亮
  - 中心 Agent 节点深色模式用更深的 radial gradient,避免被背景吃掉
  - 装饰粒子同步加亮

## [W7] - 2026-07-29

### 新增

- **W5 三篇概念长文英文版**:`concept-agent-memory` / `concept-agent-evaluation` / `concept-kg-quality` 现都有英文版(共 ~45KB)
- **英文版 `/en/category/` 分类总览索引页**:4 个分类的卡片导航(英文文案)
- **英文版 `/en/category/<slug>/` 分类分页**:与中文版对应
- **英文版 `/en/tag/` 标签总览索引页**:全部英文标签的 pill 云
- **英文版 `/en/tag/<slug>/` 标签分页**:与中文版对应
- **`findCategories()` / `findTags()` 重构**:支持传入自定义 posts 数组,中英文版共用
- **`fetchEnPosts()` 工具**:`src/utils/posts-en.ts` 集中加载英文版文章,索引页与分页复用

### 改进

- 英文版文章总数:10 → 13 篇
- 英文版导航体系:从只有首页/about/search/articles,补齐到含分类/标签浏览
- ROADMAP 中 W7 计划项全部完成(翻译 + 索引页)

## [W6] - 2026-07-29

### 新增

- **`ROADMAP.md`**:完整的季度路线图(短期 W6-W8 / 中期 Q4 / 长期 2027+),含候选方向与决策原则
- **`/category/` 分类总览索引页**:4 个分类(核心概念/核心项目/教程博客/论文综述)的卡片导航,每类显示文章数
- **`/tag/` 标签总览索引页**:全部 13+ 标签的 pill 云,按文章数 3 级缩放,点击进入 `/tag/<slug>/` 列表
- **`findCategories()` / `findTags()`** 工具函数:在 `src/utils/blog.ts` 聚合分类与标签,带 post count 排序

### 修复

- **README 死链**:`/resources/` 改指向 `/category/`(原 `/resources/` 页面不存在,内容已通过分类页承载)
- **README 隐含承诺**:`ROADMAP.md` 链接从"指向不存在文件"变成真实可访问

### 改进

- README 资源导航条目增加"核心项目 / 论文综述 / 教程博客 / 工具与框架"四个子分类提示
- 社区文件从 6 个到 7 个(新增 ROADMAP.md)

## [W5] - 2026-07-27

### 新增

- **3 篇新概念长文**:`concept-agent-memory.md` / `concept-agent-evaluation.md` / `concept-kg-quality.md`(共 ~38KB)
- **3 篇英文翻译**:W4 的 `concept-react-intro` / `concept-graph-augmented-agents` / `concept-kg-reasoning` 现在都有英文版
- **CONTRIBUTING.md**:完整的贡献指南(含本地开发、内容规范、PR 流程、Commit 规范)
- **CHANGELOG.md**:本文件

### 改进

- 文档完整度:从 4 个社区文件到 6 个
- 英文文章总数:7 → 10 篇

## [W4] - 2026-07-27

### 新增

- **3 篇新概念长文**:`concept-react-intro` / `concept-graph-augmented-agents` / `concept-kg-reasoning`(共 ~30KB)
- **7 篇英文翻译**:`src/data/post-en/` × 7
- **3 个 Issue 模板**:bug / resource / content suggestion
- **PR 模板**:含变更类型、关联 Issue、测试清单
- **PR Labeler**:基于路径的自动打标签 + 首次贡献者欢迎
- **`config.yml`**:引导到 GitHub Discussions

### 修复

- `import.meta.glob` 在 frontmatter 顶层失效问题:移到 `getStaticPaths` 内部

## [W3] - 2026-07-27

### 新增

- **UI 打磨**:Noto Sans SC 字体、JetBrains Mono、字体渲染优化
- **Hero SVG 装饰**:22 节点 + 28 连接线的知识图谱背景
- **ParadigmMap 交互图**:三大融合范式 SVG,hover 详情,移动端 fallback
- **Pagefind 静态搜索**:实时 debounce 搜索 + URL 参数 + 优雅降级
- **英文版 i18n**:`/en/` 路由(首页 / about / search)

### 改进

- 搜索入口在 Header
- 语言切换(EN ↔ 中文)在 Header

## [W2] - 2026-07-27

### 新增

- **5 篇资源导航**:
  - `resource-microsoft-graphrag.md` — 工业级 KG 增强 RAG
  - `resource-langgraph.md` — Agent 状态机框架
  - `resource-smolagents.md` — 极简 Code Agent
  - `resource-qa-gnn.md` — KG 推理路径增强 LLM
  - `resource-graphrag-survey.md` — IEEE 综述
  - `resource-hello-agents.md` — 中文 Agent 教程
- **1 篇概念长文**:`concept-graphrag-intro.md` — GraphRAG 入门
- **OG image**:`scripts/generate-og.js` 生成 1200x630 品牌主视觉
- **自动化**:
  - `weekly-update.yml`:每周一自动 snapshot
  - `dependabot.yml`:自动依赖更新

### 改进

- 404 中文化
- 全部文章列表 metadata 中文化
- 中文 Footer 完整化

## [W1] - 2026-07-26

### 新增

- **GitHub 仓库**:`LyuBailin/agent-kg-hub`(public, MIT)
- **技术栈**:Astro v6.4.2 + Tailwind CSS v4.3.0 + TypeScript
- **主题**:AstroWind v1.0.0-beta.63(`arthelokyo/astrowind`)
- **基础页面**:首页、关于、使用条款、隐私政策
- **元数据**:LICENSE (MIT)、README.md、CITATION.cff
- **CI/CD**:`.github/workflows/pages.yml` withastro/action
- **W1 收尾文档**:`W1-INIT-LOG.md`

### 改进

- 主题色:Indigo-600 + Sky-500(深蓝/靛青)
- 深色模式完整适配
- sitemap.xml + rss.xml 自动生成

## 引用规范

- **Semantic Versioning**:本项目版本号遵循 [SemVer 2.0.0](https://semver.org/lang/zh-CN/)
- **Keep a Changelog**:变更日志格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)
- **Conventional Commits**:Commit 信息遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)
