---
title: 'GraphRAG Onboarding — Principles and Practice of Industrial-Grade Graph-Enhanced RAG'
excerpt: 'Starting from the pain points of traditional RAG, this article systematically explains GraphRAG''s core ideas: why graphs are needed, how to build graphs at the indexing stage, how four retrieval modes address different questions, and walks through a minimal demo.'
publishDate: 2026-07-27
category: 'Core Concepts'
tags: ['GraphRAG', 'RAG', 'Knowledge Graph', 'Concept Deep-Dive', 'Microsoft']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# GraphRAG Onboarding: Principles and Practice of Industrial-Grade Graph-Enhanced RAG

> When vector retrieval struggles with "global questions" and "entity relationships" — GraphRAG fills the gap with a graph.

## Why I Wrote This

GraphRAG is the most widely-deployed, industrially-backed solution in the Agent × KG topic. But online articles about it are either too shallow ("just run the demo") or too deep (jumping straight into papers), lacking a **systematic onboarding from an engineer's perspective**.

This article aims to: in 30 minutes, give you a thorough understanding of GraphRAG's core ideas, key designs, what it can/cannot solve.

---

## 1. Two Pain Points of Traditional RAG

### Pain Point 1: Global Questions Are Weak

**Question**: "What's the thematic distribution of all our 2025 projects?"

**How traditional RAG answers it**:
- Convert query to embedding
- Find top-k most similar chunks in the vector store
- LLM answers based on these k chunks

**Where's the problem**: top-k is always "most similar", but "thematic distribution" needs **aggregated information from all documents**. top-k only provides local information.

### Pain Point 2: Entity Relationships Are Broken

**Question**: "Where did Company A's CEO work before?"

**How traditional RAG answers it**:
- Find chunks about "Company A CEO"
- LLM extracts the CEO's name
- Find chunks about "Company X"

**Where's the problem**: If Company A's CEO isn't explicitly mentioned in some document as "previously at Company X", it can't answer. **Relationships aren't structured** — they're hidden in text, hard to mine.

---

## 2. GraphRAG's Core Idea

**One-sentence summary**: Convert the corpus into a knowledge graph (entity-relationship-community) first, then retrieve on the graph.

```
Traditional RAG:  query → embedding → top-k chunks → LLM
GraphRAG:        query → graph retrieval (entities + subgraphs + communities) → structured context → LLM
```

GraphRAG's retrieval returns not "relevant text" but "relevant entities + relevant relationships + relevant community summaries". The LLM gets structured information, not loose text chunks.

---

## 3. Indexing Phase: From Corpus to Graph

GraphRAG's indexing is a one-time offline operation with the following flow:

```
Raw documents
  ↓ (chunking)
Document chunks
  ↓ (LLM entity/relation extraction)
Entity-relation triples
  ↓ (graph construction)
Knowledge graph
  ↓ (Leiden community detection)
Multi-level communities
  ↓ (LLM community summary)
Community summaries
  ↓ (persistence)
Graph index
```

### Key Steps Explained

**1. Entity/Relation Extraction**

Use LLM to extract from each document chunk:

```json
{
  "entities": [
    {"name": "GraphRAG", "type": "Technology", "description": "Microsoft's open-sourced graph-enhanced RAG solution"},
    {"name": "Microsoft", "type": "Company", "description": "Developer of GraphRAG"}
  ],
  "relations": [
    {"source": "Microsoft", "target": "GraphRAG", "description": "Developed and open-sourced"}
  ]
}
```

The LLM **completes the "unstructured text → structured knowledge" transformation** at this step. This is essentially the complete implementation of the LLM-Enhanced KG paradigm in industry.

**2. Community Detection**

Use the Leiden algorithm (a mature graph community detection algorithm) for hierarchical clustering on the entity-relation graph:

- Layer 1: Large communities (e.g., "LLM Agent" community)
- Layer 2: Sub-communities within large ones (e.g., "Graph-Augmented Agent" sub-community)
- Layer 3: Finer sub-communities (e.g., "GraphRAG Project" sub-community)

**3. Community Summary**

Use LLM to generate a natural language summary for each community, describing "what this community is about". This way, retrieval doesn't need to traverse the graph; it matches directly with community summaries.

---

## 4. Four Retrieval Modes

GraphRAG v2.x provides four retrieval modes, each handling different questions:

### 1. Local Search

**Suitable for**: Entity-centric fine-grained QA.

**Example question**: "Which company open-sourced GraphRAG?"

**Mechanism**:
- Extract key entities from query (GraphRAG)
- k-hop neighbor expansion on the graph
- Collect attributes, relationships, neighboring entities around the entity
- Generate "entity-centric" context for LLM

**Advantage**: Fast, accurate, with full local information

### 2. Global Search

**Suitable for**: Cross-document global questions.

**Example question**: "What's the thematic distribution of this report?"

**Mechanism**:
- Use community summaries as input to map-reduce
- LLM processes all communities in parallel, generating "partial answers"
- Aggregate LLM gives "final global answer"

**Advantage**: Can handle questions requiring aggregation of all information

### 3. DRIFT Search

**Suitable for**: Complex questions mixing local and global.

**Example question**: "Compare the design philosophies of Project A and Project B."

**Mechanism**:
- First do Local Search to get initial relevant entities
- Based on initial results, do PR (random walk) expansion
- Dynamically decide whether to escalate to Global Search

**Advantage**: Flexible, suitable for long-tail questions

### 4. LazyGraphRAG

**Suitable for**: Indexing cost-sensitive scenarios.

**Example scenario**: Large document collection, limited budget.

**Mechanism**:
- Don't pre-build the complete graph
- Expand on demand at query time
- Balance query cost and quality

**Advantage**: Indexing cost nearly zero, suitable for one-off tasks

---

## 5. Hands-on: Running a Minimal Demo

### Prerequisites

```bash
# Clone the repo
git clone https://github.com/microsoft/graphrag.git
cd graphrag

# Install dependencies (requires Python 3.10+)
pip install -e .

# Prepare .env
echo "GRAPHRAG_API_KEY=<your-openai-key>" > .env
```

### Prepare Corpus

```bash
mkdir -p ./ragtest/input
# Put your documents in the input/ directory, supports .txt and .csv
```

### Index

```bash
python -m graphrag.index --root ./ragtest
```

This runs the entire "indexing phase" flow and generates the `./ragtest/output` directory.

### Query

```bash
# Local Search
python -m graphrag.query \
  --root ./ragtest \
  --method local \
  --query "Which company open-sourced GraphRAG?"

# Global Search
python -m graphrag.query \
  --root ./ragtest \
  --method global \
  --query "What's the thematic distribution of this report?"
```

### Python SDK Approach

```python
import asyncio
from graphrag.query import local_search, global_search

async def main():
    # Local Search
    result = await local_search(
        config=config,
        query="Which company open-sourced GraphRAG?"
    )
    print(result.response)

    # Global Search
    result = await global_search(
        config=config,
        query="What's the thematic distribution of this report?"
    )
    print(result.response)

asyncio.run(main())
```

---

## 6. GraphRAG's Limitations

Not a silver bullet; it has boundaries:

| Limitation | Description |
|------------|-------------|
| **High indexing cost** | Full documents through LLM; initial indexing can take hours to days |
| **Depends on LLM quality** | Entity extraction quality directly determines retrieval quality |
| **Not for short documents** | When documents <1k, graph benefits aren't obvious |
| **Difficult incremental updates** | New documents require re-indexing or complex incremental logic |
| **Higher query latency** | 2-5x slower than pure vector retrieval |

---

## 7. Comparison with Other Solutions

| Solution | Best for | Strengths | Weaknesses |
|----------|----------|-----------|------------|
| **Pure vector RAG** | Single-doc QA, similarity queries | Simple, fast | Weak on global questions |
| **GraphRAG** | Global, entity-relationship queries | Solves the two pain points | High indexing cost |
| **LightRAG** | Lightweight scenarios | Fast, low-cost | Average on complex relationships |
| **HippoRAG** | Neuro-symbolic fusion | Biology-inspired | Immature in industry |
| **KAG** | Enterprise knowledge management | Alibaba, well-engineered | Strong for Chinese, weak for English |

---

## 8. Production Integration Recommendations

If you want to use GraphRAG in your project:

1. **Document volume assessment**: Below 1k documents, GraphRAG isn't recommended
2. **Indexing timing choice**: Full rebuild vs incremental update — start with full rebuild to verify the effect
3. **Hybrid retrieval**: GraphRAG + vector retrieval hybrid; the former handles structured queries, the latter handles similarity queries
4. **Monitoring metrics**: Build latency, query latency, community coverage, answer quality
5. **Fallback plan**: Classify queries; those GraphRAG isn't good at go to traditional RAG

---

## 9. Next Steps

After finishing this article, follow this order:

1. 📖 [Official documentation](https://microsoft.github.io/graphrag/) — Complete API
2. 📄 [The GraphRAG Manifesto](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/) — Core ideas
3. 📄 [LazyGraphRAG paper](https://arxiv.org/abs/2411.18428) — Latest retrieval paradigm
4. 💻 [GitHub repo](https://github.com/microsoft/graphrag) — More examples
5. 📚 Companion: "Microsoft GraphRAG Resource Review" entry in this hub

---

## References

- [Microsoft GraphRAG GitHub](https://github.com/microsoft/graphrag)
- [GraphRAG: Unlocking LLM discovery on narrative private data](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/)
- [LazyGraphRAG: Setting New Standards for Cost-Effective RAG](https://arxiv.org/abs/2411.18428)
- [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130)
