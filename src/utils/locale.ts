/**
 * Detect locale from URL pathname.
 *
 * Note: `pathname` from `Astro.url` in a sub-path deploy (e.g. GitHub Pages
 * mounted at `/agent-kg-hub`) includes the base path. So we test the segment
 * after stripping any base prefix, plus the raw path with a segment-boundary
 * regex to cover both flat (root domain) and prefixed deployments.
 *
 * Convention: any path whose second segment is `en` (or whose first segment
 * is `en` for root mounts) is treated as English. Everything else is Chinese.
 */
export type Locale = 'zh' | 'en';

export const detectLocale = (pathname: string): Locale => {
  // Segment-boundary match: "/en", "/en/", "/en/anything", also under a base
  // like "/agent-kg-hub/en" or "/agent-kg-hub/en/articles".
  if (/(^|\/)en(\/|$)/.test(pathname)) {
    return 'en';
  }
  return 'zh';
};

/** Canonical BCP 47 tag for the Open Graph `locale` field. */
export const localeToBcp47 = (locale: Locale): string => {
  return locale === 'en' ? 'en_US' : 'zh_CN';
};
