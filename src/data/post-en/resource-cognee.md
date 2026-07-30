---
title: 'Cognee — Give Your AI Agent Long-Term Memory in 6 Lines of Code'
excerpt: 'Cognee (appeared 2024, ~7k+ stars) is an open-source AI memory engine for AI Agents. Its core idea is the ECL (Extract-Cognify-Load) pipeline + vector + graph dual storage, letting you build a queryable knowledge graph from conversations/documents in 6 lines of Python — replacing traditional RAG as the Agent''s memory layer.'
publishDate: 2026-07-30
category: 'Core Projects'
tags: ['Cognee', 'Agent Memory', 'Knowledge Graph', 'AI Memory', 'LLM']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# Cognee

> The shortest path to giving an AI Agent long-term memory — 6 lines of Python.

- 🔗 Repo: <https://github.com/topoteretes/cognee>
- ⭐ Stars: 7k+ (as of July 2026)
- 📜 License: Apache 2.0
- 🏢 Maintainer: topoteretes (Germany)
- 🐍 Language: Python
- 🚀 First release: 2024

## What Problem Does It Solve

Two pain points of traditional LLM applications:

1. **Memory fragmentation**: LLMs have no cross-session memory. Every conversation starts from amnesia. Developers can only stuff external documents into context via RAG, but RAG is stateless and can't reflect what the Agent itself has actually said or done.
2. **RAG answers the wrong question**: Pure vector retrieval is great at "finding paragraphs" but fails completely on questions like "what were the downsides of the X approach we discussed last week?" — questions that require **temporal + entity-relationship** reasoning. Vector retrieval doesn't even know you and the Agent had that conversation.

Cognee's core idea: **extract everything an Agent produces (conversations, documents, tool results) into an entity-relationship graph that serves as the Agent's queryable long-term memory**.

## Minimum Runnable Example

```python
import cognee
from cognee.api.v1.search import SearchType

text = """Natural language processing (NLP) is an interdisciplinary subfield
of computer science and information retrieval."""

await cognee.prune.prune_data()           # clear history
await cognee.add(text)                     # feed text
await cognee.cognify()                     # extract entities, build graph
results = await cognee.search(             # retrieve
    query_type=SearchType.GRAPH_COMPLETION,
    query_text="Tell me about NLP",
)
```

In just 6 lines of core code, Cognee extracts entities like NLP / computer science / information retrieval from a paragraph of text, along with relationships like "is a subfield of".

## Key Features

### 1. ECL Pipeline (Extract-Cognify-Load)

- **Extract**: pull text chunks from raw data (conversations / documents / image transcripts)
- **Cognify**: use an LLM to convert chunks into entities and relationships, write to graph database; simultaneously compute embeddings and write to vector database
- **Load**: unified management of graph + vector dual storage with a consistent query interface

### 2. Vector + Graph Dual Storage

- **Graph database** (default Kuzu, optional Neo4j): stores entities, relationships, communities
- **Vector database** (default LanceDB, optional Qdrant / Chroma / PGVector): stores semantic vectors
- **Dual-path retrieval**: queries run "graph path search" and "vector similarity" in parallel, then fuse results

### 3. Multiple Search Modes

- `GRAPH_COMPLETION`: structured reasoning over the graph
- `RAG_COMPLETION`: pure vector RAG
- `SUMMARIES`: community-level summaries
- `CHUNKS`: return raw chunks
- `CODE`: generate Cypher / code to query the graph

### 4. Built-in Graph Post-Processing

- Entity deduplication and merging
- Relationship normalization (merge synonyms)
- Community detection (Leiden algorithm)

### 5. 30+ Data Source Connectors

Local files (PDF / DOCX / MD), Notion / Slack / Google Drive, databases (Postgres / SQLite), S3 / GCS, web pages, YouTube transcripts — covers nearly every common data source.

## Why It's Important for Agent × KG

Cognee directly hits the **most concrete and in-demand** scenario in the Agent × KG paradigm: **Agent long-term memory**.

- Compared to Microsoft GraphRAG, Cognee's design goal isn't "enterprise-grade RAG over static corpora" — it's "give a single Agent or multi-Agent system persistent, cross-session-queryable memory"
- Compared to Mem0 (another Agent memory project), Cognee uses a **full entity-relationship graph** rather than a simplified key-value memory — ideal for "recall related events" rather than "recall facts"
- Cognee's support for "conversations as a data source" (`cognee.add(chat_history)`) is key for Agent scenarios — letting the Agent's own outputs feed back into memory

In real engineering, you'll use it as the **memory backend** for an Agent framework (LangGraph / AutoGen). All conversations and tool results go through `cognee.add()`, and before the Agent makes decisions, it calls `cognee.search()` for historical context.

## Who Is It For

- ✅ **Personal AI assistants / secretaries**: remember user preferences, past decisions, project status across sessions
- ✅ **Customer service Agents**: build customer-specific knowledge graphs from historical tickets
- ✅ **Research assistants**: merge paper PDFs + your own notes into a queryable graph
- ✅ **Multi-Agent systems**: share a single "organizational memory"; new Agents can onboard quickly
- ❌ **Not for**: single-turn FAQ Q&A (plain RAG suffices; Cognee is overengineering)
- ❌ **Not for**: very large enterprise knowledge bases (>1M documents; prefer Microsoft GraphRAG for industrial scale)

## Limitations

- Project is still evolving fast (v0.1+); API occasionally has breaking changes — lock your version in production
- Heavy reliance on LLM extraction quality: small models (e.g., 7B) produce noisy entities/relations; recommend 32B+ or GPT-4
- Dual storage (vector + graph) brings operational complexity — you manage two databases
- Chinese language support requires choosing the right LLM (default prompt is in English)

## Recommended Reading Order

1. [Official README](https://github.com/topoteretes/cognee/blob/main/README.md) — 5 minutes to a working demo
2. [Cognee Docs](https://docs.cognee.ai/) — full API and concepts
3. [Notebooks directory](https://github.com/topoteretes/cognee/tree/main/notebooks) — practical recipes for multimodal, relational DB integration, etc.
4. [Discord community](https://discord.gg/cognee) — direct line to the maintainers
