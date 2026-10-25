/* Interfaz de Word Beat: pantallas, sesión de juego, voz, sonidos y guardado local. */
(function () {
  "use strict";
  const E = window.Engine;
  const WORDS = window.WORDS;
  const BY_WORD = Object.fromEntries(WORDS.map(w => [w.w, w]));
  const KEY = "wordbeat.v1";
  const $ = id => document.getElementById(id);

  const TYPE_ES = { v: "verbo", aux: "verbo auxiliar", pron: "pronombre", n: "sustantivo", adj: "adjetivo", adv: "adverbio", prep: "preposición", conj: "conjunción", det: "determinante", num: "número" };
  const BOX_ES = ["Nueva", "Caja 1 · mañana", "Caja 2 · 2 días", "Caja 3 · 4 días", "Caja 4 · 1 semana", "Caja 5 · 15 días", "Caja 6 · 1 mes", "Caja 7 · dominada"];
  const KIND_ES = { meaning: "¿Qué significa?", reverse: "¿Cómo se dice en inglés?", listen: "Escuchá y elegí", tense: "Completá con el tiempo verbal", formid: "¿Qué forma es?", cloze: "Completá la frase", spell: "Escribila en inglés", phrase: "Elegí el verbo conjugado", order: "Armá la oración", translate: "Traducí la oración" };
  const Gr = window.Grammar;

  const TIPS = [
    "Decí cada palabra en voz alta. Oírte a vos mismo agrega una segunda huella en la memoria.",
    "Mejor 1 ronda hoy que 6 el domingo. La memoria se fija con repasos separados.",
    "Si fallás, leé la mnemotecnia y armá la imagen en la cabeza 3 segundos. Ese momento vale más que el acierto.",
    "Jugá siempre a la misma hora (con el café, en el colectivo). El hábito no depende de la fuerza de voluntad.",
    "Cuando escuches una canción en inglés, buscá las palabras que ya aprendiste: es repaso gratis.",
    "Los verbos irregulares son pocos pero son los más usados: go-went-gone, see-saw-seen, take-took-taken.",
    "Si te distraés, no pasa nada: la ronda te espera. Volvé y seguí desde donde estabas.",
    "Usá auriculares para la voz: aislar el sonido ayuda a sostener la atención.",
    "Intentá adivinar antes de mirar las opciones. Recordar con esfuerzo es lo que fija la palabra."
  ];

  const SCIENCE = [
    { t: "Recordar es mejor que releer", p: "La práctica de recuperación (testing effect) es una de las dos técnicas con «alta utilidad» en la revisión de Dunlosky y colegas (2013). En estudiantes universitarios con TDAH también supera a releer (Knouse y colegas, 2016).", a: "Por eso casi todo son preguntas: la app te hace sacar la palabra de la memoria en vez de mostrártela." },
    { t: "Repasar con espacios crecientes", p: "El repaso espaciado gana al estudio en bloque en casi 1.000 experimentos (Cepeda y colegas, 2006). El mejor intervalo crece a medida que querés recordar por más tiempo.", a: "Cada palabra vive en una caja: si la acertás vuelve en 1, 2, 4, 7, 15, 30 y 60 días; si la fallás vuelve mañana." },
    { t: "Con TDAH, el cuello de botella es la entrada", p: "Un metaanálisis sobre memoria en adultos con TDAH (Skodzik y colegas, 2017) encontró que la dificultad está sobre todo al codificar (aprender), no al recuperar. La memoria de trabajo también rinde menos (Alderson y colegas, 2013).", a: "Por eso las palabras nuevas entran de a dos por ronda, con imagen mental, sonido y ejemplo a la vez, y se preguntan dos veces en la misma ronda." },
    { t: "Mnemotecnia de palabra clave", p: "Asociar la palabra con algo que suena parecido en español y una imagen mejora el recuerdo inmediato y a un día, también en adultos (Campos y colegas). Sola puede olvidarse antes que la repetición (Wang y colegas, 1992); combinada con repaso espaciado se compensa.", a: "Cada palabra tiene su ancla («KNOW se dice NOU: NO sé... ¡pero ahora sí lo KNOW!») y la app la repasa en el tiempo." },
    { t: "Doble código: ver y oír", p: "Combinar texto, sonido e imagen mental da dos rutas para recuperar el recuerdo (teoría de la codificación dual de Paivio).", a: "La app pronuncia cada palabra y te muestra cómo suena escrita en español." },
    { t: "Sesiones cortas y metas visibles", p: "Con TDAH cuesta sostener tareas largas sin una señal de avance; el feedback inmediato y las recompensas cercanas ayudan a mantener la motivación (aversión a la demora, Sonuga-Barke).", a: "Rondas de 2 minutos, barra de progreso en cada pregunta, puntos al instante y un cofre sorpresa al cumplir los 10 minutos." },
    { t: "Sin castigos que bloqueen", p: "La frustración y la sensibilidad al rechazo hacen que muchas personas con TDAH abandonen un hábito ante un mal día.", a: "Las vidas nunca te dejan afuera: sin vidas entrás en práctica libre y recuperás una. Un error baja la palabra a la mitad, no a cero. La racha tiene protectores." },
    { t: "Producir oraciones, no solo reconocer", p: "Armar y escribir la oración completa obliga a recuperar la palabra y la gramática a la vez (efecto de generación). Es más difícil que elegir una opción, por eso aparece en las dificultades Intermedio y Avanzado.", a: "Ejercicios de ordenar fichas y de traducir escribiendo, con los 11 tiempos en afirmativa, negativa y pregunta." },
    { t: "Pausas activas con juego", p: "Un cambio de actividad corto y con movimiento ayuda a recuperar la atención sin dejar de practicar.", a: "La viborita repasa la ortografía de las palabras y sus tiempos verbales comiendo letras en orden." },
    { t: "Variedad para sostener la atención", p: "Alternar tipos de tarea (práctica intercalada) mejora la retención y reduce el aburrimiento.", a: "Siete tipos de pregunta: significado, al revés, escuchar, tiempos verbales, forma verbal, completar frases y escribir." }
  ];

  /* ---------- estado y guardado ---------- */
  let S = load();
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return E.migrate(raw ? JSON.parse(raw) : null, Date.now());
    } catch (e) { return E.newState(Date.now()); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin almacenamiento: sigue en memoria */ }
  }

  const rnd = E.makeRng(Date.now() & 0xffffffff);

  /* ---------- voz ---------- */
  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /en[-_]US/i.test(v.lang) && /samantha|google|aria|jenny|natural/i.test(v.name)) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    if (!text) return;
    // En la app de Android la voz la pone el sistema (WebView no trae speechSynthesis).
    if (window.AndroidTTS) {
      try { window.AndroidTTS.speak(String(text), Number(S.settings.rate) || 0.85); } catch (e) { /* la voz es opcional */ }
      return;
    }
    if (!("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      if (voice) u.voice = voice;
      u.rate = Number(S.settings.rate) || 0.85;
      speechSynthesis.speak(u);
    } catch (e) { /* la voz es opcional */ }
  }

  /* ---------- sonido ---------- */
  let ac = null;
  function tone(freqs, dur, type) {
    if (!S.settings.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      let t = ac.currentTime;
      freqs.forEach(f => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type || "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(ac.destination);
        o.start(t); o.stop(t + dur + 0.02);
        t += dur * 0.7;
      });
    } catch (e) { /* sin audio */ }
  }
  const sfx = {
    ok: () => tone([660, 880], 0.12),
    ko: () => { tone([220, 180], 0.16, "triangle"); vibrate(120); },
    level: () => tone([523, 659, 784, 1047], 0.13),
    chest: () => tone([392, 523, 659, 784, 1047], 0.1, "triangle")
  };
  function vibrate(ms) { if (S.settings.sound && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* opcional */ } }

  /* ---------- utilidades de UI ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  const ICON_SPEAK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';

  let toastTimer = 0;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  function burst() {
    if (S.settings.calm || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = $("burst");
    const colors = ["var(--accent)", "var(--sun)", "var(--heart)", "var(--ok)", "var(--flame)"];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.top = -10 - Math.random() * 20 + "px";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.3 + "s";
      b.appendChild(p);
    }
    setTimeout(() => { b.innerHTML = ""; }, 1900);
  }

  function popStat(id) {
    const el = $(id);
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  /* ---------- barra superior e inicio ---------- */
  function renderTop() {
    const now = Date.now();
    E.regenLives(S, now);
    const st = E.liveStreak(S, now);
    $("v-streak").textContent = st;
    $("stat-streak").classList.toggle("cold", E.today(S, now).rounds === 0);
    $("v-xp").textContent = S.xp;
    $("v-lives").textContent = S.lives;
  }

  function renderHome() {
    const now = Date.now();
    renderTop();
    const lv = E.levelFor(S.xp);
    $("v-level").textContent = lv.level;
    $("v-level-title").textContent = lv.title;
    $("v-level-into").textContent = lv.into;
    $("v-level-need").textContent = lv.need;
    $("v-level-bar").style.width = Math.round(lv.into / lv.need * 100) + "%";

    const d = E.today(S, now);
    const goal = Number(S.settings.goalMin);
    const min = Math.floor(d.ms / 60000);
    $("v-min").textContent = min;
    $("v-goal").textContent = goal;
    const pct = Math.min(100, d.ms / (goal * 60000) * 100);
    $("ring-fill").setAttribute("stroke-dasharray", pct.toFixed(1) + " 100");
    $("ring-fill").style.opacity = pct > 0 ? 1 : 0;
    document.querySelector(".goal").classList.toggle("done", pct >= 100);
    $("v-goal-cap").textContent = pct >= 100 ? "¡Meta cumplida!" : "Meta de hoy";

    const due = E.dueWords(S, WORDS, now).length;
    const fresh = E.newWordsAvailable(S, WORDS, now).length;
    $("v-due").textContent = due;
    $("v-new").textContent = fresh;
    $("v-learned").textContent = E.countLearned(S);
    $("v-learned-lab").textContent = "de " + WORDS.length + " aprendidas";

    const started = d.rounds > 0;
    $("btn-start-label").textContent = S.lives === 0 ? "Práctica libre" : started ? "Otra ronda" : "Jugar una ronda";
    $("v-start-hint").textContent = due + fresh === 0 && Object.keys(S.words).length > 0
      ? "Sin repasos pendientes: la ronda refuerza tus palabras más flojas."
      : "Rondas de 8 preguntas, unos 2 minutos cada una.";

    const note = $("v-lives-note");
    if (S.lives < E.MAX_LIVES) {
      const ms = E.msToNextLife(S, now);
      note.hidden = false;
      note.textContent = S.lives === 0
        ? "Te quedaste sin vidas. Jugá una práctica libre: los errores no restan y al terminar recuperás una vida."
        : "Próxima vida en " + Math.ceil(ms / 60000) + " min.";
    } else note.hidden = true;

    $("v-diff").textContent = "Dificultad: " + E.LEVELS[S.settings.level || 1].name;
    $("placement-banner").hidden = !!S.stats.placementDone || S.stats.introduced >= 30;

    const dayIdx = Math.floor(now / E.DAY);
    $("v-tip").textContent = TIPS[dayIdx % TIPS.length];
  }

  /* ---------- navegación ---------- */
  let current = "home";
  function go(view) {
    if (current === "snake" && view !== "snake") snakePause();
    current = view;
    document.querySelectorAll(".view").forEach(v => { v.hidden = v.dataset.view !== view; });
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("on", t.dataset.go === view));
    $("app").classList.toggle("playing", view === "play" || view === "placement");
    if (view === "home") renderHome();
    if (view === "snake") snakeOpen();
    if (view === "words") renderWords();
    if (view === "stats") renderStats();
    if (view === "more") renderMore();
    renderTop();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => go(t.dataset.go)));

  /* ---------- sesión de juego ---------- */
  let R = null; // ronda en curso
  let lastActivity = Date.now();

  function startRound() {
    const now = Date.now();
    E.regenLives(S, now);
    const practice = S.lives === 0;
    const steps = E.buildRound(S, WORDS, now, rnd);
    if (!steps.length) { toast("No hay nada para jugar todavía."); return; }
    R = { steps, i: 0, combo: 0, errors: 0, correct: 0, xp: 0, practice, results: [], introduced: [], levelStart: E.levelFor(S.xp).level, waiting: false };
    go("play");
    if (practice) toast("Práctica libre: los errores no restan vidas.");
    renderSegments();
    renderStep();
  }

  function renderSegments() {
    $("segments").innerHTML = R.steps.map((st, i) => {
      const r = R.results[i];
      const cls = r === true ? "ok" : r === false ? "ko" : r === "intro" ? "intro" : i === R.i ? "now" : "";
      return '<span class="seg ' + cls + '"></span>';
    }).join("");
    const c = $("v-combo");
    c.hidden = R.combo < 3;
    c.textContent = "Combo x" + R.combo;
  }

  function cardEnter(html) {
    const card = $("card");
    card.innerHTML = html;
    card.classList.remove("enter");
    void card.offsetWidth;
    card.classList.add("enter");
    $("feedback").hidden = true;
  }

  function formsHtml(e) {
    const fs = E.forms(e), lbs = E.formLabels(e);
    if (fs.length < 2) return "";
    return '<div class="forms">' + fs.map((f, i) => '<span class="form"><strong>' + esc(f) + "</strong><small>" + esc(lbs[i] || "") + "</small></span>").join("") + "</div>";
  }

  function renderStep() {
    const st = R.steps[R.i];
    if (!st) return endRound();
    R.waiting = false;
    const e = BY_WORD[st.w];
    if (st.kind === "intro") return renderIntro(e);

    let body = '<p class="q-type"><span>' + esc(KIND_ES[st.kind]) + "</span><span>#" + e.rank + "</span></p>";
    if (st.kind === "meaning") {
      body += '<p class="q-prompt">' + esc(st.prompt) + "</p>";
      body += '<button type="button" class="speak" data-say="' + esc(e.w) + '">' + ICON_SPEAK + "Escuchar</button>";
    } else if (st.kind === "reverse") {
      body += '<p class="q-prompt es">' + esc(st.prompt) + "</p>";
    } else if (st.kind === "listen") {
      body += '<button type="button" class="speak big" data-say="' + esc(e.w) + '" aria-label="Escuchar otra vez">' + ICON_SPEAK + "</button>";
    } else if (st.kind === "tense") {
      body += '<div class="q-tense"><span class="pill">' + esc(st.tenseEs) + '</span><span class="pill sun">' + esc(st.hint) + "</span></div>";
      body += '<p class="q-sentence">' + blankify(st.sentence) + "</p>";
      body += '<p class="hint" style="text-align:center">Verbo: <strong>' + esc(e.w) + "</strong> (" + esc(e.es) + ")</p>";
    } else if (st.kind === "formid") {
      body += '<p class="q-prompt">' + esc(st.shown) + "</p>";
      body += '<p class="hint" style="text-align:center">Es una forma de <strong>' + esc(e.w) + "</strong> (" + esc(e.es) + ")</p>";
    } else if (st.kind === "cloze") {
      body += '<p class="q-sentence">' + blankify(st.sentence) + "</p>";
      if (st.translation) body += '<p class="hint" style="text-align:center">' + esc(st.translation) + "</p>";
    } else if (st.kind === "phrase") {
      body += tensePills(st);
      body += '<p class="hint" style="text-align:center">' + esc(st.es) + "</p>";
      body += '<p class="q-sentence">' + blankify(st.sentence) + "</p>";
    } else if (st.kind === "order") {
      body += tensePills(st);
      body += '<p class="es-sentence">' + esc(st.es) + "</p>";
      body += '<div class="build-line" id="build" aria-label="Tu oración"></div>';
      body += '<div class="tiles" id="tiles">' + st.tiles.map((t, i) => '<button type="button" class="tile" data-i="' + i + '">' + esc(t) + "</button>").join("") + "</div>";
      body += '<div class="order-row"><button type="button" class="btn btn-ghost" id="order-clear">Borrar</button><button type="button" class="btn btn-play" id="order-go">Comprobar</button></div>';
    } else if (st.kind === "translate") {
      body += tensePills(st);
      body += '<p class="es-sentence">' + esc(st.es) + "</p>";
      body += '<textarea class="translate-in" id="tr-in" rows="3" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Escribila en inglés" aria-label="Tu traducción en inglés"></textarea>';
      body += '<div class="order-row"><button type="button" class="btn btn-ghost" id="tr-hint">Pista</button><button type="button" class="btn btn-play" id="tr-go">Comprobar</button></div>';
    } else if (st.kind === "spell") {
      body += '<p class="q-prompt es">' + esc(st.prompt) + "</p>";
      body += '<div class="spell"><input id="spell-in" type="text" inputmode="latin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(st.hint) + '" aria-label="Escribí la palabra en inglés">' +
        '<div class="spell-row"><button type="button" class="btn btn-ghost" id="spell-hint">Pista</button><button type="button" class="btn btn-play" id="spell-go">Comprobar</button></div></div>';
    }
    if (st.options) {
      body += '<div class="options' + (st.options.every(o => o.length < 14) ? " two" : "") + '">' +
        st.options.map((o, i) => '<button type="button" class="opt" data-opt="' + esc(o) + '"><span class="opt-key">' + (i + 1) + "</span>" + esc(o) + "</button>").join("") + "</div>";
    }
    cardEnter(body);

    if (st.kind === "listen" || (st.kind === "meaning" && S.settings.tts)) setTimeout(() => speak(e.w), 150);
    document.querySelectorAll("#card .opt").forEach(b => b.addEventListener("click", () => answer(b.dataset.opt, b)));
    if (st.kind === "order") {
      const picked = [];
      const build = $("build");
      const draw = () => {
        build.innerHTML = picked.map((i, k) => '<button type="button" class="tile" data-k="' + k + '">' + esc(st.tiles[i]) + "</button>").join("");
        document.querySelectorAll("#tiles .tile").forEach(b => b.classList.toggle("used", picked.includes(Number(b.dataset.i))));
      };
      $("tiles").addEventListener("click", ev => {
        const b = ev.target.closest(".tile");
        if (!b || R.waiting || picked.includes(Number(b.dataset.i))) return;
        picked.push(Number(b.dataset.i));
        speak(st.tiles[Number(b.dataset.i)]);
        draw();
      });
      build.addEventListener("click", ev => {
        const b = ev.target.closest(".tile");
        if (!b || R.waiting) return;
        picked.splice(Number(b.dataset.k), 1);
        draw();
      });
      $("order-clear").addEventListener("click", () => { if (!R.waiting) { picked.length = 0; draw(); } });
      $("order-go").addEventListener("click", () => { if (picked.length) answer(picked.map(i => st.tiles[i]).join(" "), build); });
    }
    if (st.kind === "translate") {
      const inp = $("tr-in");
      setTimeout(() => inp.focus(), 50);
      let shown = 0;
      const words = st.full.split(" ");
      $("tr-hint").addEventListener("click", () => {
        shown = Math.min(words.length, shown + 2);
        inp.placeholder = words.slice(0, shown).join(" ") + " …";
        st.usedHint = true;
      });
      const submit = () => { if (inp.value.trim()) answer(inp.value, inp); };
      $("tr-go").addEventListener("click", submit);
      inp.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); submit(); } });
    }
    if (st.kind === "spell") {
      const inp = $("spell-in");
      setTimeout(() => inp.focus(), 50);
      let hints = 1;
      $("spell-hint").addEventListener("click", () => {
        hints = Math.min(st.answer.length, hints + 1);
        inp.placeholder = st.answer.slice(0, hints) + "·".repeat(st.answer.length - hints);
        st.usedHint = true;
      });
      const submit = () => { if (inp.value.trim()) answer(inp.value, inp); };
      $("spell-go").addEventListener("click", submit);
      inp.addEventListener("keydown", ev => { if (ev.key === "Enter") submit(); });
    }
  }

  function tensePills(st) {
    return '<div class="q-tense"><span class="pill">' + esc(st.tenseEs) + '</span><span class="pill sun">' + esc(st.hint) + "</span></div>";
  }

  function blankify(sentence) {
    return esc(sentence).replace("___", '<span class="blank">&nbsp;</span>');
  }

  // «Ya la sé»: una pregunta rápida; si la acertás, la palabra se saltea por 4 días.
  function knownCheck(e) {
    const q = E.buildKind("reverse", e, WORDS, rnd, 1);
    let body = '<p class="q-type"><span>Comprobemos rápido</span><span>#' + e.rank + "</span></p>";
    body += '<p class="q-prompt es">' + esc(q.prompt) + "</p>";
    body += '<div class="options two">' + q.options.map((o, i) => '<button type="button" class="opt" data-opt="' + esc(o) + '"><span class="opt-key">' + (i + 1) + "</span>" + esc(o) + "</button>").join("") + "</div>";
    cardEnter(body);
    document.querySelectorAll("#card .opt").forEach(b => b.addEventListener("click", () => {
      const ok = E.checkAnswer(q, b.dataset.opt);
      document.querySelectorAll("#card .opt").forEach(x => { x.disabled = true; if (E.checkAnswer(q, x.dataset.opt)) x.classList.add("ok"); else if (x === b) x.classList.add("ko"); });
      if (ok) {
        sfx.ok();
        E.markKnown(S, e.w, Date.now());
        S.xp += 5; R.xp += 5;
        R.results[R.i] = "intro";
        R.steps = R.steps.filter((x, j) => j <= R.i || x.w !== e.w);
        save();
        toast("¡Bien! La salteamos. Vuelve en 4 días para confirmar.");
        setTimeout(next, 700);
      } else {
        sfx.ko();
        toast("Mejor aprendela con la tarjeta.");
        setTimeout(() => renderIntro(e, true), 900);
      }
    }));
  }

  function srcTag(e) { return e.so ? " · canciones" : e.src === "R" ? " · de tus reuniones" : e.src === "N" ? " · negocios" : ""; }

  function renderIntro(e, noKnown) {
    let body = '<p class="q-type"><span>Palabra nueva</span><span>#' + e.rank + srcTag(e) + "</span></p>";
    body += '<p class="intro-word">' + esc(e.w) + "</p>";
    body += '<div class="intro-meta"><button type="button" class="speak" data-say="' + esc(e.w) + '">' + ICON_SPEAK + "Se dice «" + esc(e.pr) + "»</button><span class=\"pill\">" + esc(TYPE_ES[e.t]) + "</span></div>";
    body += '<p class="intro-es">' + esc(e.es) + "</p>";
    body += '<div class="memo"><b>Ancla para recordarla</b>' + esc(e.mn) + "</div>";
    body += formsHtml(e);
    if (e.t === "v") {
      body += '<div class="mini-conj">' + ["present", "past", "perfect"].map(t => {
        const b = Gr.build(e, t, e.sj ? "it" : "I", "aff");
        return '<p><button type="button" class="speak" data-say="' + esc(b.en) + '" style="padding:4px 10px">' + esc(b.en) + "</button><span>" + esc(b.es) + "</span></p>";
      }).join("") + '<button type="button" class="link-btn" id="intro-conj">Ver los 11 tiempos, negativa y pregunta</button></div>';
    }
    body += '<p class="example"><button type="button" class="speak" data-say="' + esc(e.ex) + '">' + ICON_SPEAK + esc(e.ex) + "</button><em>" + esc(e.xe) + "</em></p>";
    body += '<div class="order-row">' + (noKnown ? "<span></span>" : '<button type="button" class="btn btn-ghost" id="intro-known">Ya la sé</button>') + '<button type="button" class="btn btn-play" id="intro-ok">¡La tengo!</button></div>';
    cardEnter(body);
    if (S.settings.tts) setTimeout(() => speak(e.w), 200);
    if ($("intro-conj")) $("intro-conj").addEventListener("click", () => openWord(e.w));
    if ($("intro-known")) $("intro-known").addEventListener("click", () => knownCheck(e));
    $("intro-ok").addEventListener("click", () => {
      const xp = E.introduce(S, e.w, Date.now());
      R.xp += xp;
      R.introduced.push(e.w);
      R.results[R.i] = "intro";
      save();
      next();
    });
  }

  function answer(given, el) {
    if (R.waiting) return;
    R.waiting = true;
    lastActivity = Date.now();
    const st = R.steps[R.i];
    const e = BY_WORD[st.w];
    const ok = E.checkAnswer(st, given);
    const res = E.applyAnswer(S, st, ok, Date.now(), R.combo, R.practice);
    let xp = res.xp;
    if (ok && st.usedHint) { S.xp -= Math.min(xp, 5); xp -= Math.min(xp, 5); }
    R.xp += xp;
    R.results[R.i] = ok;
    if (ok) { R.combo++; R.correct++; sfx.ok(); } else { R.combo = 0; R.errors++; sfx.ko(); }

    // marcar opciones
    document.querySelectorAll("#card .opt").forEach(b => {
      b.disabled = true;
      if (E.checkAnswer(st, b.dataset.opt)) b.classList.add("ok");
      else if (b === el) b.classList.add("ko");
    });
    if (st.kind === "spell" || st.kind === "translate") { el.classList.add(ok ? "ok" : "ko"); el.disabled = true; }
    if (st.kind === "order") el.classList.add(ok ? "ok" : "ko");
    if (res.lifeLost) popStat("stat-lives");
    if (xp) popStat("stat-xp");
    renderTop();
    renderSegments();

    // feedback: en errores se repasa el ancla (volver a codificar es lo que más sirve)
    const fb = $("feedback");
    const shown = st.kind === "order" || st.kind === "translate" ? st.full : st.answer;
    let html = '<p class="fb-title">' + (ok ? pickPraise() : "Casi. Era «" + esc(shown) + "»") + (xp ? ' <span class="fb-xp">+' + xp + " XP</span>" : "") + "</p>";
    if (st.kind === "phrase" || st.kind === "order" || st.kind === "translate") {
      html += '<p class="fb-body"><button type="button" class="speak" data-say="' + esc(st.full) + '">' + ICON_SPEAK + esc(st.full) + "</button></p>";
      html += '<p class="fb-es">' + esc(st.es) + " · " + esc(st.tenseEs) + "</p>";
    } else if (st.kind === "tense") {
      html += '<p class="fb-body"><button type="button" class="speak" data-say="' + esc(st.full) + '">' + ICON_SPEAK + esc(st.full) + "</button></p>";
      html += '<p class="fb-body">' + esc(st.tenseEs) + " de <strong>" + esc(e.w) + "</strong>: " + esc(E.forms(e).join(" · ")) + "</p>";
    } else if (st.kind === "cloze") {
      const full = st.sentence.replace("___", st.answer);
      html += '<p class="fb-body"><button type="button" class="speak" data-say="' + esc(full) + '">' + ICON_SPEAK + esc(full) + "</button></p>";
    } else {
      html += '<p class="fb-body"><strong>' + esc(e.w) + "</strong> = " + esc(e.es) + "</p>";
    }
    if (!ok) html += '<div class="memo"><b>Ancla</b>' + esc(e.mn) + "</div>";
    html += '<button type="button" class="btn ' + (ok ? "btn-ok" : "btn-play") + ' btn-wide" id="fb-next">Seguir</button>';
    fb.className = "feedback " + (ok ? "ok" : "ko");
    fb.innerHTML = html;
    fb.hidden = false;
    if (S.settings.tts && ["tense", "phrase", "order", "translate"].includes(st.kind)) speak(st.full);
    else if (S.settings.tts && !ok) speak(e.w);
    $("fb-next").addEventListener("click", next);
    if (!ok) fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
    save();
    if (ok) R.autoNext = setTimeout(next, ["order", "translate", "phrase"].includes(st.kind) ? 2600 : st.kind === "tense" ? 1900 : 1100);
  }

  const PRAISE = ["¡Bien!", "¡Exacto!", "¡Eso es!", "¡Genial!", "¡Perfecto!", "¡Muy bien!"];
  function pickPraise() { return R.combo >= 5 ? "¡En racha! x" + R.combo : PRAISE[Math.floor(rnd() * PRAISE.length)]; }

  function next() {
    if (!R) return;
    clearTimeout(R.autoNext);
    R.i++;
    renderSegments();
    renderStep();
  }

  function endRound() {
    const now = Date.now();
    const fin = E.finishRound(S, now, R.errors, rnd);
    R.xp += fin.bonus;
    let regained = false;
    if (R.practice && R.correct >= Math.ceil(R.steps.length * 0.6)) { S.lives = Math.min(E.MAX_LIVES, S.lives + 1); S.livesTs = now; regained = true; }
    const d = E.today(S, now);
    const goalReached = d.ms >= Number(S.settings.goalMin) * 60000 && !d.goal;
    const badges = E.newBadges(S);
    const lvNow = E.levelFor(S.xp);
    const leveled = lvNow.level > R.levelStart;
    save();

    const total = R.results.filter(x => x === true || x === false).length;
    const title = R.errors === 0 && total > 0 ? "¡Ronda perfecta!" : R.correct >= total * 0.7 ? "¡Buena ronda!" : "Ronda completa";
    let html = '<p class="eyebrow">Ronda terminada</p><h2 class="sum-title">' + title + "</h2>";
    html += '<div class="sum-grid">' +
      mini("+" + R.xp, "puntos") + mini(R.correct + "/" + total, "aciertos") + mini(R.introduced.length, "palabras nuevas") + "</div>";
    if (fin.bonus) html += '<p class="hint">+' + fin.bonus + " XP de bonus por no fallar ninguna.</p>";
    if (fin.streakInfo.changed) html += '<p class="hint">Racha: ' + S.streak.current + " día" + (S.streak.current === 1 ? "" : "s") + (fin.streakInfo.earnedFreeze ? ". Ganaste un protector de racha." : fin.streakInfo.usedFreeze ? ". Un protector salvó tu racha." : ".") + "</p>";
    if (regained) html += '<p class="hint">Recuperaste una vida.</p>';
    if (leveled) html += '<div class="chest"><strong>¡Subiste al nivel ' + lvNow.level + "!</strong><span>" + esc(lvNow.title) + "</span></div>";
    if (goalReached) {
      html += '<button type="button" class="chest closed" id="chest" aria-label="Abrir el cofre de la meta diaria">' + CHEST + "<strong>¡Cumpliste tus " + S.settings.goalMin + " minutos!</strong><span>Tocá para abrir el cofre</span></button>";
    }
    if (badges.length) html += badges.map(b => '<div class="chest"><strong>Nuevo logro: ' + esc(b.name) + "</strong><span>" + esc(b.desc) + "</span></div>").join("");
    const goalLeft = Math.max(0, Number(S.settings.goalMin) * 60000 - d.ms);
    html += '<div class="sum-actions"><button type="button" class="btn btn-play" id="sum-again">' + (goalLeft > 0 ? "Otra ronda (" + (Math.ceil(goalLeft / 60000) === 1 ? "falta 1 min" : "faltan " + Math.ceil(goalLeft / 60000) + " min") + ")" : "Otra ronda") + '</button><button type="button" class="btn btn-ghost" id="sum-home">Terminar por hoy</button></div>';
    $("summary").innerHTML = html;
    R = null;
    go("summary");
    if (leveled || badges.length) { sfx.level(); burst(); }
    $("sum-again").addEventListener("click", startRound);
    $("sum-home").addEventListener("click", () => go("home"));
    const chest = $("chest");
    if (chest) chest.addEventListener("click", () => {
      const prize = E.openChest(S, Date.now(), rnd);
      save();
      if (!prize) return;
      sfx.chest(); burst();
      chest.classList.remove("closed");
      chest.disabled = true;
      chest.innerHTML = CHEST + "<strong>+" + prize.xp + " XP</strong><span>" + (prize.life ? "¡y una vida extra!" : prize.freeze ? "¡y un protector de racha!" : "Volvé mañana por otro cofre.") + "</span>";
      renderTop();
    });
  }

  const CHEST = '<svg class="chest-icon" viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="26" width="48" height="28" rx="5" fill="var(--flame)"/><path d="M8 26c0-9 7-14 24-14s24 5 24 14z" fill="var(--sun)"/><rect x="8" y="24" width="48" height="6" fill="var(--memo-ink)" opacity=".35"/><rect x="27" y="30" width="10" height="12" rx="2" fill="var(--memo-ink)"/></svg>';

  function mini(n, lab) { return '<div class="mini"><p class="mini-num">' + esc(n) + '</p><p class="mini-lab">' + esc(lab) + "</p></div>"; }

  $("btn-start").addEventListener("click", startRound);
  $("btn-quit").addEventListener("click", () => {
    if (R) { clearTimeout(R.autoNext); }
    R = null;
    save();
    go("home");
  });

  // Pronunciar cualquier botón con data-say.
  document.addEventListener("click", ev => {
    const b = ev.target.closest("[data-say]");
    if (b) speak(b.dataset.say);
  });

  // Atajos de teclado: 1-4 para elegir, Enter para seguir.
  document.addEventListener("keydown", ev => {
    if (current !== "play" || ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA") return;
    const n = Number(ev.key);
    const opts = document.querySelectorAll("#card .opt");
    if (n >= 1 && n <= opts.length && !R.waiting) opts[n - 1].click();
    if (ev.key === "Enter") { const nb = $("fb-next") && !$("feedback").hidden ? $("fb-next") : $("intro-ok"); if (nb) nb.click(); }
  });

  /* ---------- tiempo activo ---------- */
  ["pointerdown", "keydown", "touchstart"].forEach(t => document.addEventListener(t, () => { lastActivity = Date.now(); }, { passive: true }));
  setInterval(() => {
    const active = current === "play" || current === "placement" || (current === "snake" && SN && SN.state.running);
    if (!active || document.hidden) return;
    if (Date.now() - lastActivity > 60000) return; // pausa si te distraés más de un minuto
    E.addTime(S, Date.now(), 1000);
    if (Date.now() % 5000 < 1000) save();
  }, 1000);
  document.addEventListener("visibilitychange", () => { if (document.hidden) { save(); snakePause(); } else if (current === "home") renderHome(); });

  /* ---------- palabras ---------- */
  let filter = "all";
  $("filters").addEventListener("click", ev => {
    const c = ev.target.closest(".chip");
    if (!c) return;
    filter = c.dataset.filter;
    document.querySelectorAll("#filters .chip").forEach(x => x.classList.toggle("on", x === c));
    renderWords();
  });
  $("word-search").addEventListener("input", renderWords);

  function renderWords() {
    const q = $("word-search").value.trim().toLowerCase();
    const list = WORDS.filter(e => {
      const ws = S.words[e.w];
      const intro = ws && ws.intro;
      if (filter === "new" && intro) return false;
      if (filter === "learning" && !(intro && ws.box < E.LEARNED_BOX)) return false;
      if (filter === "learned" && !(intro && ws.box >= E.LEARNED_BOX)) return false;
      if (filter === "verb" && !(e.t === "v" || e.t === "aux")) return false;
      if (filter === "song" && !e.so) return false;
      if (filter === "work" && e.src !== "R") return false;
      if (filter === "biz" && e.src !== "N") return false;
      if (q && !(e.w.toLowerCase().includes(q) || e.es.toLowerCase().includes(q) || (e.f || "").toLowerCase().includes(q))) return false;
      return true;
    });
    $("word-list").innerHTML = list.map(e => {
      const ws = S.words[e.w];
      const box = ws && ws.intro ? ws.box : -1;
      let dots = "";
      for (let i = 1; i <= E.MAX_BOX; i++) dots += '<span class="dot' + (box >= i ? (box >= E.LEARNED_BOX ? " on gold" : " on") : "") + '"></span>';
      return '<li><button type="button" class="word-row" data-word="' + esc(e.w) + '"><span class="wr-rank">#' + e.rank + '</span><span class="wr-main"><span class="wr-w">' + esc(e.w) + '</span><span class="wr-es">' + esc(e.es) + '</span></span><span class="dots" aria-label="' + esc(box < 0 ? "sin ver" : BOX_ES[box]) + '">' + dots + "</span></button></li>";
    }).join("") || '<li class="hint">No hay palabras con ese filtro.</li>';
  }
  $("word-list").addEventListener("click", ev => {
    const b = ev.target.closest(".word-row");
    if (b) openWord(b.dataset.word);
  });

  function openWord(w) {
    const e = BY_WORD[w];
    const ws = S.words[w];
    let html = '<div class="sheet-head"><div><p class="eyebrow">#' + e.rank + " · " + esc(TYPE_ES[e.t]) + srcTag(e) + '</p><h2 id="sheet-title">' + esc(e.w) + '</h2></div><button type="button" class="icon-btn" id="sheet-close" aria-label="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>';
    html += '<div class="intro-meta" style="justify-content:flex-start"><button type="button" class="speak" data-say="' + esc(e.w) + '">' + ICON_SPEAK + "«" + esc(e.pr) + "»</button></div>";
    html += '<p class="intro-es" style="text-align:left">' + esc(e.es) + "</p>";
    html += '<div class="memo"><b>Ancla para recordarla</b>' + esc(e.mn) + "</div>";
    html += formsHtml(e);
    if (e.t === "v") {
      // Conjugador: elegís sujeto y forma, y se ven los 11 tiempos en inglés y castellano.
      const subs = Gr.subjectsFor(e);
      html += '<h3 class="sub">Conjugador</h3><div class="conj-controls">' +
        '<div class="seg-ctl" id="cj-subj">' + subs.map((x, i) => '<button type="button" class="chip' + (i === 0 ? " on" : "") + '" data-v="' + x.id + '">' + esc(x.en === "i" ? "I" : x.en) + "</button>").join("") + "</div>" +
        '<div class="seg-ctl" id="cj-pol">' + Gr.POLARITIES.map((x, i) => '<button type="button" class="chip' + (i === 0 ? " on" : "") + '" data-v="' + x.id + '">' + esc(x.es) + "</button>").join("") + "</div></div>" +
        '<div class="conj-list" id="cj-list"></div>';
    } else if (e.cl) {
      html += '<h3 class="sub">En contexto</h3><div class="table-wrap"><table><tbody>' +
        e.cl.map(l => { const [s, a] = l.split("|"); const full = s.replace("___", a); return '<tr><td><button type="button" class="speak" data-say="' + esc(full) + '" style="text-align:left">' + esc(full) + "</button></td></tr>"; }).join("") + "</tbody></table></div>";
    }
    html += '<p class="example" style="text-align:left"><button type="button" class="speak" data-say="' + esc(e.ex) + '">' + ICON_SPEAK + esc(e.ex) + "</button><em>" + esc(e.xe) + "</em></p>";
    html += '<h3 class="sub">Tu registro</h3>';
    if (ws && ws.intro) {
      const acc = ws.ok + ws.ko ? Math.round(ws.ok / (ws.ok + ws.ko) * 100) : 0;
      const nextDays = Math.max(0, Math.ceil((ws.due - Date.now()) / E.DAY));
      html += '<div class="kv">' + mini(ws.seen, "veces vista") + mini(acc + "%", "aciertos") + mini(nextDays === 0 ? "hoy" : nextDays + " d", "próximo repaso") + "</div>";
      html += '<p class="hint">' + esc(BOX_ES[ws.box]) + ". Aprendida el " + new Date(ws.intro).toLocaleDateString("es") + ".</p>";
    } else html += '<p class="hint">Todavía no la viste. Aparece en orden de frecuencia.</p>';
    const sh = $("sheet");
    sh.innerHTML = html;
    sh.hidden = false;
    $("sheet-back").hidden = false;
    $("sheet-close").addEventListener("click", closeSheet);
    if (e.t === "v") {
      const cj = { subj: Gr.subjectsFor(e)[0].id, pol: "aff" };
      const LV = ["", "Básico", "Intermedio", "Avanzado"];
      const draw = () => {
        $("cj-list").innerHTML = Gr.tensesFor(e, 3).map(t => {
          const b = Gr.build(e, t.id, cj.subj, cj.pol);
          const f = (ws && ws.forms[t.id]) || null;
          return '<div class="conj-item"><header><strong>' + esc(t.es) + '</strong><span class="lvl">' + LV[t.lvl] + (f ? " · " + f.ok + "✓ " + f.ko + "✗" : "") + "</span></header>" +
            '<button type="button" class="speak" data-say="' + esc(b.en) + '">' + ICON_SPEAK + esc(b.en) + "</button>" +
            '<p class="es-line">' + esc(b.es) + "</p></div>";
        }).join("") + (e.s ? '<p class="hint">«' + esc(e.w) + '» es un verbo de estado: casi no se usa en los tiempos continuos (-ing).</p>' : "");
      };
      [["cj-subj", "subj"], ["cj-pol", "pol"]].forEach(([id, k]) => $(id).addEventListener("click", ev => {
        const b = ev.target.closest(".chip");
        if (!b) return;
        cj[k] = b.dataset.v;
        $(id).querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === b));
        draw();
      }));
      draw();
    }
    if (S.settings.tts) speak(e.w);
  }
  function closeSheet() { $("sheet").hidden = true; $("sheet-back").hidden = true; }
  $("sheet-back").addEventListener("click", closeSheet);
  document.addEventListener("keydown", ev => { if (ev.key === "Escape") closeSheet(); });

  /* ---------- progreso ---------- */
  function renderStats() {
    const now = Date.now();
    const totalMs = Object.values(S.days).reduce((a, d) => a + d.ms, 0);
    const acc = S.stats.answers ? Math.round(S.stats.correct / S.stats.answers * 100) : 0;
    const activeDays = Object.values(S.days).filter(d => d.rounds > 0).length;
    $("stats-grid").innerHTML = [
      mini(Math.round(totalMs / 60000) + " min", "tiempo total"),
      mini(acc + "%", "aciertos (" + S.stats.answers + " respuestas)"),
      mini(S.stats.introduced + "/" + WORDS.length, "palabras vistas"),
      mini(E.countLearned(S), "aprendidas (caja 4+)"),
      mini(S.streak.best + (S.streak.best === 1 ? " día" : " días"), "mejor racha"),
      mini(activeDays, "días jugados"),
      mini(S.stats.orderOk + S.stats.translateOk, "oraciones armadas"),
      mini(S.stats.snakeBest + " pts", "récord en la viborita")
    ].join("");

    // gráfico de barras: minutos de los últimos 14 días
    const days = E.lastDays(S, now, 14);
    const goal = Number(S.settings.goalMin);
    const maxMin = Math.max(goal * 1.5, ...days.map(d => d.data.ms / 60000));
    const W = 320, H = 150, pad = 24, bw = (W - pad) / days.length;
    const y = m => H - 18 - (m / maxMin) * (H - 30);
    let svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Minutos por día en las últimas dos semanas">';
    [0, goal].forEach(m => { svg += '<line class="' + (m ? "goal-line" : "grid-line") + '" x1="' + pad + '" x2="' + W + '" y1="' + y(m) + '" y2="' + y(m) + '"/>'; });
    svg += '<text x="0" y="' + (y(goal) + 3) + '">' + goal + "m</text>";
    days.forEach((d, i) => {
      const m = d.data.ms / 60000;
      const x = pad + i * bw + bw * 0.18;
      const h = Math.max(m > 0 ? 2 : 0, y(0) - y(m));
      svg += '<rect class="bar-day' + (m >= goal ? " goal" : "") + '" x="' + x.toFixed(1) + '" y="' + (y(0) - h).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3"><title>' + d.key + ": " + m.toFixed(1) + " min</title></rect>";
      if (i % 2 === 1 || i === days.length - 1) svg += '<text x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle">' + Number(d.key.slice(8)) + "</text>";
    });
    svg += "</svg>";
    $("chart-days").innerHTML = svg;

    const seenBox = new Array(E.MAX_BOX + 1).fill(0);
    let unseen = 0;
    WORDS.forEach(e => { const ws = S.words[e.w]; if (ws && ws.intro) seenBox[ws.box]++; else unseen++; });
    const rows = [["Sin ver", unseen, false]].concat(seenBox.map((n, i) => [i === 0 ? "Nueva" : "Caja " + i + " · " + E.INTERVALS[i] + " d", n, i >= E.LEARNED_BOX]));
    $("chart-boxes").innerHTML = rows.map(r => '<div class="box-row' + (r[2] ? " learned" : "") + '"><span>' + esc(r[0]) + '</span><div class="box-track"><div class="box-fill" style="width:' + (r[1] / WORDS.length * 100).toFixed(1) + '%"></div></div><span class="num" style="text-align:right">' + r[1] + "</span></div>").join("");

    // aciertos por tiempo verbal
    const agg = {};
    Object.values(S.words).forEach(ws => Object.entries(ws.forms || {}).forEach(([k, v]) => { agg[k] = agg[k] || { ok: 0, ko: 0 }; agg[k].ok += v.ok; agg[k].ko += v.ko; }));
    const trows = E.TENSES.map(t => [t.es, agg[t.id] || { ok: 0, ko: 0 }]).concat([["Reconocer formas", agg.formas || { ok: 0, ko: 0 }]]);
    $("tense-stats").innerHTML = trows.map(([name, v]) => {
      const n = v.ok + v.ko, p = n ? Math.round(v.ok / n * 100) : 0;
      return '<div class="box-row learned"><span>' + esc(name) + '</span><div class="box-track"><div class="box-fill" style="width:' + p + '%"></div></div><span style="text-align:right">' + (n ? p + "%" : "–") + "</span></div>";
    }).join("");

    $("badges").innerHTML = E.BADGES.map(b => {
      const got = !!S.badges[b.id];
      return '<div class="badge' + (got ? " got" : "") + '"><svg viewBox="0 0 48 48" aria-hidden="true"><path class="b-rib" d="M15 4h8l-4 16h-8zM33 4h-8l4 16h8z"/><circle class="b-med" cx="24" cy="30" r="14"/><path d="m24 22 2.4 5 5.4.7-4 3.7 1 5.3-4.8-2.6-4.8 2.6 1-5.3-4-3.7 5.4-.7z" fill="var(--surface)" opacity=".85"/></svg><strong>' + esc(b.name) + "</strong><small>" + esc(b.desc) + "</small></div>";
    }).join("");
  }

  /* ---------- ajustes ---------- */
  function renderMore() {
    $("set-new").value = String(S.settings.newPerDay);
    $("set-level").value = String(S.settings.level || 1);
    $("set-level-desc").textContent = E.LEVELS[S.settings.level || 1].desc;
    $("set-goal").value = String(S.settings.goalMin);
    $("set-rate").value = String(S.settings.rate);
    $("set-tts").checked = !!S.settings.tts;
    $("set-sound").checked = !!S.settings.sound;
    $("set-calm").checked = !!S.settings.calm;
    $("science").innerHTML = SCIENCE.map(x => '<article class="sci"><h4>' + esc(x.t) + "</h4><p>" + esc(x.p) + '</p><p class="app-use">En la app: ' + esc(x.a) + "</p></article>").join("");
  }
  [["set-new", "newPerDay", Number], ["set-goal", "goalMin", Number], ["set-rate", "rate", Number], ["set-level", "level", Number]].forEach(([id, k, fn]) => {
    $(id).addEventListener("change", ev => {
      S.settings[k] = fn(ev.target.value);
      save();
      if (k === "level") $("set-level-desc").textContent = E.LEVELS[S.settings.level].desc;
      toast(k === "level" ? "Dificultad: " + E.LEVELS[S.settings.level].name : "Guardado");
    });
  });
  $("btn-diff").addEventListener("click", () => { go("more"); setTimeout(() => { $("set-level").focus(); $("set-level").scrollIntoView({ block: "center" }); }, 50); });

  /* ---------- prueba de nivel ---------- */
  let P = null;
  function startPlacement() {
    P = { qs: E.placementQuiz(WORDS, rnd), i: 0, results: [] };
    go("placement");
    renderPlacement();
  }
  function renderPlacement() {
    $("pl-segments").innerHTML = P.qs.map((q, i) => '<span class="seg ' + (P.results[i] ? (P.results[i].ok ? "ok" : "ko") : i === P.i ? "now" : "") + '"></span>').join("");
    const card = $("pl-card");
    if (P.i >= P.qs.length) return finishPlacement();
    const q = P.qs[P.i];
    card.innerHTML = '<p class="q-type"><span>Prueba de nivel · ' + (P.i + 1) + " de " + P.qs.length + '</span><span>#' + BY_WORD[q.w].rank + "</span></p>" +
      '<p class="q-prompt">' + esc(q.prompt) + "</p>" +
      '<div class="options">' + q.options.map((o, i) => '<button type="button" class="opt" data-opt="' + esc(o) + '"><span class="opt-key">' + (i + 1) + "</span>" + esc(o) + "</button>").join("") +
      '<button type="button" class="opt" data-opt=""><span class="opt-key">?</span>No la sé</button></div>';
    card.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
      P.results[P.i] = { band: q.band, ok: !!b.dataset.opt && E.checkAnswer(q, b.dataset.opt) };
      P.i++;
      renderPlacement();
    }));
  }
  function finishPlacement() {
    const res = E.applyPlacement(S, WORDS, P.results, Date.now(), rnd);
    save();
    const lvName = E.LEVELS[res.suggested].name;
    $("pl-card").innerHTML = '<p class="eyebrow">Resultado</p><h2 class="sum-title">' + (res.marked ? "Ya sabés " + res.marked + " palabras" : "Empezás desde el principio") + "</h2>" +
      '<div class="boxes">' + res.perBand.map((n, b) => '<div class="box-row' + (n >= E.PER_BAND ? " learned" : "") + '"><span>Palabras ' + (E.BANDS[b][0] + 1) + "–" + E.BANDS[b][1] + '</span><div class="box-track"><div class="box-fill" style="width:' + (n / E.PER_BAND * 100) + '%"></div></div><span style="text-align:right">' + n + "/" + E.PER_BAND + "</span></div>").join("") + "</div>" +
      '<p class="hint">' + (res.marked ? "Esas palabras se saltean: vuelven en los próximos días para confirmarlas. " : "") + "Dificultad sugerida: <strong>" + lvName + "</strong>.</p>" +
      '<div class="sum-actions"><button type="button" class="btn btn-play" id="pl-use">Usar dificultad ' + lvName + '</button><button type="button" class="btn btn-ghost" id="pl-keep">Mantener la actual</button></div>';
    $("pl-use").addEventListener("click", () => { S.settings.level = res.suggested; save(); go("home"); });
    $("pl-keep").addEventListener("click", () => go("home"));
    E.newBadges(S);
    P = null;
  }
  $("btn-placement").addEventListener("click", startPlacement);
  $("btn-placement-home").addEventListener("click", startPlacement);
  $("pl-quit").addEventListener("click", () => { P = null; go("home"); });

  /* ---------- viborita ---------- */
  let SN = null, snKind = 0;
  const SN_KINDS = ["Castellano → inglés", "Forma verbal", "Completá la oración"];
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-heart" d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.5 1.1 5.3 3 1.8-1.9 3.2-3 5.3-3 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21Z"/></svg>';

  function snakePool() {
    const seen = WORDS.filter(e => S.words[e.w] && S.words[e.w].intro);
    return (seen.length >= 8 ? seen : WORDS.slice(0, 40)).filter(e => /^[a-z]{2,10}$/i.test(e.w));
  }
  const clean = w => String(w).toLowerCase().replace(/[^a-z]/g, "");

  // Las consignas rotan: castellano → inglés, forma verbal y oración para completar.
  function snakePrompt() {
    const pool = snakePool();
    const verbs = pool.filter(e => e.t === "v");
    const kind = snKind % 3;
    snKind++;
    if ((kind === 1 || kind === 2) && verbs.length) {
      const e = E.pick(verbs, rnd);
      if (kind === 1) {
        const fs = E.forms(e), lbs = E.formLabels(e);
        const i = 1 + Math.floor(rnd() * 4);
        return { kind: SN_KINDS[1], q: e.w + " → " + lbs[i], sub: e.es, answer: clean(fs[i]), w: e.w, say: fs[i] };
      }
      const t = E.pick(Gr.tensesFor(e, Math.min(2, S.settings.level || 1)).filter(x => ["present", "past", "perfect", "continuous", "pastcont"].includes(x.id)), rnd);
      const b = Gr.build(e, t.id, E.pick(Gr.subjectsFor(e), rnd), "aff");
      const parts = b.verb.split(" ");
      const before = parts.slice(0, -1).join(" ");
      return { kind: SN_KINDS[2] + " · " + t.es, q: b.pre + " " + (before ? before + " " : "") + "___" + b.post, sub: b.es + " (" + e.w + ")", answer: clean(b.main), w: e.w, say: b.en };
    }
    const e = E.pick(pool, rnd);
    return { kind: SN_KINDS[0], q: e.es.split(" / ")[0], sub: TYPE_ES[e.t], answer: clean(e.w), w: e.w, say: e.w };
  }

  function snakeHud(st) {
    $("sn-score").textContent = st.score;
    $("sn-lives").innerHTML = [0, 1, 2].map(i => '<span class="' + (i < st.lives ? "" : "off") + '">' + HEART + "</span>").join("");
    const t = st.target;
    $("sn-kind").textContent = t.kind;
    $("sn-q").textContent = t.q;
    $("sn-sub").textContent = t.sub || "";
    $("sn-progress").textContent = t.answer.split("").map((c, i) => (i < st.idx ? c.toUpperCase() : "_")).join(" ");
  }

  function snakeOpen() {
    if (SN && SN.state.over) { $("sn-over").hidden = true; ["sn-board", "sn-prompt", "sn-help"].forEach(id => { $(id).hidden = false; }); SN.restart(); }
    if (!SN) {
      SN = Snake.createGame($("sn-board"), {
        rnd,
        isActive: () => current === "snake",
        nextPrompt: snakePrompt,
        onProgress: snakeHud,
        onLetter: (st, ch) => { tone([520 + st.idx * 40], 0.07); snakeHud(st); lastActivity = Date.now(); },
        onWord: (st, t) => { sfx.ok(); speak(t.say); toast("¡" + t.answer.toUpperCase() + "!"); },
        onHurt: st => { sfx.ko(); snakeHud(st); },
        onEnd: snakeEnd
      });
    } else { SN.resize(); }
    snakeHud(SN.state);
  }
  function snakePause() { if (SN && SN.state.running) SN.pause(); }
  function snakeEnd(st) {
    const done = st.words.map(t => t.w);
    const xp = E.applySnake(S, Date.now(), st.score, done);
    const best = S.stats.snakeBest === st.score && st.score > 0;
    const badges = E.newBadges(S);
    save();
    renderTop();
    const o = $("sn-over");
    o.innerHTML = '<p class="eyebrow">Fin de la partida</p><h2 class="sum-title">' + (best ? "¡Nuevo récord!" : st.score + " puntos") + "</h2>" +
      '<div class="sum-grid">' + mini(st.score, "puntos") + mini(st.words.length, "palabras") + mini("+" + xp, "XP") + "</div>" +
      (st.words.length ? '<p class="hint">' + st.words.map(t => esc(t.answer)).join(" · ") + "</p>" : "") +
      badges.map(b => '<div class="chest"><strong>Nuevo logro: ' + esc(b.name) + "</strong><span>" + esc(b.desc) + "</span></div>").join("") +
      '<div class="sum-actions"><button type="button" class="btn btn-play" id="sn-again">Jugar otra</button><button type="button" class="btn btn-ghost" id="sn-home">Volver al inicio</button></div>';
    o.hidden = false;
    ["sn-board", "sn-prompt", "sn-help"].forEach(id => { $(id).hidden = true; });
    if (best || badges.length) burst();
    $("sn-again").addEventListener("click", () => {
      o.hidden = true;
      ["sn-board", "sn-prompt", "sn-help"].forEach(id => { $(id).hidden = false; });
      SN.restart(); SN.resize(); snakeHud(SN.state);
    });
    $("sn-home").addEventListener("click", () => go("home"));
  }
  $("sn-pause").addEventListener("click", () => { if (!SN) return; if (SN.state.running) SN.pause(); else SN.start(); });
  $("btn-snake-home").addEventListener("click", () => go("snake"));
  window.addEventListener("resize", () => { if (SN && current === "snake") SN.resize(); });
  [["set-tts", "tts"], ["set-sound", "sound"], ["set-calm", "calm"]].forEach(([id, k]) => {
    $(id).addEventListener("change", ev => { S.settings[k] = ev.target.checked; save(); applyCalm(); toast("Guardado"); });
  });
  function applyCalm() { document.documentElement.classList.toggle("calm", !!S.settings.calm); }

  $("btn-export").addEventListener("click", () => {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
    const ta = $("backup-text");
    ta.value = code;
    const done = () => { $("backup-msg").textContent = "Código copiado. Guardalo en una nota o mandátelo por mensaje."; };
    try {
      navigator.clipboard.writeText(code).then(done, () => { ta.select(); $("backup-msg").textContent = "Copiá el código seleccionado."; });
    } catch (e) { ta.select(); $("backup-msg").textContent = "Copiá el código seleccionado."; }
  });
  $("btn-import").addEventListener("click", () => {
    try {
      const obj = JSON.parse(decodeURIComponent(escape(atob($("backup-text").value.trim()))));
      if (!obj || typeof obj.words !== "object") throw new Error("formato");
      S = E.migrate(obj, Date.now());
      save();
      $("backup-msg").textContent = "Progreso restaurado: " + S.stats.introduced + " palabras y " + S.xp + " XP.";
      renderTop();
    } catch (e) {
      $("backup-msg").textContent = "Ese código no es válido. Pegá el texto completo que copiaste con «Copiar mi progreso».";
    }
  });
  $("btn-reset").addEventListener("click", () => { $("reset-confirm").hidden = false; });
  $("btn-reset-no").addEventListener("click", () => { $("reset-confirm").hidden = true; });
  $("btn-reset-yes").addEventListener("click", () => {
    const settings = S.settings;
    S = E.newState(Date.now());
    S.settings = settings;
    save();
    $("reset-confirm").hidden = true;
    toast("Progreso borrado");
    go("home");
  });

  /* ---------- arranque ---------- */
  $("v-total-words").textContent = WORDS.length;
  applyCalm();
  go("home");
  setInterval(() => { if (current === "home") renderHome(); }, 30000);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* sin modo offline en este entorno */ });
  }
})();
