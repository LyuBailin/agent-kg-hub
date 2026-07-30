---
title: 'LightRAG — HKU''s Lightweight GraphRAG, Ready for Production'
excerpt: 'LightRAG (October 2024, HKUDS) rebuilds GraphRAG with "dual-layer retrieval + graph indexing", cutting indexing cost by an order of magnitude, supporting incremental updates and local models. With 40k+ stars, it''s the optimal engineering choice for small/medium teams and individual developers to ship graph-augmented RAG.'
publishDate: 2026-07-30
category: 'Core Projects'
tags: ['LightRAG', 'GraphRAG', 'RAG', 'Knowledge Graph', 'HKU']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# LightRAG

> "Light" doesn't mean weaker — it means reducing the engineering complexity of graph-augmented RAG to the bare minimum.

- 🔗 Repo: <https://github.com/HKUDS/LightRAG>
- ⭐ Stars: 40k+ (as of July 2026)
- 📜 License: MIT
- 🏢 Maintainer: HKUDS Lab, University of Hong Kong
- 📄 Paper: arXiv 2410.05779 (EMNLP 2025)
- 🚀 First release: October 2024

## What Problem Does It Solve

While Microsoft GraphRAG (July 2024) brought KG-augmented RAG to industrial scale, it has two **fatal pain points**:

1. **Prohibitive indexing cost**: uses Leiden community detection + full community summarization — a few hundred pages of documents can take 30+ minutes and cost thousands of dollars in API calls
2. **No incremental updates**: adding new documents forces a **full rebuild** of the community structure — basically unusable in production

LightRAG's response: **dual-layer retrieval paradigm + incremental update algorithm**.

- Dual-layer retrieval: supports both "low-level" (around specific entities) and "high-level" (global themes)
- Incremental updates: new data goes through "local graph indexing → set merge" — no global rebuild needed

## Minimum Runnable Example

```python
from lightrag import LightRAG, QueryParam

WORKING_DIR = "./dickens"
rag = LightRAG(working_dir=WORKING_DIR)

with open("./book.txt") as f:
    rag.insert(f.read())           # one-shot ingestion

# Four query modes, switch as needed
print(rag.query("Main themes?", param=QueryParam(mode="naive")))     # pure vector
print(rag.query("What did Sydney Carton do?", param=QueryParam(mode="local")))  # entity-centric
print(rag.query("Core themes throughout the book?", param=QueryParam(mode="global")))  # global themes
print(rag.query("Relationship between Carton and Darnay?", param=QueryParam(mode="hybrid")))  # fused
```

5 lines of code, running graph-augmented QA over the entire novel *A Tale of Two Cities*.

## Four Query Modes

| Mode | Retrieval Strategy | Suitable Question Type |
|------|--------------------|----------------------|
| `naive` | Pure vector similarity | Simple fact lookup |
| `local` | Entity-centric local graph | Specific people / concepts |
| `global` | Whole-graph relationship themes | Cross-entity macro themes |
| `hybrid` | local + global fusion | Complex reasoning (recommended default) |

## Key Features

### 1. Graph + Vector Dual Indexing

- **Graph layer**: LLM extracts entities + relationships → stored in NetworkX / Neo4j / Memgraph
- **Vector layer**: entity names, relationship descriptions, text chunks all embedded separately → stored in NanoVectorDB / PGVector / Milvus / Qdrant
- Dual-path recall then fusion at query time

### 2. Incremental Updates Are the Killer Feature

```python
# New documents: just insert, automatically merged into the existing graph
rag.insert(open("./new_doc.txt").read())
```

- No destruction of existing graph structure
- No community rebuild
- Ideal for "continuously feeding data" production scenarios

### 3. Pluggable Backend Storage

- **Graph storage**: NetworkX (default) / Neo4j / PostgreSQL (AGE plugin) / Memgraph
- **Vector storage**: NanoVectorDB (default) / PGVector / Milvus / Qdrant / Faiss
- **KV storage**: JSON (default) / Redis / PostgreSQL / MongoDB
- **Document status**: JSON (default) / PostgreSQL / MongoDB

For production deployment, you can swap everything to PostgreSQL and run a single stack.

### 4. Native Local Model Support

```python
from lightrag.llm.ollama import ollama_model_complete, ollama_embed

rag = LightRAG(
    working_dir=WORKING_DIR,
    llm_model_func=ollama_model_complete,
    llm_model_name="qwen2.5:7b",
    llm_model_kwargs={"options": {"num_ctx": 32768}},
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        func=lambda texts: ollama_embed(texts, embed_model="nomic-embed-text"),
    ),
)
```

Ollama / Hugging Face / OpenAI-compatible interfaces all switchable in one line — perfect for data privacy scenarios.

### 5. WebUI + REST API

`lightrag-server` spins up a FastAPI service with a built-in web interface and graph visualization — usable as a demo tool out of the box.

## Why It's Important for Agent × KG

- **RAG is the Agent's "short-term memory", KG is "long-term memory"**. LightRAG makes this boundary engineering-ready
- Its "local/global dual-layer retrieval" maps exactly onto the two reasoning modes an Agent needs: specific fact verification (local) + global situational awareness (global)
- Incremental updates + multi-backend storage make it suitable for **production-grade RAG**, not just demos
- Compared to Microsoft GraphRAG's 28k stars, LightRAG's 40k+ stars shows the **community has voted with its feet**

## Who Is It For

- ✅ Medium/small knowledge bases (thousands to hundreds of thousands of documents) running graph-augmented RAG
- ✅ Operational scenarios needing **continuous data feeding** (customer service KB / product docs / internal wiki)
- ✅ **On-premise deployment** requirements (data privacy / cost control)
- ✅ Anyone who wants to use Neo4j / PostgreSQL for graph storage without rewriting the whole GraphRAG pipeline
- ❌ Not for: very large enterprise corpora (>1M documents) — prefer Microsoft GraphRAG + distributed community detection
- ❌ Not for: scientific / legal scenarios requiring 100% accurate extraction (LLM extraction has hallucinations)

## Limitations

- **Higher LLM capability requirements than traditional RAG** — entity-relationship extraction is a hard task; recommend ≥32B models or GPT-4
- Default LLM extraction prompt is in English; for Chinese scenarios, switch `SUMMARY_LANGUAGE=Chinese`
- Graph post-processing (entity merging, relationship dedup) is less mature than Microsoft GraphRAG
- For very large document sets (>100k documents), a single instance may not be enough — you need distributed deployment

## Performance Comparison (Paper Data)

The paper compares LightRAG vs NaiveRAG / RQ-RAG / HyDE / GraphRAG across Agriculture / CS / Legal / Mixed datasets. LightRAG wins on all three metrics (**comprehensiveness / diversity / empowerment**), with token consumption 2-3 orders of magnitude lower than GraphRAG.

## Recommended Reading Order

1. [Official README](https://github.com/HKUDS/LightRAG) — 15 minutes to a working *A Tale of Two Cities* demo
2. [Paper arXiv 2410.05779](https://arxiv.org/abs/2410.05779) — dual-layer retrieval paradigm
3. [LearnOpenCV complete guide](https://learnopencv.com/lightrag/) — in-depth third-party tutorial
4. [LightRAG WebUI](https://github.com/HKUDS/LightRAG#lightrag-api-server) — quick demo setup
