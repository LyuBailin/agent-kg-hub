---
title: 'Agent Evaluation Methods — How to Measure Whether an Agent Is Good or Bad'
excerpt: 'From 2024 to 2026, Agent evaluation has become an independent research direction. This article explains the two major paradigms of Agent evaluation (end-to-end benchmark vs. trajectory evaluation), key metrics, representative benchmarks (AgentBench, SWE-bench, GAIA, WebArena), the evaluation pipeline, and common pitfalls.'
publishDate: 2026-07-27
category: 'Core Concepts'
tags: ['Agent Evaluation', 'AgentBench', 'SWE-bench', 'GAIA', 'WebArena', 'LLM']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# Agent Evaluation Methods: How to Measure Whether an Agent Is Good or Bad

> Without evaluation, there is no iteration. Agent evaluation is the infrastructure for "AGI engineering".

## Why I Wrote This

LLM Agents exploded from 2024 to 2026, but an awkward fact remains: **we don't know how to measure whether an Agent is good or bad**.

- For the same task, different Agent implementations vary hugely
- For the same Agent, performance varies hugely across datasets
- Subjective feel and objective metrics often disagree
- Evaluation is expensive (LLM calls + human labor)

This article aims to: in 30 minutes, give you a **thorough understanding of the two paradigms of Agent evaluation, key metrics, representative benchmarks, and practical methods**.

---

## 1. Why Is Agent Evaluation So Hard?

### 1. Task Diversity

Agent applications range from customer service to code, from research to games; the shapes of tasks are wildly different. There's no single metric that covers them all.

### 2. Path Diversity

The same task can have many correct paths (code, tool choice, and reasoning path can all differ). What you compare is not the "output" but the "process".

### 3. Evaluation Cost

Agents usually have to execute multiple steps, each invoking the LLM many times. A single full evaluation can run $0.1–$1.

### 4. Evaluation Stability

The LLM itself is stochastic (temperature > 0), so the same Agent can show 5–10% variation across two runs.

### 5. Data Contamination

Many public benchmarks have already been "seen" in LLM training data, so Agents score artificially high on them.

---

## 2. Two Evaluation Paradigms

### Paradigm 1: End-to-End Benchmark

**Idea**: Given a task, run the Agent, and look at the final result.

**Representative benchmarks**:

- **SWE-bench**: Software engineering tasks (fixing bugs from real GitHub issues)
- **GAIA**: General assistant tasks (multi-step reasoning + tool use)
- **WebArena**: Browser operation tasks (simulating real web interaction)
- **HumanEval / MBPP**: Code generation (not strictly Agent, but related)
- **MINT**: Multi-turn tool use

**Strengths**:
- Simple and direct
- Objective and comparable
- Highly reproducible

**Weaknesses**:
- High evaluation cost
- Hard to diagnose (you only see the result, not the process)
- Easy to game the leaderboard

### Paradigm 2: Trajectory Evaluation

**Idea**: Don't just look at the result; look at whether every step the Agent took is reasonable.

**Evaluation dimensions**:

- **Tool selection accuracy**: Call tool A when A is appropriate, tool B when B is appropriate
- **Parameter extraction accuracy**: Whether the parameters passed to tool calls are correct
- **Reasoning quality**: Whether each step's Thought is reasonable
- **Efficiency**: Steps / tokens used to complete the task
- **Robustness**: Whether the Agent can recover from errors

**Strengths**:
- Interpretable (you can see where it goes wrong)
- Actionable (you know what to fix)
- Good fit for the development phase

**Weaknesses**:
- Hard to unify evaluation standards
- Requires expert annotation or LLM-as-judge
- Doesn't directly reflect final performance

**Best practice**: Use both paradigms together.

---

## 3. Key Metrics

### 1. Task Success Rate

**Definition**: The proportion of tasks completed successfully.

**Calculation**: `successes / total tasks`

**Best for**: Tasks with a clear right / wrong answer (bug fixes, QA)

**Pitfall**: Binary judgment is unfriendly to "partially correct" tasks.

### 2. Answer Quality

**Metrics**:
- **BLEU / ROUGE**: Text similarity
- **BERTScore**: Semantic similarity
- **LLM-as-judge**: Let GPT-4 score (0–10)
- **Human rating**: Gold standard

**Best for**: Open-ended tasks (dialogue, writing, recommendation)

**Pitfall**: LLM-as-judge is itself biased, and human rating is expensive.

### 3. Efficiency Metrics

- **Steps to complete**: How many steps the Agent used
- **Token consumption**: How many tokens were used
- **API call count**: How many external API calls were made
- **Total time**: End-to-end latency
- **Cost**: Actual spend ($)

**Why it matters**: High success rate but 10× slower may be impractical.

### 4. Robustness

**Tests**:
- Input perturbation (paraphrase, typos)
- Tool failure (simulate API failures)
- Environment change (webpage structure changes)

**Metric**: The difference in success rate before vs. after perturbation.

### 5. Explainability

- **Trajectory readability**: Whether the Thought outputs are clear
- **Path traceability**: Can you reconstruct the process from the result
- **Error localization**: When it fails, can you quickly locate the cause

---

## 4. Representative Benchmarks in Detail

### SWE-bench (The De Facto Standard for Code Agents)

**Task**: From real GitHub projects, given an issue description, the Agent fixes the bug.

**Data**: 2,294 real Python issues (from 12 open-source projects)

**Evaluation**: Use unit tests; the percentage of tests passed = score.

**Representative results (2026)**:
- Early Agents (2023): ~3%
- GPT-4-based Agents (2024): ~20%
- SOTA Agents (2025–2026): ~50–65%

**Characteristics**:
- Real-world tasks
- Objective and quantifiable
- Complex tasks (requires understanding the whole project)
- High cost (each run takes 5–30 minutes)

### GAIA (General AI Assistant)

**Task**: General assistant scenarios (multi-step reasoning + tool use + file handling)

**Data**: 466 human-designed complex questions

**Three difficulty levels**:
- Level 1: Easy (single tool call)
- Level 2: Medium (2–3 tools)
- Level 3: Hard (5+ tools + reasoning)

**Evaluation**: Answer matching (exact match + human review)

**Representative results (2026)**:
- GPT-4 + tools: Level 1 ~85%, Level 2 ~50%, Level 3 ~15%
- Top Agents: Level 1 ~95%, Level 2 ~70%, Level 3 ~30%

### WebArena (Browser Agent)

**Task**: Complete complex tasks on real websites (e-commerce, maps, GitHub, etc.)

**Data**: 812 tasks

**Evaluation**: Task completion (target-state match)

**Representative results (2026)**:
- Simple tasks: 60–70% success rate
- Complex tasks: 20–30%
- Still far below humans (95%+)

### AgentBench (Comprehensive Agent Capability)

**Task**: 7 sub-tasks covering code, web, games, knowledge reasoning, etc.

**Data**: ~1000 tasks

**Evaluation**: Weighted average of sub-task scores

**Why it matters**: Currently the most comprehensive Agent capability benchmark.

### τ-bench (Tau Bench)

**Task**: Simulated customer service scenarios (multi-turn dialogue + tool use + rule compliance)

**Data**: Retail customer service scenario, 165 tasks

**Evaluation**: Success in fulfilling the user request

**Why it matters**: Measures Agent capability in "strict rule" scenarios.

---

## 5. Evaluation Pipeline

### Step 1: Choose a Benchmark

Based on your application scenario:
- General capability → AgentBench
- Code → SWE-bench
- Browser → WebArena
- Customer service → τ-bench
- Real assistant → GAIA

### Step 2: Configure the Evaluation Environment

- API keys, model selection
- Tool set (may need to be mocked)
- Hyperparameters (temperature, max_steps)

### Step 3: Run the Evaluation

- Single evaluation: run N times and average
- Multi-model comparison: run multiple Agents on the same benchmark
- Multiple trials: reduce stochasticity

### Step 4: Analyze Results

- Total score / sub-scores
- Failure case analysis
- Compare against a baseline

### Step 5: Iterate

- Identify weak points → tweak prompt / tools / model
- Re-evaluate
- Until you hit the bar

---

## 6. LLM-as-Judge: Using an LLM to Evaluate an LLM

**Problem**: Human evaluation is expensive, slow, and inconsistent.

**Solution**: Let a strong LLM (GPT-4, Claude 3.5) act as judge.

**Usage**:

```python
judge_prompt = """
Please evaluate the following Agent's answer and score it 0-10:

[Question]
{question}

[Agent's Answer]
{answer}

[Reference Answer]
{reference}

[Evaluation Criteria]
- Accuracy (0-3)
- Completeness (0-3)
- Fluency (0-2)
- Relevance (0-2)

Please output in the following format:
Total score: X
Comment: ...
"""

response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": judge_prompt}]
)
```

**Strengths**:
- Low cost (100× cheaper than humans)
- Reasonable consistency
- 24/7 availability

**Pitfalls**:
- LLMs are biased (position bias, length bias, brand bias)
- Cannot evaluate long outputs (beyond the window)
- Quality drops on complex tasks

**Best practices**:
- Use the strongest model as judge
- Use multiple LLMs and vote
- Regularly align with human evaluation

---

## 7. Trajectory Evaluation in Practice

```python
def evaluate_trajectory(trajectory: list) -> dict:
    """
    Evaluate the trajectory the Agent executed.

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

    # 1. Tool selection accuracy (use an LLM to evaluate each step)
    correct_tool = 0
    for step in trajectory:
        # Use an LLM to judge whether this step's tool choice was correct
        ...
        correct_tool += 1 if is_correct else 0
    metrics["tool_selection_accuracy"] = correct_tool / len(trajectory)

    # 2. Efficiency: actual steps vs. optimal steps
    metrics["efficiency"] = optimal_steps / len(trajectory)

    # 3. Robustness: did it recover after an error
    recovery_count = 0
    for i, step in enumerate(trajectory):
        if step.get("error") and i+1 < len(trajectory):
            if trajectory[i+1].get("action") != "give_up":
                recovery_count += 1
    metrics["robustness"] = recovery_count / max(1, error_count)

    return metrics
```

---

## 8. Common Pitfalls in Evaluation

### 1. Data Contamination

The LLM has seen the benchmark answers during training.

**Mitigations**:
- Use recently released benchmarks
- Build your own private benchmark
- Add perturbations when evaluating

### 2. Overfitting to a Benchmark

Repeatedly running the same benchmark makes it easy to "tune" for a high score, but real-world performance suffers.

**Mitigations**:
- Cross-validate with multiple benchmarks
- Real-world A/B testing
- Long-term monitoring

### 3. Evaluation Cost Explosion

A full SWE-bench run can cost $1000+.

**Mitigations**:
- Use a subset (500 → 100)
- Use a small model for an initial filter
- Use LLM-as-judge instead of human review

### 4. Single-Metric Tunnel Vision

Looking only at success rate may miss "barely successful but low-quality" cases.

**Mitigations**:
- Multi-metric composite (success + quality + efficiency + robustness)
- Use LLM-as-judge for quality

### 5. Irreproducible Evaluation

LLMs are stochastic, making results hard to reproduce.

**Mitigations**:
- Pin temperature
- Run multiple times and average
- Publish prompt + configuration

---

## 9. Key Takeaways

1. **Evaluation is the core of Agent engineering** — without evaluation, you cannot iterate.
2. **End-to-end + trajectory, in tandem** — one looks at the result, the other at the process.
3. **Choose the right benchmark** — it depends on your application.
4. **LLM-as-Judge is the best cost-performance choice** — 100× cheaper than humans.
5. **Beware of data contamination** — public benchmarks may have been used in training.

---

## 10. Next Steps

1. 📄 [SWE-bench paper](https://arxiv.org/abs/2310.06770) — code Agent standard
2. 📄 [GAIA paper](https://arxiv.org/abs/2311.12983) — general assistant
3. 📄 [WebArena paper](https://arxiv.org/abs/2307.13854) — browser Agent
4. 📄 [AgentBench paper](https://arxiv.org/abs/2308.03688) — comprehensive
5. 💻 [Inspect AI](https://github.com/UKGovernmentBEIS/inspect_ai) — UK AISI's Agent evaluation framework
6. 📚 Companion reading from this hub: "ReAct Onboarding" and "GraphRAG Onboarding"

---

## References

- [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770)
- [GAIA: A Benchmark for General AI Assistants](https://arxiv.org/abs/2311.12983)
- [WebArena: A Realistic Web Environment for Building Autonomous Agents](https://arxiv.org/abs/2307.13854)
- [AgentBench: Evaluating LLMs as Agents](https://arxiv.org/abs/2308.03688)
- [τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains](https://arxiv.org/abs/2406.12045)
