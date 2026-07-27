---
title: 'QA-GNN — 把 KG 推理路径喂给 LLM,让问答可解释'
excerpt: 'ACL 2021 最佳论文候选,提出把 KG 推理路径(子图)作为 LLM 的输入,增强问答的可解释性。是 LLM 与 KG 协同范式最经典的早期工作之一。'
publishDate: 2026-07-27
category: '核心项目'
tags: ['QA-GNN', '知识图谱', '问答', '可解释性', 'GNN']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# QA-GNN

> 把 KG 推理路径作为 LLM 的输入 — 经典的可解释问答方案。

- 🔗 仓库: <https://github.com/michiyasunaga/qagnn>
- 📄 论文: [QA-GNN: Reasoning with Language Models and Knowledge Graphs for Question Answering](https://arxiv.org/abs/2104.06378)
- 📚 会议: ACL 2021(最佳论文候选)
- 🏢 作者: Michihiro Yasunaga(HuggingFace)、Jure Leskovec(Stanford)

## 它解决什么问题

当时(2021)LLM 还在 GPT-3 阶段,可解释问答是开放问题。QA-GNN 的方案:

1. 用 GNN 在 KG 上做推理,得到与 question 相关的子图
2. 把"question + KG 子图"一起喂给 LLM
3. LLM 基于结构化上下文生成答案

**关键洞察**:LLM 知道语言,但不知道结构;GNN 知道结构,但不知道语言。两者结合 = 1+1 > 2。

## 技术亮点

### 1. Joint Reasoning

不是"先 GNN 后 LLM"的串行,而是联合训练:

- GNN 的输出作为 LLM 的输入 embedding
- LLM 的反向传播信号更新 GNN 参数
- 两端协同优化

### 2. Subgraph Extraction

不是把整个 KG 喂给 LLM(太大),而是先做子图抽取:

- 从 question 抽取相关实体
- 在 KG 上做 k-hop 子图扩展
- 用 PMAT(Pruning Merging Answer Tailoring)剪枝

### 3. 可解释性

答案不仅有结果,还有推理路径:从 question 实体到 answer 实体,在 KG 上的路径就是解释。

## 为什么对 Agent × KG 重要

- **LLM 与 KG 协同范式的范本**:它证明了"两者各管一段"能跑通
- **可解释性**:Agent 决策可解释性是 2024-2026 的热点,QA-GNN 的思路(推理路径作为解释)直接可用
- **Subgraph 抽取**:这其实是 GraphRAG Local Search 的前身

## 现代启示

2024-2026 视角下,QA-GNN 的"GNN+LLM"被替换为:

- **GNN** → 简单的图查询(OpenCypher, SPARQL)或向量检索(GraphRAG)
- **联合训练** → 检索增强(RAG)的离线索引 + 在线检索

但它**"KG 推理路径作为可解释性载体"**的核心思想,在 2026 年仍是 Agent 可解释性研究的主流方案之一。

## 适合谁

- ✅ 研究 KG + LLM 协同推理的研究生
- ✅ 关注 Agent 可解释性的工程师
- ✅ 想理解这个领域经典工作的入门者

## 配套资源

- 论文: <https://arxiv.org/abs/2104.06378>
- 代码: <https://github.com/michiyasunaga/qagnn>
- 讲解视频: <https://www.youtube.com/watch?v=ji1j_SKEnAA>
