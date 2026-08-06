---
title: 'KG Schema Design in Practice: Building a Usable Knowledge Graph from Scratch'
excerpt: "An engineer's complete guide to KG schema design: common mistakes, three core questions, a five-step design process, three schema styles (strict ontology / property graph / lightweight), MVP evolution path, and a full case study walking through seven steps on a tech company knowledge base."
publishDate: 2026-07-30
category: 'Core Concepts'
tags: ['Knowledge Graph', 'Schema', 'Ontology Design', 'GraphRAG', 'Engineering Practice']
image: ~/assets/images/cover-concept-kg-schema-design.png
author: 'LyuBailin'
---

# KG Schema Design in Practice: Building a Usable Knowledge Graph from Scratch

> Schema is the skeleton of a KG. Get it wrong, and every subsequent index, retrieval, and maintenance step is debt.

## Why I Wrote This

A KG's schema (node types, relationship types, properties) looks like upfront work, but teams routinely underweight it:

- "Let's get it running first, fix the schema later" → can't fix it, data's already in
- "Reference a general-purpose schema" → general-purpose schema doesn't match the business
- "Just let the LLM extract" → the output is unusable, fields are chaos

I've seen too many teams redo this work. This article's goal: in 30 minutes, explain **how an engineer designs a usable KG schema from scratch**.

It covers: common mistakes, three core questions, a five-step design process, three styles compared, MVP evolution path, and a complete case study (tech company knowledge base walked through 7 steps).

---

## 1. Four Common Schema Design Mistakes

Before starting, look at the cautionary tales.

### Mistake 1: Copying a "General KG" Directly

```
Wrong approach:
  "DBpedia defines it this way, I'll do the same."
  ↓
DBpedia is an encyclopedic KG, you're building an e-commerce customer service KG.
Entity types, relationship types, property sets are fundamentally different.
```

**Consequence**: 80% of your entity types are empty, only 20% are actually used.

### Mistake 2: Too Coarse Granularity

```
Wrong approach:
  Node types: ["Document", "Entity"]  ← that's it
  Relationship types: ["related", "belongs to", "mentions"]  ← vague
```

**Consequence**: "Apple Inc." and "apple the fruit" are both "Entity" nodes, relationships are only "related", **the graph degrades into an untyped network**, GraphRAG retrieval can't use the structure.

### Mistake 3: Ignoring Properties

```
Wrong approach:
  Person { name: String }
  Company { name: String }
  relationship: works_at
```

**Consequence**: "Zhang San worked at Company A for 3 years" and "Li Si worked at Company A for 10 years" look identical on the graph. **Key information (tenure, position, hire date) is lost**.

### Mistake 4: Relationship Type Overload

```
Wrong approach:
  Relationship types: ["works at ...", "formerly employed at", "currently serves at",
                       "interned at", "concurrently holds", "moved to after leaving ..."]
  Looks detailed, but in practice:
    - Hard for the model to distinguish when writing prompts
    - Queries need to join multiple edges
    - High maintenance cost
```

**Consequence**: LLM extraction mis-categorizes 50% of edges, queries need to write a bunch of "if A or B or C" clauses.

---

## 2. Three Core Design Questions

Schema design is essentially answering 3 questions.

### Q1: What's the Domain Boundary?

**What your KG covers, and what it doesn't**.

```
Wrong: "We want to build a knowledge graph of the AI industry"
  → Too broad: models, papers, companies, people, products, investment, regulation... all included?
  
Right: "We want to build a KG for the AI industry's **large models** domain,
       covering: models / papers / companies / people / benchmarks"
  → Clear boundary, content about "5G communications" is explicitly excluded
```

**Practice**: Write one sentence: "This KG answers questions in what domain, and can't answer what."

### Q2: How Fine is the Entity Granularity?

**Determines how you segment and merge during extraction**.

```
Coarse-grained (one node per document):
  Node: "GPT-4 paper"
  Relationship: "released by OpenAI"
  → Pro: extraction is simple
  → Con: too coarse, cross-paper comparison can't be answered

Fine-grained (one node per section/paragraph):
  Node: "GPT-4 §3.2 training data"
  Relationship: "describes", "cites"
  → Pro: precise positioning
  → Con: node explosion, entity alignment is hard

Recommended: Medium granularity (key entity level)
  Nodes: GPT-4, OpenAI, training data, RLHF, human feedback
  Relationships: GPT-4 → uses → RLHF
  → Pro: extensible, alignable
  → Con: needs clear boundary rules
```

**Rule of thumb**: entity count ≈ doc count × 10 to 100. For a 10k-doc corpus, entities are 100k-1M.

### Q3: Are Relationships Orthogonal or Hierarchical?

```
Hierarchical (tree-like):
  Person -IS_A-> Employee -IS_A-> Person
  → Good for: domains with clear classifications (biology, medicine)

Orthogonal (network-like):
  Person -works_at-> Company
  Person -knows-> Person
  Company -competes_with-> Company
  → Good for: complex relationship domains (enterprises, people, events)
```

**Practical judgment**:
- Can your domain be organized by "directory"? (e.g., "animal > mammal > cat") → Hierarchical
- Is your domain "X how-what with Y"? → Orthogonal

**Most KGs are orthogonal-dominant, hierarchical-auxiliary** (use `subclass_of` / `is_a` to express).

---

## 3. Five-Step Schema Design Process

Don't define schema in one shot; follow these 5 steps.

### Step 1: List 5-10 Typical Business Queries

**This is the most important step**. Schema serves queries, not "perfect ontology".

```
Example (tech company knowledge base):
  Q1: "What models has OpenAI released?"
  Q2: "What training method did GPT-4 use?"
  Q3: "What companies do the authors of the Transformer paper come from?"
  Q4: "What is Company A's core product?"
  Q5: "Who are Company B's competitors?"
  Q6: "Which companies are doing large models?"
  Q7: "What company is person X currently CTO of?"
  Q8: "How has the MMLU leaderboard Top 3 changed over the past 3 years?"
  Q9: "Comparison of Model A and Model B on MMLU?"
  Q10: "Which company has raised the most funding?"
```

After writing these 10 queries, your domain boundary is clear.

### Step 2: Brainstorm Entity Candidate List

**List all subjects and objects appearing in the queries above**.

```
Extract candidate entities from Q1-Q10:
  - Models: GPT-4, Claude, Llama, Gemini...
  - Companies: OpenAI, Anthropic, Meta, Google...
  - People: Sam Altman, Ilya Sutskever, Geoffrey Hinton...
  - Papers: "Attention Is All You Need", "GPT-4 Technical Report"...
  - Training methods: RLHF, SFT, RLAIF, DPO...
  - Benchmarks: MMLU, GSM8K, HumanEval, BBH...
  - Funding events: OpenAI 2023 funding, Anthropic 2024 funding...
  - Products: ChatGPT, Claude Code, Gemini App...
```

After dedup and merge, this is your "entity type list".

**Practical tips**:
- First version can **intentionally over-list**, trim later
- Reference Wikidata, DBpedia for similar domain schemas, but **take subsets only**
- Have 2-3 business stakeholders list independently, then merge differences

### Step 3: Use 1-2 Queries to Walk Through Relationship Types

**Don't design all relationships in one shot**. Pick 1-2 hardest queries, see what relationships are needed.

```
Walk through Q1: "What models has OpenAI released?"
  Needs relationship: Company -publishes-> Model
  
Walk through Q4: "What is Company A's core product?"
  Needs relationship: Company -owns-> Product
  And: Product -is_core_product_of-> Company (reverse)
  Or: Company -has_core_product-> Product
  
Walk through Q3: "What companies do the Transformer paper's authors come from?"
  Needs relationship: Paper -has_author-> Person
  And: Person -works_at-> Company (time-point must be explicit)
```

After running 2-3 queries, you have a "minimum relationship set".

**Rule of thumb**: **relationship count ≈ entity type count × 2-5**. 10 entity types → 20-50 relationship types is a reasonable range.

### Step 4: Property Schema Design

Properties are the KG's "flesh". Three categories of properties should be distinguished.

```
Required properties (must-have):
  - Minimum identifier for all entities
  - Person: name
  - Company: name
  - Paper: title, publish_year
  - Model: name, release_date

Optional properties (fill-if-available):
  - Most entities have it, some don't
  - Person: birth_date, education
  - Company: founded_year, headquarters
  - Model: parameter_count, context_length

Multi-valued properties:
  - One entity corresponds to multiple values
  - Person: alias (may have multiple), former_companies
  - Paper: authors (may have multiple), keywords
  
Time-stamped properties:
  - Timestamps on relationships
  - Person -works_at(2020-2023)-> Company
  - Relationship itself needs "from" / "to" fields
```

**Practice**: Use the table below to specify each entity type's properties.

```yaml
Person:
  name: string  # required
  alias: list[string]  # multi-value
  birth_date: date  # optional
  education: list[Education]  # nested (can be relationships)
  current_company: Company  # can be relationship
  
Company:
  name: string
  founded_year: int
  headquarters: string
  funding_rounds: list[FundingEvent]  # nested/relationship
```

**Key lessons**:
- String-type properties, length no more than 200 chars (query efficiency)
- Time always in ISO 8601 format
- Nested structures (education) — split into relationships if possible, **the property layer should be as flat as possible**

### Step 5: Replay 5-10 Queries for Validation

Take the 10 queries from Step 1, walk through each with the designed schema.

```
Q1 "What models has OpenAI released?"
  → Query Company(name=OpenAI) -publishes-> Model
  → ✅ Works

Q3 "What companies do the Transformer paper's authors come from?"
  → Query Paper(title="Attention Is All You Need") -has_author-> Person
  → Connect Person -works_at-> Company
  → Wait, author may "formerly at Google Brain" or "now at Company X"
  → ❌ Need time-point info on works_at
  → Fix: add from_date / to_date attributes, or split into "current_works_at" / "former_works_at"
```

After running 10 queries, **80% working** is initial usability. The remaining 20% edge queries, log them and put them in the next iteration.

---

## 4. Three Schema Styles

The same domain can have completely different schema expressions. Which to choose depends on your goal.

### Style 1: Strict Ontology (OWL / RDF)

**Characteristics**:
- Uses RDF triples (subject-predicate-object)
- Supports class hierarchy, property restriction, axioms
- Edited with tools like Protégé

```
Example:
  ex:GPT-4 rdf:type ex:LargeLanguageModel .
  ex:LargeLanguageModel rdfs:subClassOf ex:Model .
  ex:publishes rdfs:domain ex:Company .
  ex:publishes rdfs:range ex:Model .
```

**Good for**:
- Academic research (biology, medicine, chemistry)
- Needs reasoning (infer properties from subclass relationships)
- Multi-source data fusion (aligning different schemas)

**Not good for**:
- Business RAG systems (over-engineering)
- Quick validation (reasoning isn't used)

**Typical tools**: Protégé, Apache Jena, Stardog

### Style 2: Practical Property Graph (Neo4j)

**Characteristics**:
- Node + Relationship + Property
- Uses Cypher for queries
- Flexible, close to engineer intuition

```
Example:
  CREATE (gpt4:Model {name: 'GPT-4', release_date: '2023-03-14'})
  CREATE (openai:Company {name: 'OpenAI', founded_year: 2015})
  CREATE (openai)-[:PUBLISHES {date: '2023-03-14'}]->(gpt4)
```

**Good for**:
- Business RAG systems
- Medium scale (<100M nodes)
- Team familiar with graph queries

**Typical tools**: Neo4j, Memgraph, Amazon Neptune

### Style 3: Lightweight (LightRAG Default)

**Characteristics**:
- No preset types, whatever the LLM extracts gets stored
- Nodes and relationships use natural language descriptions
- Good for quick POC

```
Example (LightRAG actual storage):
  entity: "GPT-4"
  type: "large language model"  # string, not enum
  description: "Large language model released by OpenAI on March 2023"
  
  relation: "OpenAI -releases-> GPT-4"
  description: "OpenAI released GPT-4 on March 14, 2023"
```

**Good for**:
- Quick POC, want to see results in 2 weeks
- Domain unclear, want to see what's extracted first
- Tight budget, don't want to spend time designing schema

**Not good for**:
- Long-term evolving business systems
- Scenarios needing strict type validation

**Typical tools**: LightRAG, GraphRAG (default), HippoRAG

### Which to Choose?

| Your Situation | Recommendation |
|----------------|----------------|
| Academic research, needs reasoning | Strict ontology (OWL/RDF) |
| Business RAG, medium scale | Practical property graph (Neo4j style) |
| 2-week POC, exploration phase | Lightweight (LightRAG) |
| Long-term production, needs extension | Practical property graph + strict schema documentation |

**A common path**: First use lightweight to run POC → look at actual data → design formal schema → switch to Neo4j.

---

## 5. Schema Evolution: From MVP to Convergence

Don't aim for "perfect in one shot". **MVP schema → battle iteration → convergence** is the normal path.

### Phase 1: MVP Schema (Week 1-2)

```
Goal: Run POC
Principle: Simple as possible, iterate as you go
Typical:
  - 5-10 entity types
  - 10-20 relationship types
  - Properties: only required
  - Documentation: half a page
```

**This phase**:
- Choose LightRAG style, don't fuss over types
- Run on 100 documents, look at extraction results
- Mark "don't know where to classify" entities, log them

### Phase 2: Battle Iteration (Week 2-8)

```
Goal: Discover problems in real data
Actions:
  - Look at "unknown type" ratio from LLM extraction
  - Find 3-5 most common mis-categorizations
  - Merge, split, normalize types
  - Fill in key properties
  - Write prompt templates and few-shot examples
```

**Common discoveries in this phase**:
- "Person" too broad, needs split into "Founder / CEO / CTO / Researcher"
- "Company" needs subtypes "LLM Company / Tool Company / Compute Company"
- "publishes" relationship needs time-point + relationship type (release/acquisition/partnership)
- LLM treats "GPT-4 Turbo" and "GPT-4" as two entities, needs entity merging

**This step takes the longest**. Don't rush, iterate 3-5 rounds before convergence.

### Phase 3: Convergence (After Week 8)

```
Goal: Stable schema, production-ready
Characteristics:
  - 15-30 entity types
  - 30-80 relationship types
  - Each type has complete property definition
  - Has schema documentation + extraction prompt templates
  - Has entity alignment rules (synonyms, abbreviations)
```

**This phase**:
- Write formal schema documentation (YAML or Markdown)
- Use JSON schema to strongly constrain extraction prompts
- Entity alignment uses embedding similarity + manual review
- Monitor extraction quality (unknown type rate, merge rate, error rate)

### Don't Do

- ❌ Aim for 50+ entity types in version 1
- ❌ Write dozens of pages of schema docs but never run them
- ❌ Switch schema without writing migration scripts
- ❌ Don't do entity alignment, store 5 copies of same-name entity

---

## 6. Special Considerations for GraphRAG Scenarios

Schema design for GraphRAG (and LLM extraction frameworks like LightRAG) is a bit different from traditional KG.

### Auto Extraction vs Manual Design

| Dimension | Manual Design | LLM Auto Extraction |
|-----------|---------------|---------------------|
| Type definition | Strict enum | Free text |
| Consistency | High | Medium (depends on prompt) |
| Flexibility | Low | High |
| Maintenance cost | High (changing schema requires re-ingestion) | Low (just change prompt) |
| Good for phase | Post-convergence | MVP phase |

**Recommended strategy**: **Manually define schema, LLM extracts according to schema**.

```
Prompt template (pseudo-code):
  Please extract entities and relationships from the following text,
  strictly following this schema:
  
  Entity types: [Company, Model, Paper, Person, Benchmark]
  Company properties: [name, founded_year, headquarters]
  Model properties: [name, release_date, parameter_count]
  Paper properties: [title, authors, publish_year, venue]
  Person properties: [name, current_role, current_company]
  Benchmark properties: [name, full_name, evaluation_aspects]
  
  Relationship types: [publishes, has_author, works_at, evaluated_on]
  publishes: Company → Model
  has_author: Paper → Person
  works_at: Person → Company
  evaluated_on: Model → Benchmark
  
  Text: {chunk}
  Output: JSON
```

**Give the LLM an explicit schema, much more stable than letting it freestyle**.

### Entity Conflict Merging

LLM extraction will definitely produce conflicts. The 3 most common types:

```
1. Same name, different entity:
   "Apple" may be a company or a fruit
   → Use type to distinguish + context judgment

2. Same entity, different name:
   "OpenAI" / "Open AI" / "openai.com" / "OpenAI, Inc."
   → Entity alignment: use embedding similarity + manual rules
   → Key: maintain an alias dictionary

3. Cross-document duplicates:
   Document A extracts "GPT-4 by OpenAI"
   Document B extracts "GPT-4 by OpenAI Inc."
   → Use (name, type) as primary key, merge into one record
```

**Practical suggestions**:
- Run an **entity alignment pipeline** after extraction (embedding + rules)
- Primary key uses `(canonical_name, entity_type)`
- Maintain `alias` field, store all variants

### Extraction Quality Monitoring

```
Key metrics:
  - Unknown type rate: ratio of extracted types not in schema
  - Duplicate entity rate: number of same-name entities
  - Relationship categorization error rate: manual review accuracy of sampled relationships
  - Key entity coverage rate: ratio of core entities extracted

Recommended thresholds:
  - Unknown type rate < 5%
  - Duplicate entity rate < 10%
  - Relationship categorization accuracy > 90%
  - Key entity coverage > 95%
```

**Don't go online if it exceeds the standard**.

---

## 7. Case Study: Tech Company Knowledge Base Walks Through 7 Steps

Apply the above method to a specific scenario, walk through completely.

### Background

```
Corpus: 1000 AI industry articles + 500 company annual reports
Team: 2 engineers + 1 domain expert
Goal: Usable KG in 1 month
Tech choice: Neo4j + LLM extraction
```

### Step 1: Business Query List (10 queries)

```
Q1:  What models has OpenAI released?
Q2:  What training method did GPT-4 use?
Q3:  What companies do the Transformer paper's authors come from?
Q4:  What is Anthropic's current funding situation?
Q5:  How do Google and OpenAI compete on large models?
Q6:  Which companies are doing open-source large models?
Q7:  What company and position is person X (Yann LeCun) currently at?
Q8:  How has the MMLU leaderboard Top 5 changed?
Q9:  Comparison of Llama 3 and GPT-4 on HumanEval?
Q10: What are the 3 most important events in the AI industry in 2024?
```

### Step 2: Entity Candidate List

```
Extract from Q1-Q10:
  - Models: GPT-4, Claude, Llama, Gemini, Mistral...
  - Companies: OpenAI, Anthropic, Meta, Google, Mistral AI...
  - People: Sam Altman, Dario Amodei, Yann LeCun, Demis Hassabis...
  - Papers: "Attention Is All You Need", "GPT-4 Technical Report"...
  - Training methods: RLHF, SFT, DPO, Constitutional AI...
  - Benchmarks: MMLU, GSM8K, HumanEval, BBH, MT-Bench...
  - Events: GPT-4 release, Claude 3 release, Llama 3 open source...
  - Funding events: OpenAI 2023 $10B funding...
  - Products: ChatGPT, Claude App, Gemini App...
```

After dedup, **8 entity types**: Model / Company / Person / Paper / TrainingMethod / Benchmark / Product / Event

### Step 3: Relationship Types (Walk Q1, Q3, Q5)

```
Walk through Q1 (What models has OpenAI released?):
  → Company -publishes-> Model
  → Relationship properties: release_date

Walk through Q3 (What companies do Transformer paper's authors come from?):
  → Paper -has_author-> Person
  → Person -works_at(time-point)-> Company
  → Relationship properties: from_date, to_date (nullable), role

Walk through Q5 (Google and OpenAI's competitive relationship?):
  → Company -competes_with-> Company
  → Company -develops-> Model (reverse: has large model = competes)
```

**First version relationship set** (12):

```
publishes, has_author, works_at, competes_with, develops,
trained_with, evaluated_on, owns, acquired, invested_in,
released_product, had_event
```

### Step 4: Property Schema

```yaml
Model:
  name: string  # required
  release_date: date  # required
  parameter_count: string  # optional (e.g., "1.76T")
  context_length: int  # optional
  is_open_source: bool  # required
  type: enum[llm, vlm, speech, multimodal]  # required

Company:
  name: string  # required
  founded_year: int  # required
  headquarters: string  # optional
  focus_area: list[enum]  # multi-value, llm/robotics/...
  is_public: bool  # optional

Person:
  name: string  # required
  current_company: Company  # optional
  current_role: string  # optional
  alias: list[string]  # multi-value

Paper:
  title: string  # required
  authors: list[Person]  # multi-value
  publish_year: int  # required
  venue: string  # optional (NeurIPS, arXiv...)

TrainingMethod:
  name: string  # required
  full_name: string  # optional
  description: string  # optional

Benchmark:
  name: string  # required
  full_name: string  # optional
  evaluation_aspects: list[string]  # multi-value

Product:
  name: string  # required
  company: Company  # required
  launch_date: date  # optional

Event:
  name: string  # required
  event_date: date  # required
  involved_entities: list[Entity]  # multi-value
```

### Step 5: Validation (Replay 10 Queries)

```
Q1 "What models has OpenAI released?"
  MATCH (c:Company {name:'OpenAI'})-[:PUBLISHES]->(m:Model)
  RETURN m.name  → ✅ Works

Q3 "What companies do the Transformer paper's authors come from?"
  MATCH (p:Paper {title:'Attention Is All You Need'})-[:HAS_AUTHOR]->(person:Person)
        -[r:WORKS_AT]->(c:Company)
  RETURN person.name, c.name, r.from_date  → ⚠️ Partially works
  Problem: some authors "formerly at Google Brain" but have now left
  Fix: add is_current field to works_at, or split into current_works_at / former_works_at

Q5 "How do Google and OpenAI compete?"
  MATCH (g:Company {name:'Google'})-[r:COMPETES_WITH]->(o:Company {name:'OpenAI'})
  RETURN r.description  → ✅ Works
```

**10 queries, 8 work, 2 have edge issues**. After fixes, run again, **9/10 work**.

### Step 6: Extract + Align

```python
# Extract (Prompt template simplified)
extract_prompt = """
Please extract entities and relationships from the following text,
strictly following the schema:
[Schema definition]

Text: {chunk}

Output JSON: {entities: [...], relations: [...]}
"""

# Entity alignment
def merge_entities(entities):
    # 1. Normalize names
    normalized = [(e.name.lower().strip(), e.type) for e in entities]
    # 2. Use embedding to find similar
    embeddings = embed([n for n, _ in normalized])
    clusters = cluster(embeddings, threshold=0.85)
    # 3. Merge same cluster
    for cluster in clusters:
        canonical = pick_canonical(cluster)  # pick shortest/most common
        for entity in cluster:
            entity.alias.append(canonical)
    return entities
```

### Step 7: Quality Monitoring

```
After running 1000 documents:
  - Total entities: 12,847
  - Total relationships: 38,219
  - Unknown type rate: 3.2%  ✅ < 5%
  - Duplicate entity rate: 7.8%  ✅ < 10%
  - Relationship categorization accuracy (sample 100): 92%  ✅ > 90%
  - Core entity coverage (OpenAI/Anthropic/...): 100%  ✅ > 95%
```

**Meets standard, can go online**.

---

## 8. Common Pitfalls and Countermeasures

Finally, summarize the 5 most common pitfalls in practice.

**1. ❌ Too Many Entity Types, LLM Can't Choose Accurately**
- Symptom: prompt gives 20 types, LLM extraction has 30% wrong choice
- Countermeasure: core types ≤ 15, others use description to distinguish, don't put in enum

**2. ❌ Relationships Have Too Many Properties, Extraction Unstable**
- Symptom: relationships need `from_date / to_date / role / confidence` simultaneously, LLM often leaves blanks
- Countermeasure: core properties ≤ 3, others post-process

**3. ❌ Inconsistent Schema Across Data Sources**
- Symptom: document A uses "Company", document B uses "Enterprise", extracted types differ
- Countermeasure: use synonym dictionary + post-extraction normalization

**4. ❌ Time Information Lost**
- Symptom: "Zhang San is Company A's CEO", but 3 years ago Zhang San was Company B's VP
- Countermeasure: **add time-point to all changeable relationships**, only invariants don't need it

**5. ❌ Don't Do Entity Alignment**
- Symptom: 5 "OpenAI" nodes, 2 "Open AI" nodes in the database
- Countermeasure: **entity alignment pipeline is mandatory**, merge rate needs monitoring

---

## 9. Next Steps

After finishing this article, recommended reading:

1. 📄 [GraphRAG Onboarding: Principles and Practice of Industrial-Grade Graph-Enhanced RAG](https://github.com/LyuBailin/agent-kg-hub) — How schema gets used by GraphRAG
2. 📄 [KG Quality Evaluation in Practice](https://github.com/LyuBailin/agent-kg-hub) — How to evaluate quality after schema design
3. 📖 [Neo4j Schema Design Guide](https://neo4j.com/docs/getting-started/data-modeling/) — Property graph modeling best practices
4. 📖 [Protégé Getting Started Tutorial](https://protege.stanford.edu/) — Strict ontology editing tool
5. 📄 [Entity Alignment Survey](https://arxiv.org/abs/2105.12110) — Entity alignment algorithm reference

---

## References

- [Neo4j Data Modeling Best Practices](https://neo4j.com/docs/getting-started/data-modeling/)
- [Protégé — Stanford Ontology Editor](https://protege.stanford.edu/)
- [Microsoft GraphRAG Schema Configuration](https://microsoft.github.io/graphrag/)
- [LightRAG: Simple and Fast Retrieval-Augmented Generation](https://arxiv.org/abs/2410.17979)
- [Knowledge Graphs: Fundamentals, Techniques, and Applications (Book)](https://www.morganclaypool.com/doi/10.2200/S00825ED1V01Y202007CSK009)
