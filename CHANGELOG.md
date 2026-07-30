# 更新日志

所有对本项目的显著变更都记录在此文件。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

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
  - 把"按目标浏览"段副标题从 "6 个最常见的 Agent × KG 场景" 改为 "7 个最常见的 Agent × KG 场景:6 张直接到深度文章,1 张到系统化学习路径"
  - 让 learning-path 页成为首页最显眼的入口(放第一张卡片),新用户不再迷路

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
