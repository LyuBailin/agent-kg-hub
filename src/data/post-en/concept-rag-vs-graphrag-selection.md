---
title: 'RAG vs GraphRAG Selection: When to Use Graph, When Not To'
excerpt: "An engineer's decision framework for RAG vs GraphRAG selection. Four scoring dimensions (question type, corpus size, relationship density, query patterns), five real-world scenarios, hybrid architectures, and seven pitfalls to avoid."
publishDate: 2026-07-30
category: 'Core Concepts'
tags: ['RAG', 'GraphRAG', 'Knowledge Graph', 'Selection', 'Decision Framework']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# RAG vs GraphRAG Selection: When to Use Graph, When Not To

> 80% of teams default to GraphRAG when they don't need it; 20% need it but skip it. This article gives you a non-vibes-based decision framework.

## Why I Wrote This

In the RAG community, "should we add a graph?" is a recurring debate. One side is "GraphRAG universalism" — excited by any mention of relationships. The other is "vector retrieval is enough" — viewing graphs as over-engineering.

My observation: **most teams spend big money in the wrong places.**

- Simple FAQ scenarios, full GraphRAG stack, hundreds of dollars in LLM token indexing, answer quality nearly identical to plain vector retrieval.
- Complex legal/medical scenarios, vector retrieval only, user asks "what's the connection between this company and that one", the answer is garbage.

The question isn't "is GraphRAG good" — it's "**should this specific scenario use GraphRAG**". This article's goal: give you a 4-dimension scoring framework, 5 real-world scenario judgments, 7 pitfalls. After reading, you can give a clear "yes / no / hybrid" answer for your scenario.

---

## 1. The Capability Boundary of RAG

Let's first map vanilla RAG's (pure vector retrieval + LLM) capabilities clearly before talking about GraphRAG.

### What It's Good At

| Capability | Description | Typical Example |
|------------|-------------|-----------------|
| **Similarity recall** | Find top-k chunks most semantically close to query | "Is there a paragraph in the doc about GraphRAG indexing cost?" |
| **Single-document QA** | Factoid QA around one paragraph/document | "Why is this code written this way?" |
| **Semantic upgrade over keyword search** | Semantic understanding beyond BM25 | "Find all sections about RAG pain points" |
| **Low latency** | Vector retrieval in milliseconds, LLM in 1-3s | Online customer service, IDE assistants |
| **Zero indexing cost** | Embed documents once | Small projects of hundreds to thousands of docs |

### What It's Not Good At (GraphRAG's Leverage Points)

**1. Holistic Questions**

```
Q: "What's the thematic distribution of all our 2025 projects?"

Vector retrieval's response:
  query → embedding → find top-5 similar chunks → LLM synthesis
  ↓
  top-5 are the "5 most similar" to query, not "all of them"
  A: "Roughly concentrated on AI and data" (probably misses the other 80%)
```

This kind of question needs **full-corpus aggregation**; top-k can only give a local view.

**2. Relationship Chains**

```
Q: "Where did Company A's CEO work before?"

Vector retrieval's response:
  Find "CEO" related chunk → extract name → find "Company X" related chunk
  ↓
  If CEO's history is in document A, and Company X's intro is in document B,
  and no chunk links them → can't answer
```

Relationships are hidden in text, not structured.

**3. Multi-Hop Reasoning**

```
Q: "Project A uses library B, B depends on C, C's core developer is D — where is D now?"

Vector retrieval's response: each hop may lose context, after 3 hops it's basically a gamble
```

**4. Time-Series Evolution**

```
Q: "What features changed in this product from 2023 to 2025?"

Vector retrieval's response: retrieved chunks are "all-time similar results",
can't be temporally ordered to show "change"
```

---

## 2. The Capability Boundary of GraphRAG

GraphRAG isn't a silver bullet either. **While solving the 4 pain points above, it introduces 4 new costs.**

### What It Solves

- ✅ Holistic questions (Global Search uses community summary aggregation)
- ✅ Entity relationships (Local Search uses k-hop neighbor expansion)
- ✅ Multi-hop reasoning (graph traversal is natural for it)
- ✅ Cross-document aggregation (community detection + LLM summary)

### What It Costs

| Cost | Magnitude | Notes |
|------|-----------|-------|
| **Indexing cost** | $50-500 LLM tokens per 1k documents | Microsoft official data + measured estimates |
| **Indexing time** | 1-6 hours per 1k documents | Depends on LLM concurrency and document length |
| **Storage bloat** | Graph + vectors + community summaries, possibly 5-20x original text | Neo4j deployment needs planning |
| **Query latency** | 2-5x slower than pure vector | Adds graph traversal + LLM call |
| **LLM extraction errors** | 80-95% entity recognition accuracy | Wrong key entity = everything wrong |
| **Hard incremental updates** | Adding 100 docs requires full reindex or complex incremental logic | Microsoft GraphRAG incremental is immature |
| **Complex tuning** | Chunk size, prompts, prompt templates, merge thresholds all need tuning | No silver bullet parameters |

**Key judgment**: GraphRAG's value is only significant on corpora with **high relationship density**. If entities in the corpus have few structured relationships, indexing is just burning money.

---

## 3. 4-Dimension Scoring Decision Framework

Don't decide on vibes; quantify with scoring. Below are 4 dimensions, each 0-3 points. Total ≥ 8 strongly recommends GraphRAG, 5-7 depends on budget, ≤ 4 pure vector retrieval is enough.

### Dimension 1: Question Type (0-3 points)

| Question Type | Score | Example |
|---------------|-------|---------|
| Pure similarity query | 0 | "Sections about RAG in the doc" |
| Single-entity factoid query | 1 | "Who open-sourced GraphRAG" |
| Multi-entity relationship query | 2 | "Which companies has A acquired" |
| Holistic aggregation question | 3 | "Tech stack distribution of all 2025 projects" |

### Dimension 2: Corpus Size (0-3 points)

| Document Count | Score | Reason |
|----------------|-------|--------|
| < 500 | 0 | Vector retrieval is enough, graph gain not obvious |
| 500 - 5k | 1 | Borderline, can go either way |
| 5k - 50k | 2 | GraphRAG sweet spot |
| > 50k | 3 | Must consider graph (else token explosion) |

### Dimension 3: Relationship Density (0-3 points)

**Relationship density = extractable entity relationships per document / document count**

| Relationship Density | Score | Typical Corpus |
|----------------------|-------|----------------|
| < 5 relations/doc | 0 | Generic FAQ, product manuals |
| 5-20 relations/doc | 1 | News articles, tech blogs |
| 20-50 relations/doc | 2 | Academic papers, corporate annual reports |
| > 50 relations/doc | 3 | Knowledge bases, person networks, supply chains |

> 💡 **Key judgment**: If the corpus is mainly "narrative text" (blogs, news), relationship density is naturally low; if the corpus is "structured narrative" (annual reports, papers, contracts), relationship density is naturally high.

### Dimension 4: Query Pattern (0-3 points)

| Query Characteristic | Score |
|----------------------|-------|
| 90% of queries are single-hop similarity | 0 |
| 50% of queries need 2-3 hops | 1 |
| 30% of queries need 3+ hops or aggregation | 2 |
| Lots of "summary / comparison / trend" questions | 3 |

### Total Score Decision

| Total | Recommendation |
|-------|----------------|
| 0-4 | Pure vector RAG, don't bother |
| 5-7 | Depends on budget; tight budget → pure vector, room → POC GraphRAG |
| 8-10 | Go GraphRAG, worth the investment |
| 11-12 | Not just GraphRAG, also consider hybrid architecture |

---

## 4. Five Real-World Scenario Comparison

Apply the framework to specific scenarios.

### Scenario 1: E-commerce FAQ Knowledge Base

- Documents: 500 product FAQ entries
- Query: "What's the return policy"
- **Question type**: 0 (similarity)
- **Corpus size**: 0
- **Relationship density**: 0 (FAQ has almost no entity relationships)
- **Query pattern**: 0 (basically single-hop)
- **Total**: 0

**Recommendation**: Pure vector RAG. GraphRAG in this scenario is just burning money.

### Scenario 2: Medical Literature Retrieval

- Documents: 20k PubMed papers
- Query: "What shared targets do drug Y and drug Z for treating disease X have"
- **Question type**: 2 (multi-entity relationship)
- **Corpus size**: 2
- **Relationship density**: 3 (50+ entity-relations per paper)
- **Query pattern**: 2 (multi-hop + comparison)
- **Total**: 9

**Recommendation**: GraphRAG, prefer Local Search + entity-centric retrieval.

### Scenario 3: Legal Contract Review

- Documents: 500 contracts
- Query: "In all contracts signed between Company A and Company B in 2024, what do the breach-of-contract liability clauses have in common"
- **Question type**: 3 (holistic aggregation)
- **Corpus size**: 1
- **Relationship density**: 2 (contracts have many relationships)
- **Query pattern**: 3 (summary + comparison)
- **Total**: 9

**Recommendation**: GraphRAG, Global Search dominant, Local Search supplementary.

### Scenario 4: Customer Support Ticket Library

- Documents: 100k historical tickets
- Query: "User reports router dropping connection, how was it resolved before"
- **Question type**: 1 (single entity + similarity)
- **Corpus size**: 3
- **Relationship density**: 1 (tickets don't have many entity relationships)
- **Query pattern**: 0 (basically similarity matching)
- **Total**: 5

**Recommendation**: Borderline. Tight budget → pure vector + keyword hybrid; loose budget → POC GraphRAG but verify value first.

### Scenario 5: Internal Enterprise Wiki

- Documents: 3000 wiki + 2000-person org structure
- Query: "New employee onboarding process + which departments are involved + key contacts"
- **Question type**: 3 (holistic + multi-hop)
- **Corpus size**: 1
- **Relationship density**: 2 (org structure is naturally graph-like)
- **Query pattern**: 2 (multi-hop + summary)
- **Total**: 8

**Recommendation**: GraphRAG, dual index of org structure graph + wiki text.

---

## 5. Hybrid Architecture: Not Either/Or

In reality most production systems are **hybrid architectures**. GraphRAG doesn't replace vector retrieval; it complements its blind spots.

### Typical Hybrid Architecture

```
User query
  ↓
[Query classifier LLM]  ← decides which path
  ├── Type A (similarity/single-doc QA) → vector retrieval → LLM
  ├── Type B (entity/relationship)         → GraphRAG Local Search → LLM
  └── Type C (holistic/aggregation)         → GraphRAG Global Search → LLM
```

### Simpler Version: Vector Recall + Graph Rerank

```
User query
  ↓
Vector recall top-50 chunks
  ↓
LLM extracts candidate entities from chunks
  ↓
1-2 hop expansion on graph for these entities
  ↓
Graph context + original chunks → LLM generates final answer
```

This architecture's benefit: **keeps vector's recall breadth, adds graph's structured rerank**. LightRAG's default is close to this design.

### When to Choose Hybrid Architecture

| Condition | Recommendation |
|-----------|----------------|
| 80% similarity queries, 20% holistic/relationship | Hybrid, vector-led |
| 50% similarity, 50% relationship/holistic | Hybrid, equal-weight routing |
| 80% holistic/relationship | GraphRAG-led, vector supplements |
| Uncertain | Run a query classifier on logs first, see actual distribution |

---

## 6. Seven Pitfalls to Avoid

For engineers about to deploy GraphRAG.

**1. ❌ Don't use GraphRAG for simple FAQ**
Indexing costs $100, the question can be answered with BM25. Pure money burning.

**2. ❌ Don't treat GraphRAG as universal**
It solves "relationships" and "holistic", not "hallucination", "factuality", or "timeliness". Those need other methods.

**3. ❌ Don't ignore indexing cost**
5k documents can burn $500 in tokens. Before production, **run a 100-doc subset first**, estimate total cost, then decide.

**4. ❌ Don't cut corners on incremental updates**
Microsoft GraphRAG's incremental support is still immature. In production, either accept full rebuild or write your own incremental logic. **Don't assume "adding docs is easy"**.

**5. ❌ Don't ignore LLM extraction errors**
Wrong entity recognition → everything downstream is wrong. Either use few-shot prompts to improve accuracy, or do manual review for key entities.

**6. ❌ Don't run GraphRAG alone in production**
Keep at least one fallback channel (pure vector or BM25). When GraphRAG hiccups, the whole site shouldn't go down.

**7. ❌ Don't ignore query latency**
GraphRAG is 2-5x slower than vector retrieval. When users ask "how do you pronounce XX", that latency difference is clearly felt. **Routing needs query classification first**; simple questions shouldn't enter the graph.

---

## 7. Decision Flowchart (Condensed)

```
Start
  ↓
Corpus < 500 documents?
  ├─ Yes → Pure vector RAG, end
  └─ No ↓
Relationship density < 5 relations/doc?
  ├─ Yes → Pure vector RAG, end
  └─ No ↓
Queries mainly similarity?
  ├─ Yes → Vector RAG, or hybrid (vector-led)
  └─ No ↓
Need holistic/aggregation/multi-hop?
  ├─ Yes → GraphRAG-led + vector supplement
  └─ No → Hybrid (depends on budget)
```

---

## 8. Three Verification Steps Before Going to GraphRAG

Don't go straight to production. **POC first**.

### Step 1: Run full pipeline on a 100-doc subset

```bash
# Prepare subset
mkdir -p ./poc/input
# Pull 100 representative documents
cp source/*.md ./poc/input/ | head -100

# Index
python -m graphrag.index --root ./poc

# Test 10 real queries
python -m graphrag.query --root ./poc --method local --query "..."
python -m graphrag.query --root ./poc --method global --query "..."
```

### Step 2: Compare answer quality against pure vector

| Dimension | GraphRAG | Pure Vector RAG | Winner |
|-----------|----------|-----------------|--------|
| Holistic questions | Answerable | Incomplete | GraphRAG |
| Entity relationships | Accurate | Incomplete | GraphRAG |
| Single-doc QA | Similar | Similar | Tie |
| Query latency | 2-5x slower | Fast | Vector |
| Indexing cost | $50-500 | < $1 | Vector |

**If GraphRAG doesn't significantly beat vector on your core queries, don't deploy it.**

### Step 3: Estimate full-scale cost

| Doc Volume | Indexing LLM Cost (est) | Storage Cost | Decision |
|------------|--------------------------|--------------|----------|
| 1k | $50-100 | 1-2 GB | POC viable |
| 10k | $500-1500 | 10-30 GB | Tight budget: be careful |
| 100k | $5k-20k | 100-500 GB | Only worth it if GraphRAG is necessary |

---

## 9. Next Steps

If you've decided to go GraphRAG, recommended reading:

1. 📄 [GraphRAG Onboarding: Principles and Practice of Industrial-Grade Graph-Enhanced RAG](https://github.com/LyuBailin/agent-kg-hub) — Same-series intro in this hub
2. 📖 [Microsoft GraphRAG Official Documentation](https://microsoft.github.io/graphrag/) — Complete API + config
3. 📄 [LazyGraphRAG Paper](https://arxiv.org/abs/2411.18428) — Latest progress in indexing cost optimization
4. 📄 [LightRAG Paper](https://arxiv.org/abs/2410.17979) — Reference implementation for lightweight hybrid architecture
5. 📄 [HippoRAG Paper](https://arxiv.org/abs/2405.14831) — Another approach: neuro-symbolic fusion

---

## References

- [Microsoft GraphRAG GitHub](https://github.com/microsoft/graphrag)
- [GraphRAG: Unlocking LLM discovery on narrative private data](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/)
- [LazyGraphRAG: Setting New Standards for Cost-Effective RAG](https://arxiv.org/abs/2411.18428)
- [LightRAG: Simple and Fast Retrieval-Augmented Generation](https://arxiv.org/abs/2410.17979)
- [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130)
