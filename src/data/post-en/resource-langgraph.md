---
title: 'LangGraph — Modeling Agent State Machines as Directed Graphs'
excerpt: 'LangChain''s Agent orchestration framework, modeling Agent state, loops, and conditional branches as a directed graph. Supports Human-in-the-Loop, Checkpoint, and Time-Travel. The most mature Agent state-machine solution today.'
publishDate: 2026-07-27
category: 'Core Projects'
tags: ['LangGraph', 'Agent', 'State Machine', 'Orchestration', 'LLM']
image: ~/assets/images/cover-resource-langgraph.png
author: 'LyuBailin'
---

# LangGraph

> The go-to framework for modeling Agent state machines as directed graphs.

- 🔗 Repo: <https://github.com/langchain-ai/langgraph>
- ⭐ Stars: 80k+ (as of July 2026)
- 📜 License: MIT
- 🏢 Maintainer: LangChain Inc.
- 🐍 Language: Python + TypeScript SDK

## What Problem Does It Solve

Two schools in Agent frameworks:

1. **ReAct / loop-based** — Simple "LLM decides which tool to call" loop, suitable for single-step tasks
2. **Graph state machine** — Multiple nodes, loops, branches, and persistence, suitable for complex multi-step tasks

LangGraph represents the second school. When you need:

- Multiple Agents collaborating (subgraphs)
- Human-in-the-loop approval
- Pause/resume of long-running tasks
- State backtracking for debugging (Time-Travel)

— a simple ReAct loop isn't enough. You need a graph state machine.

## Core Abstraction

```python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
import operator

class State(TypedDict):
    messages: Annotated[list, operator.add]
    next_step: str

def search_node(state: State) -> State:
    # Call search tool
    return {"messages": [...]}

def summarize_node(state: State) -> State:
    # Summarize search results
    return {"messages": [...]}

graph = StateGraph(State)
graph.add_node("search", search_node)
graph.add_node("summarize", summarize_node)
graph.add_edge("search", "summarize")
graph.set_entry_point("search")
app = graph.compile()
```

`StateGraph` is the core: `State` is the shared state across nodes, `Node` is a processing function, `Edge` controls flow.

## Key Capabilities

| Capability | Usage | Use Case |
|------------|-------|----------|
| **Checkpoint** | Auto-save state at each step | Long-running tasks, resume from interruption |
| **Time-Travel** | Return to any historical state to replay | Debugging, human takeover |
| **Human-in-the-Loop** | `interrupt_before` to pause for approval | High-stakes scenarios (finance, medical) |
| **Subgraph** | A node is itself another graph | Multi-Agent nesting |
| **Streaming** | Stream tokens as they're generated | Real-time UI feedback |

## Why It's Important for Agent × KG

- LangGraph's "graph" and "knowledge graph" are **isomorphic concepts** — it's the most mature engineering implementation of the **Graph-Augmented Agent (GLA)** research direction
- You can directly use GraphRAG's retrieval step as a Node in LangGraph to compose a complete pipeline
- StateGraph's state is essentially the Agent's "short-term memory", which can complement KG's "long-term memory"

## Who Is It For

- ✅ Engineers building complex multi-step Agent systems
- ✅ Product managers wanting to add Human-in-the-Loop to Agents
- ✅ Algorithm engineers researching multi-Agent collaboration
- ❌ Not for: lightweight tasks that just need a couple of tool calls (use LangChain instead)

## Recommended Reading Order

1. [Quick Start](https://langchain-ai.github.io/langgraph/tutorials/introduction/) — 5-minute onboarding
2. [Human-in-the-Loop tutorial](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/) — Practical patterns
3. [Multi-Agent examples](https://github.com/langchain-ai/langgraph/tree/main/examples/multi_agent) — Advanced usage
