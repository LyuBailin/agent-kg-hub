# Images Pipeline

> 本地图片 (`src/assets/images/`) + frontmatter `image: ~/assets/images/...` + `findImage()` + `Image.astro` 组件 + Astro `getImage()` 优化。

## 数据流概览

```
frontmatter (markdown)            ← image: ~/assets/images/cover-xxx.png
       │
       ▼
findImage(imagePath) [utils]      ← glob 解析 + key 转换
       │                              ↓
       │                        ImageMetadata
       ▼
openGraph.images[] [page]         ← Type: MetaDataImage.url = string | ImageMetadata
       │
       ▼
adaptOpenGraphImages [utils]      ← 调 Astro getImage() 出 1200×626 jpg
       │
       ▼
<Metadata> (astro-seo)           ← 渲染 og:image meta 标签
       │
       ▼
SinglePost.astro (JSON-LD)        ← 接收 ImageMetadata (object form)
```

## 关键文件

- `src/utils/images.ts` — `findImage()` + `adaptOpenGraphImages()`
- `src/components/common/Image.astro` — 包装 `astro:assets` 的 `<Image />` + CDN URL via `unpic`
- `src/components/common/Metadata.astro` — 调 `adaptOpenGraphImages()` 渲染 meta
- `src/components/blog/SinglePost.astro` — 文章页 hero + JSON-LD
- `src/types.d.ts` — `MetaDataImage.url: string | ImageMetadata`

## 命名规范

| 用途 | 模式 | 示例 |
|---|---|---|
| 概念类文章封面 | `cover-concept-{slug}.png` | `cover-concept-react-intro.png` |
| 资源类文章封面 | `cover-resource-{slug}.png` | `cover-resource-langgraph.png` |
| 默认 / 兜底 | `default.png` (1200×628) | config.yaml `openGraph.images[0].url` |
| Favicon | `app-store.png`, `google-play.png`, `hero-image.png` | (历史遗留) |

**zh + en 共用同一张 cover**(文章本体是同一份,翻译不动图)。

## Vite glob 缓存陷阱 ⚠️

**问题**:`import.meta.glob('~/assets/images/...')` 在 build 时确定模块图。**新加的图片**没出现在 glob 结果里,`findImage()` 返回 `null`,hero 仍用 `default.png`。

**原因**:Vite `~/` 别名形式在静态 glob 求值时机不可靠。

**解决**:
- `src/utils/images.ts` 的 glob 改用**相对路径**:`'../assets/images/**/*.{...}'` (从 `src/utils/` 出发)
- key 转换:`imagePath.replace(/^~\//, '../')` (与相对 glob key 对齐)
- 老 `~/` 别名形式已多次踩坑,**相对路径是 canonical**

```typescript
// src/utils/images.ts (canonical)
_localImages = import.meta.glob(
  '../assets/images/**/*.{jpeg,jpg,png,tiff,webp,gif,svg,JPEG,JPG,PNG,TIFF,WEBP,GIF,SVG}'
);
const key = imagePath.replace(/^~\//, '../');
```

**何时需要重新 build**:新增/重命名/删除 `src/assets/images/` 下的文件,一定要 `npm run build`(dev 模式可能缓存,生产 build 才会重新评估 glob)。

## en 端 og:image / JSON-LD 双 bug ⚠️

**问题**:`/en/articles/{slug}/` 的 og:image 走 `src/config.yaml` 的 `default.png`;JSON-LD `image` 是 raw `~/assets/images/...` 路径。

**原因**:`src/pages/en/articles/[...post].astro` 旧版用了:
```typescript
const imageUrl = typeof image === 'string' ? image : '';  // 对 ImageMetadata 永远给空串
shapedPost.image = frontmatter.image;                     // raw string
```

**修复**(W20):直接传 `image` (ImageMetadata) 给 `openGraph.images[0].url` 和 `shapedPost.image`,让 `adaptOpenGraphImages()` 统一优化:

```typescript
const image = (await findImage(frontmatter.image)) as ImageMetadata | string | undefined;

const metadata = merge({
  // ...
  openGraph: {
    type: 'article',
    ...(image
      ? { images: [{ url: image, width: (image as ImageMetadata)?.width, height: (image as ImageMetadata)?.height }] }
      : {}),
  },
}, {}) as MetaData;

const shapedPost: Post = {
  // ...
  image,  // 不是 frontmatter.image
  // ...
};
```

**类型配套**:`src/types.d.ts::MetaDataImage.url` 必须是 `string | ImageMetadata` (W20 拓宽过,不要回退)。

## Image 组件选择

`src/components/common/Image.astro` 自动分流:
- **CDN URL** (Unsplash/Cloudinary/Imgix/Pixabay) → 走 `unpic` 加 query params,**不下载**到本地
- **本地 ImageMetadata** → 走 `astro:assets` 的 `<Image />` 经 Sharp 优化
- **本地 `~/assets/...` 字符串** → 内部 `findImage()` 解析成 ImageMetadata 后同上

`alt` 是**必传** prop,装饰性图片显式 `alt=""`:
```astro
<Image src={post.image} alt="" width={900} height={506} format="webp" />
```

## 调试清单

部署后 cover 不对?按顺序查:

1. `git status` 确认 cover PNG 已 commit + push
2. `gh api repos/LyuBailin/agent-kg-hub/actions/runs?per_page=1` 看 deploy 状态
3. `web_fetch` live URL,grep `og:image` 和 hero `<img src>`
4. 若是 build 不识别新图 → 检查 `findImage()` 用的 glob 是否相对路径
5. 若是 en 端 fallback 到 default → 检查 `[...post].astro` 是否传 `image` 而非 `frontmatter.image`
6. 若是 JSON-LD 路径错 → 同上
