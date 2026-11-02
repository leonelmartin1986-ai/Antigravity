// Genera PREPOSITIONS.md con las reglas, el porqué, los ejemplos y las oraciones con truco.
// Uso: node tools/gen-preps.js > PREPOSITIONS.md
const PREPS = require("../app/js/preps.js");
const E = require("../app/js/engine.js");
const out = ["# Preposiciones: reglas, porqué y oraciones con truco", "",
  PREPS.length + " reglas y " + PREPS.reduce((a, r) => a + r.items.length, 0) + " oraciones con truco. En cada oración, la trampa es el error típico de quien habla castellano. Aparecen dentro de las rondas diarias: primero la tarjeta de la regla y después las oraciones, con repaso espaciado.", ""];
let group = "";
PREPS.forEach(r => {
  if (r.g !== group) { group = r.g; out.push("## " + group, ""); }
  out.push("### " + r.rank + ". " + r.t, "", "**Clave:** " + r.k, "", "**Por qué:** " + r.why, "", "Ejemplos:", "");
  r.ex.forEach(([en, es]) => out.push("- *" + en + "* — " + es));
  out.push("", "| Oración con truco | Correcta | Trampa | Castellano |", "|---|---|---|---|");
  r.items.forEach(it => out.push("| " + it.s.replace("___", "\\_\\_\\_") + " | **" + E.fillPrep(it.s, it.a) + "** | ~~" + E.fillPrep(it.s, it.trap) + "~~ | " + it.es + " |"));
  out.push("");
});
console.log(out.join("\n"));
