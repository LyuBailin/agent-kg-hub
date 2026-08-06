---
title: 'LightRAG — 港大出品,轻量级 GraphRAG 的工业实践'
excerpt: 'LightRAG(2024 年 10 月,港大 HKUDS)以"双层检索 + 图索引"重构 GraphRAG,把索引成本降低一个数量级,支持增量更新与本地模型,4 万+ stars,是当前中小团队/个人开发者落地图增强 RAG 的最优工程选择。'
publishDate: 2026-07-30
category: '核心项目'
tags: ['LightRAG', 'GraphRAG', 'RAG', '知识图谱', 'HKU']
image: ~/assets/images/cover-resource-lightrag.png
author: 'LyuBailin'
---

# LightRAG

> "Light" 不是功能弱,而是把图增强 RAG 的工程复杂度降到最低。

- 🔗 仓库: <https://github.com/HKUDS/LightRAG>
- ⭐ Stars: 40k+ (2026 年 7 月)
- 📜 协议: MIT
- 🏢 维护: 香港大学数据智能系统实验室(HKUDS)
- 📄 论文: arXiv 2410.05779(EMNLP 2025)
- 🚀 首发: 2024 年 10 月

## 它解决什么问题

Microsoft GraphRAG(2024 年 7 月)虽然把"KG 增强 RAG"做成了工业级方案,但有两个**致命痛点**:

1. **索引成本高**:用 Leiden 算法做社区检测+全量社区摘要,几百页文档要跑几十分钟,API 调用成本上千刀
2. **不支持增量更新**:新增文档必须**重建**整个社区结构,生产环境几乎不可用

LightRAG 的回应:**双层检索范式 + 增量更新算法**。

- 双层检索:同时支持"low-level"(围绕具体实体)和"high-level"(全局主题)
- 增量更新:新数据走"局部图索引 → set merge 合并"路径,不再重建全局

## 最小可跑示例

```python
from lightrag import LightRAG, QueryParam

WORKING_DIR = "./dickens"
rag = LightRAG(working_dir=WORKING_DIR)

with open("./book.txt") as f:
    rag.insert(f.read())           # 一次性摄入

# 四种查询模式按需切换
print(rag.query("主要主题?", param=QueryParam(mode="naive")))    # 纯向量
print(rag.query("Sydney Carton 做了什么?", param=QueryParam(mode="local")))   # 实体中心
print(rag.query("贯穿全书的核心主题?", param=QueryParam(mode="global")))   # 全局主题
print(rag.query("Carton 和 Darnay 的关系?", param=QueryParam(mode="hybrid")))   # 融合
```

5 行代码,跑通《双城记》整本小说的图增强问答。

## 四种检索模式

| 模式 | 检索策略 | 适合问题类型 |
|------|---------|-------------|
| `naive` | 纯向量相似度 | 简单事实查找 |
| `local` | 实体为中心的局部图 | 具体人物/概念 |
| `global` | 全图关系主题 | 跨实体宏观主题 |
| `hybrid` | local + global 融合 | 复杂推理(推荐默认) |

## 核心特性

### 1. 图谱 + 向量双索引

- **图谱层**:用 LLM 抽实体+关系 → 存 NetworkX/Neo4j/Memgraph
- **向量层**:对实体名、关系描述、文本块分别嵌入 → 存 NanoVectorDB/PGVector/Milvus/Qdrant
- 查询时双路召回再融合

### 2. 增量更新是杀手锏

```python
# 新增文档,直接 insert 即可,自动合并到现有图
rag.insert(open("./new_doc.txt").read())
```

- 不破坏已有图结构
- 不重建社区
- 适合生产环境的"持续喂数据"场景

### 3. 后端存储可插拔

- **图存储**:NetworkX(默认)/ Neo4j / PostgreSQL(AGE 插件)/ Memgraph
- **向量存储**:NanoVectorDB(默认)/ PGVector / Milvus / Qdrant / Faiss
- **KV 存储**:JSON(默认)/ Redis / PostgreSQL / MongoDB
- **文档状态**:JSON(默认)/ PostgreSQL / MongoDB

生产级部署可以全部换成 PostgreSQL 一套搞定。

### 4. 本地模型原生支持

```python
from lightrag.llm.ollama import ollama_model_complete, ollama_embed

rag = LightRAG(
    working_dir=WORKING_DIR,
    llm_model_func=ollama_model_complete,
    llm_model_name="qwen2.5:7b",
    llm_model_kwargs={"options": {"num_ctx": 32768}},
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        func=lambda texts: ollama_embed(texts, embed_model="nomic-embed-text"),
    ),
)
```

Ollama / Hugging Face / OpenAI 兼容接口全部一行切换,适合数据隐私场景。

### 5. WebUI + REST API

`lightrag-server` 起一个 FastAPI 服务,自带 Web 界面和图谱可视化,直接当 demo 工具用。

## 为什么对 Agent × KG 重要

- **RAG 是 Agent 的"短期记忆",KG 是"长期记忆"**。LightRAG 把这条分界线变得可工程化
- 它的"local/global 双层检索"正好对应 Agent 的两种推理模式:具体事实查证(local)+ 全局态势感知(global)
- 增量更新 + 多后端存储让它适合做**生产级 RAG**,而不是 demo
- 对比 Microsoft GraphRAG 28k stars,LightRAG 40k+ stars 的人气,说明**社区用脚投票了**

## 适用场景

- ✅ 中小规模知识库(几千到几十万文档)的图增强 RAG
- ✅ 需要**持续喂数据**的运营场景(客服知识库 / 产品文档 / 内部 wiki)
- ✅ **本地部署**要求(数据隐私 / 成本控制)
- ✅ 想用 Neo4j/PostgreSQL 做图存储,但又不想重写 GraphRAG 整套管线
- ❌ 不适合:超大规模企业语料(>百万文档)— 优先用 Microsoft GraphRAG + 分布式社区检测
- ❌ 不适合:对抽取质量要求 100% 准确的科研/法律场景(LLM 抽取有幻觉)

## 局限

- 对 LLM 能力要求**比传统 RAG 高** — 实体-关系抽取是 hard task,建议 ≥32B 模型或 GPT-4
- 默认 LLM 抽取是英文 prompt,中文场景需要切换 `SUMMARY_LANGUAGE=Chinese`
- 图谱后处理(实体合并、关系去重)没有 Microsoft GraphRAG 成熟
- 文档量大时(>10w 文档)单实例可能撑不住,需要上分布式

## 性能对比(论文数据)

论文在 Agriculture / CS / Legal / Mixed 4 个数据集上对比 LightRAG vs NaiveRAG / RQ-RAG / HyDE / GraphRAG,LightRAG 在**全面性 / 多样性 / 赋能性**三个指标上均胜出,且 token 消耗比 GraphRAG 低**2-3 个数量级**。

## 推荐阅读顺序

1. [官方 README](https://github.com/HKUDS/LightRAG) — 15 分钟跑通双城记 demo
2. [论文 arXiv 2410.05779](https://arxiv.org/abs/2410.05779) — 双层检索范式原理
3. [LearnOpenCV 完整指南](https://learnopencv.com/lightrag/) — 第三方深度教程
4. [LightRAG WebUI](https://github.com/HKUDS/LightRAG#lightrag-api-server) — 快速搭一个 demo
