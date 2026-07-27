---
title: 'ReAct 入门 — Reasoning + Acting 协同的范式革命'
excerpt: '2022 年 Google Research 提出的 ReAct 范式,把"推理"和"行动"统一到一个 LLM 循环里,是当前几乎所有 Agent 框架的底层逻辑。本文讲清它是什么、为什么有效、如何实现。'
publishDate: 2026-07-27
category: '核心概念'
tags: ['ReAct', 'Agent', 'Reasoning', 'Acting', 'LLM', 'Prompt Engineering']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# ReAct 入门:Reasoning + Acting 协同的范式革命

> 几乎所有现代 Agent 框架的底层逻辑,都是从 ReAct 衍生出来的。

## 为什么写这篇

提到 Agent,99% 的对话都会绕到 ReAct。但网上讲它的文章要么只讲概念("推理 + 行动交替"),要么直接给代码不讲为什么。

本文目标:用 30 分钟,让你**理解 ReAct 的核心思想、为什么有效、能/不能解决什么问题、如何落地**。

---

## 一、ReAct 之前的世界

### 1. 早期 LLM 的两大能力路线

- **Chain-of-Thought (CoT)**:让 LLM 一步步推理("让我们一步步想"),但只能"想"不能"做"
- **Tool Use (工具调用)**:让 LLM 调用外部工具(计算器、搜索),但调用逻辑是写死的

**问题**:CoT 没有行动能力,Tool Use 没有推理能力。两个能力各管一段,接不上。

### 2. ReAct 的洞察

Google Research 2022 年提出的核心问题:**能不能让 LLM 在"想"和"做"之间自然切换?**

答案是:可以。在 prompt 里让 LLM 输出"Thought → Action → Observation"三段式循环。

```
Thought 1: 用户问 X,我需要先查 Y
Action 1: search[Y]
Observation 1: Y 的搜索结果是...

Thought 2: 看起来 Z 是关键,继续查 Z
Action 2: lookup[Z]
Observation 2: ...

Thought 3: 现在我有足够信息,可以回答
Action 3: finish[答案]
```

每一轮 LLM 都做三件事:

1. **Thought**:思考下一步该做什么
2. **Action**:选择工具并调用
3. **Observation**:观察工具返回,更新认知

---

## 二、ReAct 的工作原理

### 完整 Prompt 模板

```
你是一个可以使用以下工具的助手:
- search[query]:搜索 query 并返回结果
- lookup[keyword]:在已有信息中查找 keyword
- finish[answer]:基于以上信息给出最终答案

回答用户问题时,按以下格式输出:

Question: <用户的问题>
Thought 1: <你的思考>
Action 1: <工具调用>
Observation 1: <工具返回>
Thought 2: <下一步思考>
Action 2: <下一步工具调用>
Observation 2: <下一步返回>
... (循环)
Thought N: 我已经收集到足够信息
Action N: finish[最终答案]
```

### 一个具体例子

**问题**:"苹果公司的 CEO 是什么时候加入公司的?"

```
Question: 苹果公司的 CEO 是什么时候加入公司的?
Thought 1: 我需要先查苹果现任 CEO 是谁
Action 1: search[苹果现任 CEO]
Observation 1: 蒂姆·库克(Tim Cook)
Thought 2: 现在我需要查蒂姆·库克什么时候加入苹果
Action 2: search[蒂姆·库克 加入 苹果 时间]
Observation 2: 蒂姆·库克于 1998 年加入苹果公司
Thought 3: 我已经得到答案
Action 3: finish[蒂姆·库克于 1998 年加入苹果公司,目前担任 CEO。]
```

### 关键设计要点

1. **Thought 暴露推理过程**:让 LLM "说出"它在做什么,比让它"暗中"推理更稳定
2. **Action 是结构化的**:每次只能选一个工具,接口清晰
3. **Observation 闭合循环**:工具返回后,LLM 看到结果再决定下一步
4. **终止条件明确**:用 `finish[answer]` 显式结束

---

## 三、ReAct 为什么有效

### 1. 解决幻觉

LLM 单独回答"苹果 CEO 什么时候加入"会编造。ReAct 强制它调用搜索工具,基于真实信息回答。

### 2. 解决知识陈旧

LLM 训练数据有截止日期。ReAct 通过工具调用获取最新信息。

### 3. 解决复杂任务

单次 LLM 调用解决不了多步任务。ReAct 通过循环把任务拆成多步,逐步逼近答案。

### 4. 可解释性

Thought 输出本身就是推理过程,人类可以直接看,方便调试和审计。

### 5. 可组合性

不同任务可以配不同工具集。ReAct 框架本身不绑定任何工具。

---

## 四、ReAct 的局限

| 局限 | 说明 | 缓解 |
|------|------|------|
| **循环次数多** | 复杂任务可能 10+ 轮,token 消耗大 | 限制 max_iterations |
| **Thought 可能跑偏** | LLM 在循环中可能"绕圈子" | 加错误检测 + 重试机制 |
| **Action 选错** | LLM 选错工具,导致循环死锁 | 提供工具描述 + 示例 |
| **Observation 解析** | 工具返回非结构化文本,难解析 | 用结构化输出(JSON) |
| **没记忆** | 每轮 Thought 重新开始,跨轮信息可能丢失 | 在 prompt 里维护 history |

---

## 五、用 30 行 Python 实现 ReAct

```python
from openai import OpenAI
import re

client = OpenAI()

# 工具定义
def search(query):
    # 实际实现里调用搜索引擎 API
    return f"[search result for {query}]"

def lookup(keyword):
    return f"[lookup result for {keyword}]"

# ReAct 循环
def react(question, max_steps=5):
    history = [f"Question: {question}"]
    for step in range(1, max_steps + 1):
        # 让 LLM 生成 Thought + Action
        prompt = "\n".join(history) + f"\nThought {step}:"
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt + " Action {step}:"}],
            stop=[f"\nObservation {step}:"]
        ).choices[0].message.content

        # 解析 Action
        thought, action = response.strip().split(f"\nAction {step}:")
        history.append(f"Thought {step}: {thought.strip()}")
        history.append(f"Action {step}: {action.strip()}")

        # 终止?
        if action.startswith("finish"):
            return action[len("finish["):-1]

        # 执行 Action
        if action.startswith("search"):
            result = search(action[len("search["):-1])
        elif action.startswith("lookup"):
            result = lookup(action[len("lookup["):-1])
        else:
            result = "[unknown action]"

        history.append(f"Observation {step}: {result}")

    return "[max steps reached]"

# 测试
print(react("苹果公司的 CEO 是什么时候加入公司的?"))
```

这只是个 toy 实现,生产环境要用 LangGraph / smolagents 等框架。

---

## 六、ReAct 的现代演进

### 1. ReAct → Reflexion

加入"自我反思"步骤:循环结束后,让 LLM 反思哪里做错了,把反思结果加到 prompt 里再次尝试。

### 2. ReAct → Plan-and-Execute

先用 LLM 一次性生成完整 plan(规划),再按计划执行。ReAct 是"边想边做",Plan-and-Execute 是"先想后做"。

### 3. ReAct → Multi-Agent

多个 ReAct Agent 协作,每个 Agent 负责一个子任务,通过 message 传递协调。

### 4. ReAct → Graph-of-Thoughts(GoT)

把 ReAct 的线性循环改为图结构,允许回溯、分支、合并。LangGraph 是其工程化代表。

---

## 七、实战建议

### 1. 工具描述要清晰

LLM 选错工具,90% 是因为工具描述不清楚。每个工具描述应该包括:

- 工具名
- 工具功能
- 输入参数
- 输出格式
- 使用示例

### 2. 限制最大步数

防止死循环。一般 5-10 步,复杂任务可以到 20 步。

### 3. 监控每步质量

记录每轮的 Thought / Action / Observation,失败 case 收集起来改 prompt。

### 4. 配合 Few-shot 示例

在 prompt 里给 1-2 个 Thought-Action-Observation 的完整示例,效果立竿见影。

### 5. 选对模型

ReAct 对模型推理能力要求高。GPT-4 / Claude 3.5 / DeepSeek-V3 都可以,Gemini 1.5 Pro 在复杂任务上表现尤其好。开源模型 Llama 3.1 70B 也能跑通大部分任务。

---

## 八、ReAct 与 KG 的关系

ReAct 本身不直接涉及 KG。但:

1. **KG 可以作为 ReAct 的工具**:LLM 通过 SPARQL/Cypher 查询 KG,把结果作为 Observation
2. **KG 可以增强 ReAct 的推理**:把 KG 子图作为 Thought 的上下文,提升 LLM 推理质量
3. **ReAct 可以构建 KG**:LLM 通过 ReAct 循环从文本抽取实体和关系,逐步构建 KG

**GraphRAG 实际上就是 ReAct + KG 的结合**:用 ReAct 范式处理用户问题,用 KG 作为长期记忆。

---

## 九、下一步

学完本文后,建议按以下顺序继续:

1. 📄 [ReAct 原始论文](https://arxiv.org/abs/2210.03629) — 完整方法 + 实验
2. 💻 [LangGraph 文档](https://langchain-ai.github.io/langgraph/) — ReAct 的工程化实现
3. 💻 [smolagents 源码](https://github.com/huggingface/smolagents) — 1k 行核心的极简 ReAct
4. 📚 配套阅读:本仓库「LangGraph」「smolagents」资源条目

---

## 参考

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11381)
- [LangGraph: Multi-Agent Workflows](https://langchain-ai.github.io/langgraph/)
- [HuggingFace smolagents](https://huggingface.co/blog/smolagents)
