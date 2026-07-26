# W1 收尾 — 2026-07-26

## 今日完成

按最终报告 §6.1 W1 节奏,Agent KG Hub 基础设施全链路跑通。

### 已落地

- [x] GitHub 远程仓库:LyuBailin/agent-kg-hub(public, MIT)
- [x] 主题集成:AstroWind v1.0.0-beta.63(`arthelokyo/astrowind` 5835 stars 主线)
- [x] 技术栈:Astro v6.4.2 + Tailwind CSS v4.3.0 + TypeScript
- [x] 主题色板:Indigo-600 / Indigo-700 / Sky-500(深蓝/靛青)
- [x] 自定义页面:`index.astro`(三大范式 + 核心项目 + 内容服务)、`about.astro`(项目背景 + 维护节奏)
- [x] 配置文件:`astro.config.ts`(base path)、`src/config.yaml`(中文 metadata)、`src/navigation.ts`(中文导航)
- [x] 元数据:`LICENSE`(MIT)、`README.md`(中文,带徽章)、`CITATION.cff`(学术引用)
- [x] CI/CD:`.github/workflows/pages.yml`(withastro/action 部署)
- [x] Pages 启用:已通过 `gh api POST /pages` 启用 `build_type: workflow`
- [x] 首次部署成功:run 30209764854 ✅

### 在线验证(全部 200 OK)

| 路径 | 状态 | 标题 |
|------|------|------|
| `/` | 200 | Agent × 知识图谱技术资源导航 |
| `/about` | 200 | 关于本站 · Agent KG Hub |
| `/articles` | 200 | Blog · Agent KG Hub |
| `/rss.xml` | 200 | - |
| `/sitemap-index.xml` | 200 | - |

**在线 URL**: <https://lyubailin.github.io/agent-kg-hub/>

### 关键决策与踩坑

1. **astro.config.ts 的 base 路径**:第一次用 `base: '/agent-kg-hub/'` + `trailingSlash: 'never'` 时,build 输出 redirect 占位 HTML(指向 `/agent-kg-hub` 无 slash)。改为 `base: '/agent-kg-hub'` + `trailingSlash: 'ignore'` 后正常。
2. **Announcement.astro 解析错误**:多行属性拆行写法触发 esbuild 解析边界,改为单行属性后通过。
3. **vendor/integration 漏复制**:首次 build 报"Failed to load url ./vendor/integration",补全后正常。
4. **Pages 启用**:push 完成后第一次 deploy 失败 404("Failed to create deployment"),原因是 GitHub Pages 还没在仓库启用。用 `gh api POST /repos/{owner}/{repo}/pages` API 启用后重试成功。
5. **CRLF 行尾警告**:Windows 默认。GitHub Pages 部署无影响,后续可加 `.gitattributes` 统一为 LF。

### 已删的 demo 数据

- `src/pages/homes/`(4 个文件:saas/startup/mobile-app/personal)
- `src/pages/landing/`(6 个文件:lead-generation/sales/click-through/product/pre-launch/subscription)
- `src/pages/pricing.astro`、`src/pages/services.astro`、`src/pages/contact.astro`
- `src/data/post/` 6 个示例 markdown(.mdx)

### W2 待办(下一轮)

1. **资源导航页**:在 `src/data/post/` 下加入首批 5-10 个 Agent × KG 资源点评(.md 格式)
2. **概念解读第一篇**:GraphRAG 入门 — 写一篇带图解 + 代码片段的深度文章
3. **自定义 404**:把 `src/pages/404.astro` 改为中文友好版
4. **blog 列表 metadata**:把 `[...page].astro` 里的英文 title 改为中文
5. **OG image**:用 `src/assets/images/default.png` 的占位图,后续用 sharp 生成

### 文件结构(W1 状态)

```
agent-kg-hub/
├── .github/workflows/pages.yml        # GitHub Actions 部署
├── .gitignore                         # 忽略 .tmp/.astro/node_modules 等
├── astro.config.ts                    # site + base + tailwind 插件
├── CITATION.cff                       # 学术引用元数据
├── LICENSE                            # MIT
├── package.json                       # agent-kg-hub@0.1.0
├── README.md                          # 中文 README + 徽章
├── tsconfig.json
├── public/                            # 静态资源
├── src/
│   ├── assets/                        # favicons, images
│   ├── components/                    # CustomStyles, Logo, widgets, blog, common, ui
│   ├── config.yaml                    # 站点配置(中文 metadata)
│   ├── data/post/                     # 内容集合(待填充)
│   ├── navigation.ts                  # 中文导航 + Footer
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── about.astro                # 关于(已重写)
│   │   ├── index.astro                # 首页(已重写)
│   │   ├── privacy.md
│   │   ├── rss.xml.ts
│   │   ├── terms.md
│   │   └── [...blog]/                 # blog 动态路由
│   ├── styles/tailwind.css
│   └── utils/
└── vendor/                            # AstroWind 自定义集成
```

### 提交记录

```
696ae2c feat(init): scaffold Agent KG Hub with AstroWind + Tailwind v4
```
