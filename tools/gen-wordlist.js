// Genera WORDS.md (las 200 palabras con formas y tiempos verbales) a partir de app/js/words.js.
// Uso: node tools/gen-wordlist.js > WORDS.md
const W = require("../app/js/words.js");
const E = require("../app/js/engine.js");
const TYPE = { v: "verbo", aux: "auxiliar", pron: "pronombre", n: "sustantivo", adj: "adjetivo", adv: "adverbio", prep: "preposición", conj: "conjunción", det: "determinante", num: "número" };
const out = [];
out.push("# Las 200 palabras de Word Beat", "");
out.push("Ordenadas por frecuencia en inglés hablado (SUBTLEX-US) y completadas con las más típicas de canciones (♪). Archivo generado con `node tools/gen-wordlist.js`; no lo edites a mano.", "");
out.push("| # | Palabra | Español | Tipo | Formas / variantes | Se dice |", "|---|---|---|---|---|---|");
W.forEach(e => {
  const f = e.f ? E.forms(e).map((x, i) => x + (E.formLabels(e)[i] ? " (" + E.formLabels(e)[i] + ")" : "")).join(", ") : "";
  out.push(`| ${e.rank} | **${e.w}**${e.so ? " ♪" : ""} | ${e.es} | ${TYPE[e.t]} | ${f} | ${e.pr} |`);
});
out.push("", "## Verbos en cada tiempo verbal", "");
W.filter(e => e.t === "v").forEach(e => {
  out.push(`### ${e.w} (${e.es})`, "", "| Tiempo | Ejemplo |", "|---|---|");
  E.conjugationTable(e).forEach(r => out.push(`| ${r.tense.es} | ${r.first} / ${r.third} |`));
  out.push("");
});
process.stdout.write(out.join("\n") + "\n");
