// Мини-версия evo-brain-sim для шапки: растения, травоядные, хищники на торе.
// Упрощённая витрина, не сама модель.
(function () {
  const cv = document.getElementById("world");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CELL = 10;
  let W, H, plant, fert, herbs, preds, t = 0;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let C = {};
  const readColors = () => { C = { bg: css("--bg-elevated"), plant: css("--plant"), herb: css("--earth"), pred: css("--accent") }; };

  function size() {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    W = Math.max(8, Math.floor(r.width / CELL)); H = Math.max(8, Math.floor(r.height / CELL));
    plant = new Float32Array(W * H); fert = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) plant[i] = Math.random() * 0.6;
    const n = Math.round(W * H / 70);
    herbs = Array.from({ length: n }, spawn); preds = Array.from({ length: Math.round(n / 6) }, spawn);
  }
  const spawn = () => ({ x: Math.random() * W | 0, y: Math.random() * H | 0, e: 0.6 + Math.random() * 0.4 });
  const wrap = (v, m) => (v + m) % m;
  const idx = (x, y) => wrap(y, H) * W + wrap(x, W);

  function climate() {
    // зоны плодородия медленно «переезжают» — как ручка VOLATILITY
    const p = t * 0.004;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
      fert[y * W + x] = 0.5 + 0.5 * Math.sin(x * 0.13 + p) * Math.cos(y * 0.11 - p * 0.7);
  }

  function step() {
    t++; if (t % 4 === 0) climate();
    for (let i = 0; i < W * H; i++) plant[i] = Math.min(1, plant[i] + 0.012 * fert[i]);
    const occ = new Map();
    // травоядные: идут к соседней клетке с наибольшим запасом растений
    const nh = [];
    for (const a of herbs) {
      let bx = a.x, by = a.y, best = plant[idx(a.x, a.y)] + Math.random() * 0.05;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const v = plant[idx(a.x + dx, a.y + dy)] + Math.random() * 0.05;
        if (v > best) { best = v; bx = a.x + dx; by = a.y + dy; }
      }
      a.x = wrap(bx, W); a.y = wrap(by, H);
      const i = idx(a.x, a.y), bite = Math.min(plant[i], 0.35);
      plant[i] = Math.max(0.05, plant[i] - bite); a.e += bite * 0.8 - 0.045;
      if (a.e > 1.4 && herbs.length + nh.length < W * H / 26) { a.e /= 2; nh.push({ x: a.x, y: a.y, e: a.e }); }
      if (a.e > 0) occ.set(i, a);
    }
    herbs = herbs.filter((a) => a.e > 0).concat(nh);
    // хищники: случайное блуждание с уклоном к добыче рядом
    const np = [];
    for (const p of preds) {
      let tx = 0, ty = 0, found = false;
      for (let dy = -3; dy <= 3 && !found; dy++) for (let dx = -3; dx <= 3; dx++)
        if (occ.has(idx(p.x + dx, p.y + dy))) { tx = Math.sign(dx); ty = Math.sign(dy); found = true; break; }
      if (!found) { const r = Math.random() * 4 | 0; tx = [1,-1,0,0][r]; ty = [0,0,1,-1][r]; }
      p.x = wrap(p.x + tx, W); p.y = wrap(p.y + ty, H); p.e -= 0.022;
      const prey = occ.get(idx(p.x, p.y));
      if (prey && prey.e > 0) { p.e += 0.5; prey.e = 0; occ.delete(idx(p.x, p.y)); }
      if (p.e > 1.5) { p.e /= 2; np.push({ x: p.x, y: p.y, e: p.e }); }
    }
    preds = preds.filter((p) => p.e > 0).concat(np);
    herbs = herbs.filter((a) => a.e > 0);
    // страховка от вымирания, чтобы витрина жила
    if (herbs.length < 8) for (let k = 0; k < 10; k++) herbs.push(spawn());
    if (preds.length < 3) for (let k = 0; k < 3; k++) preds.push(spawn());
  }

  function draw() {
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W * CELL + CELL, H * CELL + CELL);
    ctx.fillStyle = C.plant;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = plant[y * W + x]; if (v < 0.08) continue;
      ctx.globalAlpha = Math.min(0.9, v);
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    }
    ctx.globalAlpha = 1;
    // агенты — квадратные пиксели размером с клетку, без прозрачности (растения — полупрозрачные)
    const px = (a, col) => { ctx.fillStyle = col; ctx.fillRect(a.x * CELL, a.y * CELL, CELL, CELL); };
    for (const a of herbs) px(a, C.herb);
    for (const p of preds) px(p, C.pred);
  }

  let last = 0, raf;
  function loop(ts) { if (ts - last > 90) { step(); draw(); last = ts; } raf = requestAnimationFrame(loop); }

  readColors(); size(); climate();
  if (reduce) { for (let i = 0; i < 120; i++) step(); draw(); }
  else {
    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(loop); });
  }
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { size(); climate(); draw(); }, 200); });
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { readColors(); draw(); });
})();
