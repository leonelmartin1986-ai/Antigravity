// Genera PHRASALS.md (los 200 phrasal verbs) y ROLEPLAYS.md (las conversaciones por turnos).
// Uso: node tools/gen-phrasals.js
const fs = require("fs");
const path = require("path");
const PV = require("../app/js/phrasals.js");
const RP = require("../app/js/roleplays.js");
const KIND = { s: "separable", i: "inseparable", n: "sin objeto" };
const a = ["# Los 200 phrasal verbs", "",
  "Ordenados por frecuencia: los primeros 150 siguen la lista PHaVE (Garnier y Schmitt, 2015) y los últimos 50 son los más usados en reuniones de trabajo y proyectos. En la app entran de a pocos en las rondas (hasta 4 nuevos por día), con repaso espaciado.", "",
  "| # | Phrasal verb | Castellano | Pasado | Tipo | Ejemplo | Traducción | Ancla |", "|---|---|---|---|---|---|---|---|"];
PV.forEach(x => a.push("| " + [x.rank, "**" + x.w + "**", x.es, x.past, KIND[x.kind], x.ex, x.xe, x.mn].join(" | ") + " |"));
fs.writeFileSync(path.join(__dirname, "..", "PHRASALS.md"), a.join("\n") + "\n");
const b = ["# Role-play: conversaciones por turnos", "",
  RP.length + " conversaciones de 6 turnos basadas en tus reuniones reales. En cada turno la otra persona habla en inglés y vos respondés.", ""];
RP.forEach((sc, i) => {
  b.push("## " + (i + 1) + ". " + sc.title, "", "*" + sc.ctx + "* Hablás con " + sc.who + ".", "", "| Te dicen | Querés decir | Respuesta modelo | También vale |", "|---|---|---|---|");
  sc.turns.forEach(t => b.push("| " + [t.them, t.es, "**" + t.en + "**", t.alt.join(" / ")].join(" | ") + " |"));
  b.push("");
});
fs.writeFileSync(path.join(__dirname, "..", "ROLEPLAYS.md"), b.join("\n"));
console.log("OK", PV.length, "phrasal verbs,", RP.length, "role-plays");
