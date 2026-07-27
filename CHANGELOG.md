# 更新日志

所有对本项目的显著变更都记录在此文件。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [Unreleased]

### 计划中
- W6 候选:深色模式精细化、首页大改版、增加代码示例仓库
- 翻译 W5 新写的 3 篇概念长文为英文

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
