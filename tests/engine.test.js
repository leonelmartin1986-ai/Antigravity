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
