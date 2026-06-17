import { DSA_CATS, svgCover } from './data.js';

export const SHEET_ID = '1W80DTo9J-uznnNxWodWO16PYv423CzvIy9B5Wkzxrdo';
export const sheetCsvUrl = (sheet = 'books') =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted && ch === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (!quoted && ch === ',') {
      row.push(cell);
      cell = '';
    } else if (!quoted && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export function rowsToObjects(rows) {
  const [headers = [], ...body] = rows;
  return body.map((row) => Object.fromEntries(headers.map((header, i) => [header.trim(), row[i]?.trim() ?? ''])));
}

export function domainToCat(domain = '') {
  const value = domain.toLowerCase();
  if (value.includes('展示') || value.includes('ミュージアム')) return 1;
  if (value.includes('企業') || value.includes('メディア')) return 2;
  if (value.includes('アート') || value.includes('サイン')) return 3;
  if (value.includes('舞台') || value.includes('イベント')) return 4;
  if (value.includes('商業') || value.includes('ショップ')) return 5;
  if (value.includes('食') || value.includes('カフェ')) return 6;
  if (value.includes('複合')) return 7;
  if (value.includes('ホテル') || value.includes('サービス')) return 8;
  if (value.includes('文化') || value.includes('交流')) return 9;
  if (value.includes('公共') || value.includes('地域') || value.includes('都市')) return 10;
  if (value.includes('働') || value.includes('ワーク')) return 11;
  return 12;
}

export function openBdCoverUrl(isbn = '') {
  const normalized = String(isbn).replace(/[^0-9Xx]/g, '');
  return normalized ? `https://cover.openbd.jp/${normalized}.jpg` : '';
}

export function openLibraryCoverUrl(isbn = '') {
  const normalized = String(isbn).replace(/[^0-9Xx]/g, '');
  return normalized ? `https://covers.openlibrary.org/b/isbn/${normalized}-L.jpg` : '';
}

export function normalizeSheetBooks(rows) {
  return rows
    .filter((row) => row.title || row.Title || row['書名'])
    .map((row, index) => {
      const title = row.title || row.Title || row['書名'];
      const author = row.author || row.Author || row['著者'] || '—';
      const cat = Number(row.cat || row.categoryId) || domainToCat(row.primaryDomain || row.domain || row['領域']);
      const catInfo = DSA_CATS.find((item) => item.id === cat) || DSA_CATS[11];
      const year = Number.parseInt(row.publishedYear || row.year || row['発行年'], 10) || 2000;
      const cover = row.coverUrl || row.cover || openBdCoverUrl(row.isbn || row.ISBN) || svgCover(title, author, catInfo.group, index);
      return {
        id: index + 1,
        isbn: row.isbn || row.ISBN || '',
        cat: catInfo.id,
        catName: catInfo.name,
        group: catInfo.group,
        year,
        title,
        author,
        pub: row.publisher || row.pub || row['出版社'] || '—',
        concept: row.themes || row.concept || row['テーマ'] || row.primaryDomain || catInfo.name,
        note: row.note || row.description || row['説明'] || `${catInfo.name}を考えるための書籍。`,
        cover,
        links: {
          ndl: row.ndlLink || '',
          info: row.infoLink || '',
        },
      };
    });
}

export function csvToBooks(csv) {
  return normalizeSheetBooks(rowsToObjects(parseCsv(csv)));
}
