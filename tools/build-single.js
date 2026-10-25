// Arma una versión de un solo archivo HTML (CSS y JS incluidos) para compartir como página.
// Uso: node tools/build-single.js dist/word-beat.html
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "app");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const html = read("index.html");
const body = html.slice(html.indexOf("<!--APP-START-->") + 16, html.indexOf("<!--APP-END-->"));
const out = [
  "<title>Word Beat</title>",
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Fredoka:wght@500;600;700&display=swap">',
  "<style>\n" + read("css/styles.css") + "\n</style>",
  body.trim(),
  "<script>\n" + read("js/words.js") + "\n</script>",
  "<script>\n" + read("js/grammar.js") + "\n</script>",
  "<script>\n" + read("js/words-work.js") + "\n</script>",
  "<script>\n" + read("js/engine.js") + "\n</script>",
  "<script>\n" + read("js/snake.js") + "\n</script>",
  "<script>\n" + read("js/app.js") + "\n</script>"
].join("\n");
const dest = process.argv[2] || path.join(__dirname, "..", "dist", "word-beat.html");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log("OK", dest, out.length, "bytes");
