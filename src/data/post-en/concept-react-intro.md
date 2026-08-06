---
title: 'ReAct Onboarding — The Paradigm Revolution of Reasoning + Acting Synergy'
excerpt: 'The ReAct paradigm proposed by Google Research in 2022 unifies "reasoning" and "acting" into a single LLM loop. It is the underlying logic of nearly all modern Agent frameworks. This article explains what it is, why it works, and how to implement it.'
publishDate: 2026-07-27
category: 'Core Concepts'
tags: ['ReAct', 'Agent', 'Reasoning', 'Acting', 'LLM', 'Prompt Engineering']
image: ~/assets/images/cover-concept-react-intro.png
author: 'LyuBailin'
---

# ReAct Onboarding: The Paradigm Revolution of Reasoning + Acting Synergy

> The underlying logic of nearly all modern Agent frameworks derives from ReAct.

## Why I Wrote This

When talking about Agents, 99% of conversations eventually loop back to ReAct. But online articles about it are either too shallow ("just reasoning + acting") or jump straight to code without explaining the why.

This article aims to: in 30 minutes, give you a thorough understanding of ReAct's core ideas, why it works, what it can/cannot solve, and how to land it.

---

## 1. The World Before ReAct

### 1. Two Schools of Early LLM Capabilities

- **Chain-of-Thought (CoT)**: Let the LLM reason step by step ("let's think step by step"), but can only "think", not "do"
- **Tool Use**: Let the LLM call external tools (calculator, search), but the calling logic is hardcoded

**The problem**: CoT has no action capability; Tool Use has no reasoning capability. The two capabilities each handle a part and don't connect.

### 2. The ReAct Insight

The core question raised by Google Research in 2022: **Can the LLM naturally switch between "thinking" and "doing"?**

The answer is yes. In the prompt, let the LLM output a "Thought → Action → Observation" three-part loop.

```
Thought 1: User asks X, I need to look up Y first
Action 1: search[Y]
Observation 1: Search result for Y is...

Thought 2: Z seems key, look up Z
Action 2: lookup[Z]
Observation 2: ...

Thought 3: Now I have enough info to answer
Action 3: finish[answer]
```

In each round the LLM does three things:

1. **Thought**: Think about what to do next
2. **Action**: Select a tool and call it
3. **Observation**: Observe the tool's return and update understanding

---

## 2. How ReAct Works

### Complete Prompt Template

```
You are an assistant that can use the following tools:
- search[query]: Search for query and return results
- lookup[keyword]: Look up keyword in existing information
- finish[answer]: Give the final answer based on the information above

When answering user questions, output in the following format:

Question: <user's question>
Thought 1: <your thinking>
Action 1: <tool call>
Observation 1: <tool return>
Thought 2: <next thinking>
Action 2: <next tool call>
Observation 2: <next return>
... (loop)
Thought N: I have collected enough information
Action N: finish[final answer]
```

### A Concrete Example

**Question**: "When did Apple's CEO join the company?"

```
Question: When did Apple's CEO join the company?
Thought 1: I need to first look up who Apple's current CEO is
Action 1: search[Apple current CEO]
Observation 1: Tim Cook
Thought 2: Now I need to look up when Tim Cook joined Apple
Action 2: search[Tim Cook joined Apple date]
Observation 2: Tim Cook joined Apple in 1998
Thought 3: I have the answer
Action 3: finish[Tim Cook joined Apple in 1998 and currently serves as CEO.]
```

### Key Design Points

1. **Thought exposes reasoning**: Letting the LLM "speak out" what it's doing is more stable than letting it reason "in the dark"
2. **Action is structured**: Each round can only pick one tool; the interface is clear
3. **Observation closes the loop**: After the tool returns, the LLM sees the result and decides the next step
4. **Termination is explicit**: Use `finish[answer]` to explicitly end

---

## 3. Why ReAct Works

### 1. Solves Hallucination

LLM alone answering "when did Apple CEO join" will fabricate. ReAct forces it to call search tools, answering based on real information.

### 2. Solves Knowledge Staleness

LLM training data has a cutoff date. ReAct gets the latest information through tool calls.

### 3. Solves Complex Tasks

Single LLM calls can't solve multi-step tasks. ReAct splits tasks into multiple steps through loops, gradually approaching the answer.

### 4. Explainability

Thought output IS the reasoning process, directly readable by humans, easy to debug and audit.

### 5. Composability

Different tasks can be configured with different tool sets. ReAct framework itself doesn't bind to any tool.

---

## 4. ReAct's Limitations

| Limitation | Description | Mitigation |
|------------|-------------|------------|
| **Many loop iterations** | Complex tasks may need 10+ rounds, high token consumption | Limit max_iterations |
| **Thought may drift** | LLM may "go in circles" in the loop | Add error detection + retry mechanism |
| **Wrong action** | LLM picks the wrong tool, leading to deadlock | Provide clear tool descriptions + examples |
| **Observation parsing** | Tools return unstructured text, hard to parse | Use structured output (JSON) |
| **No memory** | Each round's Thought starts fresh, cross-round info may be lost | Maintain history in prompt |

---

## 5. Implementing ReAct in 30 Lines of Python

```python
from openai import OpenAI
import re

client = OpenAI()

# Tool definitions
def search(query):
    # In a real implementation, call a search engine API
    return f"[search result for {query}]"

def lookup(keyword):
    return f"[lookup result for {keyword}]"

# ReAct loop
def react(question, max_steps=5):
    history = [f"Question: {question}"]
    for step in range(1, max_steps + 1):
        # Let the LLM generate Thought + Action
        prompt = "\n".join(history) + f"\nThought {step}:"
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt + " Action {step}:"}],
            stop=[f"\nObservation {step}:"]
        ).choices[0].message.content

        # Parse Action
        thought, action = response.strip().split(f"\nAction {step}:")
        history.append(f"Thought {step}: {thought.strip()}")
        history.append(f"Action {step}: {action.strip()}")

        # Terminate?
        if action.startswith("finish"):
            return action[len("finish["):-1]

        # Execute Action
        if action.startswith("search"):
            result = search(action[len("search["):-1])
        elif action.startswith("lookup"):
            result = lookup(action[len("lookup["):-1])
        else:
            result = "[unknown action]"

        history.append(f"Observation {step}: {result}")

    return "[max steps reached]"

# Test
print(react("When did Apple's CEO join the company?"))
```

This is just a toy implementation. For production, use frameworks like LangGraph / smolagents.

---

## 6. Modern Evolution of ReAct

### 1. ReAct → Reflexion

Add a "self-reflection" step: after the loop ends, let the LLM reflect on where it went wrong, add the reflection result to the prompt and try again.

### 2. ReAct → Plan-and-Execute

First use the LLM to generate a complete plan in one go, then execute according to the plan. ReAct is "think while doing"; Plan-and-Execute is "think first, then do".

### 3. ReAct → Multi-Agent

Multiple ReAct Agents collaborate, each Agent is responsible for a sub-task, coordinated through message passing.

### 4. ReAct → Graph-of-Thoughts (GoT)

Change ReAct's linear loop to a graph structure, allowing backtracking, branching, and merging. LangGraph is its engineering representative.

---

## 7. Practical Advice

### 1. Clear Tool Descriptions

90% of LLM picking the wrong tool is because the tool description isn't clear. Each tool's description should include:

- Tool name
- Tool function
- Input parameters
- Output format
- Usage example

### 2. Limit Maximum Steps

Prevent infinite loops. Generally 5-10 steps; complex tasks can go up to 20 steps.

### 3. Monitor Each Step's Quality

Record each round's Thought / Action / Observation, collect failure cases to improve the prompt.

### 4. Pair with Few-shot Examples

Include 1-2 complete Thought-Action-Observation examples in the prompt; the effect is immediate.

### 5. Pick the Right Model

ReAct requires strong model reasoning capabilities. GPT-4 / Claude 3.5 / DeepSeek-V3 all work; Gemini 1.5 Pro performs especially well on complex tasks. Open-source Llama 3.1 70B can also handle most tasks.

---

## 8. ReAct's Relationship with KG

ReAct itself doesn't directly involve KG. But:

1. **KG can be a ReAct tool**: The LLM queries the KG through SPARQL/Cypher, treating the result as Observation
2. **KG can enhance ReAct's reasoning**: Take KG subgraphs as the context of Thought, improving LLM reasoning quality
3. **ReAct can build KG**: The LLM through the ReAct loop extracts entities and relationships from text, gradually building the KG

**GraphRAG is actually ReAct + KG combined**: Use the ReAct paradigm to handle user questions, with KG as long-term memory.

---

## 9. Next Steps

After finishing this article, follow this order:

1. 📄 [ReAct original paper](https://arxiv.org/abs/2210.03629) — Complete method + experiments
2. 💻 [LangGraph docs](https://langchain-ai.github.io/langgraph/) — Engineering implementation of ReAct
3. 💻 [smolagents source](https://github.com/huggingface/smolagents) — 1k lines of core minimalist ReAct
4. 📚 Companion: "LangGraph" and "smolagents" resource entries in this hub

---

## References

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11381)
- [LangGraph: Multi-Agent Workflows](https://langchain-ai.github.io/langgraph/)
- [HuggingFace smolagents](https://huggingface.co/blog/smolagents)
