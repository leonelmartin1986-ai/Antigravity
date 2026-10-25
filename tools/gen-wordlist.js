// Genera WORDS.md (las 200 palabras con formas y tiempos verbales) a partir de app/js/words.js.
// Uso: node tools/gen-wordlist.js > WORDS.md
const W = require("../app/js/words.js");
const E = require("../app/js/engine.js");
const G = require("../app/js/grammar.js");
const TYPE = { v: "verbo", aux: "auxiliar", pron: "pronombre", n: "sustantivo", adj: "adjetivo", adv: "adverbio", prep: "preposición", conj: "conjunción", det: "determinante", num: "número" };
const out = [];
out.push("# Las 200 palabras de Word Beat", "");
out.push("Ordenadas por frecuencia en inglés hablado (SUBTLEX-US) y completadas con las más típicas de canciones (♪). Archivo generado con `node tools/gen-wordlist.js`; no lo edites a mano.", "");
out.push("| # | Palabra | Español | Tipo | Formas / variantes | Se dice |", "|---|---|---|---|---|---|");
W.forEach(e => {
  const f = e.f ? E.forms(e).map((x, i) => x + (E.formLabels(e)[i] ? " (" + E.formLabels(e)[i] + ")" : "")).join(", ") : "";
  out.push(`| ${e.rank} | **${e.w}**${e.so ? " ♪" : ""} | ${e.es} | ${TYPE[e.t]} | ${f} | ${e.pr} |`);
});
out.push("", "## Verbos en los 11 tiempos verbales", "");
out.push("Cada verbo con sujeto I y she, en afirmativa, negativa y pregunta, con su traducción. En la app, el conjugador de cada palabra muestra los 6 sujetos.", "");
const LV = ["", "Básico", "Intermedio", "Avanzado"];
W.filter(e => e.t === "v").forEach(e => {
  out.push(`### ${e.w} (${e.es})`, "", "| Tiempo | Nivel | Afirmativa | Negativa | Pregunta |", "|---|---|---|---|---|");
  G.tensesFor(e, 3).forEach(t => {
    const sj = e.sj ? "it" : "she";
    const a = G.build(e, t.id, e.sj ? "it" : "I", "aff"), n = G.build(e, t.id, sj, "neg"), q = G.build(e, t.id, sj, "q");
    out.push(`| ${t.es} | ${LV[t.lvl]} | ${a.en}<br>_${a.es}_ | ${n.en}<br>_${n.es}_ | ${q.en}<br>_${q.es}_ |`);
  });
  out.push("");
});
process.stdout.write(out.join("\n") + "\n");
