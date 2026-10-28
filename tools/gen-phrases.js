// Genera PHRASES.md con tus 100 frases de reunión por categoría.
// Uso: node tools/gen-phrases.js > PHRASES.md
const PHRASES = require("../app/js/phrases.js");
const E = require("../app/js/engine.js");
const out = ["# Mis 100 frases de reunión", "",
  "Frases sacadas de las transcripciones de Teams donde hablás vos, traducidas al inglés natural de reunión. «Veces» es cuántas oraciones tuyas la contienen; 0 indica una frase típica de reunión que se sumó para completar la categoría. Cómo se obtuvieron: ver [RESEARCH.md](RESEARCH.md).", ""];
E.PHRASE_CATS.forEach(c => {
  const list = PHRASES.filter(p => p.cat === c.id);
  out.push("## " + c.es + " (" + list.length + ")", "", "| # | Castellano | Inglés | También se acepta | Veces |", "|---|---|---|---|---|");
  list.forEach(p => out.push("| " + p.rank + " | " + p.es + " | " + p.en + " | " + p.alt.join(" / ") + " | " + p.n + " |"));
  out.push("");
});
console.log(out.join("\n"));
