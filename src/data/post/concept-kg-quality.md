---
title: 'KG 质量评估 — 完整性、准确性、一致性、可维护性'
excerpt: 'Agent × KG 系统的效果,80% 取决于 KG 质量。本文系统讲 KG 质量评估的四大维度(完整性/准确性/一致性/可维护性)、关键指标、评估方法(自动 + 人工)、常见缺陷与改进策略。'
publishDate: 2026-07-27
category: '核心概念'
tags: ['KG 质量', 'KG 评估', '完整性', '准确性', '一致性', '知识图谱']
image: ~/assets/images/cover-concept-kg-quality.png
author: 'LyuBailin'
---

# KG 质量评估:完整性、准确性、一致性、可维护性

> Garbage in, garbage out。Agent × KG 系统的效果,80% 取决于 KG 质量。

## 为什么写这篇

用 GraphRAG、QA-GNN、KG-R1 这些方案,大家经常问:**"我的 KG 质量怎么样?"**

但 KG 质量评估是个**被低估的领域**。多数项目只关注"能不能用",不关注"用得好不好"。结果:

- GraphRAG 检索返回无关实体(噪声)
- LLM 抽取的关系互相矛盾(冲突)
- KG schema 混乱,无法推理
- 更新时引入错误

本文目标:30 分钟,让你**理解 KG 质量评估的四大维度、关键指标、评估方法、改进策略**。

---

## 一、KG 质量四大维度

### 1. 完整性(Completeness)

**定义**:KG 是否覆盖了应该覆盖的实体和关系。

**关键问题**:
- 有没有漏掉重要实体?
- 有没有漏掉重要关系?
- 实体属性是否完整?

**典型场景**:
- 医疗 KG 漏掉某罕见病
- 电商 KG 漏掉某品牌
- 企业 KG 漏掉某部门

**影响**:
- 检索召回率低(查不到)
- Agent 决策错误(漏掉关键信息)
- 长期:模型基于残缺 KG 学到错误知识

### 2. 准确性(Correctness / Accuracy)

**定义**:KG 中的事实是否正确。

**关键问题**:
- 实体是否存在?
- 关系是否成立?
- 属性值是否准确?
- 是否包含错误/虚构信息?

**典型场景**:
- LLM 幻觉,生成不存在的实体
- 实体对齐错误(把两个不同人合并)
- 关系方向错误(把"A 是 B 的父亲"存成"B 是 A 的父亲")
- 属性值过时(如 CEO 已变更)

**影响**:
- 检索结果错误
- 推理结论错误
- 信任度崩塌

### 3. 一致性(Consistency)

**定义**:KG 内部是否存在矛盾。

**关键问题**:
- 同一事实是否有多重表达?
- 关系是否互相矛盾?
- 是否违反 schema 约束?
- 时间逻辑是否合理?

**典型场景**:
- "Tim Cook 是 Apple CEO" 和 "Tim Cook 已离职" 同时存在
- 同一实体有两个不同 ID
- 关系违反类型约束(人 -出生地-> 公司)
- "X 在 2020 年获得了 2019 年才设立的奖项"

**影响**:
- 推理器无法决定相信哪个
- 检索时优先级混乱
- Agent 决策困惑

### 4. 可维护性(Maintainability)

**定义**:KG 能否被持续更新和扩展。

**关键问题**:
- 新增数据能否平滑融入?
- 是否有版本控制?
- 是否易于审计?
- 文档是否完整?

**典型场景**:
- 新文档进入,需要更新
- 发现错误,需要回溯修正
- 新业务领域,需要扩展
- 团队多人协作,需要权限

**影响**:
- 长期:KG 失去更新,变成"死数据"
- 中期:维护成本爆炸,放弃维护

---

## 二、关键指标

### 1. 完整性指标

**实体覆盖率**:
```
实体覆盖率 = KG 中实体数 / 真实世界实体数
```

**实际计算**(没"真实世界实体数"时):
- 用 expert 标注的"金标准"实体集
- 计算 KG 与金标准的交集
- 覆盖率 = |KG ∩ Gold| / |Gold|

**关系覆盖率**:同上,改为关系级别

**属性完整率**:
```
属性完整率 = 有该属性的实体数 / 应该有的实体数
```

### 2. 准确性指标

**精确率(Precision)**:
```
Precision = 正确的事实数 / KG 总事实数
```

**事实核查方法**:
- 抽样人工核查
- 用 LLM-as-judge 二次验证
- 交叉验证(用 Wikidata/ConceptNet 对照)

**Top-K 准确率**:
```
Top-K Accuracy = Top-K 检索结果中正确的比例
```

(评估 GraphRAG 检索质量)

### 3. 一致性指标

**冲突率**:
```
冲突率 = 互相矛盾的事实对 / 总事实对
```

**冗余率**:
```
冗余率 = 应该合并但未合并的实体 / 总实体
```

**约束违反率**:
```
约束违反率 = 违反 schema 约束的事实数 / 总事实数
```

### 4. 可维护性指标

**更新延迟**:
```
更新延迟 = 真实事件发生到 KG 更新的时间差
```

**回滚成功率**:
```
回滚成功率 = 能成功回滚的更新 / 总更新
```

**审计覆盖率**:
```
审计覆盖率 = 已审计的事实数 / 总事实数
```

---

## 三、评估方法

### 1. 自动评估

**统计方法**:
- 实体数、关系数、属性数
- 平均度数、最大度数、度数分布
- 连通分量数、平均路径长度
- 三元组数量、类型分布

**规则方法**:
- 验证 schema 约束(类型、基数)
- 验证时间逻辑(时间不能倒流)
- 验证单位一致性

**LLM 方法**:
- LLM-as-judge 评估三元组质量
- LLM 检测矛盾
- LLM 评估实体对齐是否正确

**外部对照**:
- 与 Wikidata 对照
- 与 ConceptNet 对照
- 与领域标准 KG 对照

### 2. 人工评估

**抽样核查**:
- 随机抽 N 个事实
- 专家标注"对/错/不确定"
- 计算精确率/召回率

**完整审计**:
- 全量审计(成本高)
- 适合关键 KG(医疗、金融)

**众包评估**:
- 亚马逊 Mechanical Turk
- 适合大规模但质量要求不高的场景

### 3. 评估工具

| 工具 | 用途 | 特点 |
|------|------|------|
| **Loupe** | Wikidata 质量监控 | 官方 |
| **RDFUnit** | SPARQL 约束验证 | 学术 |
| **SHACL** | W3C 标准的 shape 验证 | 工业 |
| **KGTK** | KG 工具集 | CMU 开源 |
| **KGX** | KG 互操作 | 学术 |

---

## 四、常见缺陷与改进

### 缺陷 1:实体遗漏

**表现**:查询返回"未找到"

**原因**:
- LLM 抽取时漏掉
- 文档不完整
- 实体名差异(同义词、缩写)

**改进**:
- 多轮 LLM 抽取
- 实体链接(链接到 Wikidata)
- 同义词归一化
- 主动补充行业词典

### 缺陷 2:实体重复

**表现**:同一实体有多条记录

**原因**:
- 不同来源数据未对齐
- 实体名差异("Tim Cook" vs "Timothy Cook")

**改进**:
- 实体消歧(embedding 相似度)
- 实体对齐规则
- 用 Wikidata QID 做主键

### 缺陷 3:关系错误

**表现**:推理出荒谬结论

**原因**:
- LLM 幻觉
- 关系方向错误
- 时间错误

**改进**:
- 关系方向验证
- 时间标注
- LLM-as-judge 二次验证
- 与权威来源对照

### 缺陷 4:Schema 混乱

**表现**:无法用 SPARQL/Cypher 查询

**原因**:
- 没有定义 ontology
- 关系类型不一致
- 属性类型不一致

**改进**:
- 先定义 ontology(类、关系、属性)
- 用 SHACL 校验
- 强制 schema-driven 抽取

### 缺陷 5:更新滞后

**表现**:KG 反映的是历史信息

**原因**:
- 没有持续更新流程
- 增量更新复杂

**改进**:
- 自动化 ETL(从数据源定期抽取)
- 时间戳标注
- 事件触发更新

---

## 五、KG 质量对 Agent 效果的影响

| KG 质量 | Agent 表现 |
|---------|-----------|
| 完整性低 | 召回率低,Agent 漏掉关键信息 |
| 准确性低 | 检索结果错误,Agent 决策错 |
| 一致性低 | 推理矛盾,Agent 困惑 |
| 可维护性低 | 长期使用后 KG 失效,Agent 退化 |

**关键洞察**:GraphRAG/QA-GNN/KG-R1 这些方法的有效性,80% 取决于 KG 质量,20% 取决于方法本身。

**"上医治未病"**:在投入 Agent 框架之前,先把 KG 质量提到 90%+。

---

## 六、实战:30 行写一个 KG 质量评估器

```python
import json
from collections import defaultdict

def evaluate_kg(triples: list[dict]) -> dict:
    """
    评估 KG 质量(简化版)

    triples: [{head, relation, tail, ...}, ...]
    """
    metrics = {}

    # 1. 基础统计
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

    # 2. 关系分布(健康 KG 应该是长尾)
    sorted_rels = sorted(relations.values(), reverse=True)
    metrics['top_relation_ratio'] = sorted_rels[0] / max(1, len(triples))

    # 3. 简单一致性检查(自环)
    self_loops = sum(1 for t in triples if t['head'] == t['tail'])
    metrics['self_loop_rate'] = self_loops / max(1, len(triples))

    # 4. 孤立实体(没出现在任何关系中)
    # 简化:假设所有 entity 至少在 1 个三元组中
    # 真实情况需要统计实体度数

    # 5. 完整性(与 gold standard 对比)
    # gold_entities = set([...])  # 外部传入
    # metrics['entity_coverage'] = len(entities & gold_entities) / max(1, len(gold_entities))

    return metrics

# 使用
triples = [
    {"head": "Apple", "relation": "CEO", "tail": "Tim Cook"},
    {"head": "Tim Cook", "relation": "joined_in", "tail": "1998"},
    {"head": "Apple", "relation": "founded_in", "tail": "1976"},
    # ... 1000+ 三元组
]

metrics = evaluate_kg(triples)
print(json.dumps(metrics, indent=2))
```

**输出示例**:

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

**解读**:
- 实体数 / 三元组数 ≈ 0.35(每实体平均 2.85 个三元组,健康)
- Top 关系占比 18%(健康,长尾)
- 自环率 0.2%(健康,应该是数据错误)

---

## 七、KG 质量保证流程

推荐流程:

### 1. 设计阶段

- 定义 ontology(类、关系、属性、约束)
- 用 SHACL 写约束
- 准备 gold standard(专家标注 100-1000 个事实)

### 2. 构建阶段

- 抽取后立即做 schema 校验
- LLM 二次验证(用强 LLM 当裁判)
- 自动去重/合并
- 持续记录指标

### 3. 上线阶段

- 抽样人工审计(每天 1%)
- 用户反馈闭环(纠错 → 更新)
- 监控质量指标(完整性、准确性、一致性)

### 4. 维护阶段

- 定期重新评估(每周/每月)
- 自动化 ETL 更新
- 错误回滚机制

---

## 八、推荐工具链

| 阶段 | 工具 |
|------|------|
| 抽取 | LLM + 提示工程 |
| Schema | OWL、SKOS、RDF |
| 验证 | SHACL、SPARQL |
| 存储 | Neo4j、Memgraph、TigerGraph |
| 评估 | 自研 + LLM-as-judge |
| 监控 | Grafana + 自定义指标 |

---

## 九、关键 takeaway

1. **KG 质量决定 Agent 表现** — 80/20 法则
2. **四大维度**:完整性、准确性、一致性、可维护性
3. **量化是改进的前提** — 没有指标就没法优化
4. **LLM 抽取必须有验证** — LLM 会幻觉
5. **持续更新是长期关键** — KG 是"活数据"

---

## 十、下一步

1. 📄 [SHACL W3C Spec](https://www.w3.org/TR/shacl/) — 工业标准
2. 📄 [KGTK: Knowledge Graph Toolkit](https://github.com/usc-isi-i2/kgtk) — CMU 开源工具
3. 📄 [Loupe: Wikidata Quality Dashboard](https://loupe.toolforge.org/) — 参考实现
4. 💻 [Wikidata Quality Framework](https://www.wikidata.org/wiki/Wikidata:WikiProject_Quality) — 大规模 KG 经验
5. 📚 配套阅读:本仓库「GraphRAG 入门」「KG 增强推理」

---

## 参考

- [SHACL: Shapes Constraint Language](https://www.w3.org/TR/shacl/)
- [KGTK: A Toolkit for Large Knowledge Graph Construction and Analysis](https://github.com/usc-isi-i2/kgtk)
- [Quality assessment of Knowledge Graphs: A Comprehensive Survey](https://arxiv.org/abs/2311.02128)
- [KG Quality: Wikidata Perspective](https://www.wikidata.org/wiki/Wikidata:Statistics)
- [Survey on Knowledge Graph Quality](https://link.springer.com/article/10.1007/s00799-022-00315-8)
