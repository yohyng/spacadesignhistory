import { csvToBooks, sheetCsvUrl } from '../src/sheetSync.js';

export default async function handler(req, res) {
  try {
    const sheet = req.query?.sheet || 'books';
    const response = await fetch(sheetCsvUrl(sheet));
    if (!response.ok) throw new Error(`Google Sheets responded with ${response.status}`);
    const csv = await response.text();
    const books = csvToBooks(csv);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({ ok: true, count: books.length, syncedAt: new Date().toISOString(), books });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to sync books' });
  }
}
