import { API_BASE_URL } from './constants';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function toAbsoluteImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/storage') || url.startsWith('/uploads') || (!url.startsWith('/') && !url.startsWith('.'))) {
    return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
}

export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatChapterNumber = (num) => {
  if (num === undefined || num === null || num === '') return '0';
  const n = Number(num);
  if (Number.isNaN(n)) return String(num);
  return n % 1 === 0 ? String(Math.round(n)) : String(n);
};

export const formatChapterLabel = (num) => `Chapter - ${formatChapterNumber(num)}`;

export const truncate = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
