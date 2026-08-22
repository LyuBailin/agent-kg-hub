# Agent KG Hub · Agent × 知识图谱技术资源导航

> 我长期维护的一个「Agent × KG」垂域资源库，主要面向中文开发者，做资源聚合 + 概念深度解读两件事。

中文开发者向的"Agent × 知识图谱"主题资源库。

- 📚 **资源导航** — 分类整理论文、开源项目、博客、视频教程，每条附原创点评
- ✍️ **概念解读** — 对 GraphRAG、图智能体（GLA）、KG 增强 LLM 等核心概念做深度文章

在线访问：<https://LyuBailin.github.io/agent-kg-hub/>

---

## 这是什么

| 范式 | 含义 | 代表项目 |
|------|------|----------|
| **KG 增强 LLM** | 用图谱缓解幻觉、提升可解释性 | [Microsoft GraphRAG](https://github.com/microsoft/graphrag) · [ERNIE](https://github.com/PaddlePaddle/ERNIE) · [KEPLER](https://github.com/THU-KEG/KEPLER) |
| **LLM 增强 KG** | 用 LLM 解决 KG 构建瓶颈 | KG 补全（KGC） · 实体/关系抽取 · KG-to-Text |
| **LLM 与 KG 协同** | 二者作为对等伙伴共同推理 | [QA-GNN](https://github.com/michiyasunaga/qagnn) · LARK · 自我进化 Agent |

---

## 内容导航

- 🧭 [学习路径](/learning-path/) — 4 条 0→1 路线，每条 2-6 小时（系统化串联 17 篇文章）
- 📖 [概念解读](/articles/) — 关键概念深度文章（GraphRAG / ReAct / GLA / KG 质量评估等）
- 🗂️ [资源导航](/category/) — 分类聚合的论文/项目/教程（核心项目 / 论文综述 / 教程博客）
- 🏷️ [分类目录](/category/) — 按主题浏览
- 🏷️ [标签索引](/tag/) — 按关键词浏览
- ℹ️ [关于本站](/about/) — 项目背景与维护说明

## 技术栈

- **[Astro v6](https://astro.build/)** — 零 JS 默认输出，内容集合 API
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Vite 插件 + CSS 变量主题
- **[TypeScript](https://www.typescriptlang.org/)** — 类型安全
- **[AstroWind](https://github.com/arthelokyo/astrowind)** — 主题骨架（BSD-3 / 商业可用，基于 MIT）
- **[GitHub Pages](https://pages.github.com/)** + **[GitHub Actions](https://github.com/features/actions)** — 自动部署

## 快速开始

本地预览与构建：

```bash
git clone https://github.com/LyuBailin/agent-kg-hub.git
cd agent-kg-hub
npm install          # 需要 Node.js >= 22.12
npm run dev          # http://localhost:4321
npm run build
npm run preview
```

## 部署

仓库已配置 GitHub Actions 自动部署：推送到 `main` 分支即触发构建并发布到 <https://LyuBailin.github.io/agent-kg-hub/>。

## 维护节奏

- **每周**：核心资源审核 + 1 篇新资源录入
- **每月**：1 篇概念解读长文 + 主题/UI 优化
- **每季度**：生态全景盘点 + 大版本更新

详细路线见 [`ROADMAP.md`](ROADMAP.md)。

## 许可与引用

- **代码**：[MIT License](LICENSE)
- **内容（文章/资源点评）**：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — 署名即可转载
- **引用**：见 [`CITATION.cff`](CITATION.cff)

---

<sub>Maintained by [@LyuBailin](https://github.com/LyuBailin)</sub>