# Word Beat

Juego para el teléfono que enseña **1000 palabras en inglés**: las 200 más usadas del inglés hablado y de las canciones, 398 sacadas de tus últimas 20 reuniones de trabajo y 402 de vocabulario de negocios. Cada una con sus variantes y tiempos verbales, en **10 minutos por día**. Está diseñado con las técnicas de aprendizaje con más respaldo científico, adaptadas a adultos con TDAH.

- **Mnemotecnia:** cada palabra tiene un ancla en español. Por ejemplo: «KNOW se dice NOU: NO sé... ¡pero ahora sí lo KNOW!».
- **Repaso espaciado:** cada palabra vuelve justo antes de que la olvides (1, 2, 4, 7, 15, 30 y 60 días).
- **11 tiempos verbales** en afirmativa, negativa y pregunta, con traducción al castellano: presente, pasado, presente perfecto, presente continuo, futuro con *will*, pasado continuo, *going to*, condicional, pasado perfecto, futuro continuo y presente perfecto continuo.
- **Armar oraciones:** ordenar fichas, traducir escribiendo la oración completa y un conjugador interactivo por verbo (elegís sujeto, tiempo y forma).
- **Tres dificultades:** Básico, Intermedio y Avanzado. Cambian los tiempos, los tipos de ejercicio y cuántos puntos da cada acierto.
- **Prueba de nivel y «Ya la sé»:** saltea las palabras que ya conocés. Hasta 20 palabras nuevas por día.
- **Viborita de letras:** comé las letras en orden para formar la palabra. Las consignas rotan entre castellano → inglés, formas verbales y oraciones para completar.
- **Juego:** puntos, combos, 5 vidas que se recargan, racha diaria con protectores, niveles, 21 logros y un cofre sorpresa al cumplir la meta del día.
- **Registro:** minutos por día, aciertos por palabra y por tiempo verbal, caja de cada palabra y próximo repaso.
- **Pensada para TDAH:** rondas de 2 minutos, una sola tarea por pantalla, feedback inmediato y nunca te bloquea (sin vidas pasás a práctica libre).
- Pronuncia en voz alta, funciona sin internet y se instala como una app. Tu progreso queda guardado en el teléfono.

## Instalarla en Android (APK)

1. En el teléfono, abrí la sección **Releases** del repositorio en GitHub y entrá a la última versión (`Word Beat 1.0.x`).
2. Descargá el archivo `WordBeat-1.0.x.apk`.
3. Abrilo. Si Android lo pide, permití **Instalar apps de origen desconocido** para el navegador o el gestor de archivos.
4. Tocá **Instalar** y abrí **Word Beat** desde el cajón de apps.

Cada vez que se actualiza `main`, GitHub Actions compila un APK nuevo (workflow `Compilar APK de Android`) y lo publica en una Release. Las versiones nuevas se instalan encima de la anterior y conservan el progreso, porque todas se firman con la misma llave (`android/wordbeat.keystore`). Esa llave sirve solo para instalar la app por tu cuenta: para publicarla en Google Play hay que generar una llave privada nueva.

La voz usa el motor de texto a voz de Android. Si no se escucha, instalá los datos de voz en inglés en **Ajustes → Sistema → Idioma → Salida de texto a voz**.

### Alternativa: versión web (sirve también para iPhone)

1. En GitHub, **Settings → Pages → Source: GitHub Actions**.
2. Pestaña **Actions → Publicar app en GitHub Pages → Run workflow**.
3. Abrí `https://<tu-usuario>.github.io/<repositorio>/` en el teléfono y elegí **Agregar a la pantalla de inicio**. Si el repositorio es privado, GitHub Pages requiere un plan pago.

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
  js/words.js         las 200 palabras básicas: traducción, pronunciación, formas, mnemotecnia y ejemplos
  js/words-work.js    las 800 palabras de trabajo (reuniones + negocios) en formato compacto
  js/grammar.js       11 tiempos en inglés (afirmativa, negativa, pregunta) y su traducción al castellano
  js/engine.js        repaso espaciado, preguntas por dificultad, puntos, vidas, racha y logros (sin DOM)
  js/snake.js         juego de la viborita de letras
  js/app.js           pantallas, voz, sonidos y guardado local
  sw.js               modo sin conexión
  manifest.webmanifest, icons/
android/              envoltorio Android (WebView + voz del sistema) que empaqueta app/
tests/engine.test.js  tests del motor (node --test)
tools/                generador de WORDS.md y de la versión de un solo archivo
RESEARCH.md           de dónde salen las palabras y por qué funciona el método
WORDS.md              lista de las 1000 palabras con formas y tiempos verbales
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
