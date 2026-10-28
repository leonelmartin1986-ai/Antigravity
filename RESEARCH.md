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

### Palabras 201 a 1000: vocabulario de trabajo

**De tus reuniones (398 palabras, marcadas «De mis reuniones»)**

- **Fuente:** las 20 transcripciones más recientes del proyecto NexGen (Chacomer) en tu OneDrive (`Documentos/Claude/Projects/Chacomer Proyect/notes/transcript`), del 15 de julio al 5 de octubre de 2026: talleres de contabilidad de costos e impuestos, EAM y mantenimiento preventivo, plantillas y directivas de ubicación, embalaje, presupuestos y pedidos de venta, comisiones y dimensiones financieras.
- **Conteo:** 16 de las 20 transcripciones se procesaron con un script (56.770 palabras útiles, 6.487 distintas), sin artículos, preposiciones, muletillas ni nombres de personas, y agrupando singular y plural. Las otras 4 (01/10, 04/08 preparación S010, 03/08 cierre S009 y 17/07 dimensiones financieras) se revisaron leyéndolas, porque la herramienta las devolvió de una forma que no permitía pasarlas al script; de ahí salieron palabras como garantía, mano de obra, feriado, auditoría y riesgo.
- **Las más frecuentes:** activo (347), costo (320), sistema (312), dato (309), proyecto (280), línea (265), cuenta (262), plan (250), venta (246), pedido (221), grupo (213), mantenimiento (210), centro (210), fecha (206), artículo (203), cliente (158), diario (157), compra (152), tarea (144), categoría (141), ubicación (138), código (135), factura (135).
- **De castellano a inglés:** cada concepto se tradujo a la palabra que se usa en inglés de negocios y en Dynamics 365 (activo → *asset*, pedido → *order*, almacén → *warehouse*, asiento → *entry*, previsión → *forecast*, imputación → *allocation*). Se sacaron las que ya estaban entre las 200 básicas (ver, hacer, trabajo...).

**Vocabulario de negocios (402 palabras, marcadas «Negocios»)**

Completa hasta 1000 con inglés de oficina, ERP, finanzas, logística, sistemas y reuniones: *deadline, stakeholder, payroll, reconciliation, freight, barcode, deployment, roadmap*, además de verbos de trabajo (*approve, submit, schedule, hire, lead*), adjetivos (*urgent, reliable, profitable*) y conectores (*however, therefore, meanwhile*). Incluye los falsos amigos más traicioneros: *actual* (real), *actually* (en realidad), *eventually* (al final), *realize* (darse cuenta), *attend* (asistir).

**Orden:** después de las 200 básicas, las palabras de tus reuniones y las de negocios se intercalan una y una, cada grupo en su orden de frecuencia. Así la primera palabra nueva de trabajo es *case* (caso), seguida de *agenda*, *example* y *deadline*.

La lista completa con formas y tiempos verbales está en [WORDS.md](WORDS.md).

### Tus 100 frases de reunión

- **Fuente:** todas las transcripciones legibles de tu OneDrive y SharePoint (34 archivos de texto, .md y .vtt). Solo 8 tienen intervenciones tuyas identificadas por orador: Revisión FDD ajuste pagos en divisa (05/08), Call Tadeo sobre el tablero TUP (02/09), Factura anticipo (18/03), las reuniones del 25/03, 01/04 y 08/04, y las dos de Acuerdo DevOps. Las de NexGen, de talleres y las de la sala de capacitación no te registran como orador, así que no se usaron. Los .docx y videos grandes no se pudieron leer con la herramienta.
- **Extracción:** un script tomó solo tus intervenciones (unas 2.400 oraciones), descartó los fragmentos que la transcripción convirtió en inglés por error y contó expresiones de 3 a 6 palabras y aperturas de oración.
- **Selección:** 100 frases en cuatro categorías: saludo inicial (15), inicio de conversación (20), consultas o respuestas técnicas (50) y saludo final (15). Se normalizó la forma (por ejemplo, «quilombo» pasó a «lío»). 94 frases aparecen en tus reuniones; las otras 6 son saludos típicos de una llamada («Buen día a todos», «¿Me escuchan?») que sumamos porque las grabaciones suelen empezar después del saludo.
- **Las más tuyas:** «o sea» (120 veces), «en realidad» (87), «claro» (68), «exacto» (45), «no sé si» (30), «me parece que» (28), «vamos a tener que» (20). En lo técnico: pedido de venta, nota de crédito, factura anticipo, free text, POS y back office.
- **Traducción:** al inglés que se usa en una reunión de proyecto, no palabra por palabra («¿Estamos de acuerdo?» → *Are we on the same page?*; «Cancelamos lo pendiente de entrega» → *We cancel the deliver remainder*, como en Dynamics 365). Cada frase tiene una segunda forma válida.

La lista completa está en [PHRASES.md](PHRASES.md).

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
| Variedad | 10 tipos de pregunta mezclados en cada ronda, más la viborita de letras como pausa activa. |
| Producción de oraciones (efecto de generación) | Ordenar fichas y traducir escribiendo obligan a recuperar la palabra y la gramática a la vez. Se suman en Intermedio y Avanzado para no saturar al principio. |
| Dificultad ajustable | Básico (5 tiempos, opciones múltiples), Intermedio (7 tiempos, negativas y preguntas, armar oraciones) y Avanzado (11 tiempos, escribir y traducir). La prueba de nivel saltea los tramos de palabras que ya sabés. |
| Menos distracción | Una sola tarea por pantalla, letra Atkinson Hyperlegible (diseñada para leer fácil), modo calmado sin animaciones, atajos de teclado 1–4. |
| Tus frases, en su contexto | Se recuerda mejor lo que es relevante para uno mismo y lo que se practica en el contexto en que se va a usar (especificidad de la codificación). El simulador de reunión recorre tus frases en el orden de una llamada: saludo, inicio, 3 intervenciones técnicas y cierre. Las frases tienen su propio repaso espaciado y cada ronda diaria suma 1 o 2 (como máximo 3 nuevas por día). |
| Escuchar y repetir (shadowing) | Repetir en voz alta justo después de escuchar mejora la pronunciación y la fluidez (Hamada, 2016). La app dice la frase (también más lento), vos la repetís y elegís «Me salió bien», «Más o menos» o «Me trabé». Si el navegador tiene reconocimiento de voz, la app te escucha y lo evalúa sola. |
| Registro del uso | Por palabra: veces vista, aciertos, caja, próximo repaso y aciertos por tiempo verbal. Por día: minutos, puntos, respuestas y palabras nuevas. Gráfico de 14 días y distribución por cajas. |

## Límites

- Las frecuencias de SUBTLEX vienen de diálogos de películas: reflejan bien la conversación, aunque con algo más de drama que la vida real.
- La pronunciación usa la voz del teléfono; la calidad cambia según el dispositivo.
- La evidencia sobre gamificación en adultos con TDAH es indirecta. Si los puntos o las vidas te generan ansiedad en vez de motivación, usá el modo calmado y no mires la racha.
- Esta app no reemplaza un tratamiento del TDAH. Es una herramienta de estudio.
