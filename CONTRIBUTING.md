# 贡献指南

感谢你考虑为 **Agent KG Hub** 做出贡献！🎉

本仓库是"LLM Agent × 知识图谱"主题的中文资源导航与概念解读站。每一次贡献,都让这个领域的中文资料更完整。

## 🌟 你可以贡献什么

### 1. 推荐资源 📚

发现了与 Agent × KG 相关的好资源(论文 / 项目 / 教程)?

- 提 [Resource Suggestion] Issue
- 在 Issue 中提供:资源名称、URL、类型、关联范式、为什么对 Agent × KG 重要
- 维护者会审核并收录,加入资源导航

### 2. 投稿概念解读 ✍️

想写一篇概念长文?选题包括但不限于:

- 概念解读(如 ReAct、Plan-and-Execute、GraphRAG 进阶)
- 项目深度(如 LangGraph 高级用法、smolagents 实战)
- 应用案例(如企业知识管理、医疗 KG)
- 综述精读(如某综述的精读与点评)

流程:

1. 提 [Content Suggestion] Issue 提议选题
2. 维护者评估后,会邀请你写
3. 提交 PR,GitHub Actions 自动跑构建验证
4. 合并后自动部署上线

### 3. 修复问题 🐛

- 网站功能 bug
- 链接失效
- 内容错误
- 翻译不准确

请提 [Bug Report] Issue。

### 4. 改进 UI / 文档 🎨

- 配色、字体、布局
- README 完善
- CONTRIBUTING、CHANGELOG 更新

### 5. 翻译 🌍

把所有中文文章翻译为英文,或反向。

## 🛠️ 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/LyuBailin/agent-kg-hub.git
cd agent-kg-hub

# 2. 安装依赖(需要 Node.js >= 22.12)
npm install

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:4321

# 4. 生产构建
npm run build

# 5. 预览构建结果
npm run preview

# 6. Lint + Format 检查
npm run check
npm run fix
```

## 📝 内容规范

### Frontmatter(必需)

每篇文章必须有完整 frontmatter:

```yaml
---
title: '你的文章标题'
excerpt: '一句话描述文章核心内容,100-200 字'
publishDate: 2026-08-01
category: '核心概念' # 或:核心项目 / 教程博客 / 论文综述 / 应用案例
tags: ['GraphRAG', 'RAG', '知识图谱']
image: ~/assets/images/default.png # 默认图
author: '你的 GitHub 用户名'
---
```

### 正文规范

1. **结构清晰**:用 H1(仅 1 个)、H2(章节)、H3(小节)
2. **可执行**:代码示例必须能跑通
3. **引用规范**:用 `[显示文本](URL)` 格式
4. **图表优先**:能用图就用图(SVG 或 Mermaid)
5. **代码块加语言标记**:` ```python `、` ```bash ` 等
6. **避免冗长**:每节 300-800 字为佳,长内容拆小节
7. **原创优先**:复制别人的内容请注明出处

### 文件命名

- 中文章:`src/data/post/资源-{kebab-case}.md`
- 英文章:`src/data/post-en/{kebab-case}.md`
- 概念文:`src/data/post/concept-{kebab-case}.md`(中)/`src/data/post-en/concept-{kebab-case}.md`(英)

示例:

```
src/data/post/resource-microsoft-graphrag.md
src/data/post/concept-react-intro.md
src/data/post-en/resource-microsoft-graphrag.md
```

## 🔄 Pull Request 流程

1. Fork 仓库
2. 创建你的特性分支 (`git checkout -b feature/awesome-content`)
3. 提交你的改动 (`git commit -m 'feat(content): add awesome agent article'`)
4. 推送到分支 (`git push origin feature/awesome-content`)
5. 创建 Pull Request,填写 PR 模板
6. 等待 CI 通过 + 维护者 review
7. 合并后自动部署

### Commit 信息规范

用 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(content): add ReAct 入门
fix(ui): fix ParadigmMap mobile layout
docs: update README
chore(deps): bump astro to v6.5
ci: add labeler workflow
```

## ✅ 提交前检查清单

- [ ] 本地 `npm run build` 通过
- [ ] 链接全部有效
- [ ] 内容准确,无错别字
- [ ] 引用规范,出处明确
- [ ] 没有遗留的 `console.log` / debug 代码
- [ ] 没有引入不必要的依赖
- [ ] 截图 / 图片放入 `src/assets/images/`
- [ ] 大文件用 Git LFS

## 🤝 社区守则

- 友善、尊重、专业
- 讨论就事论事,避免人身攻击
- 接受建设性批评
- 关注"对 Agent × KG 社区最有价值"的事

## 📬 联系方式

- **Issue 提问**:优先用 GitHub Issue
- **讨论想法**:用 GitHub Discussions
- **私下联系**:通过 GitHub profile

## 🙏 致谢

感谢所有贡献者!你们的每一个 PR、Issue、Discussion 都让这个仓库更好。

---

<sub>本贡献指南受 [Atom Contributing Guide](https://github.com/atom/atom/blob/master/CONTRIBUTING.md) 启发,采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 协议发布。</sub>
