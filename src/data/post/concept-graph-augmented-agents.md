---
title: '图智能体(GLA)入门 — 把"图"作为 Agent 系统的统一抽象'
excerpt: '2025 年 IEEE 综述正式定义的图智能体(Graph-Augmented LLM Agent)方向,把 Agent 的规划、记忆、工具、协同四个维度统一抽象为"图"。理解 GLA,就理解了 2024-2026 Agent 领域的核心演进。'
publishDate: 2026-07-27
category: '核心概念'
tags: ['图智能体', 'GLA', 'Graph-Augmented Agent', 'Agent', 'LLM', '综述']
image: ~/assets/images/cover-concept-graph-augmented-agents.png
author: 'LyuBailin'
---

# 图智能体(GLA)入门:把"图"作为 Agent 系统的统一抽象

> 理解 GLA,就理解了 2024-2026 Agent 领域的核心演进。

## 为什么写这篇

LLM Agent 领域 2023-2025 年出现了大量工作:

- LangGraph 叫"图状态机"
- AutoGen 叫"对话流"
- CrewAI 叫"角色协作"
- LangChain 叫"Chain/AgentExecutor"

**问题**:这些不同的抽象到底在表达什么?它们之间是替代关系,还是同一件事的不同视角?

2025 年 7 月,IEEE Intelligent Systems 发表的综述《Graph-Augmented Large Language Model Agents》正式给出了答案:**这一切都是"图智能体(Graph-Augmented LLM Agent, GLA)"的不同投影**。

本文是这个方向的入门解读。

---

## 一、为什么需要 GLA

### 1. 术语混乱

Agent 领域的术语碎片化严重。同一件事在不同框架里叫不同名字:

- "Agent"在 LangChain 是 LLM + 工具循环,在 AutoGen 是能发消息的角色
- "Workflow"在 LangGraph 是 StateGraph,在 CrewAI 是 task 链
- "Multi-Agent"在不同框架里协作模式完全不同

新学者很难搞清楚"这个框架和那个框架到底有什么区别"。

### 2. 概念重复

虽然名字不同,这些框架的底层数据结构高度相似:

- LangGraph 的 StateGraph = AutoGen 的 GroupChat Manager = CrewAI 的 Crew = 都有"节点 + 边"
- 它们都支持"暂停-恢复"和"分支合并"

**重复造轮子背后,是一个被反复发现的同一件事**。

### 3. 缺统一理论

没有"Agent 系统"的形式化定义,所有讨论都在案例层面,无法形成可比较、可分析、可推广的理论。

---

## 二、GLA 的核心思想

### 一句话定义

> **图智能体(GLA)是用图结构作为统一抽象语言来建模 LLM Agent 系统的研究方向。**

G = Graph(图):节点是某种智能单元,边是某种关系  
LA = LLM Agent:用 LLM 作为智能核心的 Agent 系统

GLA 不是某个具体框架,而是**一个看待 Agent 系统的新视角**:把"图"作为分析、设计、实现 Agent 系统的统一语言。

### 核心论点

**任何 LLM Agent 系统的关键结构,本质上都是图。** 不管是 LangGraph 的 StateGraph、AutoGen 的消息流、CrewAI 的角色协作,都可以用"节点 + 边"来形式化。

---

## 三、四个维度

GLA 综述把 Agent 系统的关键结构分为四个维度,每个维度都是图的不同视角。

### 1. 规划(Planning):图作为"思考结构"

**节点**:思维步骤 / 子任务  
**边**:依赖 / 时序

ReAct 范式的 Thought-Action-Observation 循环,可以画成有向图:

```
[Question] → [Thought 1] → [Action 1] → [Observation 1] → [Thought 2] → ...
```

Plan-and-Execute 更直接:LLM 一次性生成 plan tree(规划树),每一步是节点。

**意义**:把"思考"从黑盒变成白盒,让 Agent 的规划过程可视化、可调试、可优化。

### 2. 记忆(Memory):图作为"长期记忆"

**节点**:实体 / 概念 / 事件  
**边**:关系 / 因果 / 时序

最自然的形式就是知识图谱(KG):

- GraphRAG 用 KG 作为长期记忆,Local Search 是"实体中心子图检索",Global Search 是"全图聚合"
- MemGPT 把对话历史组织为树形记忆
- LangChain 的"Conversation Knowledge Graph"把对话实体关系化

**意义**:LLM 短期记忆有限,图结构让"无限记忆"成为可能,且支持高效检索。

### 3. 工具(Tools):图作为"工具编排"

**节点**:工具 / API / 函数  
**边**:调用关系 / 数据流

LangGraph 的 StateGraph、AWS Step Functions、Apache Airflow 的 DAG,都是这种"工具编排图"。

多步工作流 = 在图上找一条从输入到输出的路径。

**意义**:把"工具调用"从写死代码变成可配置、可视化、可重用的图。

### 4. 协同(Multi-Agent):图作为"通信拓扑"

**节点**:Agent 角色  
**边**:消息流 / 协作关系

- AutoGen 的 GroupChat:节点是 Agent,边是发言关系
- CrewAI 的 Crew:节点是 Role,边是 Task 依赖
- MetaGPT 的 SOP(标准作业流程):节点是角色,边是产物传递

**意义**:多 Agent 协作的核心问题是"谁在什么时候和谁通信",图结构天然适合表达这个问题。

---

## 四、从静态图到动态图

### 静态图(2023-2024)

开发者**预先定义**图结构,LLM 在图的节点上执行。LangGraph 的 StateGraph、AutoGen 的 GroupChat 都是这种。

- ✅ 可控、可预测
- ❌ 不能适应未预见的复杂情况

### 动态图(2024-2025)

LLM **运行时**构建/修改图结构。比如 ReAct 的 Thought→Action→Observation 就是 LLM 在动态构建图。

更激进的:让 LLM 直接生成图的结构描述(如 JSON),然后框架解析执行。AutoGen 的"可编程 Agent"、LangGraph 的动态分支都是这种。

- ✅ 灵活,能处理未见过的复杂任务
- ❌ 可控性差,容易跑偏

### 趋势

2025-2026 主流是**静态骨架 + 动态细节**:开发者定义主要节点和大致流程,LLM 在每个节点内做灵活决策。

---

## 五、GLA 视角下的项目坐标

| 框架 | 主要抽象 | 静态/动态 | GLA 视角 |
|------|----------|----------|----------|
| LangGraph | StateGraph | 静态骨架 + 动态边 | 工具编排 + 记忆 |
| AutoGen | GroupChat | 静态拓扑 + 动态消息 | 协同图 |
| CrewAI | Crew + Task | 静态 DAG | 工具编排 + 协同 |
| smolagents | CodeAgent | 完全动态 | 动态规划 |
| MemGPT | 记忆层级 | 静态层级 + 动态写入 | 记忆图 |
| GraphRAG | KG + 四种检索 | 静态图 + 静态查询 | 记忆图 |
| LangChain | Chain/Agent | 静态 + 动态混合 | 通用工具编排 |

**结论**:这些项目不是替代关系,是用"图"的不同维度来解决不同问题。

---

## 六、GLA 的可解释性

这是 GLA 视角最被低估的价值。

### 传统视角:Agent 是黑盒

LLM 调用工具,返回结果,中间发生了什么很难追溯。

### GLA 视角:Agent 是在图上行走

把 Agent 的每一步记录到图上,人类可以直接"读图":

- 它访问了哪些节点(工具 / 实体 / 思维)?
- 走的是哪条路径?
- 在哪个节点上分叉 / 合并?
- 哪些节点被重复访问(可能死循环)?

**这就是"可解释性"。**

QA-GNN、KG-R1 这类工作本质上都是:在图上找到关键路径,作为 LLM 决策的解释。

---

## 七、GLA 视角下的研究机会

综述指出几个 open directions:

### 1. 统一运行时

现在每个框架有自己的运行时。能不能做一个支持多种图模式的统一运行时?

### 2. 图的自动学习

让 LLM 自动学习"什么样的图结构适合什么样的任务",而不是开发者手写。

### 3. 图的迁移学习

在 A 任务上学到的图结构,能不能迁移到 B 任务?

### 4. 大规模图上的 Agent

当图有 10 亿节点 / 100 亿边时,Agent 怎么高效检索?这是 GraphRAG 已经在解决的问题。

---

## 八、动手实践:从 GLA 视角设计一个 Agent

假设你想做一个"研究助手"Agent,从 GLA 视角设计:

### 1. 规划图(ReAct)

```
[用户问题]
  ↓
[Thought:分解问题]
  ↓
[Action:search(topic1)]  [Action:search(topic2)]  [Action:search(topic3)]
  ↓
[Observation] (每个 topic 检索结果)
  ↓
[Thought:整合信息]
  ↓
[Action:finish[答案]]
```

### 2. 记忆图(KG)

每条 Observation 提取实体和关系,加入 KG:

```
[Apple] --[CEO]--> [Tim Cook]
[Tim Cook] --[加入于]--> [1998]
[Apple] --[总部]--> [Cupertino]
```

### 3. 工具图(工具编排)

```
[search] → [web search engine]
[lookup] → [KG query]
[finish] → [LLM 总结]
```

### 4. 协同图(未来扩展)

```
[Researcher] → 协调 → [Writer] → 协调 → [Reviewer]
```

这就是 GLA 视角:同一件事,从四个维度看都是图。

---

## 九、关键 takeaway

1. **图是 Agent 系统的统一抽象语言** — 四个维度(规划/记忆/工具/协同)本质上都是图
2. **不要纠结框架名字,看底层结构** — LangGraph / AutoGen / CrewAI 都在做"图"的事,只是侧重不同
3. **图带来可解释性** — 把 Agent 决策画在图上,人类可读、可审计
4. **GLA 是 2025-2026 最值得跟踪的研究方向** — 综述正式定义后,会有大量 follow-up 工作

---

## 十、下一步

1. 📄 [IEEE 综述原文](https://arxiv.org/abs/2507.21407) — 完整论证
2. 💻 [LangGraph 文档](https://langchain-ai.github.io/langgraph/) — 静态图 + 动态边的最佳实践
3. 📚 配套阅读:本仓库「IEEE 综述《Graph-Augmented LLM Agents》」资源条目
4. 📚 配套阅读:本仓库「QA-GNN」资源条目(可解释性的早期工作)

---

## 参考

- [Graph-Augmented Large Language Model Agents: A Comprehensive Survey](https://arxiv.org/abs/2507.21407) - IEEE Intelligent Systems, 2025
- [LangGraph: Multi-Agent Workflows](https://langchain-ai.github.io/langgraph/)
- [AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation](https://arxiv.org/abs/2308.08155)
- [QA-GNN: Reasoning with Language Models and Knowledge Graphs for Question Answering](https://arxiv.org/abs/2104.06378)
