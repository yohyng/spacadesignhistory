import { BOOKS, DSA_CATS, YEAR_BOUNDS } from './data.js';

export const PX_PER_YEAR = 38;
export const CARD_W = 188;
export const SUB_H = 62;
export const LANE_PAD = 12;
export const LABEL_W = 184;
export const AXIS_H = 56;
export const GROUP_GAP = 30;
export const SCALE_MIN = 0.3;
export const SCALE_MAX = 3.6;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const baseX = (y) => (y - YEAR_BOUNDS.min) * PX_PER_YEAR + 40;

export function zoomAt(view, cx, cy, factor) {
  const ns = clamp(view.s * factor, SCALE_MIN, SCALE_MAX);
  const k = ns / view.s;
  return { ...view, s: ns, tx: cx - (cx - view.tx) * k, ty: cy - (cy - view.ty) * k };
}

export function layoutBooks(books = BOOKS) {
  let y = 20;
  const lanes = [];
  for (const cat of DSA_CATS) {
    const laneBooks = books
      .filter((book) => book.cat === cat.id)
      .sort((a, b) => a.year - b.year)
      .map((book) => ({ ...book }));
    const ends = [];
    for (const book of laneBooks) {
      const x = baseX(book.year);
      let sub = ends.findIndex((end) => x > end + 10);
      if (sub < 0) {
        sub = ends.length;
        ends.push(-Infinity);
      }
      ends[sub] = x + CARD_W;
      book._x = x;
      book._sub = sub;
    }
    const h = Math.max(1, ends.length) * SUB_H + LANE_PAD * 2;
    lanes.push({ cat, y, h, books: laneBooks });
    y += h + (cat.id % 4 === 0 ? GROUP_GAP : 0);
  }
  return { lanes, height: y, width: baseX(YEAR_BOUNDS.max) + CARD_W + 80 };
}
