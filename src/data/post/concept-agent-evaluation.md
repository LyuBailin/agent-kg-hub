---
title: 'Agent 评估方法 — 如何科学地衡量 Agent 的好坏'
excerpt: '2024-2026 年 Agent 评估成为独立研究方向。本文讲清 Agent 评估的两大范式(端到端 benchmark vs 轨迹评估)、关键指标、代表 benchmark(AgentBench、SWE-bench、GAIA、WebArena)、评估流程与陷阱。'
publishDate: 2026-07-27
category: '核心概念'
tags: ['Agent Evaluation', 'AgentBench', 'SWE-bench', 'GAIA', 'WebArena', 'LLM']
image: ~/assets/images/cover-concept-agent-evaluation.png
author: 'LyuBailin'
---

# Agent 评估方法:如何科学地衡量 Agent 的好坏

> 没有评估,就没有迭代。Agent 评估是"AGI 工程化"的基础设施。

## 为什么写这篇

2024-2026 年 LLM Agent 爆发,但一个尴尬的事实:**我们不知道怎么衡量 Agent 的好坏**。

- 同一个任务,不同 Agent 实现差异巨大
- 同一个 Agent,换数据集表现差异巨大
- 主观感受和客观指标经常不一致
- 评估成本高(LLM 调用 + 人工)

本文目标:30 分钟,让你**理解 Agent 评估的两大范式、关键指标、代表 benchmark、实战方法**。

---

## 一、为什么 Agent 评估很难

### 1. 任务多样性

Agent 应用从客服到代码,从研究到游戏,任务形态千差万别。无法用一个统一指标衡量。

### 2. 路径多样性

同一个任务可能有多种正确路径(代码、工具选择、推理路径都可能不同)。比对的不是"输出"而是"过程"。

### 3. 评估成本

Agent 通常要执行多步,每次执行要调用 LLM 多次。跑一次完整评估可能 $0.1-$1。

### 4. 评估稳定性

LLM 本身有随机性(temperature > 0),同一 Agent 跑两次结果可能差 5-10%。

### 5. 数据污染

很多公开 benchmark 已经被 LLM 训练数据"见过",Agent 在上面表现虚高。

---

## 二、两大评估范式

### 范式 1:端到端 benchmark

**思路**:给定任务,跑 Agent,看最终结果。

**代表 benchmark**:

- **SWE-bench**:软件工程任务(从 GitHub issue 修 bug)
- **GAIA**:通用助手任务(多步推理 + 工具调用)
- **WebArena**:浏览器操作任务(模拟真实网页交互)
- **HumanEval / MBPP**:代码生成(虽然不是 Agent,但相关)
- **MINT**:多轮工具调用

**优点**:
- 简单直接
- 客观可比较
- 复现性好

**缺点**:
- 评估成本高
- 难以诊断(只看到结果,看不到过程)
- 容易被刷榜

### 范式 2:轨迹评估(Trajectory Evaluation)

**思路**:不只看结果,看 Agent 执行的每一步是否合理。

**评估维度**:

- **工具选择正确率**:该调 A 时调 A,该调 B 时调 B
- **参数提取准确率**:工具调用的参数是否正确
- **推理质量**:每步 Thought 是否合理
- **效率**:完成任务用的步数 / token 数
- **鲁棒性**:遇到错误能否恢复

**优点**:
- 可解释(知道哪里出问题)
- 可指导优化(知道改哪里)
- 适合开发阶段

**缺点**:
- 评估标准难以统一
- 需要专家标注或 LLM-as-judge
- 不能直接反映最终表现

**最佳实践**:两个范式配合使用。

---

## 三、关键指标

### 1. 任务成功率(Task Success Rate)

**定义**:成功完成任务的比例。

**计算**:`成功数 / 总任务数`

**适用**:有明确正确/错误的任务(代码 bug 修复、问答)

**陷阱**:二元判断对"部分正确"的任务不友好。

### 2. 答案质量(Answer Quality)

**指标**:
- **BLEU / ROUGE**:文本相似度
- **BERTScore**:语义相似度
- **LLM-as-judge**:让 GPT-4 打分(0-10)
- **人工评分**:金标准

**适用**:开放式任务(对话、写作、推荐)

**陷阱**:LLM-as-judge 也有偏,人工评分成本高。

### 3. 效率指标

- **完成步数**:Agent 用了多少步完成
- **Token 消耗**:用了多少 token
- **API 调用次数**:调了多少次外部 API
- **总耗时**:端到端耗时
- **成本**:实际花费($)

**意义**:成功率高但耗时 10 倍,可能不实用。

### 4. 鲁棒性(Robustness)

**测试**:
- 输入扰动(同义改写、错别字)
- 工具故障(模拟 API 失败)
- 环境变化(网页结构变化)

**指标**:扰动前后成功率差值。

### 5. 可解释性(Explainability)

- **轨迹可读性**:Thought 输出是否清晰
- **路径可追溯**:能否从结果反推过程
- **错误定位**:失败时能否快速定位原因

---

## 四、代表 benchmark 详解

### SWE-bench(代码 Agent 的事实标准)

**任务**:从真实 GitHub 项目中,给定 issue 描述,让 Agent 修 bug。

**数据**:2,294 个真实 Python issue(来自 12 个开源项目)

**评估**:用单元测试,通过的百分比 = 分数。

**代表结果(2026)**:
- 早期 Agent(2023):~3%
- GPT-4 based Agent(2024):~20%
- SOTA Agent(2025-2026):~50-65%

**特点**:
- 真实世界任务
- 客观可量化
- 任务复杂(需要理解整个项目)
- 成本高(每次跑要 5-30 分钟)

### GAIA(General AI Assistant)

**任务**:通用助手场景(多步推理 + 工具调用 + 文件处理)

**数据**:466 个人工设计的复杂问题

**三级难度**:
- Level 1:简单(单个工具调用)
- Level 2:中等(2-3 个工具)
- Level 3:困难(5+ 工具 + 推理)

**评估**:答案匹配(精确匹配 + 人工审核)

**代表结果(2026)**:
- GPT-4 + 工具:Level 1 ~85%,Level 2 ~50%,Level 3 ~15%
- 顶级 Agent:Level 1 ~95%,Level 2 ~70%,Level 3 ~30%

### WebArena(浏览器 Agent)

**任务**:在真实网站上(电商、地图、GitHub 等)完成复杂任务

**数据**:812 个任务

**评估**:任务完成度(目标状态匹配)

**代表结果(2026)**:
- 简单任务:成功率达 60-70%
- 复杂任务:20-30%
- 仍远低于人类(95%+)

### AgentBench(综合 Agent 能力)

**任务**:7 个子任务,涵盖代码、网页、游戏、知识推理等

**数据**:~1000 个任务

**评估**:子任务分数加权平均

**意义**:目前最综合的 Agent 能力 benchmark。

### τ-bench(Tau Bench)

**任务**:模拟客服场景(多轮对话 + 工具调用 + 规则遵守)

**数据**:零售客服场景,165 个任务

**评估**:成功完成用户请求

**意义**:衡量 Agent 在"严格规则"场景的能力。

---

## 五、评估流程

### Step 1:选定 benchmark

根据应用场景选:
- 通用能力 → AgentBench
- 代码 → SWE-bench
- 浏览器 → WebArena
- 客服 → τ-bench
- 真实助手 → GAIA

### Step 2:配置评估环境

- API key、模型选择
- 工具集(可能需要 mock)
- 超参数(temperature、max_steps)

### Step 3:运行评估

- 单次评估:跑 N 次取平均
- 多模型对比:同一 benchmark 跑多个 Agent
- 多次试验:减少随机性

### Step 4:分析结果

- 总分 / 子分
- 失败案例分析
- 与 baseline 对比

### Step 5:迭代

- 发现弱项 → 改 prompt / 工具 / 模型
- 重新评估
- 直到达标

---

## 六、LLM-as-Judge:用 LLM 评估 LLM

**问题**:人工评估贵、慢、不一致。

**方案**:让强 LLM(GPT-4、Claude 3.5)当裁判。

**用法**:

```python
judge_prompt = """
请你评估以下 Agent 的回答,打分 0-10:

[Question]
{question}

[Agent's Answer]
{answer}

[Reference Answer]
{reference}

[Evaluation Criteria]
- 准确性 (0-3)
- 完整性 (0-3)
- 流畅性 (0-2)
- 相关性 (0-2)

请按以下格式输出:
总分:X
评论:...
"""

response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": judge_prompt}]
)
```

**优势**:
- 成本低(比人工低 100x)
- 一致性较好
- 24/7 可用

**陷阱**:
- LLM 有偏(位置偏、长度偏、品牌偏)
- 不能评估长输出(超出窗口)
- 复杂任务评估质量下降

**最佳实践**:
- 用最强模型当裁判
- 多 LLM 投票
- 与人工评估定期对齐

---

## 七、轨迹评估实战

```python
def evaluate_trajectory(trajectory: list) -> dict:
    """
    评估 Agent 执行的轨迹

    trajectory: [{step, thought, action, observation, ...}, ...]
    """
    metrics = {
        "total_steps": len(trajectory),
        "tool_selection_accuracy": 0,
        "param_extraction_accuracy": 0,
        "thought_quality": 0,
        "efficiency": 0,
        "robustness": 0,
    }

    # 1. 工具选择正确率(用 LLM 评估每步)
    correct_tool = 0
    for step in trajectory:
        # 用 LLM 判断该步的工具选择是否正确
        ...
        correct_tool += 1 if is_correct else 0
    metrics["tool_selection_accuracy"] = correct_tool / len(trajectory)

    # 2. 效率:实际步数 vs 最优步数
    metrics["efficiency"] = optimal_steps / len(trajectory)

    # 3. 鲁棒性:遇到错误后是否恢复
    recovery_count = 0
    for i, step in enumerate(trajectory):
        if step.get("error") and i+1 < len(trajectory):
            if trajectory[i+1].get("action") != "give_up":
                recovery_count += 1
    metrics["robustness"] = recovery_count / max(1, error_count)

    return metrics
```

---

## 八、评估的常见陷阱

### 1. 数据污染(Contamination)

LLM 在训练时见过 benchmark 答案。

**缓解**:
- 用近期发布的 benchmark
- 自己造私有 benchmark
- 评估时加扰动

### 2. 过拟合 benchmark

反复跑同一 benchmark 容易"调"出高分,但真实场景表现差。

**缓解**:
- 多个 benchmark 交叉验证
- 真实场景 A/B 测试
- 长期监控

### 3. 评估成本爆炸

跑一次完整 SWE-bench 评估可能要 $1000+。

**缓解**:
- 用子集(500 个 → 100 个)
- 用小模型做初筛
- 用 LLM-as-judge 替代人工

### 4. 评估指标单一

只看任务成功率,可能错过"勉强成功但质量差"。

**缓解**:
- 多指标综合(成功率 + 质量 + 效率 + 鲁棒性)
- 用 LLM-as-judge 评估质量

### 5. 评估不可复现

LLM 有随机性,评估结果难复现。

**缓解**:
- 固定 temperature
- 跑多次取平均
- 公开 prompt + 配置

---

## 九、关键 takeaway

1. **评估是 Agent 工程化的核心** — 没有评估,没法迭代
2. **端到端 + 轨迹双管齐下** — 一个看结果,一个看过程
3. **选对 benchmark** — 取决于你的应用场景
4. **LLM-as-Judge 是性价比之选** — 比人工便宜 100x
5. **警惕数据污染** — 公开 benchmark 可能被训练过

---

## 十、下一步

1. 📄 [SWE-bench 论文](https://arxiv.org/abs/2310.06770) — 代码 Agent 标准
2. 📄 [GAIA 论文](https://arxiv.org/abs/2311.12983) — 通用助手
3. 📄 [WebArena 论文](https://arxiv.org/abs/2307.13854) — 浏览器 Agent
4. 📄 [AgentBench 论文](https://arxiv.org/abs/2308.03688) — 综合
5. 💻 [Inspect AI](https://github.com/UKGovernmentBEIS/inspect_ai) — UK AISI 的 Agent 评估框架
6. 📚 配套阅读:本仓库「ReAct 入门」「GraphRAG 入门」

---

## 参考

- [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770)
- [GAIA: A Benchmark for General AI Assistants](https://arxiv.org/abs/2311.12983)
- [WebArena: A Realistic Web Environment for Building Autonomous Agents](https://arxiv.org/abs/2307.13854)
- [AgentBench: Evaluating LLMs as Agents](https://arxiv.org/abs/2308.03688)
- [τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains](https://arxiv.org/abs/2406.12045)
