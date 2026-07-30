---
title: 'neo4j-labs/llm-graph-builder — Neo4j 官方的"无代码"知识图谱构建工具'
excerpt: 'Neo4j Labs 2024 年开源的图谱构建 Web 应用,把 PDF/网页/YouTube 转录等非结构化数据一键转化为 Neo4j 图谱,支持 11 种 LLM、5 种 RAG 检索模式、自定义 Schema。是新手入门 Neo4j + LLM 知识图谱的最佳起点。'
publishDate: 2026-07-30
category: '教程博客'
tags: ['Neo4j', 'llm-graph-builder', '知识图谱', 'GraphRAG', 'Neo4j Labs']
image: ~/assets/images/default.png
author: 'LyuBailin'
---

# neo4j-labs/llm-graph-builder

> Neo4j 官方出品的"无代码"知识图谱构建 Web 应用 — 上传文件,点按钮,出图谱。

- 🔗 仓库: <https://github.com/neo4j-labs/llm-graph-builder>
- 🏢 维护: Neo4j Labs(官方)
- 🐍 后端: Python FastAPI
- ⚛️ 前端: React
- 🗄️ 数据库: Neo4j 5.15+(需 APOC 插件)
- 🚀 首发: 2024 年

## 它解决什么问题

对想上手"LLM + 知识图谱"的人来说,过去有三个**入门障碍**:

1. **没有现成 UI** — 写 Cypher、写 LangChain、写 Neo4j driver,从零搭
2. **不知道图谱长什么样** — 抽出来的实体/关系是 JSON,怎么验证质量?
3. **RAG 怎么用图谱** — 抽完图谱后,怎么让它参与检索?

neo4j-labs/llm-graph-builder(简称 LGB)**一站式**解决这三个问题:

- **数据上传**:PDF、DOC、TXT、网页 URL、YouTube 链接、Wikipedia 词条,直接拖到前端
- **图谱生成**:选 LLM → 点"Generate Graph" → 几分钟后看 Neo4j 里的实体关系
- **图谱可视化**:Neo4j Bloom 一键打开
- **RAG 对话**:右侧聊天框,基于图谱回答问题,可切换 5 种检索模式

## 三步跑起来

### Step 1: 启动 Neo4j

```bash
# 方案 A:用 Neo4j Aura 免费版(推荐新手)
# 注册 https://console.neo4j.io → 创建一个免费实例 → 下载凭证文件

# 方案 B:本地 Docker
docker run -d --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_apoc_export_file_enabled=true \
  -e NEO4J_apoc_import_file_enabled=true \
  -e NEO4J_PLUGINS='["apoc"]' \
  neo4j:5.15
```

### Step 2: 启动 llm-graph-builder

```bash
git clone https://github.com/neo4j-labs/llm-graph-builder.git
cd llm-graph-builder

# .env 文件
echo "OPENAI_API_KEY=your-key" > .env

docker-compose up --build
# → 前端 http://localhost:8080
# → 后端 http://localhost:8000
```

### Step 3: 上传文件 → 生成图谱

打开 http://localhost:8080 → "Connect to Neo4j" → 拖一个 PDF → 选 LLM → 点 "Generate Graph" → 几分钟后看到节点和关系。

## 核心特性

### 1. 多源数据接入

- 本地文件(PDF / DOC / TXT)
- Web 页面(粘贴 URL)
- YouTube 视频(自动转录)
- Wikipedia 词条
- AWS S3 / Google Cloud Storage

### 2. 11 种 LLM 支持

| 提供商 | 模型 | 用途 |
|--------|------|------|
| OpenAI | GPT-3.5 / GPT-4 / GPT-4o | 默认选项,质量最高 |
| Diffbot | Diffbot NLP | 专门用于图谱抽取,快 |
| Gemini | Gemini 1.5 Pro | 长上下文 |
| Anthropic | Claude 3.5 | 高质量推理 |
| Ollama(本地) | llama3 / qwen 等 | 数据隐私场景 |

### 3. 自定义 Schema

通过 Settings → Entity Extraction Settings,你可以:

- 用 Neo4j 现有 schema
- 自定义节点类型和关系类型(JSON)
- 从一段文本让 LLM 帮你推荐 schema

例:法律文档场景下自定义 `LegalTerm` / `Case` / `Precedent` 节点 + `CITED_BY` / `OVERRULES` 关系。

### 4. 5 种 RAG 检索模式

| 模式 | 适用问题 |
|------|---------|
| `vector` | 纯向量相似度,简单事实查找 |
| `graph+vector`(推荐) | 图谱+向量融合,综合效果最好 |
| `graph` | 纯图谱路径查询,需要精确关系的场景 |
| `hybrid` | 多策略融合 |
| `entity_vector` | 实体级向量检索 |

### 5. 图谱后处理工具

- 实体去重合并
- 孤立节点清理
- 社区检测
- 实体嵌入生成(为后续向量检索铺路)

### 6. 提问可追溯

每条回答都标注**来源文档 / chunk / 实体**,点击 "Details" 看到 RAG 用了哪些上下文,方便调试和验证。

## 为什么对 Agent × KG 重要

- **是 Neo4j + LLM 知识图谱方向的"标杆 demo"** — 任何想做类似项目的人,都得先看这个仓库,理解"什么是 LLM 知识图谱的标准 UX"
- **后端用 LangChain 的 `LLMGraphTransformer`** — 这就是 Neo4j 团队向 LangChain 贡献的核心模块,所有其他"LLM 转图谱"的实现都受其影响
- **展示了图谱在 RAG 中的"完整闭环"**:摄取 → 抽取 → 存储 → 检索 → 生成 → 反馈,每个环节都有 UI
- **新手友好**:不用写代码就能跑通"PDF → 图谱 → 问答"全流程,极大降低了 Agent × KG 的入门门槛

做 Agent 项目的工程师,**用这个工具验证"知识图谱对 Agent 有没有帮助"**,是最快的实验方式。

## 适用场景

- ✅ **新手入门 Neo4j + LLM 知识图谱**(零代码体验)
- ✅ **快速验证业务想法** — 给老板/客户演示"文档变图谱"的 Demo
- ✅ **企业知识库原型** — 内部技术文档、销售手册的图谱化 PoC
- ✅ **学术研究** — 论文里的方法用这个工具做 baseline 对比
- ✅ **教学** — 教学生"图谱怎么从文本里抽出来"的最佳教学工具
- ❌ **不适合**:生产级大规模部署(并发/权限/审计都需要自己加)
- ❌ **不适合**:对抽取质量要求极高的科研/法律场景(LangChain LLMGraphTransformer 是通用方案,不是定制)

## 局限

- 单文档处理速度受 LLM 速率限制,大型 PDF(>500 页)需要等很久
- 默认抽取的实体类型比较泛(Person / Organization / Location),专业领域需要自定义 schema
- 多人协作 / 权限管理 / 审计日志这些企业级特性都没有
- LangChain 0.1 → 0.2 的 API 变动历史上影响过这个项目,部署前需查最新 issue

## 推荐阅读顺序

1. [官方在线体验](https://llm-graph-builder.neo4jlabs.com/) — 不用注册 Neo4j,直接试
2. [GitHub README](https://github.com/neo4j-labs/llm-graph-builder) — 5 分钟本地部署
3. [Neo4j GenAI 生态文档](https://neo4j.com/labs/genai-ecosystem/) — 看相关工具集
4. [LangChain LLMGraphTransformer 源码](https://python.langchain.com/api_reference/experimental/graph_transformers/langchain_experimental.graph_transformers.llm.LLMGraphTransformer.html) — 理解底层抽取逻辑
