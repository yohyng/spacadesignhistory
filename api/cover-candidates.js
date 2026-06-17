import { openBdCoverUrl, openLibraryCoverUrl } from '../src/sheetSync.js';

const unique = (items) => Array.from(new Map(items.filter((item) => item.url).map((item) => [item.url, item])).values());

async function googleBooksCandidates({ isbn, title, author }) {
  const terms = isbn ? `isbn:${isbn}` : `intitle:${title || ''}+inauthor:${author || ''}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(terms)}&maxResults=5`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const json = await response.json();
  return (json.items || [])
    .map((item) => item.volumeInfo?.imageLinks?.thumbnail || item.volumeInfo?.imageLinks?.smallThumbnail)
    .filter(Boolean)
    .map((url) => ({ source: 'googleBooks', url: url.replace(/^http:/, 'https:'), confidence: isbn ? 0.78 : 0.58 }));
}

async function customSearchCandidates({ title, author }) {
  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CSE_ID || !title) return [];
  const q = `${title} ${author || ''} 書影 表紙`;
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('key', process.env.GOOGLE_API_KEY);
  url.searchParams.set('cx', process.env.GOOGLE_CSE_ID);
  url.searchParams.set('searchType', 'image');
  url.searchParams.set('num', '5');
  url.searchParams.set('q', q);
  const response = await fetch(url);
  if (!response.ok) return [];
  const json = await response.json();
  return (json.items || []).map((item) => ({ source: 'customSearch', url: item.link, title: item.title, confidence: 0.38 }));
}

export default async function handler(req, res) {
  try {
    const isbn = String(req.query?.isbn || '').replace(/[^0-9Xx]/g, '');
    const title = String(req.query?.title || '');
    const author = String(req.query?.author || '');
    const candidates = unique([
      { source: 'openBD', url: openBdCoverUrl(isbn), confidence: 0.95 },
      { source: 'openLibrary', url: openLibraryCoverUrl(isbn), confidence: 0.82 },
      ...(await googleBooksCandidates({ isbn, title, author })),
      ...(await customSearchCandidates({ title, author })),
    ]);
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ ok: true, candidates });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to find cover candidates' });
  }
}
