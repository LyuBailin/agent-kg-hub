import { getPermalink, getBlogPermalink, getAsset } from '~/utils/permalinks';

export const headerDataZh = {
  links: [
    {
      text: '资源导航',
      links: [
        { text: '核心项目', href: getPermalink('/category/projects') },
        { text: '论文综述', href: getPermalink('/category/papers') },
        { text: '教程与博客', href: getPermalink('/category/tutorials') },
        { text: '工具与框架', href: getPermalink('/category/tools') },
        { text: '按标签浏览', href: getPermalink('/tag') },
      ],
    },
    {
      text: '概念解读',
      links: [
        { text: '学习路径', href: getPermalink('/learning-path') },
        { text: '三大融合范式', href: getPermalink('/#paradigms') },
        { text: '全部文章', href: getBlogPermalink() },
        { text: '核心项目深度', href: getPermalink('/category/projects') },
        { text: '入门路径', href: getPermalink('/category/getting-started') },
      ],
    },
    {
      text: '关于',
      links: [
        { text: '为什么做这个仓库', href: getPermalink('/about') },
        { text: '参与贡献', href: 'https://github.com/LyuBailin/agent-kg-hub/blob/main/CONTRIBUTING.md', target: '_blank' },
        { text: '使用条款', href: getPermalink('/terms') },
        { text: '隐私政策', href: getPermalink('/privacy') },
      ],
    },
  ],
  actions: [
    { text: '搜索', href: getPermalink('/search'), icon: 'tabler:search' },
    { text: 'EN', href: '/agent-kg-hub/en/', icon: 'tabler:language' },
    { text: 'GitHub', href: 'https://github.com/LyuBailin/agent-kg-hub', target: '_blank', icon: 'tabler:brand-github' },
  ],
};

export const footerDataZh = {
  links: [
    {
      title: '内容',
      links: [
        { text: '资源导航', href: getBlogPermalink() },
        { text: '概念解读', href: getBlogPermalink() },
        { text: '全部标签', href: getPermalink('/tag') },
        { text: '全部分类', href: getPermalink('/category') },
      ],
    },
    {
      title: '关于',
      links: [
        { text: '项目背景', href: getPermalink('/about') },
        { text: '维护节奏', href: getPermalink('/about#maintenance') },
        { text: '参考来源', href: getPermalink('/about#sources') },
        { text: '许可协议', href: 'https://github.com/LyuBailin/agent-kg-hub/blob/main/LICENSE', target: '_blank' },
      ],
    },
    {
      title: '社区',
      links: [
        { text: 'GitHub 仓库', href: 'https://github.com/LyuBailin/agent-kg-hub', target: '_blank' },
        { text: '提交 Issue', href: 'https://github.com/LyuBailin/agent-kg-hub/issues', target: '_blank' },
        { text: '贡献指南', href: 'https://github.com/LyuBailin/agent-kg-hub/blob/main/CONTRIBUTING.md', target: '_blank' },
        { text: 'RSS 订阅', href: getAsset('/rss.xml') },
      ],
    },
    {
      title: '技术',
      links: [
        { text: '基于 Astro v6', href: 'https://astro.build/', target: '_blank' },
        { text: 'Tailwind CSS v4', href: 'https://tailwindcss.com/', target: '_blank' },
        { text: 'GitHub Pages', href: 'https://pages.github.com/', target: '_blank' },
        { text: 'AstroWind 主题', href: 'https://github.com/arthelokyo/astrowind', target: '_blank' },
      ],
    },
  ],
  secondaryLinks: [
    { text: '使用条款', href: getPermalink('/terms') },
    { text: '隐私政策', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'GitHub', icon: 'tabler:brand-github', href: 'https://github.com/LyuBailin/agent-kg-hub' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `由 <a class="text-primary underline dark:text-muted" href="https://github.com/LyuBailin" target="_blank" rel="noopener">LyuBailin</a> 维护 · 基于 <a class="text-primary underline dark:text-muted" href="https://github.com/arthelokyo/astrowind" target="_blank" rel="noopener">AstroWind</a> 主题 · MIT 协议`,
};

export const announcementZh = {
  badge: 'NEW',
  message: 'Agent KG Hub v0.1.0 已上线 - 欢迎推荐资源与投稿 »',
};
