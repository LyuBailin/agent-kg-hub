import type { Locale } from '~/utils/locale';
import { detectLocale } from '~/utils/locale';
import { headerDataZh, footerDataZh, announcementZh } from './zh';
import { headerDataEn, footerDataEn, announcementEn } from './en';

export const getHeaderData = (pathname: string) => (detectLocale(pathname) === 'en' ? headerDataEn : headerDataZh);

export const getFooterData = (pathname: string) => (detectLocale(pathname) === 'en' ? footerDataEn : footerDataZh);

export const getAnnouncement = (pathname: string) =>
  detectLocale(pathname) === 'en' ? announcementEn : announcementZh;

export type { Locale };
