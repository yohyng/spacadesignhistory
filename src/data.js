export const DSA_GROUPS = {
  A: { label: 'みせる・つたえる', en: 'COMMUNICATE', hue: 18 },
  B: { label: 'あきなう・もてなす', en: 'COMMERCE', hue: 152 },
  C: { label: 'いとなむ・くらす', en: 'CIVIC · LIFE', hue: 222 },
};

export const DSA_CATS = [
  { id: 1, name: 'エキシビション・イベント空間', en: 'Exhibition / Event', group: 'A' },
  { id: 2, name: '企業プロモーション空間', en: 'Corporate Promotion', group: 'A' },
  { id: 3, name: 'ショーウインドウ・アート空間', en: 'Show Window / Art', group: 'A' },
  { id: 4, name: 'エンターテインメント空間', en: 'Entertainment', group: 'A' },
  { id: 5, name: 'ショップ空間', en: 'Shop', group: 'B' },
  { id: 6, name: '食空間', en: 'Food', group: 'B' },
  { id: 7, name: '複合商業施設空間', en: 'Commercial Complex', group: 'B' },
  { id: 8, name: 'サービス・ホスピタリティー空間', en: 'Service / Hospitality', group: 'B' },
  { id: 9, name: '文化交流空間', en: 'Cultural Exchange', group: 'C' },
  { id: 10, name: '公共施設・コミュニティー空間', en: 'Public / Community', group: 'C' },
  { id: 11, name: 'ワークプレイス空間', en: 'Workplace', group: 'C' },
  { id: 12, name: '住・生活空間', en: 'Living', group: 'C' },
];

const seeds = ['空間へ','建築をめざして','陰翳礼讃','日本の民家','展示の政治学','ラスベガスから学ぶ','パタン・ランゲージ','街並みの美学','場の思想','都市のイメージ','第三の場所','経験経済','小さな建築','サードプレイス','デザインの生態学','ミュージアムの思想','ショップイメージ','食卓の文化史','ホテル空間論','ワークプレイス戦略','住まいの解剖図鑑','地域を変えるデザイン','公共空間の作法','都市は人間のもの','サインとシンボル','イベントの構法','舞台空間の詩学','企業ミュージアム','商業空間は何を語るか','カフェという場','複合施設の計画','サービスデザイン','図書館空間','コミュニティデザイン','働く場の未来','暮らしの民藝','ディスプレイデザイン','メディアとしての建築','ランドスケープと公共性','観光とまなざし','ユニバーサルデザイン','空間の経験','問いのデザイン','まちの居場所','展示デザイン講義','商店建築アーカイブ','食と建築','余白のデザイン','身体と空間','空間デザイン年鑑'];

export const svgCover = (title, author, group, i = 0) => {
  const hue = DSA_GROUPS[group]?.hue ?? DSA_GROUPS.C.hue;
  const short = String(title || 'Untitled').slice(0, 10);
  const au = String(author || '—').slice(0, 9);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='420' viewBox='0 0 300 420'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='hsl(${hue} 62% 72%)'/><stop offset='1' stop-color='hsl(${hue} 56% 34%)'/></linearGradient></defs><rect width='300' height='420' fill='url(#g)'/><rect width='34' height='420' fill='rgba(0,0,0,.2)'/><rect x='54' y='46' width='192' height='2' fill='rgba(255,255,255,.55)'/><text x='54' y='118' fill='white' font-size='32' font-family='serif' font-weight='700'>${short}</text><text x='54' y='354' fill='rgba(255,255,255,.82)' font-size='20' font-family='monospace'>${au}</text><text x='54' y='386' fill='rgba(255,255,255,.62)' font-size='15' font-family='monospace'>BOOK ${String(i + 1).padStart(3, '0')}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const BOOKS = seeds.map((title, i) => {
  const cat = (i % 12) + 1;
  const c = DSA_CATS[cat - 1];
  const author = ['柳宗悦', 'R.ヴェンチューリ 他', 'C.アレグザンダー', '芦原義信', 'J.ゲール'][i % 5];
  return {
    id: i + 1,
    cat,
    catName: c.name,
    group: c.group,
    year: 1820 + (i * 4) % 205,
    title,
    author,
    pub: ['鹿島出版会', '彰国社', '美術出版社', 'TOTO出版', '—'][i % 5],
    concept: ['記号', '身体', '場', '余白', '経験'][i % 5],
    cover: svgCover(title, author, c.group, i),
    note: `${c.name}を考えるための視点を、歴史・体験・社会との関係から読み解くためのシード書籍。`,
  };
});

export const YEAR_BOUNDS = { min: 1820, max: 2028 };
export const groupColor = (g, l = 50, s = 58) => `hsl(${DSA_GROUPS[g].hue} ${s}% ${l}%)`;
