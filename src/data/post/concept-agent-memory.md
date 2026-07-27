---
title: 'Agent Memory 机制详解 — 短期/长期/向量/KG 四种记忆如何协作'
excerpt: 'Agent 的核心能力之一是"记忆"。本文系统梳理短期记忆(上下文窗口)、长期记忆(向量/KG)、情节记忆、程序记忆的概念、区别与协作方式,以及 2024-2026 年代表性工作(MemGPT、MemoryBank、Mem0)。'
publishDate: 2026-07-27
category: '核心概念'
tags: ['Agent Memory', '短期记忆', '长期记忆', 'MemGPT', 'Mem0', 'KG Memory']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# Agent Memory 机制详解:短期/长期/向量/KG 四种记忆如何协作

> 没有记忆,Agent 就是个 stateless 的循环函数。理解记忆机制,理解 Agent 能力的边界。

## 为什么写这篇

聊到 Agent 能力,90% 的对话会绕到"上下文窗口"和"幻觉"。但真正决定 Agent 表现的,是**记忆机制**——它怎么处理信息、保留什么、遗忘什么、什么时候检索。

本文目标:30 分钟,让你**彻底理解 Agent 记忆的分类、机制、代表工作、设计原则**。

---

## 一、人类记忆 vs Agent 记忆

人类大脑有复杂的记忆系统:

- **感官记忆**:瞬时(几百毫秒),眼/耳/触等
- **短期记忆**:几秒到几分钟,容量有限(7±2 个 chunk)
- **长期记忆**:可永久,容量巨大,分陈述性(事实+情节)和程序性(技能)

Agent 借鉴了这个分层思路,但实现方式完全不同:

| 层级 | 人类 | Agent | 实现 |
|------|------|-------|------|
| 感官 | 视觉/听觉/触觉 | 输入 token 流 | Prompt 解析 |
| 短期 | 工作记忆 | 上下文窗口 | LLM context |
| 长期(陈述性) | 事实记忆 | 向量数据库 | Embedding + 检索 |
| 长期(情节性) | 经历记忆 | 对话历史 | 数据库 |
| 长期(程序性) | 技能记忆 | Tool/Code 调用 | 函数注册 |
| 元记忆 | 知道什么知道什么 | Self-Reflection | Reflexion 等 |

**关键差异**:人类记忆有自然遗忘(时间衰减),Agent 没有;人类记忆可主动压缩(抽象),Agent 只能靠 LLM 摘要。

---

## 二、四种核心记忆

### 1. 短期记忆(Short-term Memory)

**定义**:LLM 上下文窗口里的所有信息。

**典型容量**:

- GPT-4:8K → 32K → 128K tokens
- Claude 3.5:200K tokens
- Gemini 1.5 Pro:1M → 2M tokens
- Llama 3.1:128K tokens

**关键问题**:

- **容量有限**:超出窗口的信息会丢失
- **成本线性**:token 越多,API 费用越高
- **位置衰减**:长 context 中部位置的信息容易"被遗忘"

**典型用法**:

- 多轮对话历史
- 当前任务的所有 Observation
- 工具调用的中间结果

**代表工作**:无单独工作,所有 Agent 框架都隐式使用短期记忆。

### 2. 长期向量记忆(Long-term Vector Memory)

**定义**:用 embedding 把历史信息存入向量数据库,需要时检索 top-k。

**典型实现**:
- 工具:LlamaIndex、Chroma、Pinecone、Qdrant、Weaviate
- 索引:基于余弦相似度 / dot product

**流程**:

```
新信息 → LLM 生成 embedding → 存入向量 DB
查询时 → 检索 top-k 最相似 → 拼接到 LLM 上下文
```

**优势**:容量大,检索快,语义匹配
**劣势**:无法处理精确匹配(如"上次对话我说的具体数字是?"),无法捕获关系

**代表工作**:
- **LlamaIndex**:通用 RAG 框架,内置向量记忆
- **Chroma**:轻量级向量 DB
- **RAG 三件套**(Retrieve / Augment / Generate)

### 3. 长期 KG 记忆(Long-term KG Memory)

**定义**:把信息组织为知识图谱,实体和关系显式建模。

**典型实现**:
- 工具:Neo4j、Memgraph、NetworkX + LLM 抽取
- 数据结构:`(head, relation, tail)` 三元组

**优势**:
- **结构化**:实体关系显式,易于推理
- **可解释**:检索路径就是推理路径
- **关系丰富**:向量检索看不到的关系,KG 能看到
- **长期一致**:schema 约束保证数据一致

**劣势**:
- **构建成本**:需要 LLM 抽取 + 实体对齐
- **更新难**:增量更新比向量 DB 复杂
- **查询复杂**:需要 SPARQL / Cypher

**代表工作**:
- **GraphRAG**:用 KG 增强 RAG
- **HippoRAG**:神经-符号融合记忆
- **Cognee**:自动从对话构建 KG

### 4. 情节记忆(Episodic Memory)

**定义**:按"事件"组织的记忆,记录"什么时候发生了什么"。

**典型实现**:
- 每条记忆是一个 `(时间, 主体, 事件, 结果)` 四元组
- 检索时按时间或语义筛选

**优势**:
- **时序**:能回答"上次/下次/历史趋势"
- **具体**:每个事件有完整上下文
- **可回溯**:可以重放历史

**代表工作**:
- **MemoryBank**:OpenAI 提出的情节记忆框架
- **LangChain ConversationBufferMemory**:简单的对话历史
- **AgentSims**:Agent 情节记忆研究

---

## 三、记忆系统设计原则

### 1. 分层架构

不同类型的信息用不同的记忆存储:

```
原始对话 → [短期记忆] LLM 上下文(近 N 轮)
         ↓
       [长期情节] 对话事件流(数据库)
         ↓
       [长期向量] 实体/事实(向量 DB)
         ↓
       [长期 KG] 实体关系(KG)
         ↓
查询时按需检索 + 合并
```

**MemGPT** 的灵感来源:让 LLM 像操作系统管理内存一样管理不同层级记忆(DRAM vs SSD)。

### 2. 主动遗忘

人类会遗忘无关信息。Agent 也应该:

- 短期记忆过期清理
- 向量记忆定期重排序(冷数据降权)
- KG 合并重复实体
- 情节记忆按时间窗口聚合

**为什么**:不遗忘 → 检索质量下降 → 上下文噪声增加 → 性能下降。

### 3. 元记忆(Meta-Memory)

让 Agent **知道**自己"知道什么":

- **Self-RAG**:每次回答前,LLM 先判断"我需要查记忆吗?"
- **CRUD 记忆**:可以增/删/改记忆
- **置信度**:对每条记忆打置信度分,低置信度记忆不参与回答

**Reflexion** 是代表:Agent 失败时,生成反思存为记忆,下次避免同样错误。

### 4. 隐私与隔离

- **用户级隔离**:不同用户的记忆隔离存储
- **敏感信息过滤**:写入记忆前过滤掉 PII
- **加密**:敏感记忆加密存储
- **TTL**:对临时记忆设过期时间

---

## 四、代表工作深度剖析

### MemGPT(2023)

**论文**:[MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)

**核心思想**:把 LLM 当 CPU,把外部存储当内存/磁盘,LLM 主动管理记忆调度。

**三层架构**:

```
Main Context(= DRAM):LLM 当前的 system prompt + 最近消息
External Context(= SSD):向量数据库 + 文档存储
Recall Storage:历史事件
Archival Storage:长期事实
```

**机制**:LLM 通过 `function_calls` 主动读写 External Context,类似操作系统的 page fault。

**影响**:开启了"Agent 记忆管理"研究方向,后续 MemGPT、Mem0 都受它启发。

### Mem0(2025)

**论文**:[Mem0: The Memory Layer for AI](https://arxiv.org/abs/2504.19413)

**核心思想**:轻量级记忆层,自动从对话中提取关键信息,跨会话保留。

**优势**:

- 比 MemGPT 简单 90%
- 适合生产环境
- 支持本地部署

### A-MEM(2025)

**论文**:[A-MEM: Agentic Memory for LLM Agents](https://arxiv.org/abs/2502.12110)

**核心思想**:让 Agent 自己决定"什么值得记""怎么组织""怎么检索"。

**机制**:基于 Zettelkasten(卡片盒)笔记法,每条记忆是一张卡片,卡片间自动建立链接。

**优势**:记忆有"演化能力",会自我组织、自我合并、自我关联。

### MemoryBank(2023)

**论文**:[MemoryBank: Enhancing Large Language Models with Long-Term Memory](https://arxiv.org/abs/2305.10250)

**核心思想**:模拟人类 Ebbinghaus 遗忘曲线,记忆有"自然衰减"。

**机制**:每条记忆有个"激活度",随时间衰减,被检索时增强。

**适合**:需要"长期陪伴感"的场景(虚拟陪伴、个人助理)。

---

## 五、记忆 vs RAG

经常被混淆的概念辨析:

| 维度 | RAG | Agent Memory |
|------|-----|--------------|
| **目的** | 增强知识 | 增强连续性 |
| **数据来源** | 外部文档 | 对话 + 用户行为 |
| **生命周期** | 静态(文档不更新) | 动态(持续积累) |
| **更新方式** | 重建索引 | 增量写入 |
| **检索目标** | 找相关知识 | 找相关经历 |
| **评价指标** | 答案准确率 | 长期一致性 |

**结论**:RAG 是"知识增强",Agent Memory 是"自我积累"。两者不冲突,通常配合使用。

---

## 六、KG 记忆的特殊价值

在四种记忆中,KG 记忆对 Agent × KG 主题最相关:

### 1. 解决 RAG 的两个痛点

- **全局问题**:KG 社区摘要聚合,向量检索做不到
- **关系检索**:KG 天然支持多跳关系查询

### 2. 解决记忆一致性

向量记忆可能"近义但矛盾"(同一实体的不同表述),KG 记忆通过实体对齐保证一致。

### 3. 解决可解释性

检索路径 = 推理路径,人类可读。

### 4. 配合长期 Agent

Agent 跨多会话持续工作时,KG 记忆可以"演化"(实体增加、关系更新),向量记忆很难演化。

**代表实现**:

```python
# 用 LLM 从对话抽取三元组
from openai import OpenAI
client = OpenAI()

def extract_triples(conversation: str) -> list:
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"从以下对话中抽取实体和关系,以 JSON 列表返回:\n{conversation}"
        }]
    )
    import json
    return json.loads(response.choices[0].message.content)

# 存入 KG(Neo4j / NetworkX)
triples = extract_triples("""
User: 我叫 Lyu,在华为做工作流 Skill 开发
Agent: 你好 Lyu!你做工作流 Skill 开发有什么具体方向?
User: 我主要做 Skill 编排和 Agent 集成
""")
# 输出:
# [
#   {"head": "Lyu", "relation": "工作于", "tail": "华为"},
#   {"head": "Lyu", "relation": "负责", "tail": "工作流 Skill 开发"},
#   {"head": "Lyu", "relation": "关注方向", "tail": "Skill 编排"},
#   {"head": "Lyu", "relation": "关注方向", "tail": "Agent 集成"}
# ]
```

然后这些三元组可以存入 Neo4j / Memgraph,后续按需查询。

---

## 七、实战:30 行实现一个简易记忆系统

```python
from openai import OpenAI
from collections import deque

client = OpenAI()

class SimpleAgentMemory:
    def __init__(self, max_short_term=10):
        self.short_term = deque(maxlen=max_short_term)  # 短期:最近 N 轮
        self.long_term_facts = []  # 长期:简单列表
        self.long_term_kg = []  # 长期:三元组

    def add_interaction(self, user_msg, agent_msg):
        self.short_term.append({"user": user_msg, "agent": agent_msg})

        # 异步抽取事实 + KG(实际生产用后台任务)
        facts = self._extract_facts(user_msg, agent_msg)
        self.long_term_facts.extend(facts)

        triples = self._extract_triples(user_msg, agent_msg)
        self.long_term_kg.extend(triples)

    def _extract_facts(self, user_msg, agent_msg):
        # 简化:让 LLM 抽取关键事实
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": f"从以下对话抽取 1-3 个关键事实,每条一行:\n用户:{user_msg}\n助手:{agent_msg}"
            }]
        )
        return [f for f in response.choices[0].message.content.split("\n") if f.strip()]

    def _extract_triples(self, user_msg, agent_msg):
        # 简化:让 LLM 抽取实体关系
        import json
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{
                "role": "user",
                "content": f"从以下对话抽取 (head, relation, tail) 三元组,以 JSON 列表返回(无三元组返回 []):\n用户:{user_msg}\n助手:{agent_msg}"
            }]
        )
        try:
            return json.loads(response.choices[0].message.content)
        except:
            return []

    def build_context(self, query):
        """构造 LLM 上下文"""
        # 短期:全部
        st_text = "\n".join([
            f"User: {t['user']}\nAgent: {t['agent']}"
            for t in self.short_term
        ])

        # 长期事实:top 5(实际生产用向量检索)
        lt_text = "\n".join(self.long_term_facts[-5:])

        # 长期 KG:简单字符串化
        kg_text = "\n".join([f"{h} --{r}--> {t}" for h, r, t in self.long_term_kg[-10:]])

        return f"""
[Short-term Memory]
{st_text}

[Long-term Facts]
{lt_text}

[Long-term KG]
{kg_text}
"""

# 使用
memory = SimpleAgentMemory()
memory.add_interaction(
    "我叫 Lyu,在华为做工作流 Skill 开发",
    "你好 Lyu!"
)
memory.add_interaction(
    "我主要做 Agent 集成",
    "明白,工作流 + Agent 集成方向。"
)

# 查询时
context = memory.build_context("我叫什么名字?")
print(context)
```

生产环境要做:向量检索、KG schema 校验、记忆合并、隐私过滤、TTL 管理。

---

## 八、设计决策清单

设计 Agent 记忆系统时,问自己这 6 个问题:

### 1. 跨会话需求?

- 是 → 必须有长期记忆
- 否 → 仅短期记忆

### 2. 关系密集?

- 是 → KG 记忆优先
- 否 → 向量记忆足够

### 3. 时序重要?

- 是 → 情节记忆(episodic)
- 否 → 长期事实记忆

### 4. 需要遗忘?

- 是 → 加衰减机制
- 否 → 永久存储

### 5. 隐私要求?

- 严 → 本地 + 加密 + 用户隔离
- 松 → 云端 OK

### 6. 成本敏感?

- 是 → 用 embedding + 小 LLM
- 否 → 全 GPT-4 也行

---

## 九、未来方向

### 1. 自演化记忆

Agent 自己决定"什么值得记""怎么组织"(A-MEM 方向)

### 2. 跨 Agent 记忆共享

多个 Agent 共享一个记忆池(Multi-Agent 方向)

### 3. 记忆压缩

把长期记忆压缩为抽象概念(类似人类 abstraction)

### 4. 神经-符号融合记忆

HippoRAG 方向:神经网络 + KG 协同记忆

### 5. 记忆审计

让 Agent 能"解释"自己为什么记住/遗忘某条信息

---

## 十、关键 takeaway

1. **记忆是 Agent 能力的边界** — 没记忆的 Agent 就是 stateless 循环
2. **四种记忆分工明确** — 短期/长期向量/长期 KG/情节,各管一摊
3. **KG 记忆是 Agent × KG 的核心** — 结构化、可解释、关系丰富
4. **MemGPT 思路最经典** — LLM 当 OS,外部存储当内存
5. **生产环境要加隐私 + TTL** — 不能无限制积累

---

## 十一、下一步

1. 📄 [MemGPT 论文](https://arxiv.org/abs/2310.08560) — 必读
2. 📄 [Mem0 论文](https://arxiv.org/abs/2504.19413) — 轻量级
3. 📄 [A-MEM 论文](https://arxiv.org/abs/2502.12110) — 自演化
4. 💻 [LlamaIndex Memory 模块](https://docs.llamaindex.ai/en/stable/module_guides/deploying/agents/memory/)
5. 📚 配套阅读:本仓库「GraphRAG 入门」「KG 增强推理」

---

## 参考

- [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)
- [Mem0: The Memory Layer for AI](https://arxiv.org/abs/2504.19413)
- [A-MEM: Agentic Memory for LLM Agents](https://arxiv.org/abs/2502.12110)
- [MemoryBank: Enhancing LLMs with Long-Term Memory](https://arxiv.org/abs/2305.10250)
- [HippoRAG: Neurobiologically Inspired Long-Term Memory](https://arxiv.org/abs/2405.14831)
