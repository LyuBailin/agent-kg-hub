---
title: '"Graph Retrieval-Augmented Generation: A Survey" — The First Systematic GraphRAG Survey'
excerpt: 'The arXiv survey by Peng et al. (August 2024, 2408.08921) that for the first time formally defines GraphRAG''s three-stage pipeline (G-Indexing / G-Retrieval / G-Generation), systematically maps the technical landscape, downstream tasks, and industrial solutions. Required reading for any GraphRAG engineer or researcher.'
publishDate: 2026-07-30
category: 'Papers & Surveys'
tags: ['GraphRAG', 'Survey', 'Knowledge Graph', 'RAG', 'LLM']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# "Graph Retrieval-Augmented Generation: A Survey"

> The first systematic survey of GraphRAG, published on arXiv in August 2024.

- 📄 Paper: <https://arxiv.org/abs/2408.08921>
- 📅 Published: August 2024
- 👥 Authors: Boci Peng et al. (7 authors)
- 📚 Status: Ongoing work — the authors maintain a GitHub repo to track new developments

## What Problem Does It Solve

GraphRAG has grown explosively since 2024 (Microsoft GraphRAG, LightRAG, Neo4j LLM Graph Builder all open-sourced in succession), but the field has lacked **a unified formal definition and classification system**:

- Different implementations use wildly different tech stacks (NetworkX vs Neo4j vs Kuzu, community detection vs subgraph sampling)
- Different "graph augmentation" means different things (knowledge graph / text graph / multi-hop reasoning chain)
- Naming is confusing (GraphRAG / RAG-on-Graph / KG-RAG / Graph Agent RAG)

This survey is the first to propose a **unified formal definition of GraphRAG** and a **three-stage pipeline**, placing all existing work in a single coordinate system.

## Core Contributions

### 1. Formal Definition of the GraphRAG Three-Stage Pipeline

```
G-Indexing (graph indexing) → G-Retrieval (graph retrieval) → G-Generation (graph-enhanced generation)
```

- **G-Indexing**: build graphs from corpora (entity/relation extraction, subgraph sampling, text graph encoding)
- **G-Retrieval**: retrieve on graphs (subgraph traversal, community detection, personalized PageRank, vector + graph hybrid)
- **G-Generation**: feed graph-retrieval results to LLM for answer generation (graph-aware prompts, graph-enhanced decoding)

### 2. Core Technology Classification

The paper provides a **technology family tree** for each stage:

- G-Indexing: LLM-based extraction / GNN-based encoding / text graph
- G-Retrieval: subgraph-based / community-based / vector-based / hybrid
- G-Generation: prompt-based / fine-tuning-based / agent-based

For each technology, it marks **representative work** and **pros/cons** — essentially giving the reader a "technology map".

### 3. Downstream Tasks and Benchmarks

Systematically organizes GraphRAG's downstream tasks:
- QA (KBQA / open-domain QA / multi-hop QA)
- Summarization (query-focused summarization / multi-document summarization)
- Reasoning (commonsense reasoning / temporal reasoning)
- Dialogue (knowledge-grounded dialogue / task-oriented dialogue)

Lists common benchmarks (HotpotQA / WebQSP / CWQ / MetaQA, etc.) and industrial solutions (Microsoft GraphRAG / Neo4j LLM Graph Builder / HippoRAG / LightRAG).

### 4. Future Directions

The paper ends with 5 **unresolved** key questions:
1. Real-time updates for dynamic graphs
2. Unified graph representation for multimodal (text + image + table) data
3. Scalability for massive graphs (>1B nodes)
4. Standardized benchmarks for graph quality evaluation
5. Deep integration with LLM training pipelines (using graphs during pre-training / fine-tuning)

## Why It's Important for Agent × KG

Doing GraphRAG work, having read this survey versus not is two completely different states:

- **Without it**: you need to read 30+ papers yourself and piece together the technical landscape
- **With it**: you directly get "technology map + paper list + evaluation benchmarks" — **saving 2-3 weeks of investigation**

More critically, the paper turns "GraphRAG" from a **marketing buzzword** into a **research direction with clear boundaries**. The positioning and comparison of all subsequent GraphRAG work (including Microsoft GraphRAG v2, LightRAG, HippoRAG 2) can be referenced against this survey's classification system.

If your work involves:
- Adding a graph to a RAG pipeline → cite the G-Indexing + G-Retrieval sections
- Designing a new graph retrieval algorithm → cite the G-Retrieval section
- Evaluating GraphRAG performance → cite the benchmarks section
- Investigating GraphRAG industrial viability → cite the industrial use case section

## Relationship to Other Surveys

| Survey | Focus | Difference from This Paper |
|--------|-------|---------------------------|
| **Peng et al. 2024** (this paper) | GraphRAG overall | **Most comprehensive and systematic**, baseline citation |
| **Edge et al. 2024** (GraphRAG paper) | Community detection + hierarchical summarization | Only Microsoft's scheme details, doesn't cover other implementations |
| **Agrawal et al. 2024** (KG-enhanced LLM survey) | Knowledge graphs integrated into LLMs | KG-centric, doesn't specifically discuss RAG pipelines |
| **Huang et al. 2024** (Graph Agent survey) | LLMs Agents using graphs | Agent-centric; GraphRAG is only a part |

**Read this paper first** to establish the coordinate system, then choose other surveys based on your specific direction.

## Who Is It For

- ✅ Engineers / students wanting to get into GraphRAG (save investigation time)
- ✅ Researchers preparing to publish (baseline citation for survey-type work)
- ✅ Product architects designing RAG platforms (reference the industrial solutions list)
- ✅ Decision-makers evaluating GraphRAG's commercial viability (read the future directions section)
- ❌ Not for: beginners who just want to use an off-the-shelf framework (read the Microsoft GraphRAG README directly)

## Limitations

- "Ongoing work" status — authors keep updating; check the latest version before citing
- Some technology classification boundaries are blurry (e.g., "subgraph-based" and "community-based" overlap)
- The industrial solutions section lags behind actual open-source community progress (10+ new works have appeared since the survey was written)
- The evaluation benchmarks and metrics section is relatively weak, mostly referencing benchmarks from other fields

## Recommended Reading Order

1. [arXiv paper](https://arxiv.org/abs/2408.08921) — full version, focus on chapters 3-5
2. [Companion GitHub repo](https://github.com/BoChen-Ye/GraphRAG-Survey) — track the latest work
3. Cross-read [Microsoft GraphRAG paper](https://arxiv.org/abs/2404.16130) — see industrial-grade implementation
4. Cross-read [LightRAG paper](https://arxiv.org/abs/2410.05779) — see lightweight implementation
