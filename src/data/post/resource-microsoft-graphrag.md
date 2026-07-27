---
title: 'Microsoft GraphRAG — 工业级 KG 增强 RAG 的事实标准'
excerpt: '微软 2024 年 7 月开源的图增强 RAG 方案,提供 Local/Global/DRIFT/Lazy 四种检索模式,已迭代到 v2.x,是当前 KG 增强 LLM 范式最成熟的工业实现。'
publishDate: 2026-07-27
category: '核心项目'
tags: ['GraphRAG', 'RAG', '知识图谱', '微软', 'LLM']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# Microsoft GraphRAG

> 工业级 KG 增强 RAG 方案的事实标准。

- 🔗 仓库: <https://github.com/microsoft/graphrag>
- ⭐ Stars: 28k+ (2026 年 7 月)
- 📜 协议: MIT
- 🏢 维护: Microsoft Research
- 🚀 首发: 2024 年 7 月
- 📦 当前版本: v2.x

## 它解决什么问题

传统 RAG 的两大痛点:

1. **跨文档全局问题答不好**:"数据集的主题分布如何?" 这种需要聚合多文档的问题,纯向量检索只能给一堆相关 chunk,无法回答。
2. **实体关系断裂**:query 涉及多个实体和它们的关系时,向量相似度匹配不到隐含的图结构。

GraphRAG 的核心思路:先从语料构建知识图谱(实体-关系-社区),再在图上做检索。检索时不仅返回相关文本,还返回相关社区/子图,让 LLM 拿到更结构化的上下文。

## 关键技术点

### 1. 索引阶段(LLM 增强 KG)

- 用 LLM 从文档抽取实体和关系 → 构建图
- 用 Leiden 算法做社区检测 → 多层社区摘要
- 这一步其实就是 LLM 增强 KG 范式的完整实现

### 2. 四种检索模式

| 模式 | 用途 | 何时用 |
|------|------|--------|
| **Local Search** | 围绕具体实体的细粒度问答 | 问"X 公司 CEO 是谁?" |
| **Global Search** | 跨文档的全局性问题 | 问"数据集的主题分布?" |
| **DRIFT Search** | 动态检索+过滤(动态相关性+社区遍历) | 需要综合本地和全局的问题 |
| **LazyGraphRAG** | 延迟构建图谱,按需展开 | 不想提前花高额索引成本 |

### 3. 部署友好

- 支持 OpenAI 兼容接口(Azure OpenAI、OpenAI、DeepSeek 等)
- 支持 Ollama 本地模型
- CLI + Python SDK + REST API

## 为什么对 Agent × KG 重要

GraphRAG 是**用 KG 增强 LLM** 范式在 2024-2026 年最成熟、最有工业背书的实现。

- 它把"图谱构建"成本前置到索引阶段,运行时检索成本可控
- 它的四种检索模式覆盖了 80% 的企业知识管理场景
- 它证明了"KG + LLM 双向流动"(LLM 建图,KG 增强 LLM 检索)能跑通工业级部署

做 Agent × KG 主题的开发者,**至少要把 GraphRAG 的 README 和 4 种检索模式吃透**。

## 适合谁

- ✅ 想给企业知识库/技术文档库加图谱增强的工程师
- ✅ 关注 LLM 检索增强的算法工程师
- ✅ 调研 AI 产品新形态的产品经理
- ❌ 不适合:数据量 < 1k 文档的小项目(索引成本不划算)

## 推荐阅读顺序

1. [官方 README](https://github.com/microsoft/graphrag/blob/main/README.md) — 跑通最小 demo
2. [The GraphRAG Manifesto](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/) — 核心思想
3. [LazyGraphRAG 论文](https://arxiv.org/abs/2411.18428) — 最新检索范式
4. [官方文档](https://microsoft.github.io/graphrag/) — 部署实战
