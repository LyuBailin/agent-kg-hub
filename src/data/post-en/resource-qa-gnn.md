---
title: 'QA-GNN — Feeding KG Reasoning Paths to LLMs for Explainable QA'
excerpt: 'ACL 2021 best paper candidate, proposing to use KG reasoning paths (subgraphs) as LLM input to enhance question answering explainability. One of the classic early works in the LLM × KG synergy paradigm.'
publishDate: 2026-07-27
category: 'Core Projects'
tags: ['QA-GNN', 'Knowledge Graph', 'Question Answering', 'Explainability', 'GNN']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# QA-GNN

> Feeding KG reasoning paths to LLMs — the classic explainable QA approach.

- 🔗 Repo: <https://github.com/michiyasunaga/qagnn>
- 📄 Paper: [QA-GNN: Reasoning with Language Models and Knowledge Graphs for Question Answering](https://arxiv.org/abs/2104.06378)
- 📚 Venue: ACL 2021 (best paper candidate)
- 🏢 Authors: Michihiro Yasunaga (HuggingFace), Jure Leskovec (Stanford)

## What Problem Does It Solve

In 2021, LLMs were still in the GPT-3 era, and explainable QA was an open problem. QA-GNN's solution:

1. Use GNN to reason on KG, get question-related subgraphs
2. Feed "question + KG subgraph" together to LLM
3. LLM generates answers based on structured context

**Key insight**: LLMs understand language but not structure; GNNs understand structure but not language. Combining them = 1+1 > 2.

## Technical Highlights

### 1. Joint Reasoning

Not "GNN first, then LLM" serial pipeline, but joint training:

- GNN's output becomes LLM's input embedding
- LLM's backpropagation signal updates GNN parameters
- Both ends optimize collaboratively

### 2. Subgraph Extraction

Don't feed the entire KG to LLM (too big), but first extract subgraphs:

- Extract relevant entities from the question
- k-hop subgraph expansion on KG
- Use PMAT (Pruning Merging Answer Tailoring) for pruning

### 3. Explainability

Answers come not only with results, but with reasoning paths: from question entity to answer entity, the path on KG is the explanation.

## Why It's Important for Agent × KG

- **A template for the LLM × KG synergy paradigm**: it proves that "each side handles one part" can work
- **Explainability**: Agent decision explainability is a hot topic in 2024-2026; QA-GNN's idea (reasoning paths as explanation) is directly applicable
- **Subgraph extraction**: this is actually the predecessor of GraphRAG Local Search

## Modern Insights

From a 2024-2026 perspective, QA-GNN's "GNN + LLM" has been replaced by:

- **GNN** → Simple graph queries (OpenCypher, SPARQL) or vector retrieval (GraphRAG)
- **Joint training** → Retrieval-augmented (RAG) offline indexing + online retrieval

But its **core idea of "KG reasoning path as explainability carrier"** remains a mainstream approach for Agent explainability research in 2026.

## Who Is It For

- ✅ Researchers studying KG + LLM collaborative reasoning
- ✅ Engineers focused on Agent explainability
- ✅ Beginners wanting to understand classic work in this field

## Companion Resources

- Paper: <https://arxiv.org/abs/2104.06378>
- Code: <https://github.com/michiyasunaga/qagnn>
- Explanation video: <https://www.youtube.com/watch?v=ji1j_SKEnAA>
