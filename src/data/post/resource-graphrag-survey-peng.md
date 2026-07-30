---
title: '《Graph Retrieval-Augmented Generation: A Survey》— GraphRAG 的第一份系统性综述'
excerpt: 'Peng 等人 2024 年 8 月发布的 arXiv 综述(2408.08921),首次形式化定义 GraphRAG 的 G-Indexing / G-Retrieval / G-Generation 三阶段流水线,系统梳理技术谱系、下游任务与工业方案,是做 GraphRAG 方向工程和研究必读的 baseline 论文。'
publishDate: 2026-07-30
category: '论文综述'
tags: ['GraphRAG', '综述', 'Survey', '知识图谱', 'RAG']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# 《Graph Retrieval-Augmented Generation: A Survey》

> 2024 年 8 月 arXiv 上线,是 GraphRAG 方向**第一份**系统性综述。

- 📄 论文: <https://arxiv.org/abs/2408.08921>
- 📅 发表: 2024 年 8 月
- 👥 作者: Boci Peng 等 7 人
- 📚 状态: Ongoing work,作者维护了一个 GitHub 仓库持续追踪新工作

## 它解决什么问题

GraphRAG 自 2024 年起爆发式增长(Microsoft GraphRAG、LightRAG、Neo4j LLM Graph Builder 接连开源),但整个领域**缺乏统一的形式化定义和分类体系**:

- 各种实现的技术栈千差万别(NetworkX vs Neo4j vs Kuzu、社区检测 vs 子图采样)
- 各种"图增强"指代不同(知识图谱 / 文本图 / 多跳推理链)
- 各种命名令人混乱(GraphRAG / RAG-on-Graph / KG-RAG / Graph Agent RAG)

这篇综述第一次提出**统一的 GraphRAG 形式化定义**和**三阶段流水线**,把所有现有工作放进同一个坐标系。

## 核心贡献

### 1. 形式化定义 GraphRAG 三阶段流水线

```
G-Indexing(图索引) → G-Retrieval(图检索) → G-Generation(图增强生成)
```

- **G-Indexing**:从语料构建图(实体/关系抽取、子图采样、文本图编码)
- **G-Retrieval**:在图上做检索(子图遍历、社区检测、个性化 PageRank、向量+图谱混合)
- **G-Generation**:把图检索结果喂给 LLM 生成答案(图感知 prompt、图增强解码)

### 2. 核心技术分类

论文给每个阶段都做了**技术谱系图**:

- G-Indexing:基于 LLM 抽取 / 基于 GNN 编码 / 基于文本图
- G-Retrieval:基于子图 / 基于社区 / 基于向量 / 混合
- G-Generation:基于 prompt / 基于微调 / 基于 agent

每种技术都标了**代表工作**和**优缺点**,等于给读者一张"技术地图"。

### 3. 下游任务与基准

系统整理 GraphRAG 的下游任务:
- 问答(KBQA / 开放域 QA / 多跳 QA)
- 摘要(查询聚焦摘要 / 多文档摘要)
- 推理(常识推理 / 时序推理)
- 对话(知识增强对话 / 任务型对话)

附上常用基准(HotpotQA / WebQSP / CWQ / MetaQA 等)和工业方案(Microsoft GraphRAG / Neo4j LLM Graph Builder / HippoRAG / LightRAG)。

### 4. 未来方向

论文末尾列出 5 个**尚未解决**的关键问题:
1. 动态图谱的实时更新
2. 多模态(文本+图像+表格)的统一图谱表示
3. 大规模图谱(>10 亿节点)的可扩展性
4. 图谱质量评估的标准化基准
5. 与 LLM 训练流程的深度结合(预训练/微调阶段就利用图谱)

## 为什么对 Agent × KG 重要

做 GraphRAG 方向,有这篇综述和没这篇综述是两种状态:

- **没有它**:你需要自己读 30+ 篇论文,自己拼凑技术谱系
- **有了它**:你直接拿到"技术地图 + 论文清单 + 评估基准",**节省 2-3 周调研时间**

更关键的是,它把"GraphRAG"从一个**营销词**变成了一个**有清晰边界的研究方向**。后续所有 GraphRAG 相关工作(包括 Microsoft GraphRAG v2、LightRAG、HippoRAG 2)的定位和对比,都可以参照这篇综述的分类体系。

如果你的工作涉及:
- 在 RAG 流程里加图谱 → 引用本文 G-Indexing + G-Retrieval 章节
- 设计新的图检索算法 → 引用本文 G-Retrieval 章节
- 评估 GraphRAG 性能 → 引用本文 benchmark 章节
- 调研 GraphRAG 工业方案 → 引用本文 industrial use case 章节

## 与其他综述的关系

| 综述 | 关注点 | 与本文的区别 |
|------|--------|-------------|
| **Peng et al. 2024**(本文) | GraphRAG 整体 | **最全面、最系统**,baseline 引用 |
| **Edge et al. 2024**(GraphRAG 论文) | 社区检测+分层摘要 | 仅微软的方案细节,不覆盖其他实现 |
| **Agrawal et al. 2024**(KG 增强 LLM 综述) | 知识图谱接入 LLM | 偏 KG 视角,不专门讨论 RAG 流程 |
| **Huang et al. 2024**(图智能体综述) | LLM Agent 用图 | 偏 Agent 视角,GraphRAG 只占一部分 |

推荐**先读本文**建立坐标系,再根据具体方向选读其他综述。

## 适合谁

- ✅ 想入门 GraphRAG 的工程师/学生(节省调研时间)
- ✅ 准备发论文的科研人员(综述类 baseline 引用)
- ✅ 设计 RAG 平台的产品架构师(参考工业方案清单)
- ✅ 评估 GraphRAG 商业可行性的决策者(看未来方向章节)
- ❌ 不适合:只想用现成框架的初学者(直接读 Microsoft GraphRAG README 即可)

## 局限

- "Ongoing work" 状态,作者持续更新,引用前需 check 最新版
- 部分技术分类边界模糊(如"基于子图"和"基于社区"有重叠)
- 工业方案部分滞后于开源社区的实际进展(综述成文后又有 10+ 新工作)
- 评估基准和指标章节相对薄弱,主要是引用其他领域的基准

## 推荐阅读顺序

1. [arXiv 论文](https://arxiv.org/abs/2408.08921) — 完整版,重点读第 3-5 章
2. [配套 GitHub 仓库](https://github.com/BoChen-Ye/GraphRAG-Survey) — 追踪最新工作
3. 对照阅读 [Microsoft GraphRAG 论文](https://arxiv.org/abs/2404.16130) — 看工业级实现
4. 对照阅读 [LightRAG 论文](https://arxiv.org/abs/2410.05779) — 看轻量级实现
