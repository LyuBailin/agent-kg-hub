# 更新日志

所有对本项目的显著变更都记录在此文件。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [Unreleased]

### 计划中
- 下一个大版本(9 月):首页大改版、学习路径页

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
