const test = require("node:test");
const assert = require("node:assert");
const WORDS = require("../app/js/words-work.js");
const E = require("../app/js/engine.js");

const T0 = new Date("2026-10-25T10:00:00").getTime();

test("el banco tiene 1000 palabras únicas: 200 básicas y 800 de trabajo", () => {
  assert.strictEqual(WORDS.length, 1000);
  assert.strictEqual(new Set(WORDS.map(w => w.w.toLowerCase())).size, 1000);
  assert.ok(WORDS.slice(200).every(w => w.src === "R" || w.src === "N"));
  assert.ok(WORDS.filter(w => w.src === "R").length >= 300);
  WORDS.forEach((w, i) => assert.strictEqual(w.rank, i + 1));
});

test("formas regulares e irregulares de los verbos nuevos", () => {
  const f = w => WORDS.find(x => x.w === w).f;
  assert.strictEqual(f("configure"), "configure|configures|configured|configured|configuring");
  assert.strictEqual(f("apply"), "apply|applies|applied|applied|applying");
  assert.strictEqual(f("scan"), "scan|scans|scanned|scanned|scanning");
  assert.strictEqual(f("send"), "send|sends|sent|sent|sending");
  assert.strictEqual(WORDS.find(x => x.w === "shelf").f, "shelf|shelves");
});

test("todo verbo tiene 5 formas y frases bien armadas en cada tiempo", () => {
  WORDS.filter(w => w.t === "v").forEach(w => {
    assert.strictEqual(E.forms(w).length, 5, w.w);
    E.availableTenses(w).forEach(t => {
      ["I", "She", "They"].forEach(subj => {
        const q = E.conj(w, t.id, w.sj ? "It" : subj);
        assert.ok(q.answer, w.w + " " + t.id);
        assert.ok(!/\s\s/.test(q.pre + q.answer + q.post), "doble espacio en " + w.w);
      });
    });
  });
});

test("conjugación correcta de tercera persona y pasado irregular", () => {
  const go = WORDS.find(w => w.w === "go");
  assert.strictEqual(E.conj(go, "present", "She").answer, "goes");
  assert.strictEqual(E.conj(go, "present", "I").answer, "go");
  assert.strictEqual(E.conj(go, "past", "I").answer, "went");
  assert.strictEqual(E.conj(go, "perfect", "He").pre, "He has ");
  assert.strictEqual(E.conj(go, "continuous", "I").pre, "I am ");
});

test("los verbos de estado no se preguntan en continuo", () => {
  const know = WORDS.find(w => w.w === "know");
  assert.ok(!E.availableTenses(know).some(t => t.id === "continuous"));
});

test("toda pregunta generada tiene la respuesta entre las opciones (las 3 dificultades)", () => {
  const s = E.newState(T0);
  const rnd = E.makeRng(42);
  for (const lvl of [1, 2, 3]) {
  s.settings.level = lvl;
  for (let box = 0; box <= E.MAX_BOX; box++) {
    WORDS.forEach(w => {
      const q = E.makeQuestion(s, w, WORDS, rnd, box);
      assert.ok(q, "sin pregunta para " + w.w);
      if (q.options) {
        assert.ok(q.options.some(o => o.toLowerCase() === q.answer.toLowerCase()), q.kind + " " + w.w);
        assert.strictEqual(new Set(q.options).size, q.options.length, "opciones repetidas " + w.w + " " + q.kind);
      }
      if (q.sentence) assert.ok(q.sentence.includes("___"), w.w);
      if (q.kind === "order") {
        const tiles = q.tiles.slice();
        q.answer.split(" ").forEach(t => { const i = tiles.indexOf(t); assert.ok(i >= 0, "falta ficha " + t + " en " + w.w); tiles.splice(i, 1); });
        assert.ok(E.checkAnswer(q, q.answer));
      }
      if (q.kind === "translate") assert.ok(E.checkAnswer(q, q.answer), "traducción " + q.answer);
    });
  }
  }
});

test("una ronda presenta como mucho 2 nuevas y respeta el cupo diario", () => {
  const s = E.newState(T0);
  const rnd = E.makeRng(1);
  const steps = E.buildRound(s, WORDS, T0, rnd);
  assert.strictEqual(steps.filter(x => x.kind === "intro").length, 2);
  s.settings.newPerDay = 3;
  steps.filter(x => x.kind === "intro").forEach(x => E.introduce(s, x.w, T0));
  const next = E.newWordsAvailable(s, WORDS, T0);
  assert.strictEqual(next.length, 1);
});

test("repetición espaciada: acierto sube de caja, error baja a la mitad", () => {
  const s = E.newState(T0);
  E.introduce(s, "go", T0);
  const q = { kind: "meaning", w: "go", answer: "ir" };
  E.applyAnswer(s, q, true, T0, 0);
  assert.strictEqual(s.words.go.box, 1);
  assert.ok(s.words.go.due > T0);
  // Acierto antes del vencimiento: no sube (evita "inflar" la caja en la misma sesión).
  E.applyAnswer(s, q, true, T0 + 1000, 1);
  assert.strictEqual(s.words.go.box, 1);
  s.words.go.box = 6;
  E.applyAnswer(s, q, false, T0, 0);
  assert.strictEqual(s.words.go.box, 3);
  assert.strictEqual(s.lives, E.MAX_LIVES - 1);
});

test("en modo práctica los errores no quitan vidas", () => {
  const s = E.newState(T0);
  E.introduce(s, "go", T0);
  E.applyAnswer(s, { kind: "meaning", w: "go", answer: "ir" }, false, T0, 0, true);
  assert.strictEqual(s.lives, E.MAX_LIVES);
});

test("las vidas se recargan con el tiempo", () => {
  const s = E.newState(T0);
  s.lives = 2;
  s.livesTs = T0;
  E.regenLives(s, T0 + E.LIFE_REGEN_MS * 2 + 5);
  assert.strictEqual(s.lives, 4);
});

test("racha: días seguidos suman, un hueco la reinicia, el protector la salva", () => {
  const s = E.newState(T0);
  E.touchStreak(s, T0);
  E.touchStreak(s, T0 + E.DAY);
  assert.strictEqual(s.streak.current, 2);
  E.touchStreak(s, T0 + 3 * E.DAY);
  assert.strictEqual(s.streak.current, 1);
  s.streak.freezes = 1;
  E.touchStreak(s, T0 + 5 * E.DAY);
  assert.strictEqual(s.streak.current, 2);
  assert.strictEqual(s.streak.freezes, 0);
});

test("niveles crecen de forma progresiva y rápida", () => {
  assert.strictEqual(E.levelFor(0).level, 1);
  assert.strictEqual(E.levelFor(50).level, 2);
  assert.strictEqual(E.levelFor(124).level, 2);
  assert.strictEqual(E.levelFor(125).level, 3);
});

test("el cofre diario se abre una sola vez", () => {
  const s = E.newState(T0);
  assert.ok(E.openChest(s, T0, E.makeRng(3)));
  assert.strictEqual(E.openChest(s, T0, E.makeRng(3)), null);
});

test("checkAnswer ignora mayúsculas y espacios", () => {
  assert.ok(E.checkAnswer({ answer: "went" }, "  Went "));
  assert.ok(!E.checkAnswer({ answer: "went" }, "gone"));
});

const G = require("../app/js/grammar.js");

test("gramática: los 11 tiempos x 3 formas x 6 sujetos arman oraciones válidas en inglés y castellano", () => {
  WORDS.filter(w => w.t === "v").forEach(w => {
    G.tensesFor(w, 3).forEach(t => {
      G.subjectsFor(w).forEach(sj => {
        G.POLARITIES.forEach(p => {
          const b = G.build(w, t.id, sj, p.id);
          const txt = b.en + " | " + b.es;
          assert.ok(!/undefined|null|\s\s/.test(txt), txt);
          assert.ok(b.es.length > 2, "sin castellano: " + w.w);
          if (p.id === "q") { assert.ok(b.en.endsWith("?") && b.es.startsWith("¿"), txt); }
          else assert.ok(b.verb && b.en.includes(b.verb), txt);
        });
      });
    });
  });
});

test("gramática: conjugaciones clave", () => {
  const go = WORDS.find(w => w.w === "go");
  assert.strictEqual(G.build(go, "past", "she", "neg").en, "She didn't go home yesterday.");
  assert.strictEqual(G.build(go, "perfect", "they", "q").en, "Have they gone home before?");
  assert.strictEqual(G.build(go, "pastcont", "I", "aff").es, "Yo estaba yendo a casa anoche a las ocho.");
  assert.strictEqual(G.build(go, "goingto", "he", "neg").en, "He isn't going to go home next week.");
  assert.strictEqual(G.build(go, "perfcont", "we", "aff").en, "We have been going home all day.");
  const like = WORDS.find(w => w.w === "like");
  assert.strictEqual(G.build(like, "present", "she", "aff").es, "A ella le gusta la pizza.");
});

test("traducción: acepta contracciones desarmadas y omitir la expresión de tiempo", () => {
  const go = WORDS.find(w => w.w === "go");
  const b = G.build(go, "past", "she", "neg");
  assert.ok(G.checkSentence(b, "she did not go home yesterday", go));
  assert.ok(G.checkSentence(b, "She didn't go home", go));
  assert.ok(!G.checkSentence(b, "She doesn't go home yesterday", go));
});

test("«Ya la sé» y prueba de nivel marcan palabras como sabidas", () => {
  const s = E.newState(T0);
  E.markKnown(s, "go", T0);
  assert.strictEqual(s.words.go.box, 3);
  assert.ok(s.words.go.due > T0);
  const quiz = E.placementQuiz(WORDS, E.makeRng(5));
  assert.strictEqual(quiz.length, E.BANDS.length * E.PER_BAND);
  const res = E.applyPlacement(s, WORDS, quiz.map(q => ({ band: q.band, ok: q.band < 2 })), T0, E.makeRng(5));
  assert.deepStrictEqual(res.bands, [0, 1]);
  assert.strictEqual(res.marked, 99);
});

test("viborita suma puntos y registra palabras", () => {
  const s = E.newState(T0);
  E.introduce(s, "go", T0);
  const xp = E.applySnake(s, T0, 120, ["go"]);
  assert.strictEqual(xp, 60);
  assert.strictEqual(s.stats.snakeBest, 120);
  assert.strictEqual(s.words.go.ok, 1);
});

const PHRASES = require("../app/js/phrases.js");

test("frases de reunión: 100 únicas en 4 categorías, con inglés y castellano", () => {
  assert.strictEqual(PHRASES.length, 100);
  assert.strictEqual(new Set(PHRASES.map(p => p.id)).size, 100);
  assert.strictEqual(new Set(PHRASES.map(p => p.en.toLowerCase())).size, 100);
  const byCat = {};
  PHRASES.forEach(p => { byCat[p.cat] = (byCat[p.cat] || 0) + 1; assert.ok(p.es && p.en && Array.isArray(p.alt), p.id); });
  assert.deepStrictEqual(Object.keys(byCat).sort(), ["bye", "hi", "open", "tech"]);
  assert.ok(PHRASES.filter(p => p.n > 0).length >= 90, "la mayoría sale de tus reuniones");
});

test("frases: la escritura acepta contracciones, formas alternativas y un error de tipeo", () => {
  const p = id => PHRASES.find(x => x.id === id);
  const inv = PHRASES.find(x => x.en === "It's an advance invoice.");
  assert.ok(E.phraseMatch(inv, "It is an advance invoice"));
  assert.ok(E.phraseMatch(inv, "its an advance invoce"));
  assert.ok(E.phraseMatch(inv, "It's a prepayment invoice."));
  assert.ok(!E.phraseMatch(inv, "It's a credit note."));
  PHRASES.forEach(a => PHRASES.forEach(b => { if (a !== b) assert.ok(!E.phraseMatch(a, b.en), a.en + " <- " + b.en); }));
  assert.ok(p("hi01"));
});

test("frases: preguntas válidas en las 3 dificultades", () => {
  const s = E.newState(T0);
  const rnd = E.makeRng(9);
  for (const lvl of [1, 2, 3]) {
    s.settings.level = lvl;
    PHRASES.forEach(p => {
      for (let box = 0; box <= 3; box++) {
        const q = E.meetQuestion(s, p, PHRASES, rnd, box);
        if (q.options) {
          assert.ok(q.options.includes(q.answer), q.kind + " " + p.id);
          assert.strictEqual(new Set(q.options).size, q.options.length);
        }
        if (q.kind === "porder") assert.ok(E.checkAnswer(q, q.answer));
        if (q.kind === "ptype") assert.ok(E.checkAnswer(q, p.en));
        assert.ok(E.checkAnswer(q, q.answer), q.kind);
      }
    });
  }
});

test("simulador de reunión: sigue saludo, inicio, técnica y cierre", () => {
  const s = E.newState(T0);
  const steps = E.buildMeeting(s, PHRASES, T0, E.makeRng(4));
  const cats = steps.filter(x => x.kind !== "pintro").map(x => x.cat);
  assert.deepStrictEqual(cats, ["hi", "open", "tech", "tech", "tech", "bye"]);
  steps.filter(x => x.kind === "pintro").forEach(x => E.introducePhrase(s, x.p, T0));
  const q = steps.find(x => x.kind !== "pintro");
  const r = E.applyPhrase(s, q, true, T0, 0, true);
  assert.ok(r.xp > 0);
  assert.strictEqual(s.phrases[q.p].box, 1);
  E.finishPhraseGame(s, T0, "meet", 0);
  assert.strictEqual(s.stats.meetings, 1);
});

test("ronda diaria: suma tus frases con su cupo y repaso espaciado", () => {
  const s = E.newState(T0);
  const steps = E.buildRound(s, WORDS, T0, E.makeRng(2));
  assert.strictEqual(steps.filter(x => x.kind === "pintro").length, 1);
  for (let i = 0; i < 5; i++) {
    const fresh = E.newPhrasesAvailable(s, PHRASES, T0)[0];
    if (fresh) E.introducePhrase(s, fresh.id, T0);
  }
  assert.strictEqual(s.stats.phrasesIntro, E.PHRASE_NEW_PER_DAY);
  const id = Object.keys(s.phrases)[0];
  E.applyPhrase(s, { kind: "pshadow", p: id }, true, T0, 0, true, "half");
  assert.strictEqual(s.phrases[id].box, 0, "«más o menos» no sube de caja");
  assert.strictEqual(s.stats.shadowOk, 1);
  E.applyPhrase(s, { kind: "pchoose", p: id }, false, T0, 0, false);
  assert.strictEqual(s.lives, E.MAX_LIVES - 1);
});

const PREPS = require("../app/js/preps.js");

test("preposiciones: 21 reglas con porqué, ejemplos y oraciones con truco bien armadas", () => {
  assert.strictEqual(PREPS.length, 21);
  let n = 0;
  PREPS.forEach(r => {
    assert.ok(r.why.length > 80 && r.k && r.ex.length >= 2, r.id);
    r.items.forEach(it => {
      n++;
      assert.strictEqual(it.s.split("___").length, 2, it.s);
      assert.strictEqual(new Set([it.a, it.trap, it.extra]).size, 3, it.s);
      const full = E.fillPrep(it.s, it.a);
      assert.ok(!/___|\s\s|\s[.?!,]/.test(full), full);
      assert.notStrictEqual(full, E.fillPrep(it.s, it.trap));
    });
  });
  assert.ok(n >= 120);
  assert.strictEqual(E.fillPrep("Let's discuss ___ the scope.", "—"), "Let's discuss the scope.");
});

test("preposiciones: elegir la correcta y corregir escribiendo", () => {
  const s = E.newState(T0);
  const rnd = E.makeRng(7);
  PREPS.forEach(r => {
    const q = E.prepQuestion(s, r, rnd, 0, "prepchoose");
    assert.ok(q.options.includes(q.answer) && q.options.includes(q.trap));
    assert.ok(E.checkAnswer(q, q.answer) && !E.checkAnswer(q, q.trap));
    const f = E.prepQuestion(s, r, rnd, 3, "prepfix");
    assert.ok(E.checkAnswer(f, f.full.toLowerCase()));
    assert.ok(!E.checkAnswer(f, f.wrong), "la oración con trampa no vale: " + f.wrong);
  });
  const dep = PREPS.find(r => r.id === "c-on");
  const q = { kind: "prepfix", r: "c-on", full: "It depends on the customer." };
  assert.ok(E.checkAnswer(q, "it depends on the customer"));
  assert.ok(!E.checkAnswer(q, "It depends of the customer."));
  assert.ok(dep);
});

test("preposiciones en la ronda: regla nueva con su tarjeta, cupo diario y repaso espaciado", () => {
  const s = E.newState(T0);
  const steps = E.buildRound(s, WORDS, T0, E.makeRng(2));
  const intro = steps.find(x => x.kind === "prepintro");
  assert.ok(intro);
  E.introducePrep(s, intro.r, T0);
  E.introducePrep(s, "c-on", T0);
  const next = E.buildRound(s, WORDS, T0, E.makeRng(3)).filter(x => x.r);
  assert.ok(next.length >= 1 && next.every(x => x.kind !== "prepintro"), "cupo de 2 reglas nuevas por día");
  const q = E.prepQuestion(s, PREPS.find(r => r.id === "c-on"), E.makeRng(1), 0, "prepchoose");
  E.applyAnswer(s, q, true, T0, 0, false);
  assert.strictEqual(s.preps["c-on"].box, 1);
  assert.strictEqual(s.stats.prepOk, 1);
  E.applyAnswer(s, q, false, T0, 0, false);
  assert.strictEqual(s.lives, E.MAX_LIVES - 1);
  s.settings.level = 3;
  const kinds = new Set();
  for (let i = 0; i < 40; i++) kinds.add(E.prepQuestion(s, PREPS[0], E.makeRng(i), 3).kind);
  assert.deepStrictEqual([...kinds].sort(), ["prepchoose", "prepfix"]);
});

const PHRASALS = require("../app/js/phrasals.js");
const ROLEPLAYS = require("../app/js/roleplays.js");
const Crossword = require("../app/js/crossword.js");

test("phrasal verbs: 200 únicos con partícula marcada, ejemplo y ancla", () => {
  assert.strictEqual(PHRASALS.length, 200);
  assert.strictEqual(new Set(PHRASALS.map(x => x.w)).size, 200);
  PHRASALS.forEach(x => {
    assert.ok(["s", "i", "n"].includes(x.kind), x.w);
    assert.strictEqual(x.part, x.w.split(" ").slice(1).join(" "), x.w);
    assert.ok(x.cloze.includes("___") && !/[\[\]]/.test(x.ex), x.w);
    assert.strictEqual(x.cloze.replace("___", x.part), x.ex, x.w);
    assert.ok(x.es && x.xe && x.mn && x.past, x.w);
  });
});

test("phrasal verbs: preguntas válidas, cupo diario y repaso espaciado", () => {
  const s = E.newState(T0);
  const rnd = E.makeRng(11);
  for (const lvl of [1, 2, 3]) {
    s.settings.level = lvl;
    PHRASALS.forEach(x => {
      for (let box = 0; box <= 3; box++) {
        const q = E.pvQuestion(s, x, PHRASALS, rnd, box);
        if (q.options) {
          assert.ok(q.options.includes(q.answer), q.kind + " " + x.w);
          assert.strictEqual(new Set(q.options).size, q.options.length, x.w);
          assert.ok(q.options.length >= 3, x.w);
        }
        assert.ok(E.checkAnswer(q, q.answer));
      }
    });
  }
  s.settings.level = 1;
  const steps = E.pvSteps(s, PHRASALS, T0, rnd, 2);
  assert.deepStrictEqual(steps.map(x => x.kind), ["pvintro", "pvpart"]);
  for (let i = 0; i < 6; i++) { const st = E.pvSteps(s, PHRASALS, T0, rnd, 2).find(x => x.kind === "pvintro"); if (st) { E.introducePv(s, st.v, T0); s.pvs[st.v].due = T0 + 2 * E.DAY; } }
  assert.strictEqual(s.stats.pvsIntro, E.PV_NEW_PER_DAY);
  const q = E.pvQuestion(s, PHRASALS[0], PHRASALS, rnd, 0, "pvpart");
  s.pvs[PHRASALS[0].id].due = T0;
  E.applyAnswer(s, q, true, T0, 0, false);
  assert.strictEqual(s.pvs[PHRASALS[0].id].box, 1);
  assert.strictEqual(s.stats.pvOk, 1);
});

test("la ronda rota los módulos extra: como mucho 2 por ronda", () => {
  const s = E.newState(T0);
  WORDS.filter(w => w.t === "v").slice(0, 6).forEach(w => E.introduce(s, w.w, T0));
  const mods = x => (x.p ? "frase" : x.r ? "prep" : x.v ? "pv" : x.kind === "burst" || x.burst ? "burst" : null);
  const seen = new Set();
  for (let r = 0; r < 4; r++) {
    E.today(s, T0).rounds = r;
    const used = new Set(E.buildRound(s, WORDS, T0, E.makeRng(r + 1)).map(mods).filter(Boolean));
    assert.ok(used.size <= 2, "ronda " + r + ": " + [...used]);
    used.forEach(x => seen.add(x));
  }
  assert.deepStrictEqual([...seen].sort(), ["burst", "frase", "prep", "pv"]);
});

test("ráfaga de estructura: 3 modelos con el mismo tiempo y una cuarta para producir", () => {
  const s = E.newState(T0);
  assert.deepStrictEqual(E.burstSteps(s, WORDS, E.makeRng(1)), []);
  WORDS.filter(w => w.t === "v").slice(0, 8).forEach(w => E.introduce(s, w.w, T0));
  for (const lvl of [1, 2, 3]) {
    s.settings.level = lvl;
    for (let i = 0; i < 20; i++) {
      const [card, q] = E.burstSteps(s, WORDS, E.makeRng(i + lvl * 100));
      assert.strictEqual(card.models.length, 3);
      assert.strictEqual(new Set(card.models.map(m => m.w).concat(q.w)).size, 4, "4 verbos distintos");
      if (card.polEs !== "pregunta") card.models.forEach(m => assert.ok(m.en.includes(m.verb), m.en + " / " + m.verb));
      assert.strictEqual(q.tense, card.tense);
      assert.ok(E.checkAnswer(q, q.kind === "translate" ? q.full : q.answer), q.kind);
      if (q.options) assert.ok(q.options.includes(q.answer));
    }
  }
});

test("role-play: 16 conversaciones de 6 turnos, con respuesta modelo y opciones incorrectas", () => {
  assert.strictEqual(ROLEPLAYS.length, 16);
  const s = E.newState(T0);
  ROLEPLAYS.forEach(sc => {
    assert.strictEqual(sc.turns.length, 6, sc.id);
    sc.turns.forEach(t => {
      assert.ok(t.them && t.themEs && t.es && t.en, sc.id);
      assert.strictEqual(t.bad.length, 2);
      assert.strictEqual(new Set([t.en].concat(t.alt, t.bad).map(x => x.toLowerCase())).size, 3 + t.alt.length, sc.id + ": " + t.en);
    });
    for (const lvl of [1, 2, 3]) {
      s.settings.level = lvl;
      E.roleplaySteps(s, sc, E.makeRng(lvl)).forEach((q, i) => {
        assert.ok(E.checkAnswer(q, q.answer), q.kind + " " + q.answer);
        if (q.kind === "rchoose") sc.turns[i].bad.forEach(b => assert.ok(!E.checkAnswer(q, b)));
        if (q.kind === "rtype") {
          q.alt.forEach(a => assert.ok(E.checkAnswer(q, a), a));
          sc.turns[i].bad.forEach(b => assert.ok(!E.checkAnswer(q, b), "acepta una incorrecta: " + b));
        }
      });
    }
  });
  s.settings.level = 1;
  const first = E.pickRoleplay(s, ROLEPLAYS);
  E.finishRoleplay(s, T0, first.id, 5, 6);
  assert.strictEqual(s.roles[first.id].best, 83);
  assert.notStrictEqual(E.pickRoleplay(s, ROLEPLAYS).id, first.id);
});

test("crucigrama: las palabras se cruzan bien y la grilla coincide con las respuestas", () => {
  const s = E.newState(T0);
  for (let seed = 1; seed <= 30; seed++) {
    const rnd = E.makeRng(seed);
    const puz = Crossword.generate(E.crosswordPool(s, WORDS, PHRASALS, rnd, 9), rnd, { size: 9, words: 7 });
    assert.ok(puz && puz.words.length >= 5, "pocas palabras con semilla " + seed);
    const count = {};
    puz.words.forEach(w => Crossword.cellsOf(w).forEach(([r, c], i) => {
      assert.strictEqual(puz.cells[r][c], w.answer[i]);
      count[r + "," + c] = (count[r + "," + c] || 0) + 1;
    }));
    let letters = 0;
    puz.cells.forEach(row => row.forEach(c => { if (c) letters++; }));
    assert.strictEqual(Object.keys(count).length, letters, "no hay letras sueltas");
    // Ninguna secuencia de 2 o más letras en la grilla queda sin ser una palabra del crucigrama.
    const runs = [];
    for (let i = 0; i < 9; i++) {
      runs.push(...puz.cells[i].map(c => c || " ").join("").split(" "), ...puz.cells.map(r => r[i] || " ").join("").split(" "));
    }
    runs.filter(x => x.length > 1).forEach(x => assert.ok(puz.words.some(w => w.answer === x), "secuencia extra " + x));
  }
  const xp = E.applyCrossword(s, T0, ["go", "have"], 1, true);
  assert.strictEqual(xp, 34);
  assert.strictEqual(s.stats.crosswords, 1);
});

test("menú de phrasal verbs: la partida usa solo la lista filtrada", () => {
  const s = E.newState(T0);
  const ups = PHRASALS.filter(x => x.part === "up");
  for (let round = 0; round < 6; round++) {
    const steps = E.buildPvGame(s, PHRASALS, ups, T0 + round, E.makeRng(round + 1), 8);
    assert.ok(steps.length >= 6);
    steps.forEach(q => assert.strictEqual(E.allPhrasals().find(x => x.id === q.v).part, "up"));
    assert.ok(steps.filter(q => q.kind === "pvintro").length <= 3);
    steps.filter(q => q.kind !== "pvintro").forEach(q => assert.ok(E.checkAnswer(q, q.answer)));
    steps.filter(q => q.kind === "pvintro").forEach(q => E.introducePv(s, q.v, T0));
  }
  const one = E.buildPvGame(s, PHRASALS, [PHRASALS[5]], T0, E.makeRng(9), 8);
  assert.ok(one.length >= 1 && one.every(q => q.v === PHRASALS[5].id));
  E.finishPvGame(s, T0, 0);
  assert.strictEqual(s.stats.pvGames, 1);
});
