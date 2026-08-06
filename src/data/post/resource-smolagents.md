---
title: 'HuggingFace smolagents — 极简 Code Agent 范式'
excerpt: 'HuggingFace 开源的极简 Agent 框架,核心代码约 1000 行,让 LLM 直接生成 Python 代码执行动作。比传统 JSON 工具调用效率提升约 30%,是 Code Agent 范式的代表作。'
publishDate: 2026-07-27
category: '核心项目'
tags: ['smolagents', 'Code Agent', 'HuggingFace', '极简', 'LLM']
image: ~/assets/images/cover-resource-smolagents.png
author: 'LyuBailin'
---

# HuggingFace smolagents

> 1000 行核心代码,展示了 Code Agent 范式的极简形态。

- 🔗 仓库: <https://github.com/huggingface/smolagents>
- ⭐ Stars: 22k+ (2026 年 7 月)
- 📜 协议: Apache 2.0
- 🏢 维护: HuggingFace
- 📝 博客: [smolagents: the simplest library for AI agents](https://huggingface.co/blog/smolagents)

## 它解决什么问题

传统 Agent 的工具调用长这样(JSON):

```json
{
  "name": "search",
  "arguments": {"query": "GraphRAG", "top_k": 5}
}
```

LLM 要先"决定"调用哪个工具 → 生成 JSON → 系统解析 → 执行 → 把结果再喂给 LLM。这种"中间表示"既慢又不灵活。

**Code Agent 范式**:让 LLM 直接生成 Python 代码,系统执行代码。优势:

1. **表达力更强** — 循环/条件/异常处理原生支持
2. **更省 token** — 一次生成完整逻辑,不用每步都"调用-等待"
3. **更接近人类思考** — 人类解决复杂问题也是写代码,不是填 JSON

## 核心设计

```python
from smolagents import CodeAgent, HfApiModel, DuckDuckGoSearchTool

agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()],
    model=HfApiModel()
)

agent.run("调研一下 GraphRAG 最近的进展,写一份 500 字综述")
```

核心抽象只有两个:

- `CodeAgent`:Agent 类,内部循环是"生成 Python 代码 → sandbox 执行 → 拿到结果 → 再生成"
- `Tool`:Tool 类,通过 `@tool` 装饰器定义

## 关键特性

| 特性 | 说明 |
|------|------|
| **极简** | 核心代码 1k 行,15 分钟能读懂全部 |
| **沙箱执行** | 默认用 E2B/Docker 隔离,代码安全 |
| **多模型支持** | HF Inference API、OpenAI、Anthropic、Ollama 都行 |
| **CodeAct 模式** | 主要范式,LLM 生成 Python |
| **ToolCallingAgent** | 备选范式,LLM 生成 JSON(兼容老习惯) |

## 为什么对 Agent × KG 重要

- **极简可读**:1k 行核心,适合作为"读懂 Agent 内部机制"的入门教材
- **CodeAct 范式**与"用代码操作 KG"天然契合 — 可以用 Cypher/SPARQL/NetworkX 写图查询
- 当你需要在 Agent 里嵌入图谱操作时,smolagents 的 Tool 抽象比 LangChain 的更直接

## 适合谁

- ✅ 想深入理解 Agent 内部机制的工程师
- ✅ 做 Agent 教学/培训
- ✅ 需要快速原型验证
- ❌ 不适合:生产环境的复杂多步任务(用 LangGraph)

## 推荐阅读

1. [官方博客](https://huggingface.co/blog/smolagents) — 15 分钟了解全貌
2. [源码导读](https://github.com/huggingface/smolagents/tree/main/src/smolagents) — 1k 行核心
3. [示例合集](https://github.com/huggingface/smolagents/tree/main/examples) — 实战参考
