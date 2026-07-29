import { getPermalink, getBlogPermalink, getAsset } from '~/utils/permalinks';

export const headerDataEn = {
  links: [
    {
      text: 'Resources',
      links: [
        { text: 'Core Projects', href: '/en/category/core-projects/' },
        { text: 'Papers & Surveys', href: '/en/category/papers-and-surveys/' },
        { text: 'Tutorials & Blogs', href: '/en/category/tutorials-and-blogs/' },
        { text: 'Tools & Frameworks', href: '/en/category/tools-and-frameworks/' },
        { text: 'Browse by tag', href: '/en/tag/' },
      ],
    },
    {
      text: 'Concepts',
      links: [
        { text: 'Three Fusion Paradigms', href: '/agent-kg-hub/#paradigms' },
        { text: 'All articles', href: '/en/articles/' },
        { text: 'Core Projects deep-dive', href: '/en/category/core-projects/' },
        { text: 'Getting started', href: '/en/category/getting-started/' },
      ],
    },
    {
      text: 'About',
      links: [
        { text: 'Why this hub', href: getPermalink('/about') },
        { text: 'Contribute', href: 'https://github.com/LyuBailin/agent-kg-hub/blob/main/CONTRIBUTING.md', target: '_blank' },
        { text: 'Terms', href: getPermalink('/terms') },
        { text: 'Privacy', href: getPermalink('/privacy') },
      ],
    },
  ],
  actions: [
    { text: 'Search', href: '/en/search/', icon: 'tabler:search' },
    { text: '中文', href: '/agent-kg-hub/', icon: 'tabler:language' },
    { text: 'GitHub', href: 'https://github.com/LyuBailin/agent-kg-hub', target: '_blank', icon: 'tabler:brand-github' },
  ],
};

export const footerDataEn = {
  links: [
    {
      title: 'Content',
      links: [
        { text: 'Resources', href: '/en/articles/' },
        { text: 'Concepts', href: '/en/articles/' },
        { text: 'All tags', href: '/en/tag/' },
        { text: 'All categories', href: '/en/category/' },
      ],
    },
    {
      title: 'About',
      links: [
        { text: 'Background', href: getPermalink('/about') },
        { text: 'Maintenance', href: getPermalink('/about#maintenance') },
        { text: 'Sources', href: getPermalink('/about#sources') },
        { text: 'License', href: 'https://github.com/LyuBailin/agent-kg-hub/blob/main/LICENSE', target: '_blank' },
      ],
    },
    {
      title: 'Community',
      links: [
        { text: 'GitHub repo', href: 'https://github.com/LyuBailin/agent-kg-hub', target: '_blank' },
        { text: 'Open an issue', href: 'https://github.com/LyuBailin/agent-kg-hub/issues', target: '_blank' },
        { text: 'Contributing', href: 'https://github.com/LyuBailin/agent-kg-hub/blob/main/CONTRIBUTING.md', target: '_blank' },
        { text: 'RSS feed', href: getAsset('/rss.xml') },
      ],
    },
    {
      title: 'Tech',
      links: [
        { text: 'Built with Astro v6', href: 'https://astro.build/', target: '_blank' },
        { text: 'Tailwind CSS v4', href: 'https://tailwindcss.com/', target: '_blank' },
        { text: 'GitHub Pages', href: 'https://pages.github.com/', target: '_blank' },
        { text: 'AstroWind theme', href: 'https://github.com/arthelokyo/astrowind', target: '_blank' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'GitHub', icon: 'tabler:brand-github', href: 'https://github.com/LyuBailin/agent-kg-hub' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `Maintained by <a class="text-primary underline dark:text-muted" href="https://github.com/LyuBailin" target="_blank" rel="noopener">LyuBailin</a> · Built on <a class="text-primary underline dark:text-muted" href="https://github.com/arthelokyo/astrowind" target="_blank" rel="noopener">AstroWind</a> theme · MIT License`,
};

export const announcementEn = {
  badge: 'NEW',
  message: 'Agent KG Hub v0.1.0 is live — recommend resources & contribute »',
};
