/*
 * Motor del juego: repetición espaciada (cajas de Leitner), armado de preguntas,
 * puntos, vidas, racha y logros. No toca el DOM, así se puede testear con Node.
 */
(function (root) {
  const G = typeof module !== "undefined" && module.exports ? require("./grammar.js") : root.Grammar;
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

  const TENSES = G.TENSES;

  // Dificultad: 1 básico, 2 intermedio, 3 avanzado.
  const LEVELS = [
    null,
    { id: 1, name: "Básico", desc: "5 tiempos verbales en afirmativa. Opciones múltiples.", fresh: 2, xp: 1 },
    { id: 2, name: "Intermedio", desc: "7 tiempos, negativas y preguntas. Armar oraciones.", fresh: 3, xp: 1.5 },
    { id: 3, name: "Avanzado", desc: "Los 11 tiempos. Escribir y traducir oraciones completas.", fresh: 4, xp: 2 }
  ];

  const BADGES = [
    { id: "first", name: "Primera palabra", desc: "Aprendiste tu primera palabra nueva.", test: s => s.stats.introduced >= 1 },
    { id: "ten", name: "Diez en la bolsa", desc: "10 palabras presentadas.", test: s => s.stats.introduced >= 10 },
    { id: "fifty", name: "Medio centenar", desc: "50 palabras presentadas.", test: s => s.stats.introduced >= 50 },
    { id: "hundred", name: "Las primeras 100", desc: "100 palabras presentadas.", test: s => s.stats.introduced >= 100 },
    { id: "all", name: "Las 200", desc: "Viste las 200 palabras básicas.", test: s => s.stats.introduced >= 200 },
    { id: "w500", name: "Quinientas", desc: "500 palabras presentadas.", test: s => s.stats.introduced >= 500 },
    { id: "w1000", name: "Las 1000", desc: "Viste las 1000 palabras.", test: s => s.stats.introduced >= 1000 },
    { id: "learned500", name: "Inglés de trabajo", desc: "500 palabras aprendidas.", test: s => countLearned(s) >= 500 },
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
    { id: "level10", name: "Nivel 10", desc: "Llegaste al nivel 10.", test: s => levelFor(s.xp).level >= 10 },
    { id: "builder", name: "Constructor", desc: "25 oraciones bien armadas.", test: s => s.stats.orderOk >= 25 },
    { id: "translator", name: "Traductor", desc: "25 oraciones traducidas escribiendo.", test: s => s.stats.translateOk >= 25 },
    { id: "snake", name: "Viborita", desc: "10 palabras completas en la viborita.", test: s => s.stats.snakeWords >= 10 },
    { id: "snake100", name: "Serpiente sabia", desc: "100 puntos en una partida de viborita.", test: s => s.stats.snakeBest >= 100 },
    { id: "meeting1", name: "Primera reunión", desc: "Completaste el simulador de reunión.", test: s => s.stats.meetings >= 1 },
    { id: "meeting10", name: "Reunión en inglés", desc: "10 reuniones simuladas.", test: s => s.stats.meetings >= 10 },
    { id: "shadow25", name: "Eco", desc: "25 frases repetidas en voz alta.", test: s => s.stats.shadowOk >= 25 },
    { id: "phrases100", name: "Mis 100 frases", desc: "Viste tus 100 frases de reunión.", test: s => s.stats.phrasesIntro >= 100 },
    { id: "phrases25", name: "Hablo como en Teams", desc: "25 frases aprendidas (caja 4+).", test: s => countPhrasesLearned(s) >= 25 },
    { id: "advanced", name: "Modo avanzado", desc: "Una ronda completa en dificultad Avanzado.", test: s => s.stats.advancedRounds >= 1 }
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
      phrases: {},
      streak: { current: 0, best: 0, last: null, freezes: 0 },
      days: {},
      badges: {},
      stats: { introduced: 0, answers: 0, correct: 0, bestCombo: 0, perfectRounds: 0, tenseOk: 0, spellOk: 0, goalsMet: 0,
        orderOk: 0, translateOk: 0, snakeWords: 0, snakeBest: 0, snakeGames: 0, advancedRounds: 0, known: 0, placementDone: 0,
        phrasesIntro: 0, phraseOk: 0, shadowOk: 0, meetings: 0, shadowSessions: 0 },
      settings: { newPerDay: 5, goalMin: 10, rate: 0.85, sound: true, calm: false, tts: true, level: 1 }
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
    out.phrases = s.phrases || {};
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
    if (!s.days[k]) s.days[k] = { ms: 0, xp: 0, answers: 0, correct: 0, newWords: 0, newPhrases: 0, rounds: 0, goal: false };
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
    // Cada nivel pide 25 XP más que el anterior: 50, 75, 100...
    let level = 1, need = 50, acc = 0;
    while (xp >= acc + need) { acc += need; level++; need = 50 + 25 * (level - 1); }
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
    const lv = LEVELS[s.settings.level] || LEVELS[1];
    const fresh = opts.reviewOnly ? [] : newWordsAvailable(s, words, now).slice(0, lv.fresh);
    const reviewSlots = Math.max(2, size - fresh.length * 2);
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
    // Tus frases de reunión: hasta 2 por ronda, con su propio repaso espaciado.
    if (opts.phrases !== false) phraseSteps(s, allPhrases(), now, rnd, 2).forEach(x => steps.push(x));
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

  function level(s) { return (s && s.settings && s.settings.level) || 1; }

  function availableTenses(entry, lvl) { return G.tensesFor(entry, lvl || 1); }

  function pickSubject(entry, rnd) { return pick(G.subjectsFor(entry), rnd); }

  // Polaridad según dificultad: básico solo afirmativa; intermedio y avanzado mezclan.
  function pickPol(lvl, rnd, allowQ) {
    if (lvl <= 1) return "aff";
    const r = rnd();
    if (r < 0.5) return "aff";
    if (r < 0.8 || !allowQ) return "neg";
    return "q";
  }

  // Tabla completa para la ficha: cada tiempo con un sujeto y forma dados.
  function conjugationTable(entry, subj, pol, lvl) {
    const sj = entry.sj ? "it" : (subj || "I");
    return availableTenses(entry, lvl || 3).map(t => {
      const b = G.build(entry, t.id, sj, pol || "aff");
      return { tense: t, en: b.en, es: b.es, first: b.en, third: G.build(entry, t.id, entry.sj ? "it" : "she", pol || "aff").en };
    });
  }

  // Completar el verbo principal (una sola palabra) en afirmativa.
  function tenseQuestion(entry, rnd, lvl) {
    const t = pick(availableTenses(entry, Math.min(lvl, 2)), rnd);
    const b = G.build(entry, t.id, pickSubject(entry, rnd), "aff");
    const parts = b.verb.split(" ");
    const before = parts.slice(0, -1).join(" ");
    const sentence = b.pre + " " + (before ? before + " " : "") + "___" + b.post;
    const opts = shuffle(Array.from(new Set(forms(entry))), rnd);
    return {
      kind: "tense", w: entry.w, tense: t.id, tenseEs: t.es, hint: t.hint,
      sentence, verb: entry.w, options: opts, answer: b.main, full: b.en, es: b.es
    };
  }

  // Elegir la frase verbal completa (aux + verbo), incluida la negativa.
  function phraseQuestion(entry, rnd, lvl) {
    const ts = availableTenses(entry, lvl);
    const t = pick(ts, rnd);
    const subj = pickSubject(entry, rnd);
    const pol = pickPol(lvl, rnd, false);
    const b = G.build(entry, t.id, subj, pol);
    const pool = new Set([b.verb]);
    shuffle(ts, rnd).forEach(o => {
      ["aff", "neg"].forEach(pp => {
        if (pool.size < 4) pool.add(G.build(entry, o.id, subj, pp).verb);
      });
    });
    return {
      kind: "phrase", w: entry.w, tense: t.id, tenseEs: t.es + (pol === "neg" ? " · negativa" : ""), hint: t.hint,
      sentence: b.pre + " ___" + b.post, es: b.es, options: shuffle(Array.from(pool), rnd), answer: b.verb, full: b.en
    };
  }

  // Ordenar las fichas de la oración en inglés.
  function orderQuestion(entry, rnd, lvl) {
    const t = pick(availableTenses(entry, lvl), rnd);
    const subj = pickSubject(entry, rnd);
    const pol = pickPol(lvl, rnd, true);
    const b = G.build(entry, t.id, subj, pol);
    const tiles = b.words.slice();
    // En avanzado se suman 2 fichas trampa con otras formas del verbo.
    if (lvl >= 3) {
      const extra = forms(entry).filter(f => !tiles.includes(f));
      shuffle(extra, rnd).slice(0, 2).forEach(f => tiles.push(f));
    }
    return {
      kind: "order", w: entry.w, tense: t.id, tenseEs: t.es + " · " + G.POLARITIES.find(x => x.id === pol).es.toLowerCase(),
      hint: t.hint, es: b.es, tiles: shuffle(tiles, rnd), answer: b.words.join(" "), full: b.en
    };
  }

  // Escribir la oración completa en inglés.
  function translateQuestion(entry, rnd, lvl) {
    const t = pick(availableTenses(entry, lvl), rnd);
    const subj = pickSubject(entry, rnd);
    const pol = pickPol(lvl, rnd, true);
    const b = G.build(entry, t.id, subj, pol);
    return {
      kind: "translate", w: entry.w, tense: t.id, tenseEs: t.es, hint: t.hint, pol,
      es: b.es, answer: b.en, full: b.en, target: b
    };
  }

  // Compatibilidad: frase en un tiempo dado (usado en tests y en la ficha).
  function conj(entry, tenseId, subject) {
    const b = G.build(entry, tenseId, String(subject).toLowerCase() === "i" ? "I" : String(subject).toLowerCase(), "aff");
    const parts = b.verb.split(" ");
    const before = parts.slice(0, -1).join(" ");
    return { pre: b.pre + " " + (before ? before + " " : ""), answer: b.main, post: b.post };
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
    const lvl = level(s);
    let kinds;
    if (box === 0) kinds = ["meaning", "listen", "meaning"];
    else if (lvl === 1) {
      if (box === 1) kinds = isVerb ? ["tense", "tense", "meaning", "listen"] : ["meaning", "listen", "reverse"];
      else if (box <= 3) kinds = isVerb ? ["tense", "tense", "tense", "reverse", "cloze", "formid"] : ["reverse", "cloze", "listen", "formid"];
      else kinds = isVerb ? ["tense", "tense", "spell", "formid", "order"] : ["spell", "cloze", "reverse"];
    } else if (lvl === 2) {
      if (box === 1) kinds = isVerb ? ["tense", "phrase", "order", "reverse"] : ["reverse", "cloze", "listen"];
      else if (box <= 3) kinds = isVerb ? ["phrase", "order", "order", "tense", "formid"] : ["spell", "cloze", "reverse", "formid"];
      else kinds = isVerb ? ["order", "phrase", "spell", "translate"] : ["spell", "cloze", "spell"];
    } else {
      if (box === 1) kinds = isVerb ? ["phrase", "order", "order", "spell"] : ["reverse", "spell", "cloze"];
      else if (box <= 3) kinds = isVerb ? ["order", "translate", "phrase", "spell"] : ["spell", "cloze", "spell", "formid"];
      else kinds = isVerb ? ["translate", "translate", "order", "phrase"] : ["spell", "spell", "cloze"];
    }
    for (const k of shuffle(kinds, rnd).concat(["meaning"])) {
      const q = buildKind(k, entry, words, rnd, lvl);
      if (q) return q;
    }
    return null;
  }

  function buildKind(kind, entry, words, rnd, lvl) {
    lvl = lvl || 1;
    switch (kind) {
      case "meaning": return Object.assign({ kind, w: entry.w, prompt: entry.w }, mc(entry, words, rnd, e => e.es));
      case "reverse": return Object.assign({ kind, w: entry.w, prompt: entry.es }, mc(entry, words, rnd, e => e.w));
      case "listen": return Object.assign({ kind, w: entry.w, say: entry.w }, mc(entry, words, rnd, e => e.es));
      case "tense": return entry.t === "v" ? tenseQuestion(entry, rnd, lvl) : null;
      case "phrase": return entry.t === "v" ? phraseQuestion(entry, rnd, Math.max(2, lvl)) : null;
      case "order": return entry.t === "v" ? orderQuestion(entry, rnd, Math.max(lvl, 1)) : null;
      case "translate": return entry.t === "v" ? translateQuestion(entry, rnd, lvl) : null;
      case "formid": return formIdQuestion(entry, rnd);
      case "cloze": return clozeQuestion(entry, words, rnd);
      case "spell": return { kind, w: entry.w, prompt: entry.es, answer: entry.w, hint: entry.w.charAt(0) + "·".repeat(Math.max(0, entry.w.length - 1)) };
    }
    return null;
  }

  function normalize(x) { return String(x || "").trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " "); }

  function checkAnswer(q, given) {
    if (q.p) return checkPhrase(q, given);
    if (q.kind === "translate") return G.checkSentence(q.target, given, wordFor(q.w));
    if (q.kind === "order") return G.normSentence(given) === G.normSentence(q.answer);
    return normalize(given) === normalize(q.answer);
  }

  let WORD_INDEX = null;
  function wordFor(w) {
    if (!WORD_INDEX) {
      const list = typeof module !== "undefined" && module.exports ? require("./words-work.js") : root.WORDS;
      WORD_INDEX = Object.fromEntries(list.map(e => [e.w, e]));
    }
    return WORD_INDEX[w] || {};
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
    if (q.p) return applyPhrase(s, q, correct, now, combo, practice);
    const ws = wordState(s, q.w);
    const d = today(s, now);
    ws.seen++;
    ws.last = now;
    s.stats.answers++;
    d.answers++;
    if (q.kind === "tense" || q.kind === "formid" || q.kind === "phrase" || q.kind === "order" || q.kind === "translate") {
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
      if (q.kind === "order") s.stats.orderOk++;
      if (q.kind === "translate") s.stats.translateOk++;
      if (ws.due <= now) {
        ws.box = Math.min(MAX_BOX, ws.box + 1);
        ws.due = startOfDay(now) + INTERVALS[ws.box] * DAY;
      }
      const base = { spell: 15, tense: 12, phrase: 14, order: 16, translate: 25 }[q.kind] || 10;
      const mult = (LEVELS[s.settings.level] || LEVELS[1]).xp;
      xp = Math.round((base + Math.min(10, combo * 2)) * mult);
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
    if (level(s) === 3) s.stats.advancedRounds++;
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

  // «Ya la sé»: la palabra entra directo en la caja 3 (vuelve en 4 días para confirmar).
  function markKnown(s, w, now, delayDays) {
    const ws = wordState(s, w);
    if (!ws.intro) { ws.intro = now; s.stats.introduced++; }
    ws.box = Math.max(ws.box, 3);
    ws.due = startOfDay(now) + (delayDays || INTERVALS[3]) * DAY;
    s.stats.known++;
  }

  // Tramos de la prueba de nivel (por frecuencia): las básicas en tramos de 50, las de trabajo en tramos de 200.
  const BANDS = [[0, 50], [50, 100], [100, 150], [150, 200], [200, 400], [400, 600], [600, 800], [800, 1000]];
  const PER_BAND = 4;

  function placementQuiz(words, rnd) {
    const out = [];
    BANDS.forEach(([a, b], i) => {
      const band = words.slice(a, b);
      shuffle(band, rnd).slice(0, PER_BAND).forEach(e => out.push(Object.assign({ band: i }, buildKind("meaning", e, words, rnd, 1))));
    });
    return out;
  }

  // Un tramo se marca como sabido si acertás todas sus preguntas (los repasos se reparten en 14 días).
  function applyPlacement(s, words, results, now, rnd) {
    const perBand = BANDS.map(() => 0);
    results.forEach(r => { if (r.ok) perBand[r.band]++; });
    let marked = 0;
    const bands = [];
    perBand.forEach((n, b) => {
      if (n >= PER_BAND) {
        bands.push(b);
        words.slice(BANDS[b][0], BANDS[b][1]).forEach(e => {
          const ws = s.words[e.w];
          if (!(ws && ws.intro)) { markKnown(s, e.w, now, 1 + Math.floor(rnd() * 14)); marked++; }
        });
      }
    });
    const total = perBand.reduce((a, b) => a + b, 0);
    const max = BANDS.length * PER_BAND;
    const suggested = total >= max * 0.75 ? 3 : total >= max * 0.45 ? 2 : 1;
    s.stats.placementDone = now;
    return { perBand, bands, marked, suggested };
  }

  // Resultado de una partida de viborita.
  function applySnake(s, now, score, wordsDone) {
    s.stats.snakeGames++;
    s.stats.snakeWords += wordsDone.length;
    s.stats.snakeBest = Math.max(s.stats.snakeBest, score);
    const xp = Math.round(score / 2);
    s.xp += xp;
    today(s, now).xp += xp;
    wordsDone.forEach(w => { const ws = s.words[w]; if (ws) { ws.seen++; ws.ok++; ws.last = now; } });
    return xp;
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


  /* ---------- tus frases de reunión ---------- */

  const PHRASE_CATS = [
    { id: "hi", es: "Saludo inicial", scene: "Entrás a la llamada de Teams." },
    { id: "open", es: "Inicio de conversación", scene: "Arranca el tema de la reunión." },
    { id: "tech", es: "Consulta o respuesta técnica", scene: "Están revisando la solución." },
    { id: "bye", es: "Saludo final", scene: "La reunión está por terminar." }
  ];
  const PHRASE_NEW_PER_DAY = 3;
  // Simulador: una reunión corta que sigue el orden real de una llamada.
  const MEETING_PLAN = ["hi", "open", "tech", "tech", "tech", "bye"];

  let PHRASE_LIST = null;
  function allPhrases() {
    if (!PHRASE_LIST) PHRASE_LIST = (typeof module !== "undefined" && module.exports ? require("./phrases.js") : root.PHRASES) || [];
    return PHRASE_LIST;
  }

  function phraseState(s, id) {
    if (!s.phrases) s.phrases = {};
    if (!s.phrases[id]) s.phrases[id] = { box: 0, due: 0, seen: 0, ok: 0, ko: 0, last: 0, intro: 0, shadow: 0 };
    return s.phrases[id];
  }

  function duePhrases(s, phrases, now) {
    const ps = s.phrases || {};
    return phrases.filter(p => ps[p.id] && ps[p.id].intro && ps[p.id].due <= now)
      .sort((a, b) => ps[a.id].due - ps[b.id].due || ps[a.id].box - ps[b.id].box);
  }

  // Las nuevas salen rotando categorías (saludo, inicio, técnica, cierre) y por frecuencia dentro de cada una.
  function newPhrasesAvailable(s, phrases, now, ignoreCap) {
    const ps = s.phrases || {};
    const left = ignoreCap ? phrases.length : Math.max(0, PHRASE_NEW_PER_DAY - (today(s, now).newPhrases || 0));
    const byCat = PHRASE_CATS.map(c => phrases.filter(p => p.cat === c.id && !(ps[p.id] && ps[p.id].intro)));
    const out = [];
    for (let i = 0; out.length < phrases.length; i++) {
      let added = false;
      byCat.forEach(list => { if (list[i]) { out.push(list[i]); added = true; } });
      if (!added) break;
    }
    return out.slice(0, left);
  }

  function introducePhrase(s, id, now) {
    const ps = phraseState(s, id);
    if (ps.intro) return 0;
    ps.intro = now;
    ps.due = now;
    s.stats.phrasesIntro++;
    const d = today(s, now);
    d.newPhrases = (d.newPhrases || 0) + 1;
    s.xp += 5;
    d.xp += 5;
    return 5;
  }

  function phraseWords(en) { return en.split(" ").filter(Boolean); }

  // El tipo de ejercicio depende de la dificultad y de cuánto conocés la frase.
  function meetQuestion(s, p, phrases, rnd, box, forced) {
    const lvl = level(s);
    let kind = forced;
    if (!kind) {
      const pool = ["pchoose", "plisten"];
      if (lvl >= 2 && box >= 1) pool.push("porder", "porder");
      if (lvl >= 3 && box >= 2) pool.push("ptype", "ptype");
      kind = pick(pool, rnd);
    }
    if (kind === "porder" && phraseWords(p.en).length < 2) kind = "pchoose";
    const cat = PHRASE_CATS.find(c => c.id === p.cat);
    const q = { kind, p: p.id, cat: p.cat, catEs: cat.es, scene: cat.scene, es: p.es, answer: p.en, full: p.en };
    if (kind === "pchoose" || kind === "plisten") {
      const key = kind === "pchoose" ? "en" : "es";
      const same = shuffle(phrases.filter(x => x.id !== p.id && x.cat === p.cat), rnd);
      const other = shuffle(phrases.filter(x => x.id !== p.id && x.cat !== p.cat), rnd);
      const opts = [p[key]];
      same.concat(other).forEach(x => { if (opts.length < 3 && !opts.includes(x[key])) opts.push(x[key]); });
      q.options = shuffle(opts, rnd);
      q.answer = p[key];
    } else if (kind === "porder") {
      const tiles = phraseWords(p.en);
      if (lvl >= 3) {
        const extra = phraseWords(pick(phrases.filter(x => x.id !== p.id), rnd).en).filter(w => !tiles.includes(w));
        shuffle(extra, rnd).slice(0, 2).forEach(w => tiles.push(w));
      }
      q.tiles = shuffle(tiles, rnd);
    }
    return q;
  }

  function lev(a, b) {
    const m = a.length, n = b.length;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }

  const EXPAND = [
    [/\bcan't\b/g, "cannot"], [/\bwon't\b/g, "will not"], [/\blet's\b/g, "let us"], [/\b(\w+)n't\b/g, "$1 not"],
    [/\b(i)'m\b/g, "$1 am"], [/\b(\w+)'re\b/g, "$1 are"], [/\b(\w+)'ll\b/g, "$1 will"], [/\b(\w+)'ve\b/g, "$1 have"],
    [/\b(\w+)'d\b/g, "$1 would"], [/\b(it|that|what|how)s\b/g, "$1 is"], [/\bim\b/g, "i am"], [/\blets\b/g, "let us"],
    [/\b(do|did|is|are|should|does)nt\b/g, "$1 not"], [/\bcant\b/g, "cannot"], [/\bwont\b/g, "will not"], [/\byoure\b/g, "you are"], [/\b(it|that|what|how|there|he|she|who|where)'s\b/g, "$1 is"], [/\bcan not\b/g, "cannot"]
  ];
  function normPhrase(x) {
    let t = G.normSentence(x).replace(/[’`´]/g, "'");
    EXPAND.forEach(([re, rep]) => { t = t.replace(re, rep); });
    return t.replace(/'/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();
  }

  // Escribir o decir la frase: acepta contracciones, puntuación, las formas alternativas y un error de tipeo chico.
  function phraseMatch(p, given, tolerance) {
    const g = normPhrase(given);
    if (!g) return false;
    const targets = [p.en].concat(p.alt || []).map(normPhrase);
    if (targets.includes(g)) return true;
    // Un error chico se perdona, salvo que lo escrito sea justo otra de tus frases («We're» y «We were»).
    if (allPhrases().some(x => x.id !== p.id && [x.en].concat(x.alt || []).some(y => normPhrase(y) === g))) return false;
    return targets.some(t => lev(g, t) <= Math.max(2, Math.floor(t.length * (tolerance || 0.08))));
  }

  function phraseFor(id) { return allPhrases().find(x => x.id === id) || null; }

  function checkPhrase(q, given) {
    const p = phraseFor(q.p);
    if (q.kind === "ptype" || q.kind === "pshadow") return p ? phraseMatch(p, given) : false;
    if (q.kind === "porder") return G.normSentence(given) === G.normSentence(q.answer);
    return normalize(given) === normalize(q.answer);
  }

  /*
   * Resultado de una frase. grade "half" = «más o menos» en escuchar y repetir:
   * cuenta como acierto pero no sube de caja.
   */
  function applyPhrase(s, q, correct, now, combo, practice, grade) {
    const ps = phraseState(s, q.p);
    const d = today(s, now);
    ps.seen++;
    ps.last = now;
    s.stats.answers++;
    d.answers++;
    let xp = 0, lifeLost = false;
    if (correct) {
      ps.ok++;
      s.stats.correct++;
      d.correct++;
      s.stats.phraseOk++;
      if (q.kind === "pshadow") { ps.shadow++; s.stats.shadowOk++; }
      if (grade !== "half" && ps.due <= now) {
        ps.box = Math.min(MAX_BOX, ps.box + 1);
        ps.due = startOfDay(now) + INTERVALS[ps.box] * DAY;
      }
      const base = { pchoose: 10, plisten: 12, porder: 16, ptype: 25, pshadow: 14 }[q.kind] || 10;
      const mult = (LEVELS[s.settings.level] || LEVELS[1]).xp;
      xp = Math.round((base + Math.min(10, combo * 2)) * mult * (grade === "half" ? 0.5 : 1));
      s.stats.bestCombo = Math.max(s.stats.bestCombo, combo + 1);
    } else {
      ps.ko++;
      ps.box = Math.max(ps.box > 0 ? 1 : 0, Math.floor(ps.box / 2));
      ps.due = startOfDay(now) + DAY;
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

  // En cada ronda diaria: hasta 2 frases (primero las vencidas; si no hay, una nueva con su tarjeta).
  function phraseSteps(s, phrases, now, rnd, max) {
    const steps = [];
    const due = duePhrases(s, phrases, now).slice(0, max);
    due.forEach(p => steps.push(meetQuestion(s, p, phrases, rnd, s.phrases[p.id].box)));
    if (steps.length < max) {
      const fresh = newPhrasesAvailable(s, phrases, now)[0];
      if (fresh) { steps.push({ kind: "pintro", p: fresh.id }); steps.push(meetQuestion(s, fresh, phrases, rnd, 0, "pchoose")); }
    }
    return steps.slice(0, max + 1);
  }

  // Elige la frase para un momento de la reunión: vencidas, después las más flojas, después una nueva.
  function pickPhraseFor(s, phrases, cat, now, rnd, used, allowNew) {
    const ps = s.phrases || {};
    const list = phrases.filter(p => p.cat === cat && !used.has(p.id));
    const seen = list.filter(p => ps[p.id] && ps[p.id].intro);
    const due = seen.filter(p => ps[p.id].due <= now);
    if (due.length) return { p: pick(due, rnd), fresh: false };
    const fresh = list.find(p => !(ps[p.id] && ps[p.id].intro));
    if (allowNew && fresh) return { p: fresh, fresh: true };
    if (seen.length) {
      const weak = seen.slice().sort((a, b) => ps[a.id].box - ps[b.id].box || ps[a.id].last - ps[b.id].last).slice(0, 4);
      return { p: pick(weak, rnd), fresh: false };
    }
    return fresh ? { p: fresh, fresh: true } : null;
  }

  function buildMeeting(s, phrases, now, rnd) {
    const used = new Set();
    const steps = [];
    let freshLeft = 2;
    MEETING_PLAN.forEach((cat, i) => {
      const r = pickPhraseFor(s, phrases, cat, now, rnd, used, freshLeft > 0);
      if (!r) return;
      used.add(r.p.id);
      const stage = { stage: i + 1, stages: MEETING_PLAN.length };
      if (r.fresh) { freshLeft--; steps.push(Object.assign({ kind: "pintro", p: r.p.id }, stage)); }
      const box = r.fresh ? 0 : s.phrases[r.p.id].box;
      steps.push(Object.assign(meetQuestion(s, r.p, phrases, rnd, box, r.fresh ? "pchoose" : null), stage));
    });
    return steps;
  }

  // Escuchar y repetir: frases que ya viste (vencidas primero) y, si faltan, nuevas.
  function buildShadow(s, phrases, now, rnd, n) {
    n = n || 6;
    const ps = s.phrases || {};
    const due = duePhrases(s, phrases, now);
    const rest = shuffle(phrases.filter(p => ps[p.id] && ps[p.id].intro && !due.includes(p)), rnd);
    const fresh = newPhrasesAvailable(s, phrases, now, true);
    return due.concat(rest, fresh).slice(0, n).map(p => {
      const cat = PHRASE_CATS.find(c => c.id === p.cat);
      return { kind: "pshadow", p: p.id, cat: p.cat, catEs: cat.es, es: p.es, answer: p.en, full: p.en, fresh: !(ps[p.id] && ps[p.id].intro) };
    });
  }

  function finishPhraseGame(s, now, mode, errors) {
    const d = today(s, now);
    if (mode === "meet") s.stats.meetings++;
    if (mode === "shadow") s.stats.shadowSessions++;
    const streakInfo = touchStreak(s, now);
    const bonus = errors === 0 ? 15 : 0;
    s.xp += bonus;
    d.xp += bonus;
    return { bonus, streakInfo };
  }

  function countPhrasesLearned(s) {
    return Object.values(s.phrases || {}).filter(x => x.box >= LEARNED_BOX).length;
  }

  const Engine = {
    BANDS, PER_BAND, DAY, INTERVALS, MAX_BOX, LEARNED_BOX, MAX_LIVES, LIFE_REGEN_MS, ROUND_SIZE, TENSES, BADGES, FORM_LABELS, LEVELS,
    markKnown, placementQuiz, applyPlacement, applySnake, pick,
    dayKey, startOfDay, makeRng, shuffle, forms, formLabels,
    newState, migrate, wordState, today, countLearned, boxCounts,
    regenLives, msToNextLife, levelFor, touchStreak, liveStreak,
    dueWords, newWordsAvailable, buildRound, makeQuestion, buildKind, conj, conjugationTable, availableTenses,
    PHRASE_CATS, PHRASE_NEW_PER_DAY, MEETING_PLAN, allPhrases, phraseState, duePhrases, newPhrasesAvailable, introducePhrase,
    meetQuestion, phraseMatch, checkPhrase, applyPhrase, phraseSteps, buildMeeting, buildShadow, finishPhraseGame, countPhrasesLearned,
    checkAnswer, introduce, applyAnswer, finishRound, openChest, addTime, newBadges, lastDays
  };

  if (typeof module !== "undefined" && module.exports) module.exports = Engine;
  else root.Engine = Engine;
})(typeof window !== "undefined" ? window : globalThis);
