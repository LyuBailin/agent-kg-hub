---
title: 'KG Quality Assessment — Completeness, Accuracy, Consistency, Maintainability'
excerpt: 'The effectiveness of an Agent × KG system is 80% determined by KG quality. This article systematically covers the four dimensions of KG quality assessment (completeness / accuracy / consistency / maintainability), key metrics, evaluation methods (automated + manual), common defects, and improvement strategies.'
publishDate: 2026-07-27
category: 'Core Concepts'
tags: ['KG Quality', 'KG Evaluation', 'Completeness', 'Accuracy', 'Consistency', 'Knowledge Graph']
image: ~/assets/images/cover-concept-kg-quality.png
author: 'LyuBailin'
---

# KG Quality Assessment: Completeness, Accuracy, Consistency, Maintainability

> Garbage in, garbage out. The effectiveness of an Agent × KG system is 80% determined by KG quality.

## Why I Wrote This

When using GraphRAG, QA-GNN, KG-R1 and similar approaches, people often ask: **"How good is my KG?"**

But KG quality assessment is an **underrated field**. Most projects only care about "does it work", not "does it work well". The result:

- GraphRAG retrieval returns irrelevant entities (noise)
- Relations extracted by LLMs contradict each other (conflict)
- KG schema is messy and cannot support reasoning
- Updates introduce errors

This article aims to: in 30 minutes, give you a **thorough understanding of the four dimensions of KG quality, key metrics, evaluation methods, and improvement strategies**.

---

## 1. Four Dimensions of KG Quality

### 1. Completeness

**Definition**: Whether the KG covers the entities and relations it should cover.

**Key questions**:
- Are important entities missing?
- Are important relations missing?
- Are entity attributes complete?

**Typical scenarios**:
- A medical KG missing a rare disease
- An e-commerce KG missing a brand
- An enterprise KG missing a department

**Impact**:
- Low retrieval recall (can't find it)
- Agent makes wrong decisions (misses key info)
- Long term: models learn wrong knowledge from an incomplete KG

### 2. Correctness / Accuracy

**Definition**: Whether the facts in the KG are correct.

**Key questions**:
- Does the entity exist?
- Does the relation hold?
- Are attribute values accurate?
- Are there errors / fictional information?

**Typical scenarios**:
- LLM hallucination, generating non-existent entities
- Wrong entity alignment (merging two different people)
- Wrong relation direction (storing "A is B's father" as "B is A's father")
- Outdated attribute values (e.g. the CEO has changed)

**Impact**:
- Wrong retrieval results
- Wrong reasoning conclusions
- Collapse of trust

### 3. Consistency

**Definition**: Whether the KG contains internal contradictions.

**Key questions**:
- Is the same fact expressed in multiple ways?
- Do relations contradict each other?
- Are schema constraints violated?
- Is the time logic reasonable?

**Typical scenarios**:
- "Tim Cook is Apple's CEO" and "Tim Cook has left" existing at the same time
- The same entity having two different IDs
- Relations violating type constraints (person -birthplace-> company)
- "X won an award in 2020 that was established in 2019"

**Impact**:
- The reasoner cannot decide which to believe
- Confusing priorities at retrieval time
- The Agent is puzzled when making decisions

### 4. Maintainability

**Definition**: Whether the KG can be continuously updated and extended.

**Key questions**:
- Can new data be smoothly integrated?
- Is there version control?
- Is it easy to audit?
- Is documentation complete?

**Typical scenarios**:
- New documents arrive and need to be ingested
- An error is found and needs to be traced back and fixed
- A new business domain needs to be added
- Multiple team members collaborate, permissions are needed

**Impact**:
- Long term: KG stops being updated, becomes "dead data"
- Mid term: maintenance cost explodes, team gives up maintaining it

---

## 2. Key Metrics

### 1. Completeness Metrics

**Entity coverage**:
```
entity coverage = number of entities in KG / number of real-world entities
```

**Practical calculation** (when you don't know the "real-world entity count"):
- Use an expert-annotated "gold standard" entity set
- Compute the intersection of KG and gold standard
- coverage = |KG ∩ Gold| / |Gold|

**Relation coverage**: Same as above, at relation level.

**Attribute completeness**:
```
attribute completeness = number of entities with the attribute / number of entities that should have it
```

### 2. Accuracy Metrics

**Precision**:
```
Precision = number of correct facts / total facts in KG
```

**Fact-checking methods**:
- Sample for human review
- Use LLM-as-judge for second-pass verification
- Cross-validate against Wikidata / ConceptNet

**Top-K accuracy**:
```
Top-K accuracy = proportion of correct results in the top-K retrieval results
```

(Used to evaluate GraphRAG retrieval quality)

### 3. Consistency Metrics

**Conflict rate**:
```
conflict rate = number of contradictory fact pairs / total fact pairs
```

**Redundancy rate**:
```
redundancy rate = entities that should be merged but aren't / total entities
```

**Constraint violation rate**:
```
constraint violation rate = facts violating schema constraints / total facts
```

### 4. Maintainability Metrics

**Update latency**:
```
update latency = time between a real event occurring and the KG being updated
```

**Rollback success rate**:
```
rollback success rate = number of updates that can be successfully rolled back / total updates
```

**Audit coverage**:
```
audit coverage = number of audited facts / total facts
```

---

## 3. Evaluation Methods

### 1. Automated Evaluation

**Statistical methods**:
- Entity count, relation count, attribute count
- Average degree, max degree, degree distribution
- Number of connected components, average path length
- Triple count, type distribution

**Rule-based methods**:
- Validate schema constraints (types, cardinality)
- Validate time logic (time cannot flow backward)
- Validate unit consistency

**LLM methods**:
- LLM-as-judge for triple quality
- LLM for contradiction detection
- LLM to evaluate whether entity alignment is correct

**External comparison**:
- Compare against Wikidata
- Compare against ConceptNet
- Compare against a domain-standard KG

### 2. Human Evaluation

**Sampling review**:
- Randomly sample N facts
- Experts label "correct / wrong / uncertain"
- Compute precision / recall

**Full audit**:
- Full audit (high cost)
- Suitable for critical KGs (medical, financial)

**Crowdsourcing evaluation**:
- Amazon Mechanical Turk
- Suitable for large-scale but lower-quality-requirement scenarios

### 3. Evaluation Tools

| Tool | Purpose | Characteristics |
|------|---------|-----------------|
| **Loupe** | Wikidata quality monitoring | Official |
| **RDFUnit** | SPARQL constraint validation | Academic |
| **SHACL** | W3C standard shape validation | Industry |
| **KGTK** | KG toolkit | CMU open source |
| **KGX** | KG interoperation | Academic |

---

## 4. Common Defects and Improvements

### Defect 1: Missing Entities

**Symptom**: Queries return "not found"

**Causes**:
- LLM missed it during extraction
- Incomplete source document
- Entity name variation (synonyms, abbreviations)

**Improvements**:
- Multi-round LLM extraction
- Entity linking (link to Wikidata)
- Synonym normalization
- Proactively add an industry dictionary

### Defect 2: Duplicate Entities

**Symptom**: The same entity has multiple records

**Causes**:
- Different data sources not aligned
- Entity name variation ("Tim Cook" vs. "Timothy Cook")

**Improvements**:
- Entity disambiguation (embedding similarity)
- Entity alignment rules
- Use Wikidata QID as the primary key

### Defect 3: Wrong Relations

**Symptom**: Reasoning leads to absurd conclusions

**Causes**:
- LLM hallucination
- Wrong relation direction
- Wrong timestamps

**Improvements**:
- Validate relation directions
- Add time annotations
- LLM-as-judge for second-pass verification
- Cross-check against authoritative sources

### Defect 4: Messy Schema

**Symptom**: Cannot query with SPARQL / Cypher

**Causes**:
- No ontology defined
- Inconsistent relation types
- Inconsistent attribute types

**Improvements**:
- Define the ontology first (classes, relations, attributes)
- Use SHACL for validation
- Enforce schema-driven extraction

### Defect 5: Update Lag

**Symptom**: The KG reflects historical information

**Causes**:
- No continuous update process
- Complex incremental updates

**Improvements**:
- Automated ETL (periodic extraction from data sources)
- Time-stamp everything
- Event-triggered updates

---

## 5. How KG Quality Affects Agent Performance

| KG quality | Agent performance |
|------------|-------------------|
| Low completeness | Low recall, Agent misses key info |
| Low accuracy | Wrong retrieval results, wrong Agent decisions |
| Low consistency | Reasoning contradictions, Agent is confused |
| Low maintainability | KG becomes ineffective over time, Agent degrades |

**Key insight**: The effectiveness of GraphRAG / QA-GNN / KG-R1 is 80% determined by KG quality and 20% by the method itself.

**"The best doctor treats illness before it arises"**: Before investing in an Agent framework, get the KG quality up to 90%+ first.

---

## 6. Hands-on: A 30-line KG Quality Evaluator

```python
import json
from collections import defaultdict

def evaluate_kg(triples: list[dict]) -> dict:
    """
    Evaluate KG quality (simplified version)

    triples: [{head, relation, tail, ...}, ...]
    """
    metrics = {}

    # 1. Basic statistics
    entities = set()
    relations = defaultdict(int)
    for t in triples:
        entities.add(t['head'])
        entities.add(t['tail'])
        relations[t['relation']] += 1

    metrics['total_triples'] = len(triples)
    metrics['total_entities'] = len(entities)
    metrics['total_relations'] = len(relations)
    metrics['avg_degree'] = len(triples) * 2 / max(1, len(entities))

    # 2. Relation distribution (a healthy KG should be long-tailed)
    sorted_rels = sorted(relations.values(), reverse=True)
    metrics['top_relation_ratio'] = sorted_rels[0] / max(1, len(triples))

    # 3. Simple consistency check (self-loops)
    self_loops = sum(1 for t in triples if t['head'] == t['tail'])
    metrics['self_loop_rate'] = self_loops / max(1, len(triples))

    # 4. Isolated entities (not appearing in any relation)
    # Simplified: assume every entity appears in at least one triple
    # Real cases need to compute per-entity degree

    # 5. Completeness (compare against gold standard)
    # gold_entities = set([...])  # passed in externally
    # metrics['entity_coverage'] = len(entities & gold_entities) / max(1, len(gold_entities))

    return metrics

# Usage
triples = [
    {"head": "Apple", "relation": "CEO", "tail": "Tim Cook"},
    {"head": "Tim Cook", "relation": "joined_in", "tail": "1998"},
    {"head": "Apple", "relation": "founded_in", "tail": "1976"},
    # ... 1000+ triples
]

metrics = evaluate_kg(triples)
print(json.dumps(metrics, indent=2))
```

**Sample output**:

```json
{
  "total_triples": 1000,
  "total_entities": 350,
  "total_relations": 42,
  "avg_degree": 5.7,
  "top_relation_ratio": 0.18,
  "self_loop_rate": 0.002
}
```

**Interpretation**:
- Entity count / triple count ≈ 0.35 (each entity has on average 2.85 triples — healthy)
- Top relation share 18% (healthy, long-tailed)
- Self-loop rate 0.2% (healthy, should usually be data errors)

---

## 7. KG Quality Assurance Process

Recommended process:

### 1. Design Phase

- Define the ontology (classes, relations, attributes, constraints)
- Write constraints with SHACL
- Prepare a gold standard (100–1000 facts annotated by experts)

### 2. Build Phase

- Schema-validate immediately after extraction
- LLM second-pass validation (use a strong LLM as judge)
- Automatic dedup / merge
- Continuously log metrics

### 3. Launch Phase

- Sample human audit (1% per day)
- User feedback loop (correction → update)
- Monitor quality metrics (completeness, accuracy, consistency)

### 4. Maintenance Phase

- Periodic re-evaluation (weekly / monthly)
- Automated ETL updates
- Error rollback mechanism

---

## 8. Recommended Toolchain

| Phase | Tool |
|-------|------|
| Extraction | LLM + prompt engineering |
| Schema | OWL, SKOS, RDF |
| Validation | SHACL, SPARQL |
| Storage | Neo4j, Memgraph, TigerGraph |
| Evaluation | In-house + LLM-as-judge |
| Monitoring | Grafana + custom metrics |

---

## 9. Key Takeaways

1. **KG quality determines Agent performance** — the 80/20 rule
2. **Four dimensions**: completeness, accuracy, consistency, maintainability
3. **Quantification is the prerequisite for improvement** — no metrics, no optimization
4. **LLM extraction must be validated** — LLMs hallucinate
5. **Continuous updates are the long-term key** — KG is "live data"

---

## 10. Next Steps

1. 📄 [SHACL W3C Spec](https://www.w3.org/TR/shacl/) — industry standard
2. 📄 [KGTK: Knowledge Graph Toolkit](https://github.com/usc-isi-i2/kgtk) — CMU open source tool
3. 📄 [Loupe: Wikidata Quality Dashboard](https://loupe.toolforge.org/) — reference implementation
4. 💻 [Wikidata Quality Framework](https://www.wikidata.org/wiki/Wikidata:WikiProject_Quality) — large-scale KG experience
5. 📚 Companion reading from this hub: "GraphRAG Onboarding" and "KG-Enhanced Reasoning"

---

## References

- [SHACL: Shapes Constraint Language](https://www.w3.org/TR/shacl/)
- [KGTK: A Toolkit for Large Knowledge Graph Construction and Analysis](https://github.com/usc-isi-i2/kgtk)
- [Quality assessment of Knowledge Graphs: A Comprehensive Survey](https://arxiv.org/abs/2311.02128)
- [KG Quality: Wikidata Perspective](https://www.wikidata.org/wiki/Wikidata:Statistics)
- [Survey on Knowledge Graph Quality](https://link.springer.com/article/10.1007/s00799-022-00315-8)
