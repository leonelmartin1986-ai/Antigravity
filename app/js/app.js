/* Interfaz de Word Beat: pantallas, sesión de juego, voz, sonidos y guardado local. */
(function () {
  "use strict";
  const E = window.Engine;
  const WORDS = window.WORDS;
  const BY_WORD = Object.fromEntries(WORDS.map(w => [w.w, w]));
  const PHRASES = window.PHRASES || [];
  const BY_PHRASE = Object.fromEntries(PHRASES.map(p => [p.id, p]));
  const PREPS = window.PREPS || [];
  const BY_PREP = Object.fromEntries(PREPS.map(r => [r.id, r]));
  const PHRASALS = window.PHRASALS || [];
  const BY_PV = Object.fromEntries(PHRASALS.map(x => [x.id, x]));
  const ROLEPLAYS = window.ROLEPLAYS || [];
  const BY_RP = Object.fromEntries(ROLEPLAYS.map(x => [x.id, x]));
  const KEY = "wordbeat.v1";
  const $ = id => document.getElementById(id);

  const TYPE_ES = { v: "verbo", aux: "verbo auxiliar", pron: "pronombre", n: "sustantivo", adj: "adjetivo", adv: "adverbio", prep: "preposición", conj: "conjunción", det: "determinante", num: "número" };
  const BOX_ES = ["Nueva", "Caja 1 · mañana", "Caja 2 · 2 días", "Caja 3 · 4 días", "Caja 4 · 1 semana", "Caja 5 · 15 días", "Caja 6 · 1 mes", "Caja 7 · dominada"];
  const KIND_ES = { meaning: "¿Qué significa?", reverse: "¿Cómo se dice en inglés?", listen: "Escuchá y elegí", tense: "Completá con el tiempo verbal", formid: "¿Qué forma es?", cloze: "Completá la frase", spell: "Escribila en inglés", phrase: "Elegí el verbo conjugado", order: "Armá la oración", translate: "Traducí la oración",
    pchoose: "¿Cómo lo decís en inglés?", plisten: "Escuchá: ¿qué significa?", porder: "Armá tu frase", ptype: "Escribí tu frase en inglés", pshadow: "Escuchá y repetí",
    prepchoose: "Oración con truco", prepfix: "Encontrá la trampa y corregila",
    pvmeaning: "Phrasal verb: ¿qué significa?", pvreverse: "¿Qué phrasal verb es?", pvpart: "Elegí la partícula", pvtype: "Escribí el phrasal verb",
    rchoose: "¿Qué respondés?", rorder: "Armá tu respuesta", rtype: "Escribí tu respuesta" };
  const PV_KIND = { s: "Separable: el objeto puede ir en el medio", i: "Inseparable: el objeto va después", n: "Sin objeto" };
  // Tipos de respuesta escrita: el primer error da una pista y otra oportunidad (pistas graduales).
  const TYPED = ["spell", "translate", "ptype", "prepfix", "pvtype", "rtype"];
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
    { t: "Tus propias frases, en su contexto", p: "Se recuerda mejor lo que es relevante para uno mismo (efecto de autorreferencia) y lo que se practica en el mismo contexto en el que se va a usar (especificidad de la codificación, Tulving). El shadowing, repetir en voz alta justo después de escuchar, mejora la pronunciación y la fluidez al hablar (Hamada, 2016).", a: "Tus 100 frases salen de tus reuniones reales y se practican en el orden de una llamada: saludo, inicio, parte técnica y cierre. En «Escuchar y repetir» las decís en voz alta." },
    { t: "Aprender del error con explicación", p: "Equivocarse en un intento y recibir enseguida la respuesta correcta mejora el recuerdo posterior, más que solo estudiar la respuesta (Kornell, Hays y Bjork, 2009). En segundas lenguas, la corrección que explica la regla (feedback metalingüístico) tiene efectos más duraderos que la corrección sola (metaanálisis de Li, 2010).", a: "Las oraciones con truco ponen como opción el error típico de quien habla castellano (depend of, discuss about). Al responder ves por qué es así y en Avanzado corregís la oración escribiendo." },
    { t: "Ráfagas de estructura", p: "Después de leer o escuchar una estructura, tendemos a reusarla (priming estructural), y el efecto se acumula y dura (Schimke y colegas, 2025). Mezclar tiempos parecidos en la práctica mejora la precisión y la retención (Pan y colegas, 2019 y 2024).", a: "La ráfaga muestra tres oraciones con el mismo tiempo y distintos verbos, y la cuarta la armás vos. La app elige el tiempo que peor te sale." },
    { t: "Pistas que van de menos a más", p: "Las correcciones que primero dan una pista y recién después la respuesta ayudan más que la corrección directa, porque te obligan a volver a intentarlo (evaluación dinámica; Coyne y colegas, 2025).", a: "Cuando escribís y te equivocás, la primera vez recibís una pista y otra oportunidad. Recién al segundo error se muestra la respuesta." },
    { t: "Phrasal verbs por frecuencia y por partícula", p: "Los 150 phrasal verbs más frecuentes cubren más de la mitad de los usos en inglés real (lista PHaVE, Garnier y Schmitt, 2015). Explicar la lógica de la partícula (up = completar, off = separar) mejora el recuerdo frente a memorizar listas (Boers, 2000).", a: "200 phrasal verbs ordenados por frecuencia, cada uno con el ancla de su partícula, y preguntas que te hacen elegir justo la partícula." },
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
  function speak(text, slow) {
    if (!text) return;
    const rate = (Number(S.settings.rate) || 0.85) * (slow ? 0.7 : 1);
    // En la app de Android la voz la pone el sistema (WebView no trae speechSynthesis).
    if (window.AndroidTTS) {
      try { window.AndroidTTS.speak(String(text), rate); } catch (e) { /* la voz es opcional */ }
      return;
    }
    if (!("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      if (voice) u.voice = voice;
      u.rate = rate;
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
    const pDue = E.duePhrases(S, PHRASES, now).length;
    $("v-meet-home").textContent = pDue ? pDue + " para repasar" : (S.stats.phrasesIntro || 0) + "/" + PHRASES.length;
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
    if (view === "meet") { renderMeet(); renderRoleList(); }
    if (view === "cross") cwOpen();
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
    if (st.p) return renderPhraseStep(st);
    if (st.r) return renderPrepStep(st);
    if (st.v) return renderPvStep(st);
    if (st.rp) return renderRoleStep(st);
    if (st.kind === "burst") return renderBurst(st);
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
    if (st.kind === "order") wireOrder(st);
    if (st.kind === "translate") wireTranslate(st);
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

  // Fichas para armar una oración o una frase (order y porder).
  function wireOrder(st) {
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

  // Escribir la oración o la frase completa (translate y ptype).
  function wireTranslate(st) {
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

  /* ---------- preposiciones ---------- */
  const prepLabel = x => (x === "—" ? "(sin preposición)" : x);

  function renderPrepStep(st) {
    const r = BY_PREP[st.r];
    if (st.kind === "prepintro") return renderPrepIntro(r);
    let body = '<p class="q-type"><span>' + esc(KIND_ES[st.kind]) + "</span><span>" + esc(r.g) + "</span></p>";
    if (st.kind === "prepchoose") {
      body += '<p class="q-sentence">' + blankify(st.sentence) + "</p>";
      body += '<p class="hint" style="text-align:center">' + esc(st.es) + "</p>";
      body += '<div class="options">' + st.options.map((o, i) => '<button type="button" class="opt" data-opt="' + esc(o) + '"><span class="opt-key">' + (i + 1) + "</span>" + esc(prepLabel(o)) + "</button>").join("") + "</div>";
    } else {
      body += '<p class="hint" style="text-align:center">Esta oración tiene un error de preposición. Escribila bien.</p>';
      body += '<p class="q-sentence prep-wrong">' + esc(st.wrong) + "</p>";
      body += '<p class="hint" style="text-align:center">' + esc(st.es) + "</p>";
      body += '<textarea class="translate-in" id="tr-in" rows="2" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Escribí la oración corregida" aria-label="Oración corregida"></textarea>';
      body += '<div class="order-row"><button type="button" class="btn btn-ghost" id="tr-hint">Pista</button><button type="button" class="btn btn-play" id="tr-go">Comprobar</button></div>';
    }
    cardEnter(body);
    document.querySelectorAll("#card .opt").forEach(b => b.addEventListener("click", () => answer(b.dataset.opt, b)));
    if (st.kind === "prepfix") {
      const inp = $("tr-in");
      inp.value = st.wrong;
      setTimeout(() => inp.focus(), 50);
      // Pista: marca dónde está la trampa con un hueco.
      $("tr-hint").addEventListener("click", () => { inp.value = st.sentence; st.usedHint = true; });
      const submit = () => { if (inp.value.trim()) answer(inp.value, inp); };
      $("tr-go").addEventListener("click", submit);
      inp.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); submit(); } });
    }
  }

  // Tarjeta de regla nueva: el porqué, ejemplos con voz y la trampa típica.
  function renderPrepIntro(r) {
    const trap = r.items[0];
    let body = '<p class="q-type"><span>Preposiciones · regla nueva</span><span>' + esc(r.g) + "</span></p>";
    body += '<p class="prep-title">' + esc(r.p) + "</p>";
    body += '<p class="intro-es">' + esc(r.t) + "</p>";
    body += '<p class="prep-key">' + esc(r.k) + "</p>";
    body += '<div class="memo"><b>Por qué</b>' + esc(r.why) + "</div>";
    body += '<div class="prep-ex">' + r.ex.map(([en, es]) => '<p><button type="button" class="speak" data-say="' + esc(en) + '">' + ICON_SPEAK + esc(en) + "</button><span>" + esc(es) + "</span></p>").join("") + "</div>";
    body += '<p class="prep-trap"><span class="bad">✗ ' + esc(E.fillPrep(trap.s, trap.trap)) + '</span><span class="good">✓ ' + esc(E.fillPrep(trap.s, trap.a)) + "</span></p>";
    body += '<div class="order-row"><span></span><button type="button" class="btn btn-play" id="intro-ok">¡La tengo!</button></div>';
    cardEnter(body);
    $("intro-ok").addEventListener("click", () => {
      const xp = E.introducePrep(S, r.id, Date.now());
      R.xp += xp;
      R.introduced.push(r.id);
      R.results[R.i] = "intro";
      save();
      next();
    });
  }

  /* ---------- phrasal verbs ---------- */
  function pvSep(pv) {
    if (pv.kind !== "s") return "";
    const [v, ...rest] = pv.w.split(" ");
    return " (" + v + " it " + rest.join(" ") + ")";
  }

  function renderPvStep(st) {
    const pv = BY_PV[st.v];
    if (st.kind === "pvintro") return renderPvIntro(pv);
    let body = '<p class="q-type"><span>' + esc(KIND_ES[st.kind]) + "</span><span>phrasal #" + pv.rank + "</span></p>";
    if (st.kind === "pvmeaning") {
      body += '<p class="q-prompt">' + esc(pv.w) + "</p>";
      body += '<button type="button" class="speak" data-say="' + esc(pv.w) + '">' + ICON_SPEAK + "Escuchar</button>";
    } else if (st.kind === "pvreverse") {
      body += '<p class="q-prompt es">' + esc(pv.es) + "</p>";
    } else if (st.kind === "pvpart") {
      body += '<p class="q-sentence">' + blankify(st.sentence) + "</p>";
      body += '<p class="hint" style="text-align:center">' + esc(pv.xe) + "</p>";
    } else {
      body += '<p class="q-prompt es">' + esc(pv.es) + "</p>";
      body += '<p class="hint" style="text-align:center">' + esc(pv.xe) + "</p>";
      body += '<div class="spell"><input id="spell-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="verbo + partícula" aria-label="Escribí el phrasal verb">' +
        '<div class="spell-row"><button type="button" class="btn btn-ghost" id="spell-hint">Pista</button><button type="button" class="btn btn-play" id="spell-go">Comprobar</button></div></div>';
    }
    if (st.options) body += '<div class="options' + (st.options.every(o => o.length < 14) ? " two" : "") + '">' + st.options.map((o, i) => '<button type="button" class="opt" data-opt="' + esc(o) + '"><span class="opt-key">' + (i + 1) + "</span>" + esc(o) + "</button>").join("") + "</div>";
    cardEnter(body);
    if (st.kind === "pvmeaning" && S.settings.tts) setTimeout(() => speak(pv.w), 150);
    document.querySelectorAll("#card .opt").forEach(b => b.addEventListener("click", () => answer(b.dataset.opt, b)));
    if (st.kind === "pvtype") {
      const inp = $("spell-in");
      setTimeout(() => inp.focus(), 50);
      $("spell-hint").addEventListener("click", () => { inp.placeholder = pv.w.split(" ")[0] + " + " + pv.part.replace(/[a-z]/g, "·"); st.usedHint = true; });
      const submit = () => { if (inp.value.trim()) answer(inp.value, inp); };
      $("spell-go").addEventListener("click", submit);
      inp.addEventListener("keydown", ev => { if (ev.key === "Enter") submit(); });
    }
  }

  function pvCardHtml(pv) {
    let h = '<p class="intro-word pv-word">' + esc(pv.w) + "</p>";
    h += '<div class="intro-meta"><button type="button" class="speak" data-say="' + esc(pv.w) + '">' + ICON_SPEAK + 'Escuchar</button><span class="pill">pasado: ' + esc(pv.past) + "</span></div>";
    h += '<p class="intro-es">' + esc(pv.es) + "</p>";
    h += '<p class="hint" style="text-align:center">' + esc(PV_KIND[pv.kind] + pvSep(pv)) + (pv.syn ? " · parecido a «" + esc(pv.syn) + "»" : "") + "</p>";
    h += '<div class="memo"><b>Ancla para recordarlo</b>' + esc(pv.mn) + "</div>";
    h += '<p class="example"><button type="button" class="speak" data-say="' + esc(pv.ex) + '">' + ICON_SPEAK + esc(pv.ex) + "</button><em>" + esc(pv.xe) + "</em></p>";
    return h;
  }

  function renderPvIntro(pv) {
    let body = '<p class="q-type"><span>Phrasal verb nuevo</span><span>#' + pv.rank + " de " + PHRASALS.length + "</span></p>" + pvCardHtml(pv);
    body += '<div class="order-row"><span></span><button type="button" class="btn btn-play" id="intro-ok">¡Lo tengo!</button></div>';
    cardEnter(body);
    if (S.settings.tts) setTimeout(() => speak(pv.w), 200);
    $("intro-ok").addEventListener("click", () => {
      R.xp += E.introducePv(S, pv.id, Date.now());
      R.introduced.push(pv.id);
      R.results[R.i] = "intro";
      save();
      next();
    });
  }

  function openPv(id) {
    const pv = BY_PV[id], st = (S.pvs || {})[id];
    let html = '<div class="sheet-head"><div><p class="eyebrow">Phrasal verb #' + pv.rank + '</p><h2 id="sheet-title">' + esc(pv.w) + '</h2></div><button type="button" class="icon-btn" id="sheet-close" aria-label="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>';
    html += pvCardHtml(pv).replace('<p class="intro-word pv-word">' + esc(pv.w) + "</p>", "");
    html += '<p class="hint">' + (st && st.intro ? esc(BOX_ES[st.box]) + " · " + st.ok + " aciertos, " + st.ko + " errores." : "Todavía no lo viste. Aparecen de a pocos en las rondas, por frecuencia.") + "</p>";
    const sh = $("sheet");
    sh.innerHTML = html;
    sh.hidden = false;
    $("sheet-back").hidden = false;
    $("sheet-close").addEventListener("click", closeSheet);
    if (S.settings.tts) speak(pv.w);
  }

  /* ---------- ráfaga de estructura ---------- */
  function renderBurst(st) {
    let body = '<p class="q-type"><span>Ráfaga de estructura</span><span>mismo patrón, 4 verbos</span></p>';
    body += '<div class="q-tense"><span class="pill">' + esc(st.tenseEs + " · " + st.polEs) + '</span><span class="pill sun">' + esc(st.hint) + "</span></div>";
    body += '<p class="hint" style="text-align:center">Leé y escuchá estas tres en voz alta. Mirá qué se repite. La cuarta la armás vos.</p>';
    body += '<div class="prep-ex">' + st.models.map(m => {
      const i = m.en.indexOf(m.verb);
      const en = i >= 0 ? esc(m.en.slice(0, i)) + "<u>" + esc(m.verb) + "</u>" + esc(m.en.slice(i + m.verb.length)) : esc(m.en);
      return '<p><button type="button" class="speak" data-say="' + esc(m.en) + '">' + ICON_SPEAK + "<span>" + en + "</span></button><span>" + esc(m.es) + "</span></p>";
    }).join("") + "</div>";
    body += '<div class="order-row"><span></span><button type="button" class="btn btn-play" id="intro-ok">Ahora yo</button></div>';
    cardEnter(body);
    if (S.settings.tts) setTimeout(() => speak(st.models[0].en), 200);
    $("intro-ok").addEventListener("click", () => { R.results[R.i] = "intro"; next(); });
  }

  /* ---------- role-play ---------- */
  function renderRoleStep(st) {
    let body = '<p class="q-type"><span>' + esc(st.title) + "</span><span>turno " + (st.turn + 1) + " de " + st.turns + "</span></p>";
    if (st.turn === 0) body += '<p class="hint" style="text-align:center">' + esc(st.ctx) + "</p>";
    body += '<div class="bubble them"><b>' + esc(st.who.split(",")[0]) + '</b><button type="button" class="speak" data-say="' + esc(st.them) + '">' + ICON_SPEAK + "<span>" + esc(st.them) + '</span></button><button type="button" class="link-btn" id="rp-tr">Ver traducción</button><em id="rp-es" hidden>' + esc(st.themEs) + "</em></div>";
    body += '<div class="bubble me"><b>Vos querés decir</b><span>' + esc(st.es) + "</span></div>";
    if (st.kind === "rorder") {
      body += '<div class="build-line" id="build" aria-label="Tu respuesta"></div>';
      body += '<div class="tiles" id="tiles">' + st.tiles.map((t, i) => '<button type="button" class="tile" data-i="' + i + '">' + esc(t) + "</button>").join("") + "</div>";
      body += '<div class="order-row"><button type="button" class="btn btn-ghost" id="order-clear">Borrar</button><button type="button" class="btn btn-play" id="order-go">Comprobar</button></div>';
    } else if (st.kind === "rtype") {
      body += '<textarea class="translate-in" id="tr-in" rows="2" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Respondé en inglés" aria-label="Tu respuesta en inglés"></textarea>';
      body += '<div class="order-row"><button type="button" class="btn btn-ghost" id="tr-hint">Pista</button><button type="button" class="btn btn-play" id="tr-go">Comprobar</button></div>';
    } else {
      body += '<div class="options">' + st.options.map((o, i) => '<button type="button" class="opt" data-opt="' + esc(o) + '"><span class="opt-key">' + (i + 1) + "</span>" + esc(o) + "</button>").join("") + "</div>";
    }
    cardEnter(body);
    setTimeout(() => speak(st.them), 200);
    $("rp-tr").addEventListener("click", () => { $("rp-es").hidden = false; $("rp-tr").hidden = true; });
    document.querySelectorAll("#card .opt").forEach(b => b.addEventListener("click", () => answer(b.dataset.opt, b)));
    if (st.kind === "rorder") wireOrder(st);
    if (st.kind === "rtype") wireTranslate(st);
  }

  function startRoleplay(id) {
    const sc = id ? BY_RP[id] : E.pickRoleplay(S, ROLEPLAYS);
    if (!sc) { toast("No hay conversaciones cargadas."); return; }
    R = { mode: "role", role: sc.id, steps: E.roleplaySteps(S, sc, rnd), i: 0, combo: 0, errors: 0, correct: 0, xp: 0, practice: true, results: [], introduced: [], levelStart: E.levelFor(S.xp).level, waiting: false };
    go("play");
    renderSegments();
    renderStep();
  }

  function renderRoleList() {
    const st = S.roles || {};
    $("role-list").innerHTML = ROLEPLAYS.map((sc, i) => {
      const r = st[sc.id];
      return '<li><button type="button" class="word-row phrase-row" data-role="' + sc.id + '"><span class="wr-rank">' + (i + 1) + '</span><span class="wr-main"><span class="wr-w">' + esc(sc.title) + '</span><span class="wr-es">' + esc(sc.who) + '</span></span><span class="pill' + (r ? " sun" : "") + '">' + (r ? r.best + "%" : "nueva") + "</span></button></li>";
    }).join("");
    $("v-role-sub").textContent = Object.keys(st).length + " de " + ROLEPLAYS.length + " conversaciones jugadas";
  }
  if ($("role-list")) $("role-list").addEventListener("click", ev => { const b = ev.target.closest("[data-role]"); if (b) startRoleplay(b.dataset.role); });

  /* ---------- crucigrama ---------- */
  const Cw = window.Crossword;
  let CW = null;
  const cwKey = (r, c) => r + "," + c;

  function cwNew() {
    const puz = Cw.generate(E.crosswordPool(S, WORDS, PHRASALS, rnd, 9), rnd, { size: 9, words: 7 });
    if (!puz) { toast("Todavía no hay palabras suficientes para un crucigrama."); return; }
    CW = { puz, fill: {}, sel: 0, pos: 0, done: new Set(), hints: 0, finished: false, bad: -1 };
    $("cw-over").hidden = true;
    ["cw-grid", "cw-clue", "cw-keys", "cw-list", "cw-bar"].forEach(id => { $(id).hidden = false; });
    cwRender();
  }

  function cwLocked(r, c) {
    return CW.puz.words.some((w, i) => CW.done.has(i) && Cw.cellsOf(w).some(([y, x]) => y === r && x === c));
  }

  function cwRender() {
    const { puz } = CW;
    const word = puz.words[CW.sel];
    const cur = Cw.cellsOf(word);
    const inSel = new Set(cur.map(([r, c]) => cwKey(r, c)));
    const curKey = cwKey(cur[CW.pos][0], cur[CW.pos][1]);
    const badSet = new Set(CW.bad >= 0 ? Cw.cellsOf(puz.words[CW.bad]).map(([r, c]) => cwKey(r, c)) : []);
    let html = "";
    for (let r = 0; r < puz.size; r++) for (let c = 0; c < puz.size; c++) {
      const k = cwKey(r, c);
      if (!puz.cells[r][c]) { html += '<span class="cw-x"></span>'; continue; }
      const cls = "cw-cell" + (cwLocked(r, c) ? " ok" : "") + (inSel.has(k) ? " sel" : "") + (k === curKey ? " cur" : "") + (badSet.has(k) ? " bad" : "");
      html += '<button type="button" class="' + cls + '" data-r="' + r + '" data-c="' + c + '">' + (puz.nums[k] ? "<i>" + puz.nums[k] + "</i>" : "") + esc(CW.fill[k] || "") + "</button>";
    }
    const grid = $("cw-grid");
    grid.style.gridTemplateColumns = "repeat(" + puz.size + ", 1fr)";
    grid.innerHTML = html;
    $("cw-clue").innerHTML = "<b>" + word.num + (word.dir === "across" ? " →" : " ↓") + "</b> " + esc(word.clue) + ' <small>' + esc(word.tag || word.answer.length + " letras") + "</small>";
    $("cw-progress").textContent = CW.done.size + "/" + puz.words.length;
    const row = (dir, title) => '<p class="eyebrow">' + title + "</p>" + puz.words.map((w, i) => (w.dir === dir ? '<button type="button" class="cw-item' + (CW.done.has(i) ? " done" : "") + (i === CW.sel ? " on" : "") + '" data-w="' + i + '"><b>' + w.num + "</b> " + esc(w.clue) + (CW.done.has(i) ? " · " + esc(w.w) : "") + "</button>" : "")).join("");
    $("cw-list").innerHTML = row("across", "Horizontales") + row("down", "Verticales");
  }

  function cwSelect(i, pos) {
    CW.sel = i;
    const cells = Cw.cellsOf(CW.puz.words[i]);
    if (pos === undefined) { pos = cells.findIndex(([r, c]) => !CW.fill[cwKey(r, c)]); if (pos < 0) pos = 0; }
    CW.pos = pos;
    cwRender();
  }

  function cwCheck(r, c) {
    CW.puz.words.forEach((w, i) => {
      if (CW.done.has(i)) return;
      const cells = Cw.cellsOf(w);
      if (!cells.some(([y, x]) => y === r && x === c)) return;
      const typed = cells.map(([y, x]) => CW.fill[cwKey(y, x)] || "").join("");
      if (typed.length < w.answer.length) return;
      if (typed === w.answer) { CW.done.add(i); sfx.ok(); speak(w.w); toast(w.w + " = " + w.clue); }
      else { CW.bad = i; sfx.ko(); setTimeout(() => { if (CW && CW.bad === i) { CW.bad = -1; cwRender(); } }, 700); }
    });
    if (CW.done.size === CW.puz.words.length) return cwFinish();
    // Si la palabra actual quedó resuelta, pasa a la siguiente pendiente.
    if (CW.done.has(CW.sel)) { const nx = CW.puz.words.findIndex((w, i) => !CW.done.has(i)); if (nx >= 0) return cwSelect(nx); }
    cwRender();
  }

  function cwType(ch) {
    if (!CW || CW.finished) return;
    lastActivity = Date.now();
    const cells = Cw.cellsOf(CW.puz.words[CW.sel]);
    const [r, c] = cells[CW.pos];
    if (ch === "DEL") {
      if (CW.fill[cwKey(r, c)] && !cwLocked(r, c)) delete CW.fill[cwKey(r, c)];
      else if (CW.pos > 0) { CW.pos--; const [y, x] = cells[CW.pos]; if (!cwLocked(y, x)) delete CW.fill[cwKey(y, x)]; }
      return cwRender();
    }
    if (!cwLocked(r, c)) CW.fill[cwKey(r, c)] = ch;
    if (CW.pos < cells.length - 1) CW.pos++;
    cwCheck(r, c);
  }

  // La pista corrige la primera casilla vacía o equivocada de la palabra elegida.
  function cwHint() {
    if (!CW || CW.finished) return;
    const cells = Cw.cellsOf(CW.puz.words[CW.sel]);
    const i = cells.findIndex(([r, c]) => !cwLocked(r, c) && CW.fill[cwKey(r, c)] !== CW.puz.cells[r][c]);
    if (i < 0) return;
    const [r, c] = cells[i];
    CW.hints++;
    CW.fill[cwKey(r, c)] = CW.puz.cells[r][c];
    CW.pos = Math.min(i + 1, cells.length - 1);
    cwCheck(r, c);
  }

  function cwFinish() {
    CW.finished = true;
    const words = CW.puz.words;
    const xp = E.applyCrossword(S, Date.now(), words.map(w => w.w), CW.hints, true);
    const badges = E.newBadges(S);
    save();
    renderTop();
    cwRender();
    const o = $("cw-over");
    o.innerHTML = '<p class="eyebrow">Crucigrama completo</p><h2 class="sum-title">' + (CW.hints ? "¡Resuelto!" : "¡Sin pistas!") + "</h2>" +
      '<div class="sum-grid">' + mini(words.length, "palabras") + mini(CW.hints, "pistas") + mini("+" + xp, "XP") + "</div>" +
      '<p class="hint">' + words.map(w => esc(w.w) + " = " + esc(w.clue)).join(" · ") + "</p>" +
      badges.map(b => '<div class="chest"><strong>Nuevo logro: ' + esc(b.name) + "</strong><span>" + esc(b.desc) + "</span></div>").join("") +
      '<div class="sum-actions"><button type="button" class="btn btn-play" id="cw-again">Otro crucigrama</button><button type="button" class="btn btn-ghost" id="cw-home">Volver al inicio</button></div>';
    o.hidden = false;
    ["cw-clue", "cw-keys", "cw-list", "cw-bar"].forEach(id => { $(id).hidden = true; });
    burst();
    $("cw-again").addEventListener("click", cwNew);
    $("cw-home").addEventListener("click", () => go("home"));
  }

  function cwOpen() {
    if (!$("cw-keys").dataset.ready) {
      $("cw-keys").innerHTML = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, i) => '<div class="cw-row">' + row.split("").map(k => '<button type="button" class="cw-key" data-k="' + k + '">' + k + "</button>").join("") + (i === 2 ? '<button type="button" class="cw-key wide" data-k="DEL" aria-label="Borrar">⌫</button>' : "") + "</div>").join("");
      $("cw-keys").dataset.ready = "1";
      $("cw-keys").addEventListener("click", ev => { const b = ev.target.closest(".cw-key"); if (b) cwType(b.dataset.k); });
      $("cw-grid").addEventListener("click", ev => {
        const b = ev.target.closest(".cw-cell");
        if (!b || !CW || CW.finished) return;
        const r = Number(b.dataset.r), c = Number(b.dataset.c);
        const hits = CW.puz.words.map((w, i) => ({ i, pos: Cw.cellsOf(w).findIndex(([y, x]) => y === r && x === c) })).filter(h => h.pos >= 0);
        // Tocar otra vez la misma casilla cambia entre horizontal y vertical.
        const pickHit = hits.find(h => h.i !== CW.sel) && hits.some(h => h.i === CW.sel && h.pos === CW.pos) ? hits.find(h => h.i !== CW.sel) : hits.find(h => h.i === CW.sel) || hits[0];
        cwSelect(pickHit.i, pickHit.pos);
      });
      $("cw-list").addEventListener("click", ev => { const b = ev.target.closest(".cw-item"); if (b && CW && !CW.finished) { cwSelect(Number(b.dataset.w)); window.scrollTo(0, 0); } });
      $("cw-hint").addEventListener("click", cwHint);
      $("cw-new").addEventListener("click", cwNew);
      document.addEventListener("keydown", ev => {
        if (current !== "cross" || !CW || CW.finished || ev.ctrlKey || ev.metaKey) return;
        if (/^[a-zA-Z]$/.test(ev.key)) cwType(ev.key.toUpperCase());
        else if (ev.key === "Backspace") cwType("DEL");
      });
    }
    if (!CW || CW.finished) cwNew();
  }

  /* ---------- tus frases de reunión ---------- */
  const CAT_ES = Object.fromEntries(E.PHRASE_CATS.map(c => [c.id, c.es]));
  const ICON_MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-2.1a7 7 0 0 0 6-6.9z"/></svg>';
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  function timesLabel(p) { return p.n ? "La dijiste " + p.n + (p.n === 1 ? " vez" : " veces") + " en tus reuniones" : "Frase típica de reunión"; }

  function phraseHead(st, label) {
    const p = BY_PHRASE[st.p];
    let h = '<p class="q-type"><span>' + esc(label) + "</span><span>" + esc(CAT_ES[p.cat]) + "</span></p>";
    if (st.stage) h += '<p class="meet-stage"><span class="pill">Momento ' + st.stage + " de " + st.stages + "</span>" + esc(E.PHRASE_CATS.find(c => c.id === p.cat).scene) + "</p>";
    return h;
  }

  function renderPhraseStep(st) {
    const p = BY_PHRASE[st.p];
    if (st.kind === "pintro") return renderPhraseIntro(st, p);
    if (st.kind === "pshadow") return renderShadow(st, p);
    let body = phraseHead(st, KIND_ES[st.kind]);
    if (st.kind === "plisten") {
      body += '<button type="button" class="speak big" data-say="' + esc(p.en) + '" aria-label="Escuchar otra vez">' + ICON_SPEAK + "</button>";
    } else {
      body += '<p class="es-sentence">«' + esc(p.es) + "»</p>";
    }
    if (st.kind === "porder") {
      body += '<div class="build-line" id="build" aria-label="Tu frase"></div>';
      body += '<div class="tiles" id="tiles">' + st.tiles.map((t, i) => '<button type="button" class="tile" data-i="' + i + '">' + esc(t) + "</button>").join("") + "</div>";
      body += '<div class="order-row"><button type="button" class="btn btn-ghost" id="order-clear">Borrar</button><button type="button" class="btn btn-play" id="order-go">Comprobar</button></div>';
    } else if (st.kind === "ptype") {
      body += '<textarea class="translate-in" id="tr-in" rows="2" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Escribila en inglés" aria-label="Tu frase en inglés"></textarea>';
      body += '<div class="order-row"><button type="button" class="btn btn-ghost" id="tr-hint">Pista</button><button type="button" class="btn btn-play" id="tr-go">Comprobar</button></div>';
    } else {
      body += '<div class="options">' + st.options.map((o, i) => '<button type="button" class="opt" data-opt="' + esc(o) + '"><span class="opt-key">' + (i + 1) + "</span>" + esc(o) + "</button>").join("") + "</div>";
    }
    cardEnter(body);
    if (st.kind === "plisten") setTimeout(() => speak(p.en), 150);
    document.querySelectorAll("#card .opt").forEach(b => b.addEventListener("click", () => answer(b.dataset.opt, b)));
    if (st.kind === "porder") wireOrder(st);
    if (st.kind === "ptype") wireTranslate(st);
  }

  function renderPhraseIntro(st, p) {
    let body = phraseHead(st, "Frase nueva");
    body += '<p class="phrase-en">' + esc(p.en) + "</p>";
    body += '<div class="intro-meta"><button type="button" class="speak" data-say="' + esc(p.en) + '">' + ICON_SPEAK + 'Escuchar</button><button type="button" class="speak" data-say="' + esc(p.en) + '" data-slow="1">' + ICON_SPEAK + "Lento</button></div>";
    body += '<p class="intro-es">«' + esc(p.es) + "»</p>";
    body += '<p class="hint" style="text-align:center">' + esc(timesLabel(p)) + (p.alt && p.alt.length ? ". También: «" + esc(p.alt[0]) + "»" : "") + "</p>";
    body += '<div class="memo"><b>Para fijarla</b>Decila en voz alta dos veces, como si ya estuvieras en la reunión. Imaginá a quién se la decís.</div>';
    body += '<div class="order-row"><span></span><button type="button" class="btn btn-play" id="intro-ok">¡La tengo!</button></div>';
    cardEnter(body);
    if (S.settings.tts) setTimeout(() => speak(p.en), 200);
    $("intro-ok").addEventListener("click", () => {
      const xp = E.introducePhrase(S, p.id, Date.now());
      R.xp += xp;
      R.introduced.push(p.id);
      R.results[R.i] = "intro";
      save();
      next();
    });
  }

  // Escuchar y repetir (shadowing): la app la dice, vos la repetís en voz alta y te autoevaluás.
  function renderShadow(st, p) {
    let body = phraseHead(st, st.fresh ? "Escuchá y repetí · frase nueva" : KIND_ES.pshadow);
    body += '<p class="es-sentence">«' + esc(p.es) + "»</p>";
    body += '<div class="shadow-ctl"><button type="button" class="speak big" data-say="' + esc(p.en) + '" aria-label="Escuchar">' + ICON_SPEAK + '</button><button type="button" class="speak" data-say="' + esc(p.en) + '" data-slow="1">Más lento</button></div>';
    body += '<p class="phrase-en shadow-text" id="sh-text" hidden>' + esc(p.en) + "</p>";
    body += '<button type="button" class="link-btn" id="sh-show" style="justify-self:center">Mostrar el texto</button>';
    if (SR) body += '<button type="button" class="btn btn-ghost" id="sh-mic">' + ICON_MIC + "Decila y te escucho</button>";
    body += '<p class="hint" id="sh-msg" style="text-align:center">Repetila en voz alta, con el mismo ritmo. Después contá cómo te salió.</p>';
    body += '<div class="grade-row"><button type="button" class="btn btn-ghost" data-grade="bad">Me trabé</button><button type="button" class="btn btn-ghost" data-grade="half">Más o menos</button><button type="button" class="btn btn-ok" data-grade="good">Me salió bien</button></div>';
    cardEnter(body);
    setTimeout(() => speak(p.en), 200);
    $("sh-show").addEventListener("click", () => { $("sh-text").hidden = false; $("sh-show").hidden = true; st.usedHint = true; });
    document.querySelectorAll("#card [data-grade]").forEach(b => b.addEventListener("click", () => gradeShadow(st, p, b.dataset.grade)));
    if (SR) $("sh-mic").addEventListener("click", () => {
      const msg = $("sh-msg");
      try {
        const r = new SR();
        r.lang = "en-US";
        r.maxAlternatives = 3;
        r.onresult = ev => {
          const alts = Array.from(ev.results[0]).map(a => a.transcript);
          const ok = alts.some(a => E.phraseMatch(p, a, 0.25));
          msg.textContent = "Entendí: «" + alts[0] + "»";
          $("sh-text").hidden = false;
          setTimeout(() => gradeShadow(st, p, ok ? "good" : "half"), 900);
        };
        r.onerror = () => { msg.textContent = "No te pude escuchar. Usá los botones de abajo."; };
        msg.textContent = "Te escucho…";
        r.start();
      } catch (e) { msg.textContent = "El micrófono no está disponible. Usá los botones de abajo."; }
    });
  }

  function gradeShadow(st, p, grade) {
    if (R.waiting) return;
    R.waiting = true;
    lastActivity = Date.now();
    const now = Date.now();
    if (st.fresh) { R.xp += E.introducePhrase(S, p.id, now); R.introduced.push(p.id); }
    const ok = grade !== "bad";
    const res = E.applyPhrase(S, st, ok, now, R.combo, true, grade === "half" ? "half" : null);
    R.xp += res.xp;
    R.results[R.i] = ok;
    if (ok) { R.combo++; R.correct++; sfx.ok(); } else { R.combo = 0; R.errors++; sfx.ko(); }
    document.querySelectorAll("#card [data-grade]").forEach(b => { b.disabled = true; });
    $("sh-text").hidden = false;
    renderTop();
    renderSegments();
    const fb = $("feedback");
    let html = '<p class="fb-title">' + (grade === "good" ? pickPraise() : grade === "half" ? "Bien, vuelve pronto para pulirla." : "No pasa nada: mañana la repetimos.") + (res.xp ? ' <span class="fb-xp">+' + res.xp + " XP</span>" : "") + "</p>";
    html += '<p class="fb-body"><button type="button" class="speak" data-say="' + esc(p.en) + '">' + ICON_SPEAK + esc(p.en) + "</button></p>";
    if (!ok) html += '<div class="memo"><b>Truco</b>Escuchala en «Más lento» y repetí de a pedacitos: primero las 2 o 3 primeras palabras, después la frase entera.</div>';
    html += '<button type="button" class="btn ' + (ok ? "btn-ok" : "btn-play") + ' btn-wide" id="fb-next">Seguir</button>';
    fb.className = "feedback " + (ok ? "ok" : "ko");
    fb.innerHTML = html;
    fb.hidden = false;
    $("fb-next").addEventListener("click", next);
    save();
    if (ok) R.autoNext = setTimeout(next, 2200);
  }

  function startPhraseGame(mode) {
    if (!PHRASES.length) return;
    const now = Date.now();
    const steps = mode === "meet" ? E.buildMeeting(S, PHRASES, now, rnd) : E.buildShadow(S, PHRASES, now, rnd, 6);
    if (!steps.length) { toast("No hay frases para jugar."); return; }
    R = { mode, steps, i: 0, combo: 0, errors: 0, correct: 0, xp: 0, practice: true, results: [], introduced: [], levelStart: E.levelFor(S.xp).level, waiting: false };
    go("play");
    renderSegments();
    renderStep();
  }

  let meetFilter = "all";
  function renderMeet() {
    const ps = S.phrases || {};
    const now = Date.now();
    const due = E.duePhrases(S, PHRASES, now).length;
    $("v-meet-sub").textContent = (S.stats.phrasesIntro || 0) + " de " + PHRASES.length + " vistas · " + E.countPhrasesLearned(S) + " aprendidas" + (due ? " · " + due + " para repasar hoy" : "");
    $("meet-cats").innerHTML = E.PHRASE_CATS.map(c => {
      const list = PHRASES.filter(p => p.cat === c.id);
      const seen = list.filter(p => ps[p.id] && ps[p.id].intro).length;
      return '<div class="box-row learned"><span>' + esc(c.es) + '</span><div class="box-track"><div class="box-fill" style="width:' + (seen / list.length * 100).toFixed(1) + '%"></div></div><span style="text-align:right">' + seen + "/" + list.length + "</span></div>";
    }).join("");
    const list = PHRASES.filter(p => meetFilter === "all" || p.cat === meetFilter);
    $("phrase-list").innerHTML = list.map(p => {
      const st = ps[p.id];
      const box = st && st.intro ? st.box : -1;
      let dots = "";
      for (let i = 1; i <= E.MAX_BOX; i++) dots += '<span class="dot' + (box >= i ? (box >= E.LEARNED_BOX ? " on gold" : " on") : "") + '"></span>';
      return '<li><button type="button" class="word-row phrase-row" data-say="' + esc(p.en) + '"><span class="wr-rank">' + (p.n ? p.n + "×" : "–") + '</span><span class="wr-main"><span class="wr-w">' + esc(p.en) + '</span><span class="wr-es">' + esc(p.es) + '</span></span><span class="dots" aria-label="' + esc(box < 0 ? "sin ver" : BOX_ES[box]) + '">' + dots + "</span></button></li>";
    }).join("");
  }
  if ($("meet-filters")) $("meet-filters").addEventListener("click", ev => {
    const c = ev.target.closest(".chip");
    if (!c) return;
    meetFilter = c.dataset.filter;
    document.querySelectorAll("#meet-filters .chip").forEach(x => x.classList.toggle("on", x === c));
    renderMeet();
  });

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
    const e = st.p || st.r || st.v || st.rp ? null : BY_WORD[st.w];
    const pv = st.v ? BY_PV[st.v] : null;
    const rule = st.r ? BY_PREP[st.r] : null;
    const ph = st.p ? BY_PHRASE[st.p] : null;
    const ok = E.checkAnswer(st, given);
    // Pistas graduales: en respuestas escritas, el primer error da una pista y otra oportunidad.
    if (!ok && TYPED.includes(st.kind) && !st.retried) {
      st.retried = true;
      st.usedHint = true;
      R.waiting = false;
      const ans = st.kind === "pvtype" || st.kind === "spell" ? st.answer : st.full;
      const words = ans.split(" ");
      const hint = st.kind === "prepfix" ? rule.k
        : st.kind === "spell" ? "Empieza con «" + ans[0] + "» y tiene " + ans.length + " letras."
        : st.kind === "pvtype" ? "Es «" + words[0] + "» + una partícula de " + words.slice(1).join(" ").length + " letras."
        : "Empieza con «" + words.slice(0, 2).join(" ") + "…» y tiene " + words.length + " palabras.";
      let h = $("retry-hint");
      if (!h) { h = document.createElement("p"); h.id = "retry-hint"; h.className = "retry-hint"; el.insertAdjacentElement("afterend", h); }
      h.textContent = "Casi. Pista: " + hint + " Probá de nuevo.";
      vibrate(60);
      el.focus();
      return;
    }
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
    if (TYPED.includes(st.kind)) { el.classList.add(ok ? "ok" : "ko"); el.disabled = true; }
    if (st.kind === "order" || st.kind === "porder" || st.kind === "rorder") el.classList.add(ok ? "ok" : "ko");
    if (res.lifeLost) popStat("stat-lives");
    if (xp) popStat("stat-xp");
    renderTop();
    renderSegments();

    // feedback: en errores se repasa el ancla (volver a codificar es lo que más sirve)
    const fb = $("feedback");
    const shown = ["order", "translate", "porder", "ptype", "prepfix", "rorder", "rtype"].includes(st.kind) ? st.full : st.kind === "prepchoose" ? prepLabel(st.answer) : st.answer;
    let html = '<p class="fb-title">' + (ok ? pickPraise() : "Casi. Era «" + esc(shown) + "»") + (xp ? ' <span class="fb-xp">+' + xp + " XP</span>" : "") + "</p>";
    if (pv) {
      html += '<p class="fb-body"><button type="button" class="speak" data-say="' + esc(pv.ex) + '">' + ICON_SPEAK + esc(pv.ex) + "</button></p>";
      html += '<p class="fb-es">' + esc(pv.xe) + "</p>";
      html += '<p class="fb-body"><strong>' + esc(pv.w) + "</strong> = " + esc(pv.es) + "</p>";
      if (!ok) html += '<div class="memo"><b>Ancla</b>' + esc(pv.mn) + "</div>";
    } else if (st.rp) {
      html += '<p class="fb-body"><button type="button" class="speak" data-say="' + esc(st.full) + '">' + ICON_SPEAK + esc(st.full) + "</button></p>";
      html += '<p class="fb-es">' + esc(st.es) + (st.alt.length ? " · También vale: «" + esc(st.alt[0]) + "»" : "") + "</p>";
      if (!ok) html += '<div class="memo"><b>Para fijarla</b>Decí la respuesta en voz alta, como si le contestaras a ' + esc(st.who.split(",")[0]) + ".</div>";
    } else if (rule) {
      html += '<p class="fb-body"><button type="button" class="speak" data-say="' + esc(st.full) + '">' + ICON_SPEAK + esc(st.full) + "</button></p>";
      html += '<p class="fb-es">' + esc(st.es) + "</p>";
      if (!ok && st.kind === "prepchoose" && st.trap.toLowerCase() === String(given).trim().toLowerCase()) html += '<p class="fb-es">Caíste en la trampa típica: «' + esc(st.wrong) + "».</p>";
      html += '<div class="memo"><b>' + (ok ? "Por qué" : "Por qué (" + esc(rule.p) + ")") + "</b>" + esc(ok ? rule.k : rule.why) + "</div>";
    } else if (ph) {
      html += '<p class="fb-body"><button type="button" class="speak" data-say="' + esc(ph.en) + '">' + ICON_SPEAK + esc(ph.en) + "</button></p>";
      html += '<p class="fb-es">«' + esc(ph.es) + "» · " + esc(CAT_ES[ph.cat]) + "</p>";
    } else if (st.kind === "phrase" || st.kind === "order" || st.kind === "translate") {
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
    if (!ok && e && !rule) html += '<div class="memo"><b>Ancla</b>' + esc(e.mn) + "</div>";
    if (!ok && ph) html += '<div class="memo"><b>Para fijarla</b>Escuchala y decila en voz alta dos veces antes de seguir.</div>';
    html += '<button type="button" class="btn ' + (ok ? "btn-ok" : "btn-play") + ' btn-wide" id="fb-next">Seguir</button>';
    fb.className = "feedback " + (ok ? "ok" : "ko");
    fb.innerHTML = html;
    fb.hidden = false;
    if (ph) { if (S.settings.tts) speak(ph.en); }
    else if (pv) { if (S.settings.tts) speak(pv.ex); }
    else if (st.rp) { if (S.settings.tts) speak(st.full); }
    else if (rule) { if (S.settings.tts) speak(st.full); }
    else if (S.settings.tts && ["tense", "phrase", "order", "translate"].includes(st.kind)) speak(st.full);
    else if (S.settings.tts && !ok) speak(e.w);
    $("fb-next").addEventListener("click", next);
    if (!ok) fb.scrollIntoView({ behavior: "smooth", block: "nearest" });
    save();
    if (ok) R.autoNext = setTimeout(next, rule ? 3600 : pv || st.rp ? 2800 : ph || ["order", "translate", "phrase"].includes(st.kind) ? 2600 : st.kind === "tense" ? 1900 : 1100);
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
    const mode = R.mode;
    const roleId = R.role;
    const fin = mode === "role" ? E.finishRoleplay(S, now, roleId, R.correct, R.steps.length) : mode ? E.finishPhraseGame(S, now, mode, R.errors) : E.finishRound(S, now, R.errors, rnd);
    R.xp += fin.bonus;
    let regained = false;
    if (!mode && R.practice && R.correct >= Math.ceil(R.steps.length * 0.6)) { S.lives = Math.min(E.MAX_LIVES, S.lives + 1); S.livesTs = now; regained = true; }
    const d = E.today(S, now);
    const goalReached = d.ms >= Number(S.settings.goalMin) * 60000 && !d.goal;
    const badges = E.newBadges(S);
    const lvNow = E.levelFor(S.xp);
    const leveled = lvNow.level > R.levelStart;
    save();

    const total = R.results.filter(x => x === true || x === false).length;
    const title = mode === "role" ? (R.errors === 0 ? "¡Conversación impecable!" : "¡Conversación terminada!") : mode === "meet" ? (R.errors === 0 ? "¡Reunión impecable!" : "¡Reunión terminada!")
      : mode === "shadow" ? (R.errors === 0 ? "¡Eco perfecto!" : "¡Bien repetido!")
      : R.errors === 0 && total > 0 ? "¡Ronda perfecta!" : R.correct >= total * 0.7 ? "¡Buena ronda!" : "Ronda completa";
    const eyebrow = mode === "role" ? "Role-play · " + BY_RP[roleId].title : mode === "meet" ? "Simulador de reunión" : mode === "shadow" ? "Escuchar y repetir" : "Ronda terminada";
    let html = '<p class="eyebrow">' + eyebrow + '</p><h2 class="sum-title">' + title + "</h2>";
    html += '<div class="sum-grid">' +
      mini("+" + R.xp, "puntos") + mini(R.correct + "/" + total, "aciertos") + (mode === "role" ? mini(S.roles[roleId].best + "%", "tu mejor marca") : mini(R.introduced.length, mode ? "frases nuevas" : "nuevas")) + "</div>";
    if (fin.bonus) html += '<p class="hint">+' + fin.bonus + " XP de bonus por no fallar ninguna.</p>";
    if (fin.streakInfo.changed) html += '<p class="hint">Racha: ' + S.streak.current + " día" + (S.streak.current === 1 ? "" : "s") + (fin.streakInfo.earnedFreeze ? ". Ganaste un protector de racha." : fin.streakInfo.usedFreeze ? ". Un protector salvó tu racha." : ".") + "</p>";
    if (regained) html += '<p class="hint">Recuperaste una vida.</p>';
    if (leveled) html += '<div class="chest"><strong>¡Subiste al nivel ' + lvNow.level + "!</strong><span>" + esc(lvNow.title) + "</span></div>";
    if (goalReached) {
      html += '<button type="button" class="chest closed" id="chest" aria-label="Abrir el cofre de la meta diaria">' + CHEST + "<strong>¡Cumpliste tus " + S.settings.goalMin + " minutos!</strong><span>Tocá para abrir el cofre</span></button>";
    }
    if (badges.length) html += badges.map(b => '<div class="chest"><strong>Nuevo logro: ' + esc(b.name) + "</strong><span>" + esc(b.desc) + "</span></div>").join("");
    const goalLeft = Math.max(0, Number(S.settings.goalMin) * 60000 - d.ms);
    html += '<div class="sum-actions"><button type="button" class="btn btn-play" id="sum-again">' + (mode === "role" ? "Otra conversación" : mode === "meet" ? "Otra reunión" : mode === "shadow" ? "Repetir otras 6" : goalLeft > 0 ? "Otra ronda (" + (Math.ceil(goalLeft / 60000) === 1 ? "falta 1 min" : "faltan " + Math.ceil(goalLeft / 60000) + " min") + ")" : "Otra ronda") + '</button><button type="button" class="btn btn-ghost" id="sum-home">Terminar por hoy</button></div>';
    $("summary").innerHTML = html;
    R = null;
    go("summary");
    if (leveled || badges.length) { sfx.level(); burst(); }
    $("sum-again").addEventListener("click", () => (mode === "role" ? startRoleplay() : mode ? startPhraseGame(mode) : startRound()));
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
    if (b) speak(b.dataset.say, !!b.dataset.slow);
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
    const active = current === "play" || current === "placement" || (current === "cross" && CW && !CW.finished) || (current === "snake" && SN && SN.state.running);
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
    if (filter === "pv") {
      const st = S.pvs || {};
      $("word-list").innerHTML = PHRASALS.filter(x => !q || x.w.includes(q) || x.es.toLowerCase().includes(q)).map(x => {
        const box = st[x.id] && st[x.id].intro ? st[x.id].box : -1;
        let dots = "";
        for (let i = 1; i <= E.MAX_BOX; i++) dots += '<span class="dot' + (box >= i ? (box >= E.LEARNED_BOX ? " on gold" : " on") : "") + '"></span>';
        return '<li><button type="button" class="word-row" data-pv="' + x.id + '"><span class="wr-rank">#' + x.rank + '</span><span class="wr-main"><span class="wr-w">' + esc(x.w) + '</span><span class="wr-es">' + esc(x.es) + '</span></span><span class="dots">' + dots + "</span></button></li>";
      }).join("") || '<li class="hint">No hay phrasal verbs con esa búsqueda.</li>';
      return;
    }
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
    if (b && b.dataset.pv) openPv(b.dataset.pv);
    else if (b) openWord(b.dataset.word);
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
      mini(S.stats.snakeBest + " pts", "récord en la viborita"),
      mini((S.stats.phrasesIntro || 0) + "/" + PHRASES.length, "frases de reunión vistas"),
      mini((S.stats.meetings || 0) + " · " + (S.stats.shadowOk || 0), "reuniones simuladas · frases repetidas"),
      mini((S.stats.pvsIntro || 0) + "/" + PHRASALS.length, "phrasal verbs vistos"),
      mini((S.stats.roleplays || 0) + " · " + (S.stats.crosswords || 0), "role-plays · crucigramas"),
      mini((S.stats.prepsIntro || 0) + "/" + PREPS.length + " · " + (S.stats.prepOk || 0), "reglas de preposiciones · trampas resueltas")
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
  $("btn-meet-home").addEventListener("click", () => go("meet"));
  $("btn-cross-home").addEventListener("click", () => go("cross"));
  $("btn-role-start").addEventListener("click", () => startRoleplay());
  $("btn-meet-start").addEventListener("click", () => startPhraseGame("meet"));
  $("btn-shadow-start").addEventListener("click", () => startPhraseGame("shadow"));
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
