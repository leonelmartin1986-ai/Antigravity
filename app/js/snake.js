/*
 * Viborita de letras: la víbora come las letras en orden para formar la palabra pedida.
 * Lógica y dibujo en un canvas. Las paredes no matan (se cruza al otro lado);
 * comer una letra equivocada o chocarse con la cola cuesta una vida.
 */
(function (root) {
  const COLS = 12, ROWS = 14;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const OPP = { up: "down", down: "up", left: "right", right: "left" };
  const ALPHA = "abcdefghijklmnopqrstuvwxyz";

  function createGame(canvas, cfg) {
    const ctx = canvas.getContext("2d");
    const st = {
      snake: [], dir: "right", queue: [], letters: [], target: null, idx: 0,
      score: 0, lives: 3, words: [], speed: 260, timer: 0, running: false, over: false,
      flash: 0, flashColor: null, invuln: 0, rnd: cfg.rnd || Math.random
    };

    function colors() {
      const cs = getComputedStyle(document.documentElement);
      const v = n => cs.getPropertyValue(n).trim();
      return { bg: v("--surface"), grid: v("--line"), snake: v("--accent"), head: v("--ink"), letter: v("--memo"), letterInk: v("--memo-ink"), ok: v("--ok"), ko: v("--ko"), ink: v("--ink") };
    }

    function size() {
      const w = canvas.clientWidth || 320;
      const cell = Math.floor(w / COLS);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cell * COLS * dpr;
      canvas.height = cell * ROWS * dpr;
      canvas.style.height = cell * ROWS + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.cell = cell;
    }

    function occupied(x, y) {
      return st.snake.some(p => p.x === x && p.y === y) || st.letters.some(l => l.x === x && l.y === y);
    }

    function freeCell() {
      const head = st.snake[0];
      for (let i = 0; i < 400; i++) {
        const x = Math.floor(st.rnd() * COLS), y = Math.floor(st.rnd() * ROWS);
        const near = head && Math.abs(head.x - x) + Math.abs(head.y - y) < 3;
        if (!occupied(x, y) && !near) return { x, y };
      }
      return { x: 0, y: 0 };
    }

    function spawnLetters() {
      st.letters = [];
      const need = st.target.answer[st.idx];
      const decoys = new Set();
      // Trampas: la letra que sigue (para no adelantarse) y letras al azar.
      const after = st.target.answer[st.idx + 1];
      if (after && after !== need) decoys.add(after);
      while (decoys.size < 3) {
        const c = ALPHA[Math.floor(st.rnd() * 26)];
        if (c !== need) decoys.add(c);
      }
      st.letters.push(Object.assign(freeCell(), { ch: need, good: true }));
      decoys.forEach(ch => st.letters.push(Object.assign(freeCell(), { ch, good: false })));
    }

    function nextTarget() {
      st.target = cfg.nextPrompt();
      st.idx = 0;
      spawnLetters();
      cfg.onProgress && cfg.onProgress(st);
    }

    function reset() {
      const y = Math.floor(ROWS / 2);
      st.snake = [{ x: 4, y }, { x: 3, y }, { x: 2, y }];
      st.dir = "right"; st.queue = [];
      st.score = 0; st.lives = 3; st.words = []; st.speed = 260; st.over = false; st.invuln = 0;
      nextTarget();
    }

    function turn(d) {
      const last = st.queue.length ? st.queue[st.queue.length - 1] : st.dir;
      if (d === last || d === OPP[last] || st.queue.length >= 2) return;
      st.queue.push(d);
      if (!st.running && !st.over) start();
    }

    function hurt(color) {
      st.lives--;
      st.flash = 6; st.flashColor = color;
      st.invuln = 4;
      cfg.onHurt && cfg.onHurt(st);
      if (st.lives <= 0) end();
    }

    function step() {
      if (st.queue.length) st.dir = st.queue.shift();
      const [dx, dy] = DIRS[st.dir];
      const head = st.snake[0];
      const nh = { x: (head.x + dx + COLS) % COLS, y: (head.y + dy + ROWS) % ROWS };
      if (st.invuln > 0) st.invuln--;
      if (st.invuln === 0 && st.snake.slice(0, -1).some(p => p.x === nh.x && p.y === nh.y)) {
        // Choque con la cola: pierde una vida y la víbora vuelve a ser corta.
        st.snake = st.snake.slice(0, 3);
        hurt("ko");
        if (st.over) return;
      }
      st.snake.unshift(nh);
      const li = st.letters.findIndex(l => l.x === nh.x && l.y === nh.y);
      let grow = false;
      if (li >= 0) {
        const l = st.letters[li];
        if (l.good) {
          st.idx++; st.score += 5; grow = true;
          cfg.onLetter && cfg.onLetter(st, l.ch);
          if (st.idx >= st.target.answer.length) {
            st.score += 10 + st.target.answer.length;
            st.words.push(st.target);
            st.speed = Math.max(120, st.speed - 12);
            st.flash = 6; st.flashColor = "ok";
            cfg.onWord && cfg.onWord(st, st.target);
            nextTarget();
            restartTimer();
          } else { spawnLetters(); cfg.onProgress && cfg.onProgress(st); }
        } else {
          st.letters.splice(li, 1);
          hurt("ko");
          if (!st.over) spawnLetters();
        }
      }
      if (!grow) st.snake.pop();
      draw();
    }

    function draw() {
      const c = colors(), cell = st.cell;
      const W = cell * COLS, H = cell * ROWS;
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = c.grid;
      for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
        ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.arc(x * cell + cell / 2, y * cell + cell / 2, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // letras
      ctx.font = "700 " + Math.round(cell * 0.62) + "px Fredoka, ui-rounded, system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      st.letters.forEach(l => {
        ctx.fillStyle = c.letter;
        roundRect(l.x * cell + 2, l.y * cell + 2, cell - 4, cell - 4, cell * 0.3); ctx.fill();
        ctx.fillStyle = c.letterInk;
        ctx.fillText(l.ch.toUpperCase(), l.x * cell + cell / 2, l.y * cell + cell / 2 + 1);
      });
      // víbora
      st.snake.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? c.head : c.snake;
        ctx.globalAlpha = st.invuln > 0 && i > 0 ? 0.5 : 1 - Math.min(0.45, i * 0.025);
        roundRect(p.x * cell + 1.5, p.y * cell + 1.5, cell - 3, cell - 3, cell * (i === 0 ? 0.38 : 0.28)); ctx.fill();
      });
      ctx.globalAlpha = 1;
      const h = st.snake[0];
      if (h) {
        ctx.fillStyle = c.bg;
        const [dx, dy] = DIRS[st.dir];
        const cx = h.x * cell + cell / 2, cy = h.y * cell + cell / 2;
        [[-1, 1]].forEach(() => {
          const ox = dy !== 0 ? cell * 0.18 : 0, oy = dx !== 0 ? cell * 0.18 : 0;
          ctx.beginPath(); ctx.arc(cx + dx * cell * 0.15 + ox, cy + dy * cell * 0.15 + oy, cell * 0.09, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + dx * cell * 0.15 - ox, cy + dy * cell * 0.15 - oy, cell * 0.09, 0, Math.PI * 2); ctx.fill();
        });
      }
      if (st.flash > 0) {
        ctx.strokeStyle = st.flashColor === "ok" ? c.ok : c.ko;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, W - 6, H - 6);
        st.flash--;
      }
      if (!st.running && !st.over) {
        ctx.fillStyle = c.ink;
        ctx.globalAlpha = 0.75;
        ctx.font = "600 " + Math.round(cell * 0.55) + "px Fredoka, ui-rounded, system-ui, sans-serif";
        ctx.fillText("Deslizá para empezar", W / 2, H / 2);
        ctx.globalAlpha = 1;
      }
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function restartTimer() {
      clearInterval(st.timer);
      if (st.running) st.timer = setInterval(step, st.speed);
    }
    function start() { if (st.over) return; st.running = true; restartTimer(); }
    function pause() { st.running = false; clearInterval(st.timer); draw(); }
    function end() {
      st.running = false; st.over = true; clearInterval(st.timer);
      cfg.onEnd && cfg.onEnd(st);
    }

    // Controles: deslizar el dedo y flechas del teclado.
    let t0 = null;
    canvas.addEventListener("touchstart", e => { const t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY }; }, { passive: true });
    canvas.addEventListener("touchmove", e => {
      if (!t0) return;
      const t = e.touches[0], dx = t.clientX - t0.x, dy = t.clientY - t0.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 22) {
        turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
        t0 = { x: t.clientX, y: t.clientY };
      }
      e.preventDefault();
    }, { passive: false });
    canvas.addEventListener("touchend", () => { t0 = null; });
    // Con mouse: tocar a un costado de la cabeza también gira.
    canvas.addEventListener("mousedown", e => {
      const r = canvas.getBoundingClientRect(), h = st.snake[0];
      const dx = e.clientX - r.left - (h.x + 0.5) * st.cell, dy = e.clientY - r.top - (h.y + 0.5) * st.cell;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    });
    function onKey(e) {
      const k = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" }[e.key];
      if (k && cfg.isActive()) { e.preventDefault(); turn(k); }
      if (e.key === " " && cfg.isActive()) { e.preventDefault(); st.running ? pause() : start(); }
    }
    document.addEventListener("keydown", onKey);

    size();
    reset();
    draw();
    if (typeof window !== "undefined") window.__snakeState = st; // para pruebas automáticas
    return {
      state: st, start, pause, turn, draw,
      restart() { clearInterval(st.timer); st.running = false; reset(); draw(); },
      resize() { size(); draw(); }
    };
  }

  root.Snake = { createGame, COLS, ROWS };
})(typeof window !== "undefined" ? window : globalThis);
