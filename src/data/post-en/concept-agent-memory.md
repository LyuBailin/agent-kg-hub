---
title: 'Agent Memory Mechanisms Explained — How Short-term, Long-term, Vector, and KG Memory Work Together'
excerpt: 'One of the core capabilities of an Agent is "memory". This article systematically reviews the concepts, differences, and collaboration of short-term memory (context window), long-term memory (vector / KG), episodic memory, and procedural memory, along with representative work from 2024-2026 (MemGPT, MemoryBank, Mem0).'
publishDate: 2026-07-27
category: 'Core Concepts'
tags: ['Agent Memory', 'Short-term Memory', 'Long-term Memory', 'MemGPT', 'Mem0', 'KG Memory']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# Agent Memory Mechanisms Explained: How Short-term, Long-term, Vector, and KG Memory Work Together

> Without memory, an Agent is just a stateless loop. Understanding memory means understanding the boundary of an Agent's capabilities.

## Why I Wrote This

When we talk about Agent capabilities, 90% of the conversation eventually loops back to "context window" and "hallucination". But what really determines an Agent's behavior is the **memory mechanism** — how it processes information, what it keeps, what it forgets, and when it retrieves.

This article aims to: in 30 minutes, give you a **thorough understanding of the taxonomy, mechanisms, representative work, and design principles of Agent memory**.

---

## 1. Human Memory vs. Agent Memory

The human brain has a complex memory system:

- **Sensory memory**: Instantaneous (a few hundred milliseconds), from sight / hearing / touch
- **Short-term memory**: A few seconds to minutes, limited capacity (7±2 chunks)
- **Long-term memory**: Effectively permanent, huge capacity, split into declarative (facts + episodes) and procedural (skills)

Agents borrow this layered approach, but implement it in a very different way:

| Layer | Human | Agent | Implementation |
|-------|-------|-------|----------------|
| Sensory | Vision / hearing / touch | Input token stream | Prompt parsing |
| Short-term | Working memory | Context window | LLM context |
| Long-term (declarative) | Factual memory | Vector database | Embedding + retrieval |
| Long-term (episodic) | Experiential memory | Conversation history | Database |
| Long-term (procedural) | Skill memory | Tool / code invocation | Function registration |
| Meta-memory | Knowing what you know | Self-reflection | Reflexion, etc. |

**Key differences**: Human memory has natural forgetting (time-based decay), Agent memory does not; human memory can actively compress (abstraction), but an Agent can only summarize via the LLM.

---

## 2. Four Core Memory Types

### 1. Short-term Memory

**Definition**: All information inside the LLM's context window.

**Typical capacity**:

- GPT-4: 8K → 32K → 128K tokens
- Claude 3.5: 200K tokens
- Gemini 1.5 Pro: 1M → 2M tokens
- Llama 3.1: 128K tokens

**Key issues**:

- **Limited capacity**: Information beyond the window is lost
- **Linear cost**: More tokens mean higher API cost
- **Position decay**: Information in the middle of a long context is easy to "forget"

**Typical use**:

- Multi-turn conversation history
- All Observations for the current task
- Intermediate results of tool calls

**Representative work**: No dedicated work — all Agent frameworks use short-term memory implicitly.

### 2. Long-term Vector Memory

**Definition**: Embed historical information into a vector database via embeddings; retrieve top-k on demand.

**Typical implementations**:
- Tools: LlamaIndex, Chroma, Pinecone, Qdrant, Weaviate
- Index: cosine similarity / dot product

**Flow**:

```
New info → LLM generates embedding → store in vector DB
At query time → retrieve top-k most similar → concatenate into LLM context
```

**Strengths**: Large capacity, fast retrieval, semantic matching.
**Weaknesses**: Cannot handle exact matching (e.g. "what was the exact number I said last time?"); cannot capture relations.

**Representative work**:
- **LlamaIndex**: A general-purpose RAG framework with built-in vector memory
- **Chroma**: A lightweight vector DB
- **RAG triplet** (Retrieve / Augment / Generate)

### 3. Long-term KG Memory

**Definition**: Organize information as a knowledge graph, with explicit modeling of entities and relations.

**Typical implementations**:
- Tools: Neo4j, Memgraph, NetworkX + LLM extraction
- Data structure: `(head, relation, tail)` triples

**Strengths**:
- **Structured**: Entities and relations are explicit, easy to reason over
- **Interpretable**: The retrieval path is the reasoning path
- **Rich relations**: Relations that vector retrieval cannot see, KG can see
- **Long-term consistency**: Schema constraints guarantee data consistency

**Weaknesses**:
- **Construction cost**: Requires LLM extraction + entity alignment
- **Hard to update**: Incremental updates are more complex than a vector DB
- **Complex queries**: Requires SPARQL / Cypher

**Representative work**:
- **GraphRAG**: KG-enhanced RAG
- **HippoRAG**: Neuro-symbolic fused memory
- **Cognee**: Automatically builds a KG from conversation

### 4. Episodic Memory

**Definition**: Memory organized by "event", recording "what happened when".

**Typical implementation**:
- Each memory entry is a `(time, subject, event, outcome)` quadruple
- Filter by time or semantics at retrieval

**Strengths**:
- **Temporal**: Can answer "last time / next time / historical trend"
- **Concrete**: Each event has full context
- **Replayable**: Can replay history

**Representative work**:
- **MemoryBank**: Episodic memory framework proposed by OpenAI
- **LangChain ConversationBufferMemory**: Simple conversation history
- **AgentSims**: Agent episodic memory research

---

## 3. Design Principles for Memory Systems

### 1. Layered Architecture

Different kinds of information live in different memory stores:

```
Raw conversation → [Short-term] LLM context (last N turns)
                 ↓
              [Long-term Episodic] Conversation event stream (database)
                 ↓
              [Long-term Vector] Entities / facts (vector DB)
                 ↓
              [Long-term KG] Entity relations (KG)
                 ↓
Retrieve as needed + merge on query
```

**Source of inspiration for MemGPT**: Let the LLM manage different layers of memory like an OS manages memory (DRAM vs. SSD).

### 2. Active Forgetting

Humans forget irrelevant information. Agents should too:

- Expire and clean short-term memory
- Periodically re-rank vector memory (down-weight cold data)
- Merge duplicate entities in KG
- Aggregate episodic memory by time window

**Why**: No forgetting → degraded retrieval quality → context noise → degraded performance.

### 3. Meta-memory

Let the Agent **know** what it "knows":

- **Self-RAG**: Before each answer, the LLM first judges "do I need to look up memory?"
- **CRUD memory**: Can add / delete / modify memory
- **Confidence**: Score each memory's confidence; low-confidence memories do not participate in answering

**Reflexion** is a representative: when the Agent fails, it generates a reflection stored as memory to avoid the same mistake next time.

### 4. Privacy and Isolation

- **User-level isolation**: Different users' memories are stored separately
- **Sensitive information filtering**: Filter out PII before writing to memory
- **Encryption**: Encrypt sensitive memory at rest
- **TTL**: Set expiration for temporary memory

---

## 4. Deep Dive on Representative Work

### MemGPT (2023)

**Paper**: [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)

**Core idea**: Treat the LLM as the CPU, external storage as memory / disk, and let the LLM actively manage memory scheduling.

**Three-layer architecture**:

```
Main Context (= DRAM): LLM's current system prompt + most recent messages
External Context (= SSD): vector database + document storage
Recall Storage: historical events
Archival Storage: long-term facts
```

**Mechanism**: The LLM actively reads / writes External Context via `function_calls`, similar to a page fault in an OS.

**Impact**: Kicked off the "Agent memory management" research direction; later MemGPT, Mem0, etc. are all inspired by it.

### Mem0 (2025)

**Paper**: [Mem0: The Memory Layer for AI](https://arxiv.org/abs/2504.19413)

**Core idea**: A lightweight memory layer that automatically extracts key information from conversation and retains it across sessions.

**Strengths**:

- 90% simpler than MemGPT
- Suitable for production environments
- Supports local deployment

### A-MEM (2025)

**Paper**: [A-MEM: Agentic Memory for LLM Agents](https://arxiv.org/abs/2502.12110)

**Core idea**: Let the Agent itself decide "what is worth remembering", "how to organize it", and "how to retrieve it".

**Mechanism**: Based on the Zettelkasten (card-box) note-taking method; each memory is a card, and cards automatically establish links to one another.

**Strengths**: Memory has "evolution capability" — it can self-organize, self-merge, and self-associate.

### MemoryBank (2023)

**Paper**: [MemoryBank: Enhancing Large Language Models with Long-Term Memory](https://arxiv.org/abs/2305.10250)

**Core idea**: Mimic the human Ebbinghaus forgetting curve; memory has "natural decay".

**Mechanism**: Each memory has an "activation level" that decays with time and is reinforced when retrieved.

**Best for**: Scenarios that need a "long-term companionship" feel (virtual companions, personal assistants).

---

## 5. Memory vs. RAG

Two concepts that are often confused, clarified:

| Dimension | RAG | Agent Memory |
|-----------|-----|--------------|
| **Purpose** | Knowledge augmentation | Continuity augmentation |
| **Data source** | External documents | Conversation + user behavior |
| **Lifecycle** | Static (documents don't change) | Dynamic (continuously accumulated) |
| **Update mode** | Rebuild index | Incremental write |
| **Retrieval target** | Find relevant knowledge | Find relevant experience |
| **Evaluation metric** | Answer accuracy | Long-term consistency |

**Conclusion**: RAG is "knowledge augmentation", Agent Memory is "self-accumulation". They are not in conflict, and are usually used together.

---

## 6. The Special Value of KG Memory

Among the four memory types, KG memory is the most relevant to the Agent × KG topic:

### 1. Solves two pain points of RAG

- **Global questions**: KG community-summary aggregation; vector retrieval cannot do this
- **Relational retrieval**: KG naturally supports multi-hop relational queries

### 2. Solves memory consistency

Vector memory may have "synonymous but contradictory" entries (different expressions of the same entity); KG memory guarantees consistency through entity alignment.

### 3. Solves interpretability

The retrieval path = the reasoning path, which is human-readable.

### 4. Works well with long-term Agents

When an Agent works continuously across multiple sessions, KG memory can "evolve" (entities added, relations updated), which is hard for vector memory.

**Representative implementation**:

```python
# Use the LLM to extract triples from a conversation
from openai import OpenAI
client = OpenAI()

def extract_triples(conversation: str) -> list:
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"Extract entities and relations from the following conversation; return as a JSON list:\n{conversation}"
        }]
    )
    import json
    return json.loads(response.choices[0].message.content)

# Store in KG (Neo4j / NetworkX)
triples = extract_triples("""
User: My name is Lyu, and I work on workflow skill development at Huawei.
Agent: Hello Lyu! What specific direction is your workflow skill development work in?
User: I mainly do skill orchestration and Agent integration.
""")
# Output:
# [
#   {"head": "Lyu", "relation": "works_at", "tail": "Huawei"},
#   {"head": "Lyu", "relation": "responsible_for", "tail": "workflow skill development"},
#   {"head": "Lyu", "relation": "focus_area", "tail": "skill orchestration"},
#   {"head": "Lyu", "relation": "focus_area", "tail": "Agent integration"}
# ]
```

These triples can then be stored in Neo4j / Memgraph and queried as needed.

---

## 7. Hands-on: A 30-line Simple Memory System

```python
from openai import OpenAI
from collections import deque

client = OpenAI()

class SimpleAgentMemory:
    def __init__(self, max_short_term=10):
        self.short_term = deque(maxlen=max_short_term)  # Short-term: last N turns
        self.long_term_facts = []  # Long-term: simple list
        self.long_term_kg = []  # Long-term: triples

    def add_interaction(self, user_msg, agent_msg):
        self.short_term.append({"user": user_msg, "agent": agent_msg})

        # Asynchronously extract facts + KG (use a background task in production)
        facts = self._extract_facts(user_msg, agent_msg)
        self.long_term_facts.extend(facts)

        triples = self._extract_triples(user_msg, agent_msg)
        self.long_term_kg.extend(triples)

    def _extract_facts(self, user_msg, agent_msg):
        # Simplified: let the LLM extract key facts
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": f"Extract 1-3 key facts from the following conversation, one per line:\nUser: {user_msg}\nAgent: {agent_msg}"
            }]
        )
        return [f for f in response.choices[0].message.content.split("\n") if f.strip()]

    def _extract_triples(self, user_msg, agent_msg):
        # Simplified: let the LLM extract entity relations
        import json
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": f"Extract (head, relation, tail) triples from the following conversation; return as a JSON list (return [] if no triples):\nUser: {user_msg}\nAgent: {agent_msg}"
            }]
        )
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return []

    def build_context(self, query):
        """Build the LLM context"""
        # Short-term: all of it
        st_text = "\n".join([
            f"User: {t['user']}\nAgent: {t['agent']}"
            for t in self.short_term
        ])

        # Long-term facts: top 5 (use vector retrieval in production)
        lt_text = "\n".join(self.long_term_facts[-5:])

        # Long-term KG: simple stringification
        kg_text = "\n".join([f"{h} --{r}--> {t}" for h, r, t in self.long_term_kg[-10:]])

        return f"""
[Short-term Memory]
{st_text}

[Long-term Facts]
{lt_text}

[Long-term KG]
{kg_text}
"""

# Usage
memory = SimpleAgentMemory()
memory.add_interaction(
    "My name is Lyu, and I work on workflow skill development at Huawei.",
    "Hello Lyu!"
)
memory.add_interaction(
    "I mainly work on Agent integration.",
    "Got it, workflow + Agent integration."
)

# At query time
context = memory.build_context("What is my name?")
print(context)
```

In production, you also need: vector retrieval, KG schema validation, memory merging, privacy filtering, TTL management.

---

## 8. Design Decision Checklist

When designing an Agent memory system, ask yourself these 6 questions:

### 1. Do you need cross-session continuity?

- Yes → You must have long-term memory
- No → Short-term memory alone is enough

### 2. Are the data relation-dense?

- Yes → KG memory takes priority
- No → Vector memory is enough

### 3. Is temporal ordering important?

- Yes → Episodic memory
- No → Long-term factual memory

### 4. Do you need forgetting?

- Yes → Add a decay mechanism
- No → Permanent storage

### 5. How strict are the privacy requirements?

- Strict → Local + encryption + per-user isolation
- Relaxed → Cloud is fine

### 6. Are you cost-sensitive?

- Yes → Use embeddings + a small LLM
- No → All-GPT-4 is fine

---

## 9. Future Directions

### 1. Self-evolving Memory

The Agent itself decides "what is worth remembering" and "how to organize it" (the A-MEM direction).

### 2. Cross-Agent Memory Sharing

Multiple Agents share one memory pool (the multi-Agent direction).

### 3. Memory Compression

Compress long-term memory into abstract concepts (similar to human abstraction).

### 4. Neuro-symbolic Fused Memory

The HippoRAG direction: neural network + KG working together as memory.

### 5. Memory Auditing

Let the Agent "explain" why it remembered or forgot a given piece of information.

---

## 10. Key Takeaways

1. **Memory is the boundary of an Agent's capabilities** — an Agent without memory is just a stateless loop.
2. **The four memory types have a clear division of labor** — short-term / long-term vector / long-term KG / episodic each own a piece.
3. **KG memory is the core of Agent × KG** — structured, interpretable, relation-rich.
4. **The MemGPT idea is the most classic** — LLM as OS, external storage as memory.
5. **Production environments need privacy + TTL** — no unbounded accumulation.

---

## 11. Next Steps

1. 📄 [MemGPT paper](https://arxiv.org/abs/2310.08560) — must read
2. 📄 [Mem0 paper](https://arxiv.org/abs/2504.19413) — lightweight
3. 📄 [A-MEM paper](https://arxiv.org/abs/2502.12110) — self-evolution
4. 💻 [LlamaIndex Memory module](https://docs.llamaindex.ai/en/stable/module_guides/deploying/agents/memory/)
5. 📚 Companion reading from this hub: "GraphRAG Onboarding" and "KG-Enhanced Reasoning"

---

## References

- [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)
- [Mem0: The Memory Layer for AI](https://arxiv.org/abs/2504.19413)
- [A-MEM: Agentic Memory for LLM Agents](https://arxiv.org/abs/2502.12110)
- [MemoryBank: Enhancing LLMs with Long-Term Memory](https://arxiv.org/abs/2305.10250)
- [HippoRAG: Neurobiologically Inspired Long-Term Memory](https://arxiv.org/abs/2405.14831)
