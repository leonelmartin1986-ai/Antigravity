/*
 * Gramática: arma oraciones en 11 tiempos verbales, en afirmativa, negativa y pregunta,
 * en inglés y con su traducción al castellano. No toca el DOM.
 */
(function (root) {
  // nivel: 1 básico, 2 intermedio, 3 avanzado. cont: usa -ing (no va con verbos de estado).
  const TENSES = [
    { id: "present", es: "Presente simple", hint: "rutina, todos los días", lvl: 1 },
    { id: "past", es: "Pasado simple", hint: "ayer, terminado", lvl: 1 },
    { id: "perfect", es: "Presente perfecto", hint: "alguna vez, hasta hoy", lvl: 1 },
    { id: "continuous", es: "Presente continuo", hint: "ahora mismo", lvl: 1, cont: 1 },
    { id: "future", es: "Futuro (will)", hint: "mañana", lvl: 1 },
    { id: "pastcont", es: "Pasado continuo", hint: "en ese momento del pasado", lvl: 2, cont: 1 },
    { id: "goingto", es: "Futuro (going to)", hint: "plan, intención", lvl: 2 },
    { id: "conditional", es: "Condicional", hint: "haría, si se pudiera", lvl: 3 },
    { id: "pastperf", es: "Pasado perfecto", hint: "antes de otro pasado", lvl: 3 },
    { id: "futcont", es: "Futuro continuo", hint: "mañana a esta hora", lvl: 3, cont: 1 },
    { id: "perfcont", es: "Presente perfecto continuo", hint: "desde hace rato, todo el día", lvl: 3, cont: 1 }
  ];
  const TENSE = Object.fromEntries(TENSES.map(t => [t.id, t]));

  const POLARITIES = [
    { id: "aff", es: "Afirmativa" },
    { id: "neg", es: "Negativa" },
    { id: "q", es: "Pregunta" }
  ];

  // p = persona en castellano (0 yo, 1 tú, 2 él/ella, 3 nosotros, 5 ellos)
  const SUBJECTS = [
    { id: "I", en: "I", es: "Yo", p: 0, third: false },
    { id: "you", en: "you", es: "Tú", p: 1, third: false },
    { id: "he", en: "he", es: "Él", p: 2, third: true },
    { id: "she", en: "she", es: "Ella", p: 2, third: true, fem: true },
    { id: "we", en: "we", es: "Nosotros", p: 3, third: false },
    { id: "they", en: "they", es: "Ellos", p: 5, third: false }
  ];
  const IT = { id: "it", en: "it", es: "", p: 2, third: true, impersonal: true };

  const TIME = {
    present: ["every day", "todos los días", "", ""],
    past: ["yesterday", "ayer", "last year", "el año pasado"],
    perfect: ["before", "antes", "for a long time", "desde hace mucho tiempo"],
    continuous: ["right now", "ahora mismo"],
    future: ["tomorrow", "mañana", "tomorrow", "mañana"],
    pastcont: ["at eight last night", "anoche a las ocho"],
    goingto: ["next week", "la próxima semana", "next week", "la próxima semana"],
    conditional: ["if possible", "si fuera posible", "if possible", "si fuera posible"],
    pastperf: ["before the party", "antes de la fiesta", "before the party", "antes de la fiesta"],
    futcont: ["at this time tomorrow", "mañana a esta hora"],
    perfcont: ["all day", "todo el día"]
  };

  /* ---------- castellano ---------- */

  // Cómo se dice cada verbo en castellano. v: infinitivo, post: complemento,
  // pre: pronombre antes del verbo, rf: reflexivo (me/te/se...), gu: estructura de «gustar».
  const SP = {
    have: { v: "desayunar", post: "" },
    do: { v: "hacer", post: "la tarea" },
    know: { v: "saber", post: "la respuesta" },
    get: { v: "comprar", post: "un café" },
    like: { v: "gustar", gu: 1, post: "la pizza" },
    go: { v: "ir", post: "a casa" },
    come: { v: "venir", post: "aquí" },
    want: { v: "querer", post: "un teléfono nuevo" },
    think: { v: "pensar", post: "en el futuro" },
    see: { v: "ver", post: "el amanecer" },
    let: { v: "dejar", post: "jugar a los niños" },
    look: { v: "mirar", post: "el cielo" },
    take: { v: "tomar", post: "el colectivo" },
    tell: { v: "decir", post: "la verdad" },
    say: { v: "decir", post: "hola" },
    make: { v: "hacer", post: "la cena" },
    need: { v: "necesitar", post: "ayuda" },
    mean: { v: "decir", pre: "lo", post: "en serio" },
    give: { v: "dar", pre: "le", post: "comida al perro" },
    thank: { v: "agradecer", post: "al profesor" },
    love: { v: "amar", post: "la música" },
    help: { v: "ayudar", post: "a mamá" },
    call: { v: "llamar", post: "a mamá" },
    talk: { v: "hablar", post: "con mi amigo" },
    find: { v: "encontrar", post: "las llaves" },
    wait: { v: "esperar", post: "el colectivo" },
    put: { v: "poner", post: "las llaves en la mesa" },
    work: { v: "trabajar", post: "duro" },
    stop: { v: "detener", post: "el auto" },
    keep: { v: "guardar", post: "un secreto" },
    feel: { v: "sentir", rf: 1, post: "feliz" },
    believe: { v: "creer", post: "en el amor" },
    leave: { v: "salir", post: "de la oficina" },
    hear: { v: "oír", post: "música" },
    listen: { v: "escuchar", post: "música" },
    remember: { v: "recordar", post: "la dirección" },
    stay: { v: "quedar", rf: 1, post: "en casa" },
    happen: { v: "pasar", post: "" },
    show: { v: "mostrar", post: "las fotos" },
    care: { v: "preocupar", rf: 1, post: "por los niños" },
    ask: { v: "hacer", post: "una pregunta" },
    understand: { v: "entender", post: "el problema" },
    try: { v: "probar", post: "comida nueva" },
    guess: { v: "adivinar", post: "la respuesta" },
    dance: { v: "bailar", post: "salsa" },
    dream: { v: "soñar", post: "con la playa" },
    cry: { v: "llorar", post: "con las películas tristes" },
    fall: { v: "enamorar", rf: 1, post: "" },
    kiss: { v: "besar", post: "al bebé" },
    break: { v: "romper", post: "las reglas" },
    touch: { v: "tocar", post: "la pantalla" },
    rain: { v: "llover", post: "" },
    sing: { v: "cantar", post: "una canción" },
    hold: { v: "sostener", post: "el paraguas" }
  };

  // Verbos irregulares (formas para yo, tú, él, nosotros, vosotros, ellos).
  const IRR = {
    hacer: { pres: "hago haces hace hacemos hacéis hacen", pret: "hice hiciste hizo hicimos hicisteis hicieron", fut: "har", pp: "hecho" },
    saber: { pres: "sé sabes sabe sabemos sabéis saben", pret: "supe supiste supo supimos supisteis supieron", fut: "sabr" },
    ir: { pres: "voy vas va vamos vais van", pret: "fui fuiste fue fuimos fuisteis fueron", ger: "yendo" },
    venir: { pres: "vengo vienes viene venimos venís vienen", pret: "vine viniste vino vinimos vinisteis vinieron", fut: "vendr", ger: "viniendo" },
    querer: { sc: "ie", pret: "quise quisiste quiso quisimos quisisteis quisieron", fut: "querr" },
    pensar: { sc: "ie" },
    ver: { pres: "veo ves ve vemos veis ven", pret: "vi viste vio vimos visteis vieron", pp: "visto" },
    decir: { pres: "digo dices dice decimos decís dicen", pret: "dije dijiste dijo dijimos dijisteis dijeron", fut: "dir", pp: "dicho", ger: "diciendo" },
    dar: { pres: "doy das da damos dais dan", pret: "di diste dio dimos disteis dieron" },
    agradecer: { pres: "agradezco agradeces agradece agradecemos agradecéis agradecen" },
    encontrar: { sc: "ue" },
    poner: { pres: "pongo pones pone ponemos ponéis ponen", pret: "puse pusiste puso pusimos pusisteis pusieron", fut: "pondr", pp: "puesto" },
    detener: { pres: "detengo detienes detiene detenemos detenéis detienen", pret: "detuve detuviste detuvo detuvimos detuvisteis detuvieron", fut: "detendr" },
    sostener: { pres: "sostengo sostienes sostiene sostenemos sostenéis sostienen", pret: "sostuve sostuviste sostuvo sostuvimos sostuvisteis sostuvieron", fut: "sostendr" },
    sentir: { sc: "ie", pret: "sentí sentiste sintió sentimos sentisteis sintieron", ger: "sintiendo" },
    creer: { pret: "creí creíste creyó creímos creísteis creyeron", pp: "creído", ger: "creyendo" },
    salir: { pres: "salgo sales sale salimos salís salen", fut: "saldr" },
    "oír": { pres: "oigo oyes oye oímos oís oyen", pret: "oí oíste oyó oímos oísteis oyeron", fut: "oir", pp: "oído", ger: "oyendo" },
    recordar: { sc: "ue" },
    mostrar: { sc: "ue" },
    entender: { sc: "ie" },
    probar: { sc: "ue" },
    "soñar": { sc: "ue" },
    llover: { sc: "ue" },
    romper: { pp: "roto" },
    tocar: { pret: "toqué tocaste tocó tocamos tocasteis tocaron" }
  };

  const END = {
    pres: { ar: ["o", "as", "a", "amos", "áis", "an"], er: ["o", "es", "e", "emos", "éis", "en"], ir: ["o", "es", "e", "imos", "ís", "en"] },
    pret: { ar: ["é", "aste", "ó", "amos", "asteis", "aron"], er: ["í", "iste", "ió", "imos", "isteis", "ieron"], ir: ["í", "iste", "ió", "imos", "isteis", "ieron"] },
    fut: ["é", "ás", "á", "emos", "éis", "án"],
    cond: ["ía", "ías", "ía", "íamos", "íais", "ían"]
  };
  const AUX = {
    haber: ["he", "has", "ha", "hemos", "habéis", "han"],
    habia: ["había", "habías", "había", "habíamos", "habíais", "habían"],
    estar: ["estoy", "estás", "está", "estamos", "estáis", "están"],
    estaba: ["estaba", "estabas", "estaba", "estábamos", "estabais", "estaban"],
    estare: ["estaré", "estarás", "estará", "estaremos", "estaréis", "estarán"],
    ir: ["voy", "vas", "va", "vamos", "vais", "van"]
  };
  const REFLEX = ["me", "te", "se", "nos", "os", "se"];
  const GUSTAR_IO = ["me", "te", "le", "nos", "os", "les"];

  function vclass(inf) {
    const e = inf.slice(-2).replace("í", "i");
    return e === "ar" ? "ar" : e === "er" ? "er" : "ir";
  }
  function stem(inf) { return inf.slice(0, -2); }
  function stemChange(st, sc) {
    const from = sc === "ie" ? "e" : "o";
    const i = st.lastIndexOf(from);
    return i < 0 ? st : st.slice(0, i) + (sc === "ie" ? "ie" : "ue") + st.slice(i + 1);
  }

  const Es = {
    pres(inf, p) {
      const x = IRR[inf] || {};
      if (x.pres) return x.pres.split(" ")[p];
      let st = stem(inf);
      if (x.sc && [0, 1, 2, 5].includes(p)) st = stemChange(st, x.sc);
      return st + END.pres[vclass(inf)][p];
    },
    pret(inf, p) {
      const x = IRR[inf] || {};
      if (x.pret) return x.pret.split(" ")[p];
      return stem(inf) + END.pret[vclass(inf)][p];
    },
    fut(inf, p) { const x = IRR[inf] || {}; return (x.fut || inf) + END.fut[p]; },
    cond(inf, p) { const x = IRR[inf] || {}; return (x.fut || inf) + END.cond[p]; },
    pp(inf) { const x = IRR[inf] || {}; return x.pp || stem(inf) + (vclass(inf) === "ar" ? "ado" : "ido"); },
    ger(inf) { const x = IRR[inf] || {}; return x.ger || stem(inf) + (vclass(inf) === "ar" ? "ando" : "iendo"); }
  };

  function esVerbGroup(inf, tense, p) {
    switch (tense) {
      case "present": return Es.pres(inf, p);
      case "past": return Es.pret(inf, p);
      case "perfect": return AUX.haber[p] + " " + Es.pp(inf);
      case "continuous": return AUX.estar[p] + " " + Es.ger(inf);
      case "future": return Es.fut(inf, p);
      case "pastcont": return AUX.estaba[p] + " " + Es.ger(inf);
      case "goingto": return AUX.ir[p] + " a " + inf;
      case "conditional": return Es.cond(inf, p);
      case "pastperf": return AUX.habia[p] + " " + Es.pp(inf);
      case "futcont": return AUX.estare[p] + " " + Es.ger(inf);
      case "perfcont": return AUX.haber[p] + " estado " + Es.ger(inf);
    }
    return inf;
  }

  /* ---------- inglés ---------- */

  function forms(entry) { return entry.f.split("|"); }

  // Devuelve las partes de la frase verbal: aux (antes del sujeto en preguntas), mid (resto) y main (verbo principal).
  function enVerb(entry, tense, subj, pol) {
    const [base, s3, past, pp, ing] = forms(entry);
    const third = subj.third, isI = subj.id === "I";
    const plural = !third && !isI;
    const be = isI ? "am" : third ? "is" : "are";
    const beNeg = isI ? "am not" : third ? "isn't" : "aren't";
    const was = isI || third ? "was" : "were";
    const have = third ? "has" : "have";
    void plural;
    // Para cada tiempo: [auxiliar afirmativo, auxiliar negativo, resto después del auxiliar, verbo principal]
    let a, n, rest, main;
    switch (tense) {
      case "present":
        if (pol === "aff") return { q: null, mid: third ? s3 : base, main: third ? s3 : base };
        a = third ? "does" : "do"; n = third ? "doesn't" : "don't"; main = base; rest = base; break;
      case "past":
        if (pol === "aff") return { q: null, mid: past, main: past };
        a = "did"; n = "didn't"; main = base; rest = base; break;
      case "perfect": a = have; n = have + "n't"; main = pp; rest = pp; break;
      case "continuous": a = be; n = beNeg; main = ing; rest = ing; break;
      case "future": a = "will"; n = "won't"; main = base; rest = base; break;
      case "pastcont": a = was; n = was + "n't"; main = ing; rest = ing; break;
      case "goingto": a = be; n = beNeg; main = base; rest = "going to " + base; break;
      case "conditional": a = "would"; n = "wouldn't"; main = base; rest = base; break;
      case "pastperf": a = "had"; n = "hadn't"; main = pp; rest = pp; break;
      case "futcont": a = "will"; n = "won't"; main = ing; rest = "be " + ing; break;
      case "perfcont": a = have; n = have + "n't"; main = ing; rest = "been " + ing; break;
    }
    if (pol === "q") return { q: a, mid: rest, main };
    return { q: null, mid: (pol === "neg" ? n : a) + " " + rest, main, aux: pol === "neg" ? n : a };
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function join(parts) { return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim(); }

  function subjectsFor(entry) { return entry.sj ? [IT] : SUBJECTS; }

  function tensesFor(entry, level) {
    return TENSES.filter(t => t.lvl <= (level || 3) && !(entry.s && t.cont));
  }

  function timeFor(entry, tense) {
    const t = TIME[tense];
    if (entry.s && t.length > 2) return { en: t[2], es: t[3] };
    return { en: t[0], es: t[1] };
  }

  /*
   * Arma una oración completa.
   * Devuelve { en, es, words (fichas en inglés), verb (frase verbal para completar),
   *            pre/post (oración en inglés alrededor de la frase verbal), main }.
   */
  function build(entry, tense, subj, pol) {
    if (typeof subj === "string") subj = SUBJECTS.find(s => s.id === subj) || IT;
    const v = enVerb(entry, tense, subj, pol);
    const time = timeFor(entry, tense);
    const c = entry.c || "";
    const subjEn = subj.en;
    let en, pre, post, verb;
    if (pol === "q") {
      en = cap(join([v.q, subjEn, v.mid, c, time.en])) + "?";
      verb = null;
    } else {
      pre = cap(subjEn) === "I" ? "I" : cap(subjEn);
      verb = v.mid;
      post = join([c, time.en]);
      en = join([pre, verb, post]) + ".";
    }
    const es = buildEs(entry, tense, subj, pol, time.es);
    const words = en.replace(/[.?]$/, "").split(" ").map(w => (w === "I" ? w : w.toLowerCase()));
    return { en, es, words, verb, pre, post: post ? " " + post + "." : ".", main: v.main, tense, pol, subj: subj.id };
  }

  function buildEs(entry, tense, subj, pol, timeEs) {
    const sp = SP[entry.w];
    if (!sp) return "";
    const p = subj.p;
    let subjEs = subj.impersonal ? "" : subj.es;
    let clitic = sp.pre || "";
    if (sp.rf) clitic = REFLEX[p];
    let vg;
    if (sp.gu) {
      // «gustar»: la persona pasa a ser objeto indirecto (me gusta, le gusta...).
      clitic = GUSTAR_IO[p];
      subjEs = p === 2 ? (subj.fem ? "A ella" : "A él") : p === 5 ? "A ellos" : "";
      vg = esVerbGroup(sp.v, tense, 2);
    } else vg = esVerbGroup(sp.v, tense, p);
    const body = join([subjEs, pol === "neg" ? "no" : "", clitic, vg, sp.post, timeEs]);
    if (pol === "q") return "¿" + cap(body) + "?";
    return cap(body) + ".";
  }

  /* ---------- corrección de oraciones escritas ---------- */

  const CONTR = [
    [/\bdon't\b/g, "do not"], [/\bdoesn't\b/g, "does not"], [/\bdidn't\b/g, "did not"],
    [/\bhaven't\b/g, "have not"], [/\bhasn't\b/g, "has not"], [/\bhadn't\b/g, "had not"],
    [/\bisn't\b/g, "is not"], [/\baren't\b/g, "are not"], [/\bwasn't\b/g, "was not"], [/\bweren't\b/g, "were not"],
    [/\bwon't\b/g, "will not"], [/\bwouldn't\b/g, "would not"], [/\bcan't\b/g, "can not"], [/\bcannot\b/g, "can not"],
    [/\bi'm\b/g, "i am"], [/'re\b/g, " are"], [/'ve\b/g, " have"], [/'ll\b/g, " will"], [/'d\b/g, " would"]
  ];
  function normSentence(s) {
    let x = String(s || "").toLowerCase().replace(/[’`´]/g, "'");
    CONTR.forEach(([re, rep]) => { x = x.replace(re, rep); });
    return x.replace(/[.,!?¿¡;:]/g, " ").replace(/\s+/g, " ").trim();
  }

  // Acepta la oración con o sin la expresión de tiempo (yesterday, every day...).
  function checkSentence(target, given, entry) {
    const g = normSentence(given);
    if (g === normSentence(target.en)) return true;
    const time = timeFor(entry, target.tense).en;
    if (time) {
      const noTime = normSentence(target.en.replace(new RegExp("\\s*" + time.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), ""));
      if (g === noTime) return true;
    }
    return false;
  }

  const Grammar = { TENSES, TENSE, POLARITIES, SUBJECTS, IT, SP, Es, build, buildEs, tensesFor, subjectsFor, timeFor, normSentence, checkSentence, enVerb };

  if (typeof module !== "undefined" && module.exports) module.exports = Grammar;
  else root.Grammar = Grammar;
})(typeof window !== "undefined" ? window : globalThis);
