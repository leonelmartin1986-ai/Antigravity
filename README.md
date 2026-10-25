# Word Beat

Juego para el teléfono que enseña las **200 palabras más usadas del inglés hablado y de las canciones**, con todas sus variantes y tiempos verbales, en **10 minutos por día**. Está diseñado con las técnicas de aprendizaje con más respaldo científico, adaptadas a adultos con TDAH.

- **Mnemotecnia:** cada palabra tiene un ancla en español. Por ejemplo: «KNOW se dice NOU: NO sé... ¡pero ahora sí lo KNOW!».
- **Repaso espaciado:** cada palabra vuelve justo antes de que la olvides (1, 2, 4, 7, 15, 30 y 60 días).
- **Tiempos verbales:** cada verbo se practica en presente, pasado, presente perfecto, presente continuo y futuro, con distintos sujetos.
- **Juego:** puntos, combos, 5 vidas que se recargan, racha diaria con protectores, niveles, 16 logros y un cofre sorpresa al cumplir la meta del día.
- **Registro:** minutos por día, aciertos por palabra y por tiempo verbal, caja de cada palabra y próximo repaso.
- **Pensada para TDAH:** rondas de 2 minutos, una sola tarea por pantalla, feedback inmediato y nunca te bloquea (sin vidas pasás a práctica libre).
- Pronuncia en voz alta, funciona sin internet y se instala como una app. Tu progreso queda guardado en el teléfono.

## Instalarla en el teléfono

La app es una **PWA** (web instalable): no pasa por la tienda de apps.

1. Publicala en GitHub Pages (una sola vez):
   1. En GitHub, andá a **Settings → Pages** del repositorio.
   2. En **Source**, elegí **GitHub Actions**.
   3. Uní esta rama a `main`. El workflow `Publicar app en GitHub Pages` corre los tests y publica la carpeta `app/`.
   4. La dirección queda como `https://<tu-usuario>.github.io/<repositorio>/`. Si el repositorio es privado, GitHub Pages requiere un plan pago; si no, hacelo público.
2. Abrí esa dirección en el teléfono:
   - **Android (Chrome):** menú ⋮ → **Instalar app** o **Agregar a la pantalla principal**.
   - **iPhone (Safari):** botón Compartir → **Agregar a inicio**.
3. Abrila desde el ícono. Desde ahí funciona sin conexión.

## Cómo se usa (10 minutos)

1. Tocá **Jugar una ronda**. Cada ronda tiene 8 preguntas y dura unos 2 minutos.
2. Las palabras nuevas aparecen con su tarjeta: escuchala, leé el ancla, mirá sus formas y tocá **¡La tengo!**.
3. Respondé. Si fallás, leé el ancla otra vez y armá la imagen en la cabeza.
4. Hacé rondas hasta llenar el anillo de 10 minutos y abrí el cofre.
5. Volvé mañana: los repasos aparecen solos cuando toca.

En **Ajustes** podés cambiar las palabras nuevas por día (3 a 10), la meta (5 a 15 min), la velocidad de la voz y el modo calmado. También podés copiar tu progreso para pasarlo a otro teléfono.

## Estructura

```
app/                  la app (se publica tal cual)
  index.html
  css/styles.css
  js/words.js         las 200 palabras: traducción, pronunciación, formas, mnemotecnia y ejemplos
  js/engine.js        repaso espaciado, preguntas, puntos, vidas, racha y logros (sin DOM)
  js/app.js           pantallas, voz, sonidos y guardado local
  sw.js               modo sin conexión
  manifest.webmanifest, icons/
tests/engine.test.js  tests del motor (node --test)
tools/                generador de WORDS.md y de la versión de un solo archivo
RESEARCH.md           de dónde salen las palabras y por qué funciona el método
WORDS.md              lista de las 200 palabras con formas y tiempos verbales
```

## Desarrollo

No necesita instalar dependencias. Se necesita Node 18 o más y Python 3.

```bash
npm test               # tests del motor
npm start              # sirve la app en http://localhost:8080
npm run wordlist       # regenera WORDS.md después de editar app/js/words.js
npm run build:single   # genera dist/word-beat.html, todo en un archivo
```

Si cambiás archivos de `app/`, subí la versión de la caché en `app/sw.js` (`wordbeat-v1` → `wordbeat-v2`) para que los teléfonos descarguen la versión nueva.
