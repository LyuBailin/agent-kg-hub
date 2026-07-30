---
title: 'KG Schema 设计实战:从零搭建一个能用的知识图谱'
excerpt: '从工程师视角讲 KG schema 设计的全流程:常见错误、3 个核心问题、5 步设计流程、3 种 schema 风格(严格本体/属性图/轻量级)、MVP 演进路径,以及一个完整案例(科技公司知识库走通 7 步)。'
publishDate: 2026-07-30
category: '核心概念'
tags: ['知识图谱', 'Schema', '本体设计', 'GraphRAG', '工程实践']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# KG Schema 设计实战:从零搭建一个能用的知识图谱

> Schema 是 KG 的骨架,设计错了,后面所有索引、检索、维护都是债。

## 为什么写这篇

知识图谱的 schema(节点类型、关系类型、属性)看起来是个前置工作,但在团队里经常被轻视:

- 「先跑通,schema 后面再改」 → 改不动,数据已经灌进去了
- 「参考通用 schema」 → 通用 schema 跟业务根本不匹配
- 「直接让 LLM 抽」 → 抽出来的东西没法用,字段乱七八糟

我见过太多团队因此返工。本文目标:用 30 分钟,讲清楚**一个工程师怎么从零设计一份能用的 KG schema**。

会包含:常见错误、3 个核心问题、5 步设计流程、3 种风格对比、MVP 演进路径,以及一个完整案例(科技公司知识库 7 步走通)。

---

## 一、Schema 设计的 4 个常见错误

开始之前,先看反面教材。

### 错误 1:直接抄"通用 KG"

```
错误做法:
  "我看 DBpedia 怎么定义的,我也照着搞一个。"
  ↓
DBpedia 是百科类 KG,你是电商客服 KG,实体类型、关系类型、属性集根本不一样
```

**后果**:你的图谱里 80% 的实体类型是空的,只有 20% 真正用得上。

### 错误 2:粒度太粗

```
错误做法:
  节点类型:["文档", "实体"]  ← 没了
  关系类型:["关联", "属于", "提到"]  ← 模糊
```

**后果**:"苹果公司"和"苹果水果"都是「实体」节点,关系只有"关联",**图谱退化成无类型网络**,GraphRAG 检索时根本用不上结构。

### 错误 3:忽略属性

```
错误做法:
  Person { name: String }
  Company { name: String }
  关系:works_at
```

**后果**:"张三在 A 公司工作 3 年"和"李四在 A 公司工作 10 年"在图上看起来一样。**关键信息(工龄、职位、入职时间)丢了**。

### 错误 4:关系类型过载

```
错误做法:
  关系类型:["在 ... 工作", "曾经就职于", "当前任职", "实习于", "兼任", "离职后到 ..."]
  看起来很细,实际:
    - 写 prompt 时模型很难区分
    - 查询时要 join 多张边
    - 维护成本高
```

**后果**:LLM 抽取时 50% 的边归错类型,查询时要写一堆"如果是 A 或 B 或 C"。

---

## 二、3 个核心设计问题

Schema 设计本质是回答 3 个问题。

### Q1:领域边界是什么?

**你的 KG 覆盖什么、不覆盖什么**。

```
错误: "我们要做一个 AI 行业的知识图谱"
  → 太宽:模型、论文、公司、人物、产品、投资、监管...全要?
  
正确: "我们要做一个 AI 行业**大模型**的 KG,覆盖:模型/论文/公司/人物/基准测试"
  → 边界清楚,后面对"5G 通信"的内容就明确不进
```

**实操**:用一句话写清楚「这个 KG 回答什么领域的问题,回答不了什么」。

### Q2:实体颗粒度多细?

**决定你抽取时怎么断句、怎么合并**。

```
粗粒度(整篇文档一个节点):
  节点: "GPT-4 论文"
  关系: "由 OpenAI 发布"
  → 优点:抽取简单
  → 缺点:粒度太粗,跨论文对比答不上

细粒度(章节/段落一个节点):
  节点: "GPT-4 §3.2 训练数据"
  关系: "详细描述", "引用"
  → 优点:能精确定位
  → 缺点:节点爆炸,实体对齐难

推荐:中等粒度(关键实体级别)
  节点: GPT-4, OpenAI, 训练数据, RLHF, 人类反馈
  关系: GPT-4 → 用了 → RLHF
  → 优点:可扩展、可对齐
  → 缺点:需要清边界规则
```

**经验法则**:实体数 ≈ 文档数 × 10 到 100。1 万篇文档的语料,实体在 10 万-100 万之间。

### Q3:关系是正交还是层级?

```
层级关系(树状):
  Person -IS_A-> Employee -IS_A-> Person
  → 适合:有明确分类的领域(生物、医学)

正交关系(网状):
  Person -works_at-> Company
  Person -knows-> Person
  Company -competes_with-> Company
  → 适合:复杂关系领域(企业、人物、事件)
```

**实操判断**:
- 你的领域能用"目录"组织吗?(比如"动物 > 哺乳动物 > 猫") → 层级
- 你的领域是"X 跟 Y 怎么怎么样"吗? → 正交

**大部分 KG 是正交为主,层级为辅**(用 `subclass_of` / `is_a` 表达)。

---

## 三、5 步 Schema 设计流程

不要一上来就定 schema,按这 5 步走。

### Step 1:列出 5-10 个典型业务查询

**这是最重要的一步**。Schema 是为查询服务的,不是为"完美本体"服务的。

```
示例(科技公司知识库):
  Q1: "OpenAI 发布过哪些模型?"
  Q2: "GPT-4 用的是什么训练方法?"
  Q3: "Transformer 论文的作者都来自哪些公司?"
  Q4: "A 公司的核心产品是什么?"
  Q5: "B 公司的竞争对手有哪些?"
  Q6: "哪些公司在做大模型?"
  Q7: "X 人物现在是哪家公司 CTO?"
  Q8: "过去 3 年大模型评测榜单 Top 3 怎么变化的?"
  Q9: "模型 A 和模型 B 在 MMLU 上的对比?"
  Q10: "哪家公司融资最多?"
```

写完这 10 个查询,你的领域边界就清楚了。

### Step 2:头脑风暴实体候选清单

**把上面查询里出现的主语、宾语全列出来**。

```
从 Q1-Q10 抽取候选实体:
  - 模型: GPT-4, Claude, Llama, Gemini...
  - 公司: OpenAI, Anthropic, Meta, Google...
  - 人物: Sam Altman, Ilya Sutskever, Geoffrey Hinton...
  - 论文: "Attention Is All You Need", "GPT-4 Technical Report"...
  - 训练方法: RLHF, SFT, RLAIF, DPO...
  - 基准测试: MMLU, GSM8K, HumanEval, BBH...
  - 融资事件: OpenAI 2023 融资, Anthropic 2024 融资...
  - 产品: ChatGPT, Claude Code, Gemini App...
```

去重、合并后,这就是你的「实体类型清单」。

**实操技巧**:
- 第一版清单可以**故意多列**,后面再删
- 参考 Wikidata、DBpedia 同领域 schema,但**只取子集**
- 让 2-3 个业务方独立列,合并差异

### Step 3:用 1-2 个查询走通关系类型

**不要一次性设计所有关系**。挑 1-2 个最难的查询,看需要哪些关系。

```
走通 Q1: "OpenAI 发布过哪些模型?"
  需要关系: Company -publishes-> Model
  
走通 Q4: "A 公司的核心产品是什么?"
  需要关系: Company -owns-> Product
  以及: Product -is_core_product_of-> Company(反向)
  或: Company -has_core_product-> Product
  
走通 Q3: "Transformer 论文的作者都来自哪些公司?"
  需要关系: Paper -has_author-> Person
  以及: Person -works_at-> Company(时点要明确)
```

跑完 2-3 个查询,你就有了一份「最小关系集」。

**经验法则**:**关系数 ≈ 实体类型数 × 2-5**。实体类型 10 个,关系类型 20-50 个是合理范围。

### Step 4:属性 schema 设计

属性是 KG 的"血肉"。三类属性要分清。

```
必填属性(must-have):
  - 所有实体必须有的最小标识
  - Person: name
  - Company: name
  - Paper: title, publish_year
  - Model: name, release_date

可空属性(可选填):
  - 大部分实体有,部分没有
  - Person: birth_date, education
  - Company: founded_year, headquarters
  - Model: parameter_count, context_length

多值属性:
  - 一个实体对应多个值
  - Person: alias(可能有多个), former_companies
  - Paper: authors(可能有多个), keywords
  
时序属性:
  - 关系上的时间戳
  - Person -works_at(2020-2023)-> Company
  - 关系本身要带 "from" / "to" 字段
```

**实操**:用下表规范每类实体的属性。

```yaml
Person:
  name: string  # 必填
  alias: list[string]  # 多值
  birth_date: date  # 可选
  education: list[Education]  # 嵌套(可作为关系)
  current_company: Company  # 可作为关系
  
Company:
  name: string
  founded_year: int
  headquarters: string
  funding_rounds: list[FundingEvent]  # 嵌套/关系
```

**关键经验**:
- 字符串类型的属性,长度不要超过 200 字(查询效率)
- 时间一律用 ISO 8601 格式
- 嵌套结构(education)能拆成关系就拆成关系,**属性层越扁平越好**

### Step 5:用 5-10 个查询回放验证

把 Step 1 列的 10 个查询,挨个用设计的 schema 走一遍。

```
Q1 "OpenAI 发布过哪些模型?"
  → 查 Company(name=OpenAI) -publishes-> Model
  → ✅ 走通

Q3 "Transformer 论文的作者都来自哪些公司?"
  → 查 Paper(title="Attention Is All You Need") -has_author-> Person
  → 关联 Person -works_at-> Company
  → 等等,作者可能"曾经在 Google Brain",也可能"现在在 X 公司"
  → ❌ 需要在 works_at 关系上加时点信息
  → 修正:加属性 from_date / to_date,或拆成 "current_works_at" / "former_works_at"
```

跑完 10 个查询,**80% 走通**就算初步可用。剩下 20% 的边缘查询,先记下来,放到下一轮迭代。

---

## 四、3 种 Schema 风格

同一个领域,可以有完全不同的 schema 表达方式。选哪种看你的目标。

### 风格 1:严格本体论(OWL / RDF)

**特征**:
- 用 RDF 三元组(主-谓-宾)表达
- 支持 class hierarchy、property restriction、axiom
- 用 Protégé 之类的工具编辑

```
例子:
  ex:GPT-4 rdf:type ex:LargeLanguageModel .
  ex:LargeLanguageModel rdfs:subClassOf ex:Model .
  ex:publishes rdfs:domain ex:Company .
  ex:publishes rdfs:range ex:Model .
```

**适合场景**:
- 学术研究(生物、医学、化学)
- 需要推理(从子类关系推出属性)
- 多源数据融合(对齐不同 schema)

**不适合**:
- 业务 RAG 系统(过度设计)
- 快速验证(用不上推理)

**典型工具**:Protégé、Apache Jena、Stardog

### 风格 2:实用属性图(Neo4j)

**特征**:
- 节点(Node) + 关系(Relationship) + 属性(Property)
- 用 Cypher 查询
- 灵活,贴近工程师直觉

```
例子:
  CREATE (gpt4:Model {name: 'GPT-4', release_date: '2023-03-14'})
  CREATE (openai:Company {name: 'OpenAI', founded_year: 2015})
  CREATE (openai)-[:PUBLISHES {date: '2023-03-14'}]->(gpt4)
```

**适合场景**:
- 业务 RAG 系统
- 中等规模(<1 亿节点)
- 团队熟悉图查询

**典型工具**:Neo4j、Memgraph、Amazon Neptune

### 风格 3:轻量级(LightRAG 默认)

**特征**:
- 不预设类型,LLM 抽到啥就存啥
- 节点和关系都用自然语言描述
- 适合快速 POC

```
例子(LightRAG 实际存储):
  entity: "GPT-4"
  type: "large language model"  # 字符串,不是 enum
  description: "OpenAI 发布的大语言模型,2023 年 3 月发布"
  
  relation: "OpenAI -发布-> GPT-4"
  description: "OpenAI 在 2023 年 3 月 14 日发布 GPT-4"
```

**适合场景**:
- 快速 POC,2 周内要看效果
- 语料领域不明确,先看抽取出来什么
- 预算紧,不想花时间设计 schema

**不适合**:
- 长期演进的业务系统
- 需要严格类型校验的场景

**典型工具**:LightRAG、GraphRAG(默认)、HippoRAG

### 选哪种?

| 你的情况 | 推荐 |
|----------|------|
| 学术研究、需要推理 | 严格本体论(OWL/RDF) |
| 业务 RAG,中等规模 | 实用属性图(Neo4j 风格) |
| 2 周内 POC,探索阶段 | 轻量级(LightRAG) |
| 长期生产,需要扩展 | 实用属性图 + 严格的 schema 文档 |

**一个常见路径**:先用轻量级跑通 POC → 看实际数据 → 设计正式 schema → 切换到 Neo4j。

---

## 五、Schema 演进:从 MVP 到收敛

不要追求"一次到位"。**MVP schema → 实战迭代 → 收敛**才是正常路径。

### Phase 1:MVP schema(第 1-2 周)

```
目标:跑通 POC
原则:能简则简,边用边改
典型:
  - 实体类型 5-10 个
  - 关系类型 10-20 个
  - 属性:只有必填项
  - 文档:半页纸
```

**这个阶段**:
- 选 LightRAG 风格,不要纠结类型
- 用 100 篇文档跑一遍,看抽取结果
- 标记"不知道该归到哪"的实体,记下来

### Phase 2:实战迭代(第 2-8 周)

```
目标:发现实际数据中的问题
动作:
  - 看 LLM 抽取的"unknown type"占比
  - 找最常见的 3-5 个错误归类
  - 合并、拆分、规范化类型
  - 补齐关键属性
  - 写 prompt 模板和 few-shot examples
```

**这个阶段常见发现**:
- 「人物」太宽,要拆成「创始人/CEO/CTO/研究员」
- 「公司」要加子类型「大模型公司/工具公司/算力公司」
- 「发布」关系要加时点 + 关系类型(发布/收购/合作)
- LLM 把"GPT-4 Turbo"和"GPT-4"当成两个实体,要做实体合并

**这一步花的时间最长**。不要急,迭代 3-5 轮再收敛。

### Phase 3:收敛(第 8 周以后)

```
目标:schema 稳定,生产可用
特征:
  - 实体类型 15-30 个
  - 关系类型 30-80 个
  - 每个类型有完整属性定义
  - 有 schema 文档 + 抽取 prompt 模板
  - 有实体对齐规则(同义词、缩写)
```

**这个阶段做**:
- 写正式的 schema 文档(YAML 或 Markdown)
- 抽取 prompt 用 JSON schema 强约束
- 实体对齐用 embedding 相似度 + 人工校对
- 监控抽取质量(未知类型率、合并率、错误率)

### 不要做的事

- ❌ 第一版就追求 50+ 实体类型
- ❌ schema 文档写了几十页但没跑过
- ❌ 切换 schema 时不写迁移脚本
- ❌ 不做实体对齐,同名实体存了 5 份

---

## 六、GraphRAG 场景的特殊考量

GraphRAG(以及 LightRAG 这类 LLM 抽取框架)的 schema 设计跟传统 KG 有点不一样。

### 自动抽取 vs 人工设计

| 维度 | 人工设计 | LLM 自动抽取 |
|------|----------|--------------|
| 类型定义 | 严格 enum | 自由文本 |
| 一致性 | 高 | 中(看 prompt) |
| 灵活性 | 低 | 高 |
| 维护成本 | 高(改 schema 要重灌) | 低(改 prompt 即可) |
| 适合阶段 | 收敛后 | MVP 阶段 |

**推荐策略**:**人工定义 schema,LLM 按 schema 抽取**。

```
Prompt 模板(伪代码):
  请从以下文本抽取实体和关系,严格按照以下 schema:
  
  实体类型:[Company, Model, Paper, Person, Benchmark]
  Company 属性:[name, founded_year, headquarters]
  Model 属性:[name, release_date, parameter_count]
  Paper 属性:[title, authors, publish_year, venue]
  Person 属性:[name, current_role, current_company]
  Benchmark 属性:[name, full_name, evaluation_aspects]
  
  关系类型:[publishes, has_author, works_at, evaluated_on]
  publishes:Company → Model
  has_author:Paper → Person
  works_at:Person → Company
  evaluated_on:Model → Benchmark
  
  文本:{chunk}
  输出:JSON
```

**给 LLM 一个明确 schema,比让 LLM 自由发挥稳定得多**。

### 实体冲突合并

LLM 抽取一定会产生冲突。最常见的 3 类:

```
1. 同名不同实体:
   "苹果" 可能是公司,也可能是水果
   → 用 type 区分 + 上下文判断

2. 同实体不同名:
   "OpenAI" / "Open AI" / "openai.com" / "OpenAI, Inc."
   → 实体对齐:用 embedding 相似度 + 人工规则
   → 关键: 维护一个 alias 字典

3. 跨文档重复:
   文档 A 抽到 "GPT-4 by OpenAI"
   文档 B 抽到 "GPT-4 by OpenAI Inc."
   → 用 (name, type) 做主键,合并到一条记录
```

**实操建议**:
- 抽取后跑一遍**实体对齐 pipeline**(embedding + 规则)
- 主键用 `(canonical_name, entity_type)`
- 维护 `alias` 字段,存所有变体

### 抽取质量监控

```
关键指标:
  - 未知类型率:抽出来但 type 不在 schema 里的比例
  - 重复实体率:同名实体的数量
  - 关系归类错误率:抽样的关系人工 review 正确率
  - 关键实体覆盖率:核心实体被抽取到的比例

阈值建议:
  - 未知类型率 < 5%
  - 重复实体率 < 10%
  - 关系归类正确率 > 90%
  - 关键实体覆盖率 > 95%
```

**超标就修 prompt 或 schema,不要上线**。

---

## 七、案例:科技公司知识库走完 7 步

把上面的方法用到具体场景,完整走一遍。

### 背景

```
语料: 1000 篇 AI 行业文章 + 500 份公司年报
团队: 2 个工程师 + 1 个领域专家
目标: 1 个月内出能用的 KG
技术选型: Neo4j + LLM 抽取
```

### Step 1:业务查询列表(10 个)

```
Q1:  OpenAI 发布过哪些模型?
Q2:  GPT-4 用了什么训练方法?
Q3:  Transformer 论文的作者都来自哪些公司?
Q4:  Anthropic 当前的融资情况?
Q5:  Google 和 OpenAI 在大模型上的竞争关系?
Q6:  哪些公司在做开源大模型?
Q7:  X 人物(Yann LeCun)目前在哪家公司、什么职位?
Q8:  MMLU 榜单上 Top 5 模型怎么变化的?
Q9:  Llama 3 和 GPT-4 在 HumanEval 上的对比?
Q10: 2024 年 AI 行业最重要的 3 个事件?
```

### Step 2:实体候选清单

```
从 Q1-Q10 抽取:
  - 模型: GPT-4, Claude, Llama, Gemini, Mistral...
  - 公司: OpenAI, Anthropic, Meta, Google, Mistral AI...
  - 人物: Sam Altman, Dario Amodei, Yann LeCun, Demis Hassabis...
  - 论文: "Attention Is All You Need", "GPT-4 Technical Report"...
  - 训练方法: RLHF, SFT, DPO, Constitutional AI...
  - 基准测试: MMLU, GSM8K, HumanEval, BBH, MT-Bench...
  - 事件: GPT-4 发布, Claude 3 发布, Llama 3 开源...
  - 融资事件: OpenAI 2023 融资 100 亿美元...
  - 产品: ChatGPT, Claude App, Gemini App...
```

去重后,**实体类型 8 个**:Model / Company / Person / Paper / TrainingMethod / Benchmark / Product / Event

### Step 3:关系类型(走 Q1、Q3、Q5)

```
走通 Q1 (OpenAI 发布过哪些模型):
  → Company -publishes-> Model
  → 关系属性: release_date

走通 Q3 (Transformer 论文作者都来自哪些公司):
  → Paper -has_author-> Person
  → Person -works_at(时点)-> Company
  → 关系属性: from_date, to_date (可空), role

走通 Q5 (Google 和 OpenAI 的竞争关系):
  → Company -competes_with-> Company
  → Company -develops-> Model (反推:有大模型 = 竞争)
```

**第一版关系集**(12 个):

```
publishes, has_author, works_at, competes_with, develops,
trained_with, evaluated_on, owns, acquired, invested_in,
released_product, had_event
```

### Step 4:属性 schema

```yaml
Model:
  name: string  # 必填
  release_date: date  # 必填
  parameter_count: string  # 可选(如 "1.76T")
  context_length: int  # 可选
  is_open_source: bool  # 必填
  type: enum[llm, vlm, speech, multimodal]  # 必填

Company:
  name: string  # 必填
  founded_year: int  # 必填
  headquarters: string  # 可选
  focus_area: list[enum]  # 多值,llm/robotics/...
  is_public: bool  # 可选

Person:
  name: string  # 必填
  current_company: Company  # 可选
  current_role: string  # 可选
  alias: list[string]  # 多值

Paper:
  title: string  # 必填
  authors: list[Person]  # 多值
  publish_year: int  # 必填
  venue: string  # 可选(NeurIPS, arXiv...)

TrainingMethod:
  name: string  # 必填
  full_name: string  # 可选
  description: string  # 可选

Benchmark:
  name: string  # 必填
  full_name: string  # 可选
  evaluation_aspects: list[string]  # 多值

Product:
  name: string  # 必填
  company: Company  # 必填
  launch_date: date  # 可选

Event:
  name: string  # 必填
  event_date: date  # 必填
  involved_entities: list[Entity]  # 多值
```

### Step 5:验证(回放 10 个查询)

```
Q1 "OpenAI 发布过哪些模型?"
  MATCH (c:Company {name:'OpenAI'})-[:PUBLISHES]->(m:Model)
  RETURN m.name  → ✅ 走通

Q3 "Transformer 论文的作者都来自哪些公司?"
  MATCH (p:Paper {title:'Attention Is All You Need'})-[:HAS_AUTHOR]->(person:Person)
        -[r:WORKS_AT]->(c:Company)
  RETURN person.name, c.name, r.from_date  → ⚠️ 部分走通
  问题:有些作者"曾经在 Google Brain"但现在已经离职
  修正:works_at 加 is_current 字段,或拆成 current_works_at / former_works_at

Q5 "Google 和 OpenAI 的竞争关系?"
  MATCH (g:Company {name:'Google'})-[r:COMPETES_WITH]->(o:Company {name:'OpenAI'})
  RETURN r.description  → ✅ 走通
```

**10 个查询,8 个走通,2 个有边界问题**。修正后再跑一遍,**9/10 走通**。

### Step 6:抽取 + 对齐

```python
# 抽取(Prompt 模板简化版)
extract_prompt = """
请从以下文本抽取实体和关系,严格按 schema:
[Schema 定义]

文本: {chunk}

输出 JSON: {entities: [...], relations: [...]}
"""

# 实体对齐
def merge_entities(entities):
    # 1. 规范化名字
    normalized = [(e.name.lower().strip(), e.type) for e in entities]
    # 2. 用 embedding 找相似
    embeddings = embed([n for n, _ in normalized])
    clusters = cluster(embeddings, threshold=0.85)
    # 3. 同 cluster 合并
    for cluster in clusters:
        canonical = pick_canonical(cluster)  # 选最短/最常见的
        for entity in cluster:
            entity.alias.append(canonical)
    return entities
```

### Step 7:质量监控

```
跑完 1000 篇文档后:
  - 实体总数: 12,847
  - 关系总数: 38,219
  - 未知类型率: 3.2%  ✅ < 5%
  - 重复实体率: 7.8%  ✅ < 10%
  - 关系归类正确率(抽样 100): 92%  ✅ > 90%
  - 核心实体覆盖率(OpenAI/Anthropic/...): 100%  ✅ > 95%
```

**达标,可以上线**。

---

## 八、常见陷阱与对策

最后总结 5 个实战中最常踩的坑。

**1. ❌ 实体类型太多,LLM 选不准**
- 表现:prompt 里给了 20 个类型,LLM 抽出来 30% 选错
- 对策:核心类型 ≤ 15 个,其他用 description 区分,不放进 enum

**2. ❌ 关系带太多属性,抽取不稳定**
- 表现:关系上同时要 `from_date / to_date / role / confidence`,LLM 经常漏填
- 对策:核心属性 ≤ 3 个,其他后处理补

**3. ❌ 不同源数据 schema 不一致**
- 表现:文档 A 用「公司」,文档 B 用「企业」,抽取出来 type 不一样
- 对策:用同义词字典 + 抽取后正则化

**4. ❌ 时间信息丢失**
- 表现:「张三是 A 公司 CEO」,但 3 年前张三是 B 公司 VP
- 对策:**所有会变化的关系都加时点**,不变量才不加

**5. ❌ 不做实体对齐**
- 表现:库里 5 个「OpenAI」节点,2 个「Open AI」节点
- 对策:**实体对齐 pipeline 必做**,合并率要监控

---

## 九、下一步

学完本文,推荐继续:

1. 📄 [GraphRAG 入门:工业级图增强 RAG 的原理与实践](https://github.com/LyuBailin/agent-kg-hub) — schema 怎么被 GraphRAG 用上
2. 📄 [KG 质量评估实战](https://github.com/LyuBailin/agent-kg-hub) — schema 设计完之后怎么评估质量
3. 📖 [Neo4j Schema 设计指南](https://neo4j.com/docs/getting-started/data-modeling/) — 属性图建模最佳实践
4. 📖 [Protégé 入门教程](https://protege.stanford.edu/) — 严格本体编辑工具
5. 📄 [Entity Alignment 综述](https://arxiv.org/abs/2105.12110) — 实体对齐算法参考

---

## 参考

- [Neo4j Data Modeling Best Practices](https://neo4j.com/docs/getting-started/data-modeling/)
- [Protégé — Stanford Ontology Editor](https://protege.stanford.edu/)
- [Microsoft GraphRAG Schema Configuration](https://microsoft.github.io/graphrag/)
- [LightRAG: Simple and Fast Retrieval-Augmented Generation](https://arxiv.org/abs/2410.17979)
- [Knowledge Graphs: Fundamentals, Techniques, and Applications (Book)](https://www.morganclaypool.com/doi/10.2200/S00825ED1V01Y202007CSK009)
