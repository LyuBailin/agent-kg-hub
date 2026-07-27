---
title: 'Microsoft GraphRAG — The De Facto Standard for Industrial-Grade KG-Enhanced RAG'
excerpt: 'Microsoft''s open-sourced graph-enhanced RAG (July 2024), providing Local/Global/DRIFT/Lazy retrieval modes. The most mature industrial implementation of the KG-enhanced LLM paradigm.'
publishDate: 2026-07-27
category: 'Core Projects'
tags: ['GraphRAG', 'RAG', 'Knowledge Graph', 'Microsoft', 'LLM']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# Microsoft GraphRAG

> The de facto standard for industrial-grade KG-enhanced RAG.

- 🔗 Repo: <https://github.com/microsoft/graphrag>
- ⭐ Stars: 28k+ (as of July 2026)
- 📜 License: MIT
- 🏢 Maintainer: Microsoft Research
- 🚀 First Release: July 2024
- 📦 Current Version: v2.x

## What Problem Does It Solve

Two key pain points of traditional RAG:

1. **Global questions across documents are weak**: Questions like "what's the thematic distribution of this dataset?" require aggregation across many documents. Pure vector retrieval returns locally-similar chunks, not the global picture.
2. **Entity relationships are broken**: When a query involves multiple entities and their relationships, vector similarity can't capture the implicit graph structure.

GraphRAG's core idea: **first build a knowledge graph (entity-relationship-community) from the corpus, then retrieve on the graph**. Retrieval returns not just relevant text, but also communities/subgraphs, giving the LLM more structured context.

## Key Technical Points

### 1. Indexing Phase (LLM-Enhanced KG)

- Use LLM to extract entities and relationships from documents → build the graph
- Use Leiden algorithm for community detection → multi-level community summaries
- This step is essentially the complete implementation of the LLM-Enhanced KG paradigm

### 2. Four Retrieval Modes

| Mode | Purpose | When to Use |
|------|---------|-------------|
| **Local Search** | Entity-centric fine-grained QA | "Who is the CEO of Company X?" |
| **Global Search** | Cross-document global questions | "What's the thematic distribution of this dataset?" |
| **DRIFT Search** | Dynamic retrieval + filtering (dynamic relevance + community traversal) | Complex questions needing both local and global context |
| **LazyGraphRAG** | Lazy graph construction, expand on demand | When upfront indexing cost is too high |

### 3. Deployment-Friendly

- Supports OpenAI-compatible APIs (Azure OpenAI, OpenAI, DeepSeek, etc.)
- Supports Ollama local models
- CLI + Python SDK + REST API

## Why It's Important for Agent × KG

GraphRAG is **the most mature, industrially-backed implementation** of the KG-Enhanced LLM paradigm in 2024-2026.

- It front-loads graph construction cost to indexing time, keeping runtime retrieval cost manageable
- Its four retrieval modes cover ~80% of enterprise knowledge management scenarios
- It proves the "KG + LLM bidirectional flow" (LLM builds the graph, KG enhances LLM retrieval) can support industrial-grade deployment

**Anyone working on Agent × KG should at least deeply understand the GraphRAG README and its 4 retrieval modes.**

## Who Is It For

- ✅ Engineers adding graph enhancement to enterprise knowledge bases / technical documentation
- ✅ Algorithm engineers focused on LLM retrieval augmentation
- ✅ Product managers researching new AI product forms
- ❌ Not for: small projects with <1k documents (indexing cost not worth it)

## Recommended Reading Order

1. [Official README](https://github.com/microsoft/graphrag/blob/main/README.md) — Run the minimum demo
2. [The GraphRAG Manifesto](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/) — Core ideas
3. [LazyGraphRAG paper](https://arxiv.org/abs/2411.18428) — Latest retrieval paradigm
4. [Official docs](https://microsoft.github.io/graphrag/) — Deployment in practice
