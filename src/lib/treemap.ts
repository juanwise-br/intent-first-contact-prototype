export interface TItem {
  key: string;
  value: number;
}

export interface TRect extends TItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Squarified treemap layout (Bruls, Huizing, van Wijk). Returns one rectangle
 * per item, sized in proportion to its value, filling the given area.
 */
export function squarify(items: TItem[], x: number, y: number, w: number, h: number): TRect[] {
  const data = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  if (data.length === 0 || w <= 0 || h <= 0) return [];

  const total = data.reduce((s, i) => s + i.value, 0);
  const scale = (w * h) / total;
  const area = (i: TItem) => i.value * scale;

  const out: TRect[] = [];
  let cx = x;
  let cy = y;
  let cw = w;
  let ch = h;
  let row: TItem[] = [];

  const worst = (r: TItem[], side: number) => {
    const areas = r.map(area);
    const s = areas.reduce((a, b) => a + b, 0);
    const max = Math.max(...areas);
    const min = Math.min(...areas);
    return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min));
  };

  const flush = () => {
    if (row.length === 0) return;
    const s = row.reduce((a, i) => a + area(i), 0);
    if (cw >= ch) {
      const colW = s / ch;
      let yy = cy;
      for (const i of row) {
        const hh = area(i) / colW;
        out.push({ ...i, x: cx, y: yy, w: colW, h: hh });
        yy += hh;
      }
      cx += colW;
      cw -= colW;
    } else {
      const rowH = s / cw;
      let xx = cx;
      for (const i of row) {
        const ww = area(i) / rowH;
        out.push({ ...i, x: xx, y: cy, w: ww, h: rowH });
        xx += ww;
      }
      cy += rowH;
      ch -= rowH;
    }
    row = [];
  };

  for (const item of data) {
    const side = Math.min(cw, ch);
    if (row.length === 0 || worst([...row, item], side) <= worst(row, side)) {
      row.push(item);
    } else {
      flush();
      row.push(item);
    }
  }
  flush();
  return out;
}
