---
title: 'neo4j-labs/llm-graph-builder — Neo4j''s Official "No-Code" Knowledge Graph Builder'
excerpt: 'A web application open-sourced by Neo4j Labs in 2024 that turns unstructured data (PDFs, web pages, YouTube transcripts) into Neo4j graphs with one click. Supports 11 LLMs, 5 RAG retrieval modes, and custom schemas. The best starting point for anyone new to Neo4j + LLM knowledge graphs.'
publishDate: 2026-07-30
category: 'Tutorials & Blogs'
tags: ['Neo4j', 'llm-graph-builder', 'Knowledge Graph', 'GraphRAG', 'Neo4j Labs']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# neo4j-labs/llm-graph-builder

> Neo4j's official "no-code" knowledge graph builder — upload files, click a button, get a graph.

- 🔗 Repo: <https://github.com/neo4j-labs/llm-graph-builder>
- 🏢 Maintainer: Neo4j Labs (official)
- 🐍 Backend: Python FastAPI
- ⚛️ Frontend: React
- 🗄️ Database: Neo4j 5.15+ (APOC plugin required)
- 🚀 First release: 2024

## What Problem Does It Solve

For anyone wanting to get started with "LLM + knowledge graph", there used to be three **onboarding barriers**:

1. **No ready-made UI** — write Cypher, write LangChain, write the Neo4j driver, build from scratch
2. **Can't see what the graph looks like** — extracted entities/relations are JSON; how do you verify quality?
3. **How does RAG use the graph** — once you've extracted a graph, how do you make it participate in retrieval?

neo4j-labs/llm-graph-builder (LGB for short) **one-stop** solves all three:

- **Data upload**: PDF, DOC, TXT, web URLs, YouTube links, Wikipedia entries — drag directly into the frontend
- **Graph generation**: pick an LLM → click "Generate Graph" → see entities and relations in Neo4j minutes later
- **Graph visualization**: open Neo4j Bloom with one click
- **RAG conversation**: chat box on the right, answers based on the graph, switchable across 5 retrieval modes

## Three Steps to Get Running

### Step 1: Start Neo4j

```bash
# Option A: Neo4j Aura Free (recommended for beginners)
# Register at https://console.neo4j.io → create a free instance → download credentials file

# Option B: Local Docker
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_apoc_export_file_enabled=true \
  -e NEO4J_apoc_import_file_enabled=true \
  -e NEO4J_PLUGINS='["apoc"]' \
  neo4j:5.15
```

### Step 2: Launch llm-graph-builder

```bash
git clone https://github.com/neo4j-labs/llm-graph-builder.git
cd llm-graph-builder

# .env file
echo "OPENAI_API_KEY=your-key" > .env

docker-compose up --build
# → Frontend: http://localhost:8080
# → Backend:  http://localhost:8000
```

### Step 3: Upload Files → Generate Graph

Open http://localhost:8080 → "Connect to Neo4j" → drag a PDF → pick an LLM → click "Generate Graph" → see nodes and relations in minutes.

## Key Features

### 1. Multi-Source Data Ingestion

- Local files (PDF / DOC / TXT)
- Web pages (paste URL)
- YouTube videos (auto-transcribed)
- Wikipedia entries
- AWS S3 / Google Cloud Storage

### 2. 11 LLM Support

| Provider | Model | Purpose |
|----------|-------|---------|
| OpenAI | GPT-3.5 / GPT-4 / GPT-4o | Default option, highest quality |
| Diffbot | Diffbot NLP | Specialized for graph extraction, fast |
| Gemini | Gemini 1.5 Pro | Long context |
| Anthropic | Claude 3.5 | High-quality reasoning |
| Ollama (local) | llama3 / qwen / etc. | Data privacy scenarios |

### 3. Custom Schema

Through Settings → Entity Extraction Settings, you can:

- Use an existing Neo4j schema
- Customize node types and relationship types (JSON)
- Let an LLM recommend a schema from a passage of text

Example: for legal document scenarios, customize `LegalTerm` / `Case` / `Precedent` nodes + `CITED_BY` / `OVERRULES` relationships.

### 4. 5 RAG Retrieval Modes

| Mode | Suitable For |
|------|--------------|
| `vector` | Pure vector similarity, simple fact lookup |
| `graph+vector` (recommended) | Graph + vector fusion, best overall |
| `graph` | Pure graph path queries, scenarios needing precise relationships |
| `hybrid` | Multi-strategy fusion |
| `entity_vector` | Entity-level vector retrieval |

### 5. Graph Post-Processing Tools

- Entity deduplication and merging
- Orphan node cleanup
- Community detection
- Entity embedding generation (sets the stage for later vector retrieval)

### 6. Traceable Answers

Every answer is annotated with **source documents / chunks / entities**. Click "Details" to see exactly which contexts the RAG used, making debugging and validation easy.

## Why It's Important for Agent × KG

- **It's the "benchmark demo" for the Neo4j + LLM knowledge graph direction** — anyone building a similar project must first look at this repo to understand "what is the standard UX for LLM knowledge graphs"
- **Backend uses LangChain's `LLMGraphTransformer`** — this is the core module the Neo4j team contributed back to LangChain; all other "LLM-to-graph" implementations have been influenced by it
- **Demonstrates the "complete closed loop" of graphs in RAG**: ingest → extract → store → retrieve → generate → feedback, every step has a UI
- **Beginner-friendly**: zero code to run the full "PDF → graph → Q&A" pipeline, dramatically lowering the barrier to Agent × KG

Engineers building Agent projects can use this tool to **validate "does a knowledge graph actually help my Agent"** — the fastest way to experiment.

## Who Is It For

- ✅ **Beginners getting into Neo4j + LLM knowledge graphs** (zero-code experience)
- ✅ **Quick business idea validation** — demo "documents become graphs" to your boss / client
- ✅ **Enterprise knowledge base prototype** — graph-ify internal technical docs and sales manuals as a PoC
- ✅ **Academic research** — use this tool for baseline comparisons in your paper
- ✅ **Teaching** — the best teaching tool for showing students "how graphs are extracted from text"
- ❌ **Not for**: production-grade large-scale deployment (you need to add concurrency / permissions / audit yourself)
- ❌ **Not for**: scientific / legal scenarios requiring the highest extraction quality (LangChain LLMGraphTransformer is a general solution, not customized)

## Limitations

- Single-document processing speed is bounded by LLM rate limits; large PDFs (>500 pages) require long waits
- Default extracted entity types are generic (Person / Organization / Location); professional domains need custom schemas
- No multi-user collaboration / permission management / audit logging — none of the enterprise-grade features
- LangChain 0.1 → 0.2 API changes have historically affected this project; check the latest issues before deploying

## Recommended Reading Order

1. [Official online experience](https://llm-graph-builder.neo4jlabs.com/) — try it without registering Neo4j
2. [GitHub README](https://github.com/neo4j-labs/llm-graph-builder) — 5-minute local deployment
3. [Neo4j GenAI Ecosystem docs](https://neo4j.com/labs/genai-ecosystem/) — see the related toolset
4. [LangChain LLMGraphTransformer source](https://python.langchain.com/api_reference/experimental/graph_transformers/langchain_experimental.graph_transformers.llm.LLMGraphTransformer.html) — understand the underlying extraction logic
