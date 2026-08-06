---
title: 'Cognee — 6 行代码给 AI Agent 装上长期记忆'
excerpt: 'Cognee(2024 出现,~7k+ stars)是面向 AI Agent 的开源 AI 记忆引擎,核心思路是 ECL(Extract-Cognify-Load)流水线 + 向量+图双存储,允许用 6 行 Python 代码从对话/文档构建可检索的知识图谱,替代传统 RAG 作为 Agent 的记忆层。'
publishDate: 2026-07-30
category: '核心项目'
tags: ['Cognee', 'Agent Memory', '知识图谱', 'AI 记忆', 'LLM']
image: ~/assets/images/cover-resource-cognee.png
author: 'LyuBailin'
---

# Cognee

> 给 AI Agent 装长期记忆的最短路径 — 6 行 Python。

- 🔗 仓库: <https://github.com/topoteretes/cognee>
- ⭐ Stars: 7k+ (2026 年 7 月)
- 📜 协议: Apache 2.0
- 🏢 维护: topoteretes(德国)
- 🐍 语言: Python
- 🚀 首发: 2024 年

## 它解决什么问题

传统 LLM 应用的两个痛点:

1. **记忆断裂**:LLM 本身没有跨会话记忆,每次对话都是"失忆"的。开发者只能用 RAG 把外部文档塞进 context,但 RAG 是 stateless 的,不能反映 Agent 实际产生的对话和工具调用。
2. **RAG 答非所问**:纯向量检索擅长"找段落",但问"上周我们讨论过 X 这个方案的缺点是什么?"这种**时序+实体关系**问题时,向量检索完全失效 — 因为它根本不知道你和 Agent 之前聊过什么。

Cognee 的核心思路:**把 Agent 产生的对话、外部文档、工具调用结果都抽取成实体-关系图谱,作为 Agent 的可查询长期记忆**。

## 最小可跑示例

```python
import cognee
from cognee.api.v1.search import SearchType

text = """自然语言处理(NLP)是计算机科学与信息检索的交叉子领域。"""

await cognee.prune.prune_data()           # 清空历史
await cognee.add(text)                     # 喂入文本
await cognee.cognify()                     # 抽实体建图谱
results = await cognee.search(             # 检索
    query_type=SearchType.GRAPH_COMPLETION,
    query_text="Tell me about NLP",
)
```

只要 6 行核心代码,Cognee 就能从一段文本里抽出 NLP / 计算机科学 / 信息检索这些实体,以及"是...的子领域"这样的关系。

## 核心特性

### 1. ECL 流水线(Extract-Cognify-Load)

- **Extract**:从原始数据(对话/文档/图片转录)抽取文本 chunk
- **Cognify**:用 LLM 把 chunk 抽成实体-关系,写入图数据库;同时算嵌入写入向量数据库
- **Load**:统一管理图+向量双存储,提供一致的查询接口

### 2. 向量 + 图谱双存储

- **图数据库**(默认 Kuzu,可选 Neo4j):存实体、关系、社区
- **向量数据库**(默认 LanceDB,可接 Qdrant/Chroma/PGVector):存语义向量
- **双路检索**:问句同时走"图谱路径搜索"和"向量相似度",再融合结果

### 3. 多种搜索模式

- `GRAPH_COMPLETION`:基于图谱结构化推理
- `RAG_COMPLETION`:纯向量 RAG
- `SUMMARIES`:社区摘要
- `CHUNKS`:返回原始 chunk
- `CODE`:生成 Cypher/代码查询图

### 4. 内置图谱后处理

- 实体去重与合并
- 关系规范化(同义关系合并)
- 社区检测(Leiden 算法)

### 5. 30+ 数据源接入

本地文件(PDF/DOCX/MD)、Notion / Slack / Google Drive、数据库(postgres / SQLite)、S3 / GCS、Web 页面、YouTube 转录,几乎覆盖所有常见数据源。

## 为什么对 Agent × KG 重要

Cognee 直接命中了 Agent × KG 范式里**最具体、最刚需**的场景:**Agent 长期记忆**。

- 比起 Microsoft GraphRAG,Cognee 的设计目标不是"对静态语料做企业级 RAG",而是"给单 Agent 或多 Agent 系统装可持久化的、可跨会话查询的记忆"
- 比起 Mem0(另一个 Agent 记忆项目),Cognee 用的是**完整的实体-关系图谱**而不是简化的 key-value 记忆 — 适合需要"回忆关联事件"而非"回忆事实"的场景
- Cognee 支持的"对话作为数据源"(`cognee.add(chat_history)`)是 Agent 场景的关键 — 让 Agent 自己的输出也能反哺记忆

实际工程里,你会把它当成 Agent 框架(LangGraph / AutoGen)的**记忆后端**,所有对话和工具结果都过一遍 `cognee.add()`,Agent 决策前调 `cognee.search()` 拿历史上下文。

## 适用场景

- ✅ **个人 AI 助手/秘书**:跨会话记住用户偏好、历史决策、项目状态
- ✅ **客服 Agent**:基于历史工单构建客户专属知识图谱
- ✅ **研究助理**:把论文 PDF + 自己的笔记合并成可推理图谱
- ✅ **多 Agent 系统**:共享同一份"组织记忆",新 Agent 加入可快速 onboarding
- ❌ **不适合**:单轮 FAQ 问答(直接用朴素 RAG 即可,引入 Cognee 是过度工程)
- ❌ **不适合**:超大规模企业知识库(>100 万文档,优先用 Microsoft GraphRAG 这种工业级方案)

## 局限

- 项目还在快速迭代(版本 v0.1+),API 偶有 breaking change,生产环境需锁版本
- 对 LLM 抽取质量依赖强,小模型(如 7B)抽出的实体关系噪声较大,推荐 32B+ 或 GPT-4
- 双存储(向量+图)带来运维复杂度,需要同时管理两套数据库
- 对中文支持需要选对 LLM(默认 prompt 是英文)

## 推荐阅读顺序

1. [官方 README](https://github.com/topoteretes/cognee/blob/main/README.md) — 5 分钟跑通 demo
2. [Cognee Docs](https://docs.cognee.ai/) — 完整 API 与概念
3. [Notebooks 目录](https://github.com/topoteretes/cognee/tree/main/notebooks) — 多模态、关系数据库集成等实战
4. [Discord 社区](https://discord.gg/cognee) — 与维护者直接交流
