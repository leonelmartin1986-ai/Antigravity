/*
 * Crucigramas: arma una grilla chica cruzando palabras que ya viste.
 * Sin DOM, así se puede testear con Node. La pista de cada palabra es su significado en castellano.
 */
(function (root) {
  function emptyGrid(n) {
    return Array.from({ length: n }, () => new Array(n).fill(null));
  }

  // ¿Se puede poner la palabra en (r, c) hacia dir sin tocar otras palabras de costado?
  function fits(grid, word, r, c, dir) {
    const n = grid.length;
    const dr = dir === "down" ? 1 : 0, dc = dir === "across" ? 1 : 0;
    const er = r + dr * (word.length - 1), ec = c + dc * (word.length - 1);
    if (r < 0 || c < 0 || er >= n || ec >= n) return 0;
    const at = (y, x) => (y >= 0 && x >= 0 && y < n && x < n ? grid[y][x] : null);
    if (at(r - dr, c - dc) || at(er + dr, ec + dc)) return 0;
    let crosses = 0;
    for (let i = 0; i < word.length; i++) {
      const y = r + dr * i, x = c + dc * i;
      const cell = grid[y][x];
      if (cell) {
        if (cell.ch !== word[i] || cell[dir]) return 0;
        crosses++;
      } else if (at(y - dc, x - dr) || at(y + dc, x + dr)) return 0;
    }
    return crosses;
  }

  function put(grid, word, r, c, dir) {
    const dr = dir === "down" ? 1 : 0, dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < word.length; i++) {
      const y = r + dr * i, x = c + dc * i;
      if (!grid[y][x]) grid[y][x] = { ch: word[i], across: false, down: false };
      grid[y][x][dir] = true;
    }
  }

  function attempt(entries, rnd, size, target) {
    const grid = emptyGrid(size);
    const placed = [];
    const pool = entries.slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    // La primera palabra va al medio, horizontal: conviene que sea larga para tener dónde cruzar.
    const first = pool.slice(0, 12).sort((a, b) => b.answer.length - a.answer.length)[0];
    if (!first || first.answer.length > size) return { grid, placed };
    pool.splice(pool.indexOf(first), 1);
    const r0 = Math.floor(size / 2), c0 = Math.floor((size - first.answer.length) / 2);
    put(grid, first.answer, r0, c0, "across");
    placed.push({ entry: first, row: r0, col: c0, dir: "across" });
    for (const e of pool) {
      if (placed.length >= target) break;
      const options = [];
      placed.forEach(p => {
        const dir = p.dir === "across" ? "down" : "across";
        for (let i = 0; i < p.entry.answer.length; i++) {
          for (let k = 0; k < e.answer.length; k++) {
            if (p.entry.answer[i] !== e.answer[k]) continue;
            const y = p.dir === "across" ? p.row - k : p.row + i;
            const x = p.dir === "across" ? p.col + i : p.col - k;
            const crosses = fits(grid, e.answer, y, x, dir);
            if (crosses) options.push({ row: y, col: x, dir, crosses });
          }
        }
      });
      if (!options.length) continue;
      options.sort((a, b) => b.crosses - a.crosses);
      const best = options.filter(o => o.crosses === options[0].crosses);
      const o = best[Math.floor(rnd() * best.length)];
      put(grid, e.answer, o.row, o.col, o.dir);
      placed.push({ entry: e, row: o.row, col: o.col, dir: o.dir });
    }
    return { grid, placed };
  }

  /*
   * entries: [{ answer: "INVOICE", clue: "factura", w: "invoice" }]. Devuelve la grilla y las palabras
   * numeradas como en un crucigrama de diario (de izquierda a derecha y de arriba abajo).
   */
  function generate(entries, rnd, opts) {
    opts = opts || {};
    const size = opts.size || 9, target = opts.words || 7;
    const seen = new Set();
    const clean = entries.filter(e => /^[A-Z]{3,}$/.test(e.answer) && e.answer.length <= size && !seen.has(e.answer) && seen.add(e.answer));
    let best = null;
    for (let t = 0; t < (opts.tries || 40); t++) {
      const res = attempt(clean, rnd, size, target);
      if (!best || res.placed.length > best.placed.length) best = res;
      if (best.placed.length >= target) break;
    }
    if (!best || best.placed.length < 2) return null;
    const starts = {};
    let num = 0;
    best.placed.slice().sort((a, b) => a.row - b.row || a.col - b.col).forEach(p => {
      const k = p.row + "," + p.col;
      if (!starts[k]) starts[k] = ++num;
      p.num = starts[k];
    });
    const words = best.placed.map(p => ({ num: p.num, dir: p.dir, row: p.row, col: p.col, answer: p.entry.answer, clue: p.entry.clue, w: p.entry.w, tag: p.entry.tag || "" }))
      .sort((a, b) => a.num - b.num || (a.dir === "across" ? -1 : 1));
    return { size, words, cells: best.grid.map(row => row.map(c => (c ? c.ch : null))), nums: starts };
  }

  function cellsOf(word) {
    const out = [];
    for (let i = 0; i < word.answer.length; i++) out.push([word.row + (word.dir === "down" ? i : 0), word.col + (word.dir === "across" ? i : 0)]);
    return out;
  }

  const Crossword = { generate, cellsOf };
  if (typeof module !== "undefined" && module.exports) module.exports = Crossword;
  else root.Crossword = Crossword;
})(typeof window !== "undefined" ? window : globalThis);
