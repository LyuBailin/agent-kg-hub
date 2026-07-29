import type { Post } from '~/types';
import { cleanSlug } from '~/utils/permalinks';

/**
 * Load all English posts from src/data/post-en/*.md via Vite's import.meta.glob.
 * Returns a normalized list shaped like the default `post` collection, but without
 * the Astro `Content` factory (English post pages use their own loader).
 */
const enPostModules = import.meta.glob('../data/post-en/*.md', { eager: true });

const rawEnPosts: Post[] = Object.entries(enPostModules)
  .map(([path, mod]: [string, any]) => {
    const slug = cleanSlug(path.split('/').pop()!.replace('.md', ''));
    const fm = mod.frontmatter || {};
    const categoryTitle = fm.category as string | undefined;
    return {
      id: slug,
      slug,
      permalink: `/en/articles/${slug}/`,
      title: fm.title || 'Untitled',
      excerpt: fm.excerpt || '',
      publishDate: new Date(fm.publishDate),
      updateDate: fm.updateDate ? new Date(fm.updateDate) : undefined,
      image: fm.image,
      category: categoryTitle
        ? { slug: cleanSlug(categoryTitle), title: categoryTitle }
        : undefined,
      tags: Array.isArray(fm.tags)
        ? fm.tags.map((t: string) => ({ slug: cleanSlug(t), title: t }))
        : [],
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
