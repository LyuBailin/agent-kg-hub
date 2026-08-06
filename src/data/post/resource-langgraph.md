---
title: 'LangGraph — 把 Agent 状态机画成有向图'
excerpt: 'LangChain 团队出品的 Agent 编排框架,用有向图建模 Agent 的状态、循环、条件分支,支持 Human-in-the-Loop、Checkpoint、Time-Travel。是当前最成熟的 Agent 状态机方案。'
publishDate: 2026-07-27
category: '核心项目'
tags: ['LangGraph', 'Agent', '状态机', '编排', 'LLM']
image: ~/assets/images/cover-resource-langgraph.png
author: 'LyuBailin'
---

# LangGraph

> 用有向图建模 Agent 状态机的代表作。

- 🔗 仓库: <https://github.com/langchain-ai/langgraph>
- ⭐ Stars: 80k+ (2026 年 7 月)
- 📜 协议: MIT
- 🏢 维护: LangChain Inc.
- 🐍 语言: Python + TypeScript SDK

## 它解决什么问题

Agent 框架的两大流派:

1. **ReAct/循环式** — 简单的 "LLM 决定调用哪个 tool" 循环,适合单步任务
2. **图状态机式** — 多个节点、有循环、有分支、有持久化,适合复杂多步任务

LangGraph 是第二流派的代表。当你需要:
- 多个 Agent 协作(子图)
- 人在环审批(Human-in-the-Loop)
- 长时程任务的暂停/恢复
- 状态回溯调试(Time-Travel)

— 简单 ReAct 循环就不够用了,需要图状态机。

## 核心抽象

```python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
import operator

class State(TypedDict):
    messages: Annotated[list, operator.add]
    next_step: str

def search_node(state: State) -> State:
    # 调用 search tool
    return {"messages": [...]}

def summarize_node(state: State) -> State:
    # 总结搜索结果
    return {"messages": [...]}

graph = StateGraph(State)
graph.add_node("search", search_node)
graph.add_node("summarize", summarize_node)
graph.add_edge("search", "summarize")
graph.set_entry_point("search")
app = graph.compile()
```

`StateGraph` 是核心:`State` 是跨节点共享的状态,`Node` 是处理函数,`Edge` 控制流转。

## 关键能力

| 能力 | 用法 | 适用场景 |
|------|------|----------|
| **Checkpoint** | 自动保存每步状态 | 长时程任务,断点续传 |
| **Time-Travel** | 回到任意历史状态重放 | 调试,人工接管 |
| **Human-in-the-Loop** | `interrupt_before` 暂停等审批 | 金融/医疗高风险场景 |
| **Subgraph** | 节点本身就是另一个图 | 多 Agent 嵌套 |
| **Streaming** | 边执行边输出 token | UI 实时反馈 |

## 为什么对 Agent × KG 重要

- LangGraph 的"图"和"知识图谱"是同构概念 — 它是**图智能体(GLA)**这一研究方向最成熟的工程实现
- 你可以把 GraphRAG 的检索步骤直接作为 LangGraph 的一个 Node,组成完整 Pipeline
- StateGraph 的状态本质上是 Agent 的"短期记忆",可以和 KG 的"长期记忆"形成互补

## 适合谁

- ✅ 需要构建复杂多步 Agent 系统的工程师
- ✅ 想给 Agent 加 Human-in-the-Loop 的产品经理
- ✅ 研究多 Agent 协作的算法工程师
- ❌ 不适合:只想快速调用一两次 tool 的轻量任务(用 LangChain 即可)

## 推荐阅读顺序

1. [Quick Start](https://langchain-ai.github.io/langgraph/tutorials/introduction/) — 5 分钟上手
2. [Human-in-the-Loop 教程](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/) — 实用模式
3. [Multi-Agent 范例](https://github.com/langchain-ai/langgraph/tree/main/examples/multi_agent) — 高级用法
