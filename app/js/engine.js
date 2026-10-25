/*
 * Motor del juego: repetición espaciada (cajas de Leitner), armado de preguntas,
 * puntos, vidas, racha y logros. No toca el DOM, así se puede testear con Node.
 */
(function (root) {
  const DAY = 86400000;
  // Días hasta el próximo repaso según la caja (0 = nueva). Intervalos expansivos.
  const INTERVALS = [0, 1, 2, 4, 7, 15, 30, 60];
  const MAX_BOX = INTERVALS.length - 1;
  const LEARNED_BOX = 4;   // desde aquí la palabra cuenta como "aprendida"
  const MAX_LIVES = 5;
  const LIFE_REGEN_MS = 30 * 60000;
  const ROUND_SIZE = 8;

  const FORM_LABELS = {
    v: ["base", "3ª persona (he/she/it)", "pasado", "participio", "gerundio (-ing)"],
    pron: ["sujeto", "objeto", "posesivo", "pronombre posesivo", "reflexivo"],
    n: ["singular", "plural"],
    adj: ["base", "comparativo", "superlativo"],
    adv: ["base", "comparativo", "superlativo"],
    det: ["singular", "plural"]
  };

  const TENSES = [
    { id: "present", es: "Presente simple", hint: "rutina, todos los días" },
    { id: "past", es: "Pasado simple", hint: "ayer, terminado" },
    { id: "perfect", es: "Presente perfecto", hint: "alguna vez, hasta hoy" },
    { id: "continuous", es: "Presente continuo", hint: "ahora mismo" },
    { id: "future", es: "Futuro", hint: "mañana" }
  ];

  const SUBJECTS = ["I", "You", "He", "She", "We", "They"];
  const THIRD = { he: 1, she: 1, it: 1 };

  const BADGES = [
    { id: "first", name: "Primera palabra", desc: "Aprendiste tu primera palabra nueva.", test: s => s.stats.introduced >= 1 },
    { id: "ten", name: "Diez en la bolsa", desc: "10 palabras presentadas.", test: s => s.stats.introduced >= 10 },
    { id: "fifty", name: "Medio centenar", desc: "50 palabras presentadas.", test: s => s.stats.introduced >= 50 },
    { id: "hundred", name: "Las primeras 100", desc: "100 palabras presentadas.", test: s => s.stats.introduced >= 100 },
    { id: "all", name: "Las 200", desc: "Viste las 200 palabras.", test: s => s.stats.introduced >= 200 },
    { id: "learned25", name: "Memoria firme", desc: "25 palabras en caja 4 o más.", test: s => countLearned(s) >= 25 },
    { id: "learned100", name: "Vocabulario sólido", desc: "100 palabras aprendidas.", test: s => countLearned(s) >= 100 },
    { id: "streak3", name: "Tres al hilo", desc: "Racha de 3 días.", test: s => s.streak.best >= 3 },
    { id: "streak7", name: "Una semana entera", desc: "Racha de 7 días.", test: s => s.streak.best >= 7 },
    { id: "streak30", name: "Hábito de hierro", desc: "Racha de 30 días.", test: s => s.streak.best >= 30 },
    { id: "combo10", name: "Combo x10", desc: "10 respuestas correctas seguidas.", test: s => s.stats.bestCombo >= 10 },
    { id: "perfect", name: "Ronda perfecta", desc: "Una ronda sin errores.", test: s => s.stats.perfectRounds >= 1 },
    { id: "tenses50", name: "Maestro de tiempos", desc: "50 tiempos verbales correctos.", test: s => s.stats.tenseOk >= 50 },
    { id: "speller", name: "Buena ortografía", desc: "25 palabras escritas sin error.", test: s => s.stats.spellOk >= 25 },
    { id: "goal10", name: "Diez metas", desc: "Cumpliste la meta diaria 10 veces.", test: s => s.stats.goalsMet >= 10 },
    { id: "level10", name: "Nivel 10", desc: "Llegaste al nivel 10.", test: s => levelFor(s.xp).level >= 10 }
  ];

  const LEVEL_TITLES = ["Oyente", "Principiante", "Aprendiz", "Conversador", "Cantante de ducha", "Fluido", "Letrista", "Estrella", "Leyenda"];

  /* ---------- utilidades ---------- */

  function dayKey(ts) {
    const d = new Date(ts);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function daysBetween(a, b) {
    return Math.round((startOfDay(b) - startOfDay(a)) / DAY);
  }

  function makeRng(seed) {
    let x = seed >>> 0 || 1;
    return function () {
      x ^= x << 13; x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5; x >>>= 0;
      return x / 4294967296;
    };
  }

  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }

  function forms(entry) { return entry.f ? entry.f.split("|") : [entry.w]; }

  function formLabels(entry) {
    return entry.lb || FORM_LABELS[entry.t] || [];
  }

  /* ---------- estado ---------- */

  function newState(now) {
    return {
      v: 1,
      created: now,
      xp: 0,
      lives: MAX_LIVES,
      livesTs: now,
      words: {},
      streak: { current: 0, best: 0, last: null, freezes: 0 },
      days: {},
      badges: {},
      stats: { introduced: 0, answers: 0, correct: 0, bestCombo: 0, perfectRounds: 0, tenseOk: 0, spellOk: 0, goalsMet: 0 },
      settings: { newPerDay: 5, goalMin: 10, rate: 0.85, sound: true, calm: false, tts: true }
    };
  }

  function migrate(s, now) {
    const base = newState(now);
    if (!s || typeof s !== "object") return base;
    const out = Object.assign({}, base, s);
    out.streak = Object.assign({}, base.streak, s.streak);
    out.stats = Object.assign({}, base.stats, s.stats);
    out.settings = Object.assign({}, base.settings, s.settings);
    out.words = s.words || {};
    out.days = s.days || {};
    out.badges = s.badges || {};
    return out;
  }

  function wordState(s, w) {
    if (!s.words[w]) s.words[w] = { box: 0, due: 0, seen: 0, ok: 0, ko: 0, last: 0, intro: 0, forms: {} };
    return s.words[w];
  }

  function today(s, now) {
    const k = dayKey(now);
    if (!s.days[k]) s.days[k] = { ms: 0, xp: 0, answers: 0, correct: 0, newWords: 0, rounds: 0, goal: false };
    return s.days[k];
  }

  function countLearned(s) {
    return Object.values(s.words).filter(x => x.box >= LEARNED_BOX).length;
  }

  function boxCounts(s, words) {
    const c = new Array(MAX_BOX + 1).fill(0);
    words.forEach(e => { const ws = s.words[e.w]; c[ws ? ws.box : 0]++; });
    return c;
  }

  /* ---------- vidas ---------- */

  function regenLives(s, now) {
    if (s.lives >= MAX_LIVES) { s.livesTs = now; return 0; }
    const gained = Math.floor((now - s.livesTs) / LIFE_REGEN_MS);
    if (gained > 0) {
      s.lives = Math.min(MAX_LIVES, s.lives + gained);
      s.livesTs = s.lives >= MAX_LIVES ? now : s.livesTs + gained * LIFE_REGEN_MS;
    }
    return gained;
  }

  function msToNextLife(s, now) {
    if (s.lives >= MAX_LIVES) return 0;
    return Math.max(0, LIFE_REGEN_MS - (now - s.livesTs));
  }

  /* ---------- nivel ---------- */

  function levelFor(xp) {
    // Cada nivel pide 60 XP más que el anterior: 60, 120, 180...
    let level = 1, need = 60, acc = 0;
    while (xp >= acc + need) { acc += need; level++; need = 60 * level; }
    return {
      level,
      into: xp - acc,
      need,
      title: LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 2))]
    };
  }

  /* ---------- racha ---------- */

  function touchStreak(s, now) {
    const k = dayKey(now);
    const st = s.streak;
    if (st.last === k) return { changed: false };
    let usedFreeze = false;
    if (st.last) {
      const gap = daysBetween(new Date(st.last + "T00:00:00").getTime(), now);
      if (gap === 1) st.current++;
      else if (gap > 1 && st.freezes >= gap - 1) { st.freezes -= gap - 1; st.current++; usedFreeze = true; }
      else st.current = 1;
    } else st.current = 1;
    st.last = k;
    st.best = Math.max(st.best, st.current);
    let earnedFreeze = false;
    if (st.current > 0 && st.current % 7 === 0 && st.freezes < 2) { st.freezes++; earnedFreeze = true; }
    return { changed: true, usedFreeze, earnedFreeze };
  }

  // Racha visible: si ayer no jugó y no hay protectores, ya está en 0.
  function liveStreak(s, now) {
    const st = s.streak;
    if (!st.last) return 0;
    const gap = daysBetween(new Date(st.last + "T00:00:00").getTime(), now);
    if (gap <= 1) return st.current;
    if (st.freezes >= gap - 1) return st.current;
    return 0;
  }

  /* ---------- cola de estudio ---------- */

  function dueWords(s, words, now) {
    return words
      .filter(e => { const ws = s.words[e.w]; return ws && ws.intro && ws.due <= now; })
      .sort((a, b) => s.words[a.w].due - s.words[b.w].due || s.words[a.w].box - s.words[b.w].box);
  }

  function newWordsAvailable(s, words, now) {
    const d = today(s, now);
    const left = Math.max(0, s.settings.newPerDay - d.newWords);
    return words.filter(e => !(s.words[e.w] && s.words[e.w].intro)).slice(0, left);
  }

  /*
   * Arma una ronda corta: primero los repasos vencidos (lo más valioso para la memoria),
   * luego como mucho 2 palabras nuevas por ronda para no saturar la memoria de trabajo.
   * Cada palabra nueva se presenta con su tarjeta y se pregunta de nuevo al final de la ronda.
   */
  function buildRound(s, words, now, rnd, opts) {
    opts = opts || {};
    const size = opts.size || ROUND_SIZE;
    const steps = [];
    const due = dueWords(s, words, now);
    const fresh = opts.reviewOnly ? [] : newWordsAvailable(s, words, now).slice(0, 2);
    const reviewSlots = Math.max(0, size - fresh.length * 2);
    const reviews = due.slice(0, reviewSlots);

    // Completar la ronda con práctica extra de las palabras más débiles que todavía no vencen.
    // Suma recuperación sin adelantar su caja (applyAnswer solo sube de caja si ya venció).
    const used = new Set(reviews.concat(fresh).map(e => e.w));
    const extra = words
      .filter(e => s.words[e.w] && s.words[e.w].intro && !used.has(e.w))
      .sort((a, b) => (s.words[a.w].box - s.words[b.w].box) || (s.words[a.w].last - s.words[b.w].last))
      .slice(0, Math.max(0, reviewSlots - reviews.length));

    fresh.forEach(e => {
      steps.push({ kind: "intro", w: e.w });
      steps.push(makeQuestion(s, e, words, rnd, 0));
    });
    shuffle(reviews.concat(extra), rnd).forEach(e => {
      steps.push(makeQuestion(s, e, words, rnd, s.words[e.w].box));
    });
    // Segunda exposición de las nuevas al final de la ronda (espaciado dentro de la sesión).
    fresh.forEach(e => steps.push(makeQuestion(s, e, words, rnd, 1)));
    return steps.filter(Boolean);
  }

  /* ---------- preguntas ---------- */

  function distractors(entry, words, rnd, n, key) {
    const same = words.filter(e => e.w !== entry.w && e.t === entry.t);
    const pool = same.length >= n ? same : words.filter(e => e.w !== entry.w);
    const seen = new Set([key(entry)]);
    const out = [];
    for (const e of shuffle(pool, rnd)) {
      const k = key(e);
      if (!seen.has(k)) { seen.add(k); out.push(e); }
      if (out.length >= n) break;
    }
    return out;
  }

  function mc(entry, words, rnd, key) {
    const opts = shuffle([entry].concat(distractors(entry, words, rnd, 3, key)), rnd).map(key);
    return { options: opts, answer: key(entry) };
  }

  function subjectFor(entry, rnd) {
    if (entry.sj) return entry.sj.charAt(0).toUpperCase() + entry.sj.slice(1);
    return pick(SUBJECTS, rnd);
  }

  function conj(entry, tenseId, subject) {
    const [base, s3, past, pp, ing] = forms(entry);
    const third = !!THIRD[subject.toLowerCase()];
    const S = subject;
    const c = entry.c ? " " + entry.c : "";
    const stative = !!entry.s;
    const be = subject === "I" ? "am" : third ? "is" : "are";
    const have = third ? "has" : "have";
    switch (tenseId) {
      case "present": return { pre: S + " ", answer: third ? s3 : base, post: c + (stative ? "." : " every day.") };
      case "past": return { pre: (stative ? "Last year " : "Yesterday ") + lowerSubj(S) + " ", answer: past, post: c + "." };
      case "perfect": return { pre: S + " " + have + " ", answer: pp, post: c + (stative ? " for a long time." : " before.") };
      case "continuous": return { pre: S + " " + be + " ", answer: ing, post: c + " right now." };
      case "future": return { pre: "Tomorrow " + lowerSubj(S) + " will ", answer: base, post: c + "." };
    }
    return null;
  }

  function lowerSubj(S) { return S === "I" ? "I" : S.toLowerCase(); }

  function availableTenses(entry) {
    return TENSES.filter(t => !(entry.s && t.id === "continuous"));
  }

  // Todas las frases por tiempo verbal, para la ficha de la palabra.
  function conjugationTable(entry) {
    const subj = entry.sj ? subjectFor(entry) : "I";
    const subj3 = entry.sj ? subj : "She";
    return availableTenses(entry).map(t => {
      const a = conj(entry, t.id, subj);
      const b = conj(entry, t.id, subj3);
      return { tense: t, first: a.pre + a.answer + a.post, third: b.pre + b.answer + b.post };
    });
  }

  function tenseQuestion(entry, rnd) {
    const t = pick(availableTenses(entry), rnd);
    const subject = subjectFor(entry, rnd);
    const q = conj(entry, t.id, subject);
    const opts = shuffle(Array.from(new Set(forms(entry))), rnd);
    return {
      kind: "tense", w: entry.w, tense: t.id, tenseEs: t.es, hint: t.hint,
      sentence: q.pre + "___" + q.post, verb: entry.w,
      options: opts, answer: q.answer, full: q.pre + q.answer + q.post
    };
  }

  function formIdQuestion(entry, rnd) {
    const fs = forms(entry), lbs = formLabels(entry);
    if (fs.length < 2 || lbs.length !== fs.length) return null;
    // Elegir una forma cuya etiqueta sea única para esa palabra (p. ej. "put" es base, pasado y participio).
    const idx = shuffle(fs.map((_, i) => i).filter(i => i > 0), rnd).find(i => fs.filter(x => x === fs[i]).length === 1);
    if (idx === undefined) return null;
    const opts = shuffle(lbs.map((l, i) => ({ l, i })).filter(o => fs[o.i] !== fs[idx] || o.i === idx), rnd).slice(0, 4);
    if (!opts.some(o => o.i === idx)) opts[0] = { l: lbs[idx], i: idx };
    return {
      kind: "formid", w: entry.w, shown: fs[idx],
      options: shuffle(opts.map(o => o.l), rnd), answer: lbs[idx]
    };
  }

  function clozeQuestion(entry, words, rnd) {
    if (entry.cl && entry.cl.length) {
      const [sentence, answer] = pick(entry.cl, rnd).split("|");
      const fs = Array.from(new Set(forms(entry).map(x => x)));
      let opts = fs.filter(x => x.toLowerCase() !== answer.toLowerCase());
      opts = shuffle(opts, rnd).slice(0, 3);
      if (opts.length < 3) {
        distractors(entry, words, rnd, 3 - opts.length, e => e.w).forEach(e => opts.push(e.w));
      }
      return { kind: "cloze", w: entry.w, sentence, answer, options: shuffle(opts.concat([answer]), rnd) };
    }
    const fs = forms(entry);
    const found = fs.concat([entry.w]).find(f => new RegExp("\\b" + escapeRe(f) + "\\b", "i").test(entry.ex));
    if (!found) return null;
    const m = entry.ex.match(new RegExp("\\b" + escapeRe(found) + "\\b", "i"));
    const sentence = entry.ex.slice(0, m.index) + "___" + entry.ex.slice(m.index + m[0].length);
    const answer = m[0];
    const opts = distractors(entry, words, rnd, 3, e => e.w).map(e => matchCase(e.w, answer));
    return { kind: "cloze", w: entry.w, sentence, answer, options: shuffle(opts.concat([answer]), rnd), translation: entry.xe };
  }

  function matchCase(word, model) {
    if (model[0] === model[0].toUpperCase() && model[0] !== model[0].toLowerCase()) return word.charAt(0).toUpperCase() + word.slice(1);
    return word;
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  /*
   * Elige el tipo de pregunta según qué tan conocida es la palabra:
   * caja 0-1 reconocimiento (más fácil), 2-3 producción guiada, 4+ producción libre.
   */
  function makeQuestion(s, entry, words, rnd, box) {
    const isVerb = entry.t === "v";
    let kinds;
    // Los verbos pasan rápido a practicar tiempos verbales: es el foco del juego.
    if (box === 0) kinds = ["meaning", "listen", "meaning"];
    else if (box === 1) kinds = isVerb ? ["tense", "tense", "meaning", "listen"] : ["meaning", "listen", "reverse"];
    else if (box <= 3) kinds = isVerb ? ["tense", "tense", "tense", "reverse", "cloze", "formid"] : ["reverse", "cloze", "listen", "formid"];
    else kinds = isVerb ? ["tense", "tense", "spell", "formid"] : ["spell", "cloze", "reverse"];
    for (const k of shuffle(kinds, rnd).concat(["meaning"])) {
      const q = buildKind(k, entry, words, rnd);
      if (q) return q;
    }
    return null;
  }

  function buildKind(kind, entry, words, rnd) {
    switch (kind) {
      case "meaning": return Object.assign({ kind, w: entry.w, prompt: entry.w }, mc(entry, words, rnd, e => e.es));
      case "reverse": return Object.assign({ kind, w: entry.w, prompt: entry.es }, mc(entry, words, rnd, e => e.w));
      case "listen": return Object.assign({ kind, w: entry.w, say: entry.w }, mc(entry, words, rnd, e => e.es));
      case "tense": return entry.t === "v" ? tenseQuestion(entry, rnd) : null;
      case "formid": return formIdQuestion(entry, rnd);
      case "cloze": return clozeQuestion(entry, words, rnd);
      case "spell": return { kind, w: entry.w, prompt: entry.es, answer: entry.w, hint: entry.w.charAt(0) + "·".repeat(Math.max(0, entry.w.length - 1)) };
    }
    return null;
  }

  function normalize(x) { return String(x || "").trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " "); }

  function checkAnswer(q, given) {
    return normalize(given) === normalize(q.answer);
  }

  /* ---------- aplicar resultado ---------- */

  function introduce(s, w, now) {
    const ws = wordState(s, w);
    if (ws.intro) return 0;
    ws.intro = now;
    ws.box = 0;
    ws.due = now;
    s.stats.introduced++;
    today(s, now).newWords++;
    s.xp += 5;
    today(s, now).xp += 5;
    return 5;
  }

  /*
   * Acierto: sube una caja y se aleja el próximo repaso.
   * Error: baja a la mitad (no a cero) para no castigar de más y vuelve mañana.
   */
  function applyAnswer(s, q, correct, now, combo, practice) {
    const ws = wordState(s, q.w);
    const d = today(s, now);
    ws.seen++;
    ws.last = now;
    s.stats.answers++;
    d.answers++;
    if (q.kind === "tense" || q.kind === "formid") {
      const key = q.tense || "formas";
      ws.forms[key] = ws.forms[key] || { ok: 0, ko: 0 };
      ws.forms[key][correct ? "ok" : "ko"]++;
    }
    let xp = 0, lifeLost = false;
    if (correct) {
      ws.ok++;
      s.stats.correct++;
      d.correct++;
      if (q.kind === "tense") s.stats.tenseOk++;
      if (q.kind === "spell") s.stats.spellOk++;
      if (ws.due <= now) {
        ws.box = Math.min(MAX_BOX, ws.box + 1);
        ws.due = startOfDay(now) + INTERVALS[ws.box] * DAY;
      }
      xp = (q.kind === "spell" ? 15 : q.kind === "tense" ? 12 : 10) + Math.min(10, combo * 2);
      s.stats.bestCombo = Math.max(s.stats.bestCombo, combo + 1);
    } else {
      ws.ko++;
      ws.box = Math.max(ws.box > 0 ? 1 : 0, Math.floor(ws.box / 2));
      ws.due = startOfDay(now) + DAY;
      if (!practice && s.lives > 0) {
        if (s.lives === MAX_LIVES) s.livesTs = now;
        s.lives--;
        lifeLost = true;
      }
    }
    s.xp += xp;
    d.xp += xp;
    return { xp, lifeLost };
  }

  function finishRound(s, now, errors, rnd) {
    const d = today(s, now);
    d.rounds++;
    const streakInfo = touchStreak(s, now);
    let bonus = 0;
    if (errors === 0) { s.stats.perfectRounds++; bonus += 20; }
    s.xp += bonus;
    d.xp += bonus;
    return { bonus, streakInfo };
  }

  // Cofre de la meta diaria: premio variable (sorpresa) una vez por día.
  function openChest(s, now, rnd) {
    const d = today(s, now);
    if (d.goal) return null;
    d.goal = true;
    s.stats.goalsMet++;
    const r = rnd();
    const prize = { xp: 30 + Math.floor(rnd() * 71), life: false, freeze: false };
    if (r < 0.35 && s.lives < MAX_LIVES) { s.lives++; prize.life = true; }
    else if (r < 0.5 && s.streak.freezes < 2) { s.streak.freezes++; prize.freeze = true; }
    s.xp += prize.xp;
    d.xp += prize.xp;
    return prize;
  }

  function addTime(s, now, ms) {
    today(s, now).ms += ms;
  }

  function newBadges(s) {
    const out = [];
    BADGES.forEach(b => {
      if (!s.badges[b.id] && b.test(s)) { s.badges[b.id] = Date.now(); out.push(b); }
    });
    return out;
  }

  function lastDays(s, now, n) {
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const k = dayKey(now - i * DAY);
      out.push({ key: k, data: s.days[k] || { ms: 0, xp: 0, answers: 0, correct: 0, newWords: 0 } });
    }
    return out;
  }

  const Engine = {
    DAY, INTERVALS, MAX_BOX, LEARNED_BOX, MAX_LIVES, LIFE_REGEN_MS, ROUND_SIZE, TENSES, BADGES, FORM_LABELS,
    dayKey, startOfDay, makeRng, shuffle, forms, formLabels,
    newState, migrate, wordState, today, countLearned, boxCounts,
    regenLives, msToNextLife, levelFor, touchStreak, liveStreak,
    dueWords, newWordsAvailable, buildRound, makeQuestion, buildKind, conj, conjugationTable, availableTenses,
    checkAnswer, introduce, applyAnswer, finishRound, openChest, addTime, newBadges, lastDays
  };

  if (typeof module !== "undefined" && module.exports) module.exports = Engine;
  else root.Engine = Engine;
})(typeof window !== "undefined" ? window : globalThis);
