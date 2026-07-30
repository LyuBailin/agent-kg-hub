# Agent KG Hub — 待办任务拆解

> 用于分发给不同对话**并行**执行。每个 task 自包含:上下文 + 范围 + 验收标准 + 不要做的事。
> 新对话接手时,从对应 task 章节开始读即可,无需重新摸项目。
>
> 上次更新:2026-07-30
> 仓库:`D:\WorkSoftware\MiniMax Code\projects\agent-kg-hub`
> 远程:github.com/LyuBailin/agent-kg-hub
> 在线:https://lyubailin.github.io/agent-kg-hub/

---

## 已完成基线(2026-07-30 现状)

| 阶段 | 改动 |
|---|---|
| W6 | `/category/` `/tag/` 索引页 + ROADMAP.md + README 死链修复 |
| W7 | en/category en/tag + 3 篇 W5 概念长文英译(concept-agent-memory / evaluation / kg-quality) |
| W8 | ParadigmMap 锚点修(paradigm-map → paradigms)+ 移动端 fallback 完整化 + SVG 深色模式适配 |
| W9 | 4 个 i18n bug 修复:Note 插值 / Features2 (N) 计数 / 英文 Header-Footer / html lang + og:locale |

**当前统计**:158 个静态页面,13 篇中文章 + 13 篇英文文章,4 个分类 / 56 个标签。

---

## 待办 6 个独立 task(可并行)

### Task A · 响应式精细化(1366 笔记本)

**为什么做**:用户(用 1366×768 笔记本)反馈"页面不能自适应,有些拥挤"。根因是 Tailwind 默认断点 sm/md/lg/xl 跳到 1280,而 1366 屏恰好落在 lg(1024)和 xl(1280)之间,没有专门样式。

**当前状态**:
- `src/components/widgets/Hero.astro`:`max-w-7xl` (1280px) + `text-5xl md:text-6xl`
- `src/components/widgets/Features2.astro`:`lg:grid-cols-3 sm:grid-cols-2` —— lg 已经是 3 列
- `src/components/widgets/Content.astro`:`md:flex md:flex-row-reverse` + `md:basis-1/2` —— md+ 立即 50/50 分栏
- `src/components/widgets/ParadigmMap.astro`:viewBox 700×500,容器 `max-w-4xl` (896px)
- `src/components/blog/ListItem.astro`:`md:grid-cols-2`,容器 `max-w-4xl` (896px)

**要做的事**:
1. 给关键 widget 加 `xl:` 断点(在 lg 的基础上加大内边距 / 字号 / 容器)
2. Content widget `md:basis-1/2` 改为 `md:basis-1/2 xl:basis-5/12`(1366 屏给文字 5/12,图 7/12,留更多空间给左侧文字)
3. Features2 在 `lg:grid-cols-3` 之上 `xl:gap-8`(加大卡片间距)
4. ListItem 在 1366 屏下测试:可能需要 `xl:grid-cols-3` (3 列),目前 896px 容器 2 列太挤
5. Header 菜单 6 个 item + 3 个 action:测试 1366 是否会换行,如果会,可能需要 `xl:gap-3 xl:px-4` 缩 padding
6. 完成后在 build 后手动打开 https://lyubailin.github.io/agent-kg-hub/ 测 1366/1440/1920 三个宽度,确保拥挤点都缓解

**验收标准**:
- 1366×768 屏下,首页 Hero / ParadigmMap / Content widget / Features2 都没有明显拥挤
- 1280 以下(原样式)和 1536+ (2xl) 视觉差异不破坏现有体验
- 本地 `npm run build` 成功,158 页全生成
- 部署上线后用 web_fetch 抓首页能看到 `xl:` class 出现在 HTML 上

**不要做**:
- 不要改 Tailwind 配置 / 主题色 / 字体
- 不要碰 ParadigmMap 的 SVG 内容(那是 W8 改的,稳定)
- 不要拆 P0/P1 之外的 widget(如 Hero/Features2/Content 之外的)

**关键文件**:
- `src/components/widgets/Hero.astro`
- `src/components/widgets/Features2.astro`
- `src/components/widgets/Content.astro`
- `src/components/blog/ListItem.astro`
- `src/components/widgets/Header.astro`
- `src/components/widgets/Footer.astro`

**预计工作量**:2-3 小时

**依赖 / 可并行性**:完全独立。可与其他 task 并行。

---

### Task B · 英文版 i18n 深度补完

**为什么做**:W9 修了英文版 Header/Footer/Announcement/lang/locale,但**英文版页面内容**还是中文(`/about` `/privacy` `/terms` 没翻译,`ParadigmMap` 在英文版仍显示中文)。

**当前状态**:
- 中文站 `/about` / `/privacy` / `/terms` 三个 .md 页面存在
- 英文站 `src/pages/en/` 下**没有** about/privacy/terms 页面(footer 链接直接跳中文站)
- `src/pages/en/index.astro` 用 ParadigmMap,但 ParadigmMap 内文案(标题"三大融合范式"、描述、节点文字、代表项目)全是中文
- 中文站 about 页面有 `#maintenance` `#sources` 锚点(footer 链)

**要做的事**:
1. 创建 `src/pages/en/about.md`:翻译 `src/pages/about.md` 内容,保留中文版 frontmatter 风格(title/excerpt/tags 等)
2. 创建 `src/pages/en/privacy.md`:翻译 `src/pages/privacy.md`
3. 创建 `src/pages/en/terms.md`:翻译 `src/pages/terms.md`
4. 修改 `src/navigation/en.ts`:footer 链接 `/agent-kg-hub/about` → `/en/about/`,`/terms` → `/en/terms/`,`/privacy` → `/en/privacy/`
5. 修改 `src/navigation/en.ts`:Header "About" 下 "Why this hub" 链接指向 `/en/about/`
6. **ParadigmMap 英文版**:在 `src/components/widgets/ParadigmMap.astro` 加一个 `locale` prop(`'zh' | 'en'`),传 `paradigms` 数据切换:
   - zh: 三大融合范式 / KG 增强 LLM / LLM 增强 KG / LLM × KG 协同
   - en: Three Fusion Paradigms / KG-Enhanced LLM / LLM-Enhanced KG / LLM × KG Synergy
   - examples 同步翻译
7. `src/pages/index.astro` 和 `src/pages/en/index.astro` 用 `<ParadigmMap locale={...} />` 传入
8. README.md / 顶部公告条(Announcement)已经在 W9 翻译过了,不用动

**验收标准**:
- `/en/about/` `/en/privacy/` `/en/terms/` 全部 200,内容是英文
- 英文 footer "About" 区块的 4 个链接都指向 `/en/...`,不再跳中文
- 英文版 ParadigmMap 节点文字是英文(Three Fusion Paradigms / KG-Enhanced LLM / etc.)
- 中文站 ParadigmMap 仍是中文(无回归)
- `npm run build` 成功,页面数 +3 (新增 en/about /privacy /terms)

**不要做**:
- 不要改中文版的 about/privacy/terms
- 不要改 Header 顶部公告条(已翻译)
- 不要把英文版 ParadigmMap 的 SVG id 改掉(改数据即可,id 仍叫 kg-enhance-llm 等)
- 不要引入第三方 i18n 库(用现有的 navigation/zh-en 模式即可)

**关键文件**:
- `src/pages/en/` (新建 about.md / privacy.md / terms.md)
- `src/navigation/en.ts` (改链接)
- `src/components/widgets/ParadigmMap.astro` (加 locale prop)
- `src/pages/index.astro` / `src/pages/en/index.astro` (传 locale)
- 中文站 about/privacy/terms 原文作为翻译参考(只读)

**预计工作量**:1.5-2 小时(主要是翻译,代码改动小)

**依赖 / 可并行性**:完全独立。可与 Task A/C/D 并行。

---

### Task C · W7 录入 3-5 篇新资源(内容扩充)

**为什么做**:ROADMAP W7 计划"录入 3-5 篇新资源(核心项目 +2、论文综述 +1、教程博客 +1)",**目前 W7 commit 只做了翻译,内容扩充跳过了**。项目当前 13 篇,目标应有 16-18 篇。

**当前状态**:
- `src/data/post/` 现有 6 篇 resource 点评(microsoft-graphrag / langgraph / smolagents / qa-gnn / graphrag-survey / hello-agents)
- `src/data/post-en/` 同步有 6 篇英文版
- content 集合 schema 见 `src/content.config.ts`(title/excerpt/publishDate/category/tags/image/author)
- 已有 frontmatter 风格参考,见 `src/data/post/resource-microsoft-graphrag.md`

**要做的事**:
- **核心项目 +2**(候选,选 1-2):
  - **Cognee** — 自动从对话/文档构建 KG 的开源框架(2024 出现,GitHub ~3k stars)
  - **HippoRAG** — 神经-符号融合记忆(2024 ICLR)
  - **LightRAG** — 轻量级 GraphRAG 实现
  - **AutoGen** — Microsoft 多 Agent 框架(已有概念文章,可补一篇资源点评)
- **论文综述 +1**(候选):
  - **A Survey of Graph-Augmented LLMs**(2024, 比 IEEE 综述更早)
  - **Knowledge Graph Enhanced LLMs Survey**(Pak & Zhou, 2024)
- **教程博客 +1**(候选):
  - **neo4j-labs/llm-graph-builder** — Neo4j 官方 LLM 图构建工具
  - **LlamaIndex GraphRAG Tutorial**

**每个资源的工作**:
1. 写一份 .md,frontmatter 完整(`title` / `excerpt` / `publishDate` / `category` / `tags` / `image` / `author`)
2. 正文结构(参考 `resource-microsoft-graphrag.md`):
   - 1 段 TL;DR
   - "为什么对 Agent × KG 重要" 1 段
   - "核心特性" 列表
   - "适用场景" 列表
   - "局限" 1 段
   - "参考链接"(GitHub/Paper/Docs)
3. 写完后**同步**写英文版(放 `src/data/post-en/`)
4. 写完更新 CHANGELOG [W10] 条目,标 `feat(content): add 3 resource reviews (zh + en)`

**验收标准**:
- 4 篇新文章(2 核心项目 + 1 论文综述 + 1 教程博客)
- 全部有中英双语版
- 每篇 ≥ 800 字
- 跟现有 6 篇 resource 风格一致
- `npm run build` 成功,文章数 +4
- CHANGELOG W10 条目记录

**不要做**:
- 不要写概念解读长文(那有专门的 ROADMAP 中期项)
- 不要在 frontmatter 漏字段(每个字段都填)
- 不要硬编码图片(用 `~/assets/images/default.png` 占位即可)

**关键文件**:
- `src/data/post/resource-{name}.md` (新建)
- `src/data/post-en/resource-{name}.md` (新建)
- 已有 6 篇 resource 作为风格参考
- `src/content.config.ts` (只读,确认 schema)

**预计工作量**:2-3 小时(取决于内容深度)

**依赖 / 可并行性**:完全独立。可与 Task A/B/D 并行。注意:本 task 跟 W6/W7 翻译 task 没冲突。

---

### Task D · 首页大改版(ROADMAP Q4 候选)

**为什么做**:ROADMAP Q4 第一项:从"概念中心"转向"问题中心"——按"我想做 XX"组织内容(如"我想构建一个 GraphRAG"、"我想做 Agent 评估")。当前首页是"信息展示型",用户进入后要自己找入口。

**当前状态**:
- `src/pages/index.astro` 当前结构: Hero / Note(定位) / ParadigmMap / Content(重点项目 4 个) / Features2(4 类服务) / BlogLatestPosts / CallToAction
- `src/pages/en/index.astro` 结构相同(英文文案)
- 主要 widget 都已存在,可复用

**要做的事**:
1. 设计"问题驱动"首页结构(可参考 Notion / Vercel docs / Linear changelog 风格):
   - Hero(同现,但 CTA 改成"按目标浏览"而非"按类型浏览")
   - **目标导航**(新):3-5 个用户问题卡片,如"我想用 KG 增强 RAG"、"我想评估 Agent 性能"、"我想从零构建 GraphRAG",每个卡片链到对应资源/文章
   - ParadigmMap(保留)
   - 重点项目(保留,但按"问题"组织而非"项目名"列表)
   - BlogLatestPosts(保留)
2. 中文 + 英文版本同步改
3. 内容来源:从现有 13 篇文章里挑 5-8 篇最"问题导向"的,作为问题卡片的目标
4. 如果发现首页某个 widget 不再需要(比如 CallToAction),可以删除

**验收标准**:
- 新首页第一屏(首屏)能看到"问题驱动"的入口卡片
- 至少 4 个问题卡片,每个链到具体文章/分类
- 中英双语版都改了
- `npm run build` 成功
- 部署后用 web_fetch 抓首页能看到新的"目标导航"section

**不要做**:
- 不要删除 ParadigmMap(它是项目的标志性交互)
- 不要改 WidgetWrapper / PageLayout / Layout 这些底层组件
- 不要做 i18n 改造(W9 已完成,沿用)
- 不要做响应式精细化(那是 Task A)

**关键文件**:
- `src/pages/index.astro` (重写)
- `src/pages/en/index.astro` (重写)
- 现有 widget 可复用:ParadigmMap / Content / BlogLatestPosts / CallToAction / Features2
- 可选:新增 `src/components/widgets/GoalGrid.astro` 或 `GoalCards.astro` 之类的针对性 widget

**预计工作量**:半天-1 天(主要是设计 + 调样式)

**依赖 / 可并行性**:**与 Task E 有依赖**——学习路径页会链到首页"问题卡片",建议 Task D 先做或同时做。**与 Task A/B/C 完全独立**。

---

### Task E · 学习路径(Learning Path)页(ROADMAP Q4 候选)

**为什么做**:ROADMAP Q4 第二项:对新人友好的 0 → 1 路线图,串联 5-8 个关键概念。这是降低入门门槛的核心功能。

**当前状态**:
- `src/pages/` 现有页面:index / about / articles (动态) / category / tag / privacy / terms / 404 / search
- **没有** learning-path 页面
- 概念长文现有 7 篇:ReAct / Graph-Augmented Agents / KG 增强推理 / GraphRAG 入门 / Agent Memory / Agent Evaluation / KG 质量

**要做的事**:
1. 新建 `src/pages/learning-path.astro`(中文)+ `src/pages/en/learning-path.astro`(英文)
2. 设计 3-4 条学习路径(可参考 README "内容架构"):
   - **入门路径**:"什么是 KG + 什么是 LLM Agent → ReAct 入门 → GraphRAG 入门" (3-4 篇)
   - **工程化路径**:"GraphRAG 入门 → KG 增强推理 → 评估方法 → KG 质量" (4-5 篇)
   - **进阶路径**:"图智能体(GLA) → Agent Memory → Agent Evaluation" (3-4 篇)
3. 页面结构:
   - Hero("0 → 1 学习路径")
   - 3-4 张大卡片(每条路径)
     - 路径名 + 一句话描述 + 文章列表(每篇带简短说明)
     - "开始这条路径"按钮 → 跳到第一篇
   - 底部:提示"想自定义路径?看全部分类 /category"
4. 路径里的文章从 `src/data/post/` 里挑,不用新增文章
5. 更新 navigation.ts / navigation/zh.ts / navigation/en.ts:Header 加"学习路径"链接(可选)
6. 更新首页(配合 Task D):Hero CTA 加一条"按学习路径开始"

**验收标准**:
- `/learning-path/` 和 `/en/learning-path/` 200 OK
- 至少 3 条路径,每条路径 3-5 篇文章
- 路径里的每篇文章都真实存在(`getStaticPaths` 时验证)
- 中英双语版都建了
- `npm run build` 成功,页面数 +2
- 从首页/导航能跳到 learning-path

**不要做**:
- 不要新增文章(从现有的挑)
- 不要做动态生成路径(Astro static + getStaticPaths 即可,不要 runtime)
- 不要做"完成度追踪"(与"轻量资源聚合"定位冲突)

**关键文件**:
- `src/pages/learning-path.astro` (新建)
- `src/pages/en/learning-path.astro` (新建)
- `src/data/post/*.md` 列表(只读,挑文章用)
- `src/navigation/{zh,en}.ts`(可选,加 Header 链接)

**预计工作量**:半天

**依赖 / 可并行性**:**依赖 Task D 首页大改版**——首页的"目标导航"卡片会引用 learning-path。建议 Task D 先做完再做 E。**与 Task A/B/C 独立**。

---

### Task F · 搜索增强(ROADMAP Q4 候选)

**为什么做**:ROADMAP Q4 第四项:Pagefind 已有,后续可加分类/标签/相关度权重/全文高亮等。当前搜索是 Pagefind 基础版。

**当前状态**:
- `src/pages/search.astro` 已存在,接 Pagefind
- Pagefind 在 build 时索引所有 .md 文件
- 当前 search.astro 的实际实现 — 需要先看一下,确认是否支持排序/分类/筛选

**要做的事**(开始前先看 search.astro 现状):
1. 读 `src/pages/search.astro` 了解当前实现
2. 根据现状决定增强方向:
   - **方案 A(轻量)**:加 "按分类筛选" UI(4 个分类 tab)+ Pagefind 搜索结果按分类二次过滤
   - **方案 B(中等)**:加"按标签筛选"+ 搜索关键词高亮(用 Pagefind 的 excerpt + CSS 标记)
   - **方案 C(重)**:接第三方语义搜索(Algolia DocSearch / Meilisearch)—— **不建议**,维护成本高,与"轻量"定位冲突
3. 建议实现方案 A 或 B(单选)
4. 添加 CHANGELOG [W10/W11] 条目

**验收标准**:
- 搜索结果能按分类或标签筛选
- 关键词在结果中高亮显示
- 中文 + 英文都改了
- `npm run build` 成功
- 搜索响应速度保持(< 200ms 客户端)

**不要做**:
- 不要接 Algolia / Meilisearch(重方案)
- 不要做"全文语义搜索"(Pagefind 已是静态索引最佳实践)
- 不要破坏现有搜索基础功能

**关键文件**:
- `src/pages/search.astro` (主战场)
- `src/pages/en/search.astro` (英文版,如果存在)
- Pagefind 文档参考(https://pagefind.app/)

**预计工作量**:1-2 小时(简单方案) 或 半天(完整方案)

**依赖 / 可并行性**:完全独立。可与 Task A/B/C 并行,与 Task D/E 不冲突。

---

## 优先级建议

| 优先级 | Task | 理由 |
|---|---|---|
| **P0 (先做)** | Task A 响应式 | 用户当前最痛的体验问题,改动局部、风险低 |
| **P0** | Task B i18n 深度 | 完整性工作,直接提升英文站可用性 |
| **P1** | Task C 资源扩充 | 内容资产,但需要选题决策 |
| **P1** | Task F 搜索增强 | 体验加分,工作量和风险可控 |
| **P2** | Task D 首页大改版 | 大改,需要设计投入 |
| **P2** | Task E 学习路径页 | 依赖 Task D 设计方向 |

---

## 怎么接 task

新对话接手时:
1. 读本文件对应 task 章节
2. 读 `CHANGELOG.md` 了解最近 commit(W6-W9)避免重复
3. 读 task 列出的"关键文件"
4. 按"验收标准"工作,完成后:
   - `git add` + `git commit`(按 Conventional Commits 风格,W10/W11/...)
   - `git push origin main`
   - **重要**:push 后 30 秒内 GitHub Actions 自动部署,大约 1-3 分钟完成
   - 部署状态可以用 `gh run list --repo LyuBailin/agent-kg-hub --limit=1` 查
5. 完成后更新本 BACKLOG.md 顶部"已完成基线"部分 + `git commit` 跟进

---

## 项目关键约定(必读)

- **Base path**: `/agent-kg-hub`(GitHub Pages sub-path)
- **包管理**: npm
- **Node**: >= 22.12
- **Astro**: v6
- **Tailwind**: v4
- **TypeScript**: 严格模式
- **i18n 模式**: URL-based(`/en/...` 英文,其它中文),用 `src/utils/locale.ts::detectLocale(pathname)` 推断
- **Commit 规范**: Conventional Commits (`feat:` / `fix:` / `docs:` / `chore:` / `ci:`)
- **CHANGELOG**: Keep a Changelog 格式,新版本加在最上面

**`Astro.url.pathname` 在 build 时包含 base path**(`/agent-kg-hub/en` 而非 `/en`),写 locale 检测时注意。
