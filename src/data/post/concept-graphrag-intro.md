---
title: 'GraphRAG 入门 — 工业级图增强 RAG 的原理与实践'
excerpt: '从传统 RAG 的痛点出发,系统讲解 GraphRAG 的核心思想:为什么需要图谱、索引阶段如何构建图谱、四种检索模式如何应对不同问题、动手跑通一个最小 demo。'
publishDate: 2026-07-27
category: '核心概念'
tags: ['GraphRAG', 'RAG', '知识图谱', '概念解读', '微软']
image: ~/assets/images/cover-concept-graphrag-intro.png
author: 'LyuBailin'
---

# GraphRAG 入门:工业级图增强 RAG 的原理与实践

> 当向量检索遇到"全局性问题"和"实体关系"时力不从心 — GraphRAG 用一张图来补足。

## 为什么写这篇

GraphRAG 是 Agent × KG 主题里落地最广、最有工业背书的方案。但网上讲它的文章要么太浅("跑通 demo 就完了"),要么太深(直接啃论文),缺一个**工程师视角的系统入门**。

本文目标:用 30 分钟,让你彻底理解 GraphRAG 的核心思想、关键设计、能/不能解决什么问题。

---

## 一、传统 RAG 的两大痛点

### 痛点 1:全局性问题答不好

**问题**:"我们公司 2025 年所有项目的主题分布如何?"

**传统 RAG 怎么答**:
- 把 query 转成 embedding
- 在向量库找最相似的 top-k chunks
- LLM 基于这 k 个 chunks 回答

**问题在哪**:top-k 永远是"最相似",但"主题分布"这种问题需要**所有文档的聚合信息**,top-k 给的只是局部。

### 痛点 2:实体关系断裂

**问题**:"A 公司 CEO 之前在哪个公司工作过?"

**传统 RAG 怎么答**:
- 找"A 公司 CEO"的 chunk
- LLM 从中找到 CEO 名字
- 再找"X 公司"的 chunk

**问题在哪**:如果 A 公司的 CEO 没在某篇文档里被显式提到"之前在 X 公司",就答不上。**关系没有结构化**,藏在文本里很难挖掘。

---

## 二、GraphRAG 的核心思想

**一句话总结**:把语料库先转成知识图谱(实体-关系-社区),再在图上做检索。

```
传统 RAG:   query → embedding → top-k chunks → LLM
GraphRAG:   query → 图检索(实体+子图+社区) → 结构化上下文 → LLM
```

GraphRAG 的检索返回的不是"相关文本",而是"相关实体 + 相关关系 + 相关社区摘要"。LLM 拿到的是结构化信息,而不是松散的文本块。

---

## 三、索引阶段:从语料到图谱

GraphRAG 的索引是一次性离线操作,流程如下:

```
原始文档
  ↓ (chunking)
文档块
  ↓ (LLM 实体/关系抽取)
实体-关系三元组
  ↓ (构图)
知识图谱
  ↓ (Leiden 社区检测)
多层社区
  ↓ (LLM 社区摘要)
社区摘要
  ↓ (持久化)
图谱索引
```

### 关键步骤说明

**1. 实体/关系抽取**

用 LLM 从每个文档块抽取:

```json
{
  "entities": [
    {"name": "GraphRAG", "type": "技术", "description": "微软开源的图增强 RAG 方案"},
    {"name": "微软", "type": "公司", "description": "GraphRAG 的开发方"}
  ],
  "relations": [
    {"source": "微软", "target": "GraphRAG", "description": "开发并开源"}
  ]
}
```

LLM 在这一步**完成"非结构化文本 → 结构化知识"的转换**。这其实就是"LLM 增强 KG"范式在工业界的完整实现。

**2. 社区检测**

用 Leiden 算法(一种成熟的图社区发现算法)在实体-关系图上做层次化聚类:

- 第一层:大社区(比如"LLM Agent"社区)
- 第二层:大社区里的子社区(比如"图增强 Agent"子社区)
- 第三层:更细的子社区(比如"GraphRAG 项目"子社区)

**3. 社区摘要**

用 LLM 为每个社区生成自然语言摘要,描述"这个社区讲的是什么"。这样检索时不用遍历图,直接用社区摘要匹配。

---

## 四、四种检索模式

GraphRAG v2.x 提供四种检索模式,各自应对不同问题:

### 1. Local Search(本地搜索)

**适合问题**:围绕具体实体的细粒度问答。

**问题例子**:"GraphRAG 是哪个公司开源的?"

**机制**:
- 从 query 抽取关键实体(GraphRAG)
- 在图上做 k-hop 邻居展开
- 收集实体周围的属性、关系、相邻实体
- 生成"实体中心"的上下文给 LLM

**优势**:快、准、局部信息充分

### 2. Global Search(全局搜索)

**适合问题**:跨文档的全局性问题。

**问题例子**:"这份报告的主题分布如何?"

**机制**:
- 把社区摘要作为 map-reduce 的输入
- LLM 并行处理所有社区,生成"部分答案"
- 聚合 LLM 给出"最终全局答案"

**优势**:能处理需要聚合全库信息的问题

### 3. DRIFT Search(动态检索)

**适合问题**:本地+全局混合的复杂问题。

**问题例子**:"对比一下 A 项目和 B 项目的设计哲学。"

**机制**:
- 先做 Local Search 拿到初始相关实体
- 基于初始结果做 PR(随机游走)扩展
- 动态决定是否升级到 Global Search

**优势**:灵活,适合长尾问题

### 4. LazyGraphRAG(懒加载)

**适合问题**:索引成本敏感的场景。

**问题例子**:大文档库、预算有限

**机制**:
- 不提前构建完整图谱
- 查询时按需展开
- 平衡查询成本和质量

**优势**:索引成本几乎为 0,适合一次性任务

---

## 五、动手跑通最小 demo

### 准备工作

```bash
# 克隆仓库
git clone https://github.com/microsoft/graphrag.git
cd graphrag

# 安装依赖(需要 Python 3.10+)
pip install -e .

# 准备 .env
echo "GRAPHRAG_API_KEY=<your-openai-key>" > .env
```

### 准备语料

```bash
mkdir -p ./ragtest/input
# 把你的文档放到 input/ 目录,支持 .txt 和 .csv
```

### 索引

```bash
python -m graphrag.index --root ./ragtest
```

这会跑完上面"索引阶段"的全部流程,生成 `./ragtest/output` 目录。

### 查询

```bash
# Local Search
python -m graphrag.query \
  --root ./ragtest \
  --method local \
  --query "GraphRAG 是哪个公司开源的?"

# Global Search
python -m graphrag.query \
  --root ./ragtest \
  --method global \
  --query "这份报告的主题分布如何?"
```

### Python SDK 方式

```python
import asyncio
from graphrag.query import local_search, global_search

async def main():
    # Local Search
    result = await local_search(
        config=config,
        query="GraphRAG 是哪个公司开源的?"
    )
    print(result.response)

    # Global Search
    result = await global_search(
        config=config,
        query="这份报告的主题分布如何?"
    )
    print(result.response)

asyncio.run(main())
```

---

## 六、GraphRAG 的局限

不是银弹,也有边界:

| 局限 | 说明 |
|------|------|
| **索引成本高** | 全量文档过 LLM,初次索引可能花几小时到几天 |
| **依赖 LLM 质量** | 实体抽取质量直接决定检索质量 |
| **不适合短文档** | 文档<1k 时,图谱增益不明显 |
| **增量更新难** | 新文档加入要重新索引,或做复杂增量逻辑 |
| **查询延迟较高** | 比纯向量检索慢 2-5 倍 |

---

## 七、与其他方案对比

| 方案 | 适合场景 | 优势 | 劣势 |
|------|----------|------|------|
| **纯向量 RAG** | 单文档 QA、相似查询 | 简单、快 | 全局问题弱 |
| **GraphRAG** | 全局性、实体关系类 | 解决两大痛点 | 索引成本高 |
| **LightRAG** | 轻量场景 | 快、低成本 | 复杂关系表现一般 |
| **HippoRAG** | 神经-符号融合 | 生物学启发 | 工业落地不成熟 |
| **KAG** | 企业级知识管理 | 阿里出品,工程化好 | 中文场景强,英文弱 |

---

## 八、生产环境集成建议

如果你想在自己的项目里用 GraphRAG:

1. **文档量评估**:低于 1k 文档不建议上 GraphRAG
2. **索引时机选择**:全量重建 vs 增量更新 — 推荐先用全量重建验证效果
3. **混合检索**:GraphRAG + 向量检索混合,前者处理结构化查询,后者处理相似查询
4. **监控指标**:构建延迟、查询延迟、社区覆盖率、答案质量
5. **回退方案**:对查询做分类,GraphRAG 不擅长的走传统 RAG

---

## 九、下一步

学完本文后,建议按以下顺序继续:

1. 📖 [官方文档](https://microsoft.github.io/graphrag/) — 完整 API
2. 📄 [The GraphRAG Manifesto](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/) — 核心思想
3. 📄 [LazyGraphRAG 论文](https://arxiv.org/abs/2411.18428) — 最新检索范式
4. 💻 [GitHub 仓库](https://github.com/microsoft/graphrag) — 跑通更多示例
5. 📚 配套阅读:本仓库「Microsoft GraphRAG 资源导航」条目

---

## 参考

- [Microsoft GraphRAG GitHub](https://github.com/microsoft/graphrag)
- [GraphRAG: Unlocking LLM discovery on narrative private data](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/)
- [LazyGraphRAG: Setting New Standards for Cost-Effective RAG](https://arxiv.org/abs/2411.18428)
- [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130)
