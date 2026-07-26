# Agent KG Hub · Agent × 知识图谱技术资源导航

> 聚焦 LLM Agent 与知识图谱(KG)交叉领域的技术资源导航 + 关键概念深度解读。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-4F46E5?logo=github)](https://LyuBailin.github.io/agent-kg-hub/)
[![License: MIT](https://img.shields.io/badge/License-MIT-4338CA.svg)](LICENSE)
[![Astro v6](https://img.shields.io/badge/Astro-v6-0EA5E9?logo=astro)](https://astro.build/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

## 这是什么

一个长期维护的"Agent × KG"主题资源库,核心理念是 **轻量资源聚合 + 关键概念深度解读** 的混合定位:

- 📚 **资源导航**:分类整理论文、开源项目、博客、视频教程,每条附原创点评
- ✍️ **概念解读**:对 GraphRAG、图智能体(GLA)、KG 增强 LLM 等核心概念做深度文章
- 🇨🇳 **中文为主**:面向中文开发者,关键论文/项目保留英文原文链接

## 三大融合范式

| 范式 | 含义 | 代表项目 |
|------|------|----------|
| **KG 增强 LLM** | 用图谱缓解幻觉、提升可解释性 | [Microsoft GraphRAG](https://github.com/microsoft/graphrag) · [ERNIE](https://github.com/PaddlePaddle/ERNIE) · [KEPLER](https://github.com/THU-KEG/KEPLER) |
| **LLM 增强 KG** | 用 LLM 解决 KG 构建瓶颈 | KG 补全(KGC) · 实体/关系抽取 · KG-to-Text |
| **LLM 与 KG 协同** | 二者作为对等伙伴共同推理 | [QA-GNN](https://github.com/michiyasunaga/qagnn) · LARK · 自我进化 Agent |

## 内容导航

- 📖 [概念解读](/articles/) — 关键概念深度文章
- 🗂️ [资源导航](/resources/) — 分类聚合的论文/项目/教程
- 🏷️ [分类目录](/category/) — 按主题浏览
- 🏷️ [标签索引](/tag/) — 按关键词浏览
- ℹ️ [关于本站](/about/) — 项目背景与维护说明

## 技术栈

- **[Astro v6](https://astro.build/)** — 零 JS 默认输出,内容集合 API
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Vite 插件 + CSS 变量主题
- **[TypeScript](https://www.typescriptlang.org/)** — 类型安全
- **[AstroWind](https://github.com/arthelokyo/astrowind)** — 主题骨架(BSD-3 / 商业可用,基于 MIT)
- **[GitHub Pages](https://pages.github.com/)** + **[GitHub Actions](https://github.com/features/actions)** — 自动部署

## 快速开始

本地预览与构建:

```bash
# 1. 克隆仓库
git clone https://github.com/LyuBailin/agent-kg-hub.git
cd agent-kg-hub

# 2. 安装依赖(需要 Node.js >= 22.12)
npm install

# 3. 本地开发服务器
npm run dev
# 打开 http://localhost:4321

# 4. 生产构建
npm run build

# 5. 预览构建结果
npm run preview
```

## 部署

仓库已配置 GitHub Actions 自动部署:

- 推送到 `main` 分支 → 触发 `.github/workflows/pages.yml` → 构建 + 部署到 GitHub Pages
- 在线访问: **<https://LyuBailin.github.io/agent-kg-hub/>**

部署源配置(在 GitHub 仓库 Settings → Pages):

- **Source**: GitHub Actions
- **Custom domain**: (可选,后续接入)

## 内容贡献

欢迎推荐资源或投稿概念解读文章。流程:

1. 提 Issue 描述资源/选题(推荐先聊一下,避免重复)
2. 在 `src/content/articles/` 下新建 `.md` 或 `.mdx` 文件
3. 提交 PR,GitHub Actions 自动跑构建验证
4. 合并后自动部署上线

文章 frontmatter 示例:

```yaml
---
title: 'GraphRAG 原理与实践'
excerpt: '从微软开源方案看 KG 增强 RAG 的工程化路径'
publishDate: 2026-07-30
category: '核心概念'
tags: ['GraphRAG', 'RAG', '知识图谱', 'LLM']
---
```

## 维护节奏

- **每周**:核心资源审核 + 1 篇新资源录入
- **每月**:1 篇概念解读长文 + 主题/UI 优化
- **每季度**:生态全景盘点 + 大版本更新

详细路线见 [`ROADMAP.md`](ROADMAP.md)。

## 许可与引用

- **代码**:[MIT License](LICENSE)
- **内容(文章/资源点评)**:[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — 署名即可转载
- **引用**:见 [`CITATION.cff`](CITATION.cff)

## 相关链接

- 📦 [GitHub 仓库](https://github.com/LyuBailin/agent-kg-hub)
- 🌐 [在线站点](https://LyuBailin.github.io/agent-kg-hub/)
- 📝 [项目维护说明](https://github.com/LyuBailin/agent-kg-hub/blob/main/src/content/pages/about.md)
- 🐛 [提交 Issue](https://github.com/LyuBailin/agent-kg-hub/issues)

---

<sub>Built with [Astro](https://astro.build/) · Theme: [AstroWind](https://github.com/arthelokyo/astrowind) · Maintained by [@LyuBailin](https://github.com/LyuBailin)</sub>
