# Astro 6 模式与坑

> 在 agent-kg-hub 项目里反复用到的 Astro 6 / Tailwind 4 / Shiki / TypeScript 模式与坑。

## 1. Inline `<script>` 顶层不能用 `return` ⚠️

**问题**:Astro 把 inline `<script>` 包装在 closure 里,顶层 `return` 会触发 Rollup parse error:

```
Build error: Unexpected return statement
```

**错误示例**:
```astro
<script is:inline>
  const el = document.getElementById('foo');
  if (!el) return;  // ❌ 顶层 return
  el.focus();
</script>
```

**正确写法**:
```astro
<script is:inline>
  const el = document.getElementById('foo');
  if (el) {  // 用 if 包块,局部 const 自动窄化
    el.focus();
  }
</script>
```

或者用 `try/catch` / `if (el)` 块代替 early return。

## 2. `import.meta.glob` 别名坑 ⚠️

- `'~/assets/images/...'` 别名形式 **不可靠** — Vite 求值时机可能漏掉新加的文件
- 用**相对路径**:`'../assets/images/**/*.{...}'` (从 `src/utils/` 出发)
- 详见 [references/images-pipeline.md §Vite glob 缓存陷阱](references/images-pipeline.md)

## 3. GoalGrid 导入

`src/components/widgets/GoalGrid.astro` 是 **default export**,不导出 named binding:

```typescript
// ❌ 错误
import { GoalGrid } from '~/components/widgets/GoalGrid.astro';

// ✅ 正确
import GoalGrid from '~/components/widgets/GoalGrid.astro';
import type { Goal } from '~/types';  // type 单独 import
```

## 4. ImageMetadata vs string

`post.image` 可以是 `ImageMetadata` 或 `string` (URL 路径):
- 来自 `import { ImageMetadata }` 的本地图 → `ImageMetadata` 对象
- 来自 `frontmatter.image: '~/assets/...'` → string (需 findImage 解析)
- 来自 `~/public/...` 或 `https://...` → string (直接用)

**消费端 (SinglePost JSON-LD)**:
```typescript
const jsonLD = {
  // ...
  image: post.image || '',  // 直接 JSON.stringify 进去
  // ...
};
```

- `ImageMetadata` → JSON 序列化成对象 `{src, width, height, format}`
- `string` → JSON 序列化成字符串

两种都对,搜引擎/社交平台都接受。优先用 ImageMetadata (它有完整元数据)。

## 5. MetaDataImage 类型

`src/types.d.ts`:
```typescript
export interface MetaDataImage {
  url: string | ImageMetadata;  // W20 拓宽,支持本地图
  width?: number;
  height?: number;
}
```

**不要**改回 `url: string` — 那会强制调用方先 resolve,导致 en 端 ImageMetadata 直接传不进去。

## 6. Shiki 自定义主题 (AA 对比度)

`astro.config.ts`:
```typescript
markdown: {
  shikiConfig: {
    theme: 'css-variables',  // 用 CSS 变量驱动 token 颜色
    wrap: true,
  },
},
```

`src/assets/styles/tailwind.css` 定义 12 个 `--astro-code-*` 变量 (light + dark mode),每个 token 满足 WCAG AA 4.5:1。

- 改 Shiki 颜色:**只改 CSS 变量**,不要换 theme
- 增加语言支持:不需要改 (默认支持所有 Shiki 内置语言)
- 行号/高亮行:走 Shiki `transformerNotationHighlight` 等 (本项目未启用)

## 7. 路由 base path

`astro.config.ts::base = '/agent-kg-hub'` 让 build 出来的链接自带前缀。

**注意**:`Astro.url.pathname` 在 build time **包含** base,例如 `'/agent-kg-hub/concept-react-intro/'`。locale 检测 regex 必须用 segment-boundary:

```typescript
// ✅ segment-boundary
/(^|\/)en(\/|$)/.test(pathname)

// ❌ 简单子串(会误匹配)
pathname.includes('/en/')
```

## 8. 静态构建 + 动态内容

- 整个项目 `output: 'static'`,**无 SSR**
- 所有内容必须 build time 可解析
- 搜索用 **Pagefind** (build time 索引,client side 查)
- 评论用 **Giscus** (client side iframe,GitHub Discussions 后端)
- 不要尝试在 .astro 文件里写 `fetch()` 取动态数据

## 9. Content collections

`src/content.config.ts`:
```typescript
import { defineCollection, z } from 'astro:content';

const post = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/post' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    publishDate: z.coerce.date(),
    // ...
    image: z.string().optional(),  // path string
    // ...
  }),
});

export const collections = { post };
```

**注意**:`image` 字段 schema 是 `z.string()`(路径),**不是** ImageMetadata。Astro content collections 在 schema 阶段不解析图片。

**en 端不走 content collections**:用 `import.meta.glob` 自己加载。详见 [references/i18n.md](references/i18n.md)。

## 10. Prettier + ESLint 一致性

```bash
npm run check   # 三个 check 串行
npm run fix     # autofix eslint + prettier
```

- 写完代码 → `npm run check`
- 出 lint 错 → `npm run fix`
- **CI gate**:0 errors 才能 commit/push

## 11. 常用 import 路径

| 目标 | 写法 |
|---|---|
| 内部 alias | `~/components/...`, `~/utils/...`, `~/types` |
| 相对路径 | `../components/...` (从 src/utils 出发的 import 常用) |
| `astro:assets` | `import { Image } from 'astro:assets'` |
| `astro:content` | `import { getCollection, getEntry } from 'astro:content'` |
| `astro-seo` | `import { SEO } from 'astro-seo'` |
| `astro-icon` | `import { Icon } from 'astro-icon/components'` |

## 12. 调试清单

| 现象 | 检查 |
|---|---|
| Build error: Unexpected return | inline `<script>` 顶层有 `return`?改 `if` 块 |
| 新加图片 build 后不出现 | `findImage()` 用的 glob 是相对路径? |
| `Cannot find module` | alias `~` 路径对吗?Vite config `resolve.alias['~']` 指向 `./src` |
| TypeScript: 'X' is not assignable to type 'Y' | `src/types.d.ts` 的 `MetaDataImage.url` 还是 `string`?应改为 `string \| ImageMetadata` |
| Prettier 一直报警 | `.prettierignore` 是否覆盖手写内容?`npm run fix:prettier` |
