import type { Post } from '~/types';
import { cleanSlug } from '~/utils/permalinks';

/**
 * Shape of a single English post module after `import.meta.glob({ eager: true })`.
 * Mirrors the frontmatter fields actually used by this loader — keep it narrow
 * so `fm.*` reads stay type-safe and the `fm.tags.map(...)` call site keeps its
 * inferred `string` element type.
 */
interface EnPostFrontmatter {
  title?: string;
  excerpt?: string;
  publishDate?: string | Date;
  updateDate?: string | Date;
  image?: string;
  category?: string;
  tags?: string[];
  author?: string;
}

/** Default shape for missing frontmatter — every field optional, no required keys. */
const EMPTY_FRONT: EnPostFrontmatter = {};

interface EnPostModule {
  frontmatter?: EnPostFrontmatter;
}

/**
 * Load all English posts from src/data/post-en/*.md via Vite's import.meta.glob.
 * Returns a normalized list shaped like the default `post` collection, but without
 * the Astro `Content` factory (English post pages use their own loader).
 */
const enPostModules = import.meta.glob<EnPostModule>('../data/post-en/*.md', { eager: true });

const rawEnPosts: Post[] = Object.entries(enPostModules)
  .map(([path, mod]) => {
    const slug = cleanSlug(path.split('/').pop()!.replace('.md', ''));
    // TypeScript collapses `EnPostFrontmatter | {}` to `{}` when all fields are
    // optional, so anchor the default to the same interface explicitly.
    const fm: EnPostFrontmatter = mod.frontmatter || EMPTY_FRONT;
    const categoryTitle = fm.category;
    return {
      id: slug,
      slug,
      permalink: `/en/articles/${slug}/`,
      title: fm.title || 'Untitled',
      excerpt: fm.excerpt || '',
      publishDate: new Date(fm.publishDate ?? 0),
      updateDate: fm.updateDate ? new Date(fm.updateDate) : undefined,
      image: fm.image,
      category: categoryTitle ? { slug: cleanSlug(categoryTitle), title: categoryTitle } : undefined,
      tags: Array.isArray(fm.tags) ? fm.tags.map((t) => ({ slug: cleanSlug(t), title: t })) : [],
      author: fm.author || 'LyuBailin',
    };
  })
  .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

let _cached: Post[] | null = null;

/**
 * Cached accessor for the English post list.
 * Returns the array shaped like `Post[]` from the default `post` collection.
 */
export const fetchEnPosts = (): Post[] => {
  if (!_cached) {
    _cached = rawEnPosts;
  }
  return _cached;
};
