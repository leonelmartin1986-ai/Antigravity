# Investigación detrás de Word Beat

Este documento explica tres cosas: cómo se eligieron las 200 palabras, qué dice la evidencia sobre cómo aprenden mejor los adultos con TDAH, y cómo se aplica cada hallazgo en la app.

## 1. Cómo se eligieron las 200 palabras

### Fuente principal: inglés hablado

- **SUBTLEX-US** (Brysbaert y New, 2009): frecuencias de palabras sacadas de 51 millones de palabras de subtítulos de 8.388 películas y series estadounidenses. Predice cómo se usa el inglés hablado mejor que los corpus escritos. Se usó la lista pública del paquete [`subtlex-word-frequencies`](https://github.com/words/subtlex-word-frequencies) (74.286 palabras ordenadas por frecuencia). [Datos en OSF](https://osf.io/djpqz) · [Artículo con categorías gramaticales](https://www.doi.org/10.3758/S13428-012-0190-4).

### Cómo se limpió la lista

1. **Se agruparon las variantes bajo una sola palabra** (el lema). `is, was, were, been, am, are` cuentan como **be**; `went, gone, going` cuentan como **go**; `me, my, mine, myself` cuentan como **I**. Así cada palabra de la app trae todas sus formas y tiempos verbales en lugar de ocupar varios lugares de la lista.
2. **Se sacaron fragmentos y ruido de los subtítulos**: pedazos de contracciones (`s`, `t`, `ll`, `don`, `didn`), muletillas (`uh`, `huh`, `oh`, `yeah`, `okay`, `hey`), tratamientos (`Mr`, `sir`), palabrotas y formas informales (`gonna`, `wanna`, `gotta`) que se enseñan mejor como parte de sus verbos.
3. **Se quitaron 3 palabras de tono violento** (`kill`, `die`, `else`), muy frecuentes en los guiones de cine pero poco útiles para conversar, para dejar lugar a vocabulario de canciones.
4. **Se sumaron 20 palabras típicas de canciones**: heart, dance, dream, cry, fall, eye, forever, kiss, alone, light, sky, break, touch, fire, rain, sing, song, tonight, hold y together.

El resultado son **180 palabras del inglés hablado + 20 de canciones**. 26 palabras más del bloque hablado (love, baby, night, world, girl, know, want, feel...) también son muy frecuentes en letras y están marcadas con ♪ en la app.

### Evidencia sobre las letras de canciones

- En las letras dominan los pronombres y las palabras funcionales (`I, you, me, the, it, to`), igual que en la conversación. Por eso la mayor parte de la lista sirve para las dos cosas.
- La palabra de contenido más frecuente en las letras es **love** (Dodds y Danforth, *Measuring the happiness of large-scale written expression: songs, blogs, and presidents*, [arXiv](https://arxiv.org/pdf/1703.09774)).
- Un estudio sobre 479 canciones de Billboard (unas 220.000 palabras) encontró que conocer unas 3.000 familias de palabras cubre el 95% de las letras. También encontró que las combinaciones más frecuentes son contracciones como *I don't, I can't, you don't* ([Temple University](https://scholarshare.temple.edu/handle/20.500.12613/3488)).
- No existe una lista oficial única de palabras de canciones: los estudios cambian según el corpus y según si cuentan o no las palabras funcionales. Por eso las 20 palabras de canciones se eligieron por coincidencia entre esas fuentes, no desde un ranking único.

La lista completa con formas y tiempos verbales está en [WORDS.md](WORDS.md).

## 2. Qué funciona para aprender (y qué cambia con TDAH)

| Hallazgo | Evidencia | Fuerza |
|---|---|---|
| **Recordar es mejor que releer** (práctica de recuperación) | Una de las dos técnicas con «alta utilidad» en la revisión de 10 técnicas de estudio de Dunlosky y colegas (2013, *Psychological Science in the Public Interest* 14(1), 4–58). En universitarios con TDAH también supera a releer (Knouse, Rawson, Vaughn y Dunlosky, 2016, *Clinical Psychological Science*), aunque no cierra del todo la brecha con quienes no tienen TDAH ([estudio de 2023 en *Frontiers in Psychology*](https://doaj.org/article/1401b0311d8d4f73886ee7f0ee44fa95)). | Alta |
| **Repasar con espacios crecientes** | Metaanálisis de 839 mediciones en 317 experimentos: el repaso espaciado supera al estudio en bloque, y el mejor intervalo crece cuanto más tiempo se quiere recordar (Cepeda y colegas, 2006, *Psychological Bulletin* 132(3), 354–380, [PubMed](https://pubmed.ncbi.nlm.nih.gov/16719566/)). | Alta |
| **Con TDAH, la dificultad está sobre todo al codificar** | Metaanálisis de memoria a largo plazo en adultos con TDAH: el déficit aparece al aprender (codificar), no al recuperar (Skodzik, Holling y Pedersen, 2017, *Journal of Attention Disorders*). La memoria de trabajo verbal y visoespacial también rinde moderadamente menos (Alderson y colegas, 2013, metaanálisis de 38 estudios, [SAGE](https://journals.sagepub.com/doi/10.1177/1087054713510561)). | Alta |
| **Mnemotecnia de palabra clave** (asociar con un sonido y una imagen en español) | Mejora el recuerdo inmediato y a un día, también en adultos (Campos y colegas, [Psicothema](https://www.psicothema.com/pdf/3797.pdf)). Usada sola, puede olvidarse antes que la repetición (Wang, Thomas y Ouellette, 1992). Una revisión sistemática encontró resultados heterogéneos a largo plazo ([UDC](https://portalinvestigacion.udc.gal/documentos/608ca9b4af765575d40b116a)). | Media |
| **Doble código: palabra + sonido + imagen mental** | Teoría de la codificación dual (Paivio): dos rutas de acceso a un mismo recuerdo. | Media |
| **Recompensa cercana y feedback inmediato** | El modelo de aversión a la demora (Sonuga-Barke) y estudios de descuento temporal muestran que en el TDAH pesan más las recompensas inmediatas, sobre todo en los subtipos combinado e hiperactivo ([estudio con adolescentes](https://pubmed.ncbi.nlm.nih.gov/17876680)). | Media |
| **Gamificación (puntos, vidas, insignias) en TDAH** | No se encontraron ensayos controlados específicos en adultos con TDAH. Se usa como apoyo a la motivación, apoyado en el punto anterior, no como técnica de aprendizaje en sí. | Baja (inferencia) |

### Conclusiones para el diseño

1. Lo central es **recuperar con esfuerzo y repasar espaciado**. El juego es el envoltorio que ayuda a volver todos los días.
2. Como el problema está en la **entrada**, cada palabra nueva tiene que entrar fuerte: imagen mental, sonido, ejemplo, y una segunda pregunta en la misma ronda.
3. La **mnemotecnia** se usa para entrar, y el **repaso espaciado** compensa su debilidad a largo plazo.
4. **Poca carga a la vez**: la memoria de trabajo es el recurso más escaso.

## 3. Cómo se aplica en la app

| Principio | Cómo lo hace Word Beat |
|---|---|
| Práctica de recuperación | Casi todo son preguntas: elegir el significado, decirlo en inglés, escuchar y elegir, completar frases, identificar la forma verbal y escribir la palabra. |
| Repaso espaciado | Sistema de cajas (Leitner) con intervalos de 0, 1, 2, 4, 7, 15, 30 y 60 días. Un acierto sube una caja; un error baja la palabra a la mitad (no a cero) y la trae de vuelta mañana. Acertar antes de tiempo no sube de caja. |
| Codificación fuerte | Como máximo 2 palabras nuevas por ronda y 5 por día (se puede cambiar). Tarjeta con pronunciación en voz alta, ancla mnemotécnica, formas y ejemplo. Cada palabra nueva se pregunta enseguida y otra vez al final de la ronda. |
| Tiempos verbales | Cada verbo se practica en presente, pasado, presente perfecto, presente continuo y futuro, con sujetos que cambian (I, she, they...) para entrenar la -s de tercera persona. Los verbos de estado (know, like, want...) no se preguntan en continuo. |
| Dificultad progresiva | Caja 0: reconocer. Cajas 1–3: tiempos verbales, traducción inversa, completar frases. Caja 4 en adelante: escribir la palabra. |
| Re-codificar en el error | Al fallar se muestra de nuevo el ancla y se pronuncia la palabra: es el momento de mayor aprendizaje. |
| Sesiones cortas, meta visible | Rondas de 8 preguntas (unos 2 minutos), barra segmentada, anillo de 10 minutos. Solo cuenta el tiempo activo: si te distraés más de un minuto, el reloj se pausa. |
| Recompensa inmediata y sorpresa | Puntos al instante, combo por aciertos seguidos, bonus por ronda perfecta, cofre con premio variable al cumplir la meta diaria, niveles e insignias. |
| Sin castigos que bloqueen | 5 vidas que se recargan cada 30 minutos. Sin vidas no hay bloqueo: entrás en práctica libre y recuperás una vida. La racha tiene protectores (uno cada 7 días, máximo 2). |
| Variedad | 7 tipos de pregunta mezclados en cada ronda. |
| Menos distracción | Una sola tarea por pantalla, letra Atkinson Hyperlegible (diseñada para leer fácil), modo calmado sin animaciones, atajos de teclado 1–4. |
| Registro del uso | Por palabra: veces vista, aciertos, caja, próximo repaso y aciertos por tiempo verbal. Por día: minutos, puntos, respuestas y palabras nuevas. Gráfico de 14 días y distribución por cajas. |

## Límites

- Las frecuencias de SUBTLEX vienen de diálogos de películas: reflejan bien la conversación, aunque con algo más de drama que la vida real.
- La pronunciación usa la voz del teléfono; la calidad cambia según el dispositivo.
- La evidencia sobre gamificación en adultos con TDAH es indirecta. Si los puntos o las vidas te generan ansiedad en vez de motivación, usá el modo calmado y no mires la racha.
- Esta app no reemplaza un tratamiento del TDAH. Es una herramienta de estudio.
