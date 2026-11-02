/*
 * Preposiciones: reglas con su porqué, ejemplos y oraciones con truco.
 * Cada regla: id, grupo, preposiciones (p), título (t), clave en una línea (k), explicación (why),
 * ejemplos [inglés, castellano] e ítems "oración con ___|correcta|trampa|otra opción|castellano".
 * La trampa es el error típico de quien habla castellano. «—» significa «sin preposición».
 */
(function (root) {
  const RAW = [
    {
      id: "t-iot", g: "Tiempo", p: "in · on · at", t: "Cuándo: in, on, at",
      k: "IN para períodos largos (meses, años, partes del día), ON para días y fechas, AT para la hora exacta.",
      why: "Pensalo como un embudo que va de lo grande a lo chico. IN envuelve un período largo: in March, in 2026, in the morning. ON se apoya en un día del calendario: on Monday, on June 30th. AT apunta a un punto exacto del reloj: at 10:30, at noon, at night. En castellano decimos «en» o «a» para todo, por eso se mezclan. Si hay día y parte del día juntos, manda el día: on Friday afternoon.",
      ex: [["The go-live is in March.", "El arranque es en marzo."], ["The steering meeting is on Monday.", "El comité es el lunes."], ["The call starts at 10:30.", "La llamada empieza a las 10:30."], ["See you on Friday afternoon.", "Nos vemos el viernes a la tarde."]],
      items: [
        "The go-live is ___ March.|in|on|at|El arranque es en marzo.",
        "The meeting is ___ Monday.|on|in|at|La reunión es el lunes.",
        "The call starts ___ 10:30.|at|in|on|La llamada empieza a las 10:30.",
        "We close the period ___ June 30th.|on|in|at|Cerramos el período el 30 de junio.",
        "I usually review the backlog ___ the morning.|in|on|at|Suelo revisar el backlog a la mañana.",
        "The batch job runs ___ night.|at|in|on|El proceso batch corre de noche.",
        "The project started ___ 2025.|in|on|at|El proyecto empezó en 2025.",
        "See you ___ Friday afternoon.|on|in|at|Nos vemos el viernes a la tarde."
      ]
    },
    {
      id: "t-for-since", g: "Tiempo", p: "for · since", t: "Hace / desde: for, since",
      k: "FOR + cuánto tiempo (two years). SINCE + desde cuándo (2024, Monday).",
      why: "En castellano decimos «hace dos años» o «desde 2024» y en inglés las dos ideas van con presente perfecto, pero cambia la preposición. FOR mide una duración: for two hours, for a week. SINCE marca el punto de partida en el calendario: since Monday, since January, since last week. Truco: si podés preguntar «¿cuánto tiempo?», es FOR; si preguntás «¿desde cuándo?», es SINCE.",
      ex: [["I've worked on this project for two years.", "Trabajo en este proyecto hace dos años."], ["I've worked here since 2024.", "Trabajo acá desde 2024."], ["We've been waiting for an hour.", "Estamos esperando hace una hora."]],
      items: [
        "I've worked at Axxon ___ three years.|for|since|from|Trabajo en Axxon hace tres años.",
        "We've been testing ___ Monday.|since|for|during|Estamos probando desde el lunes.",
        "The server has been down ___ two hours.|for|since|from|El servidor está caído hace dos horas.",
        "She has been the PM ___ January.|since|for|during|Ella es la PM desde enero.",
        "We've known about the issue ___ last week.|since|from|for|Sabemos del problema desde la semana pasada."
      ]
    },
    {
      id: "t-by-until", g: "Tiempo", p: "by · until", t: "Fecha límite: by, until",
      k: "BY = a más tardar (fecha límite). UNTIL = hasta (algo sigue sin cortar hasta ese momento).",
      why: "Las dos se traducen «para» o «hasta», pero dicen cosas distintas. BY pide que algo esté hecho antes de ese momento o justo en él: send it by Friday (mandalo, a más tardar, el viernes). UNTIL describe algo que dura y se corta en ese momento: the system is frozen until Friday (sigue congelado hasta el viernes). Pregunta clave: ¿es una entrega? BY. ¿Es algo que dura? UNTIL.",
      ex: [["Send me the FDD by Friday.", "Mandame el FDD para el viernes."], ["The environment is frozen until Friday.", "El entorno queda congelado hasta el viernes."], ["I'll be in the office until 6.", "Voy a estar en la oficina hasta las 6."]],
      items: [
        "Please send the FDD ___ Friday.|by|until|since|Mandá el FDD para el viernes.",
        "The environment is frozen ___ the go-live.|until|by|since|El entorno queda congelado hasta el go-live.",
        "We need the approval ___ the end of the month.|by|until|since|Necesitamos la aprobación para fin de mes.",
        "I'll be available ___ 6 p.m.|until|by|since|Voy a estar disponible hasta las 6.",
        "The data must be loaded ___ tomorrow morning.|by|until|since|Los datos tienen que estar cargados para mañana a la mañana."
      ]
    },
    {
      id: "t-during", g: "Tiempo", p: "during · for", t: "Durante: during, for",
      k: "DURING + un evento (¿cuándo pasó?). FOR + una duración (¿cuánto duró?).",
      why: "«Durante» tiene dos traducciones. DURING va con el nombre de algo que pasa: during the meeting, during the demo, during the month-end close. FOR va con una cantidad de tiempo: for two hours, for a week. Nunca «during two hours».",
      ex: [["Someone called during the meeting.", "Alguien llamó durante la reunión."], ["The meeting lasted for two hours.", "La reunión duró dos horas."]],
      items: [
        "My phone rang ___ the demo.|during|for|since|Me sonó el teléfono durante la demo.",
        "We discussed it ___ two hours.|for|during|since|Lo discutimos durante dos horas.",
        "Please mute your mic ___ the presentation.|during|for|since|Silenciá el micrófono durante la presentación.",
        "The system was slow ___ the month-end close.|during|for|since|El sistema anduvo lento durante el cierre de mes."
      ]
    },
    {
      id: "t-in-within", g: "Tiempo", p: "in · within", t: "Dentro de: in, within",
      k: "IN + tiempo = dentro de (cuánto falta). WITHIN = dentro del plazo, no más tarde.",
      why: "«Te llamo dentro de diez minutos» es I'll call you IN ten minutes: IN mide cuánto falta para que pase. El error típico es «after ten minutes», que significa «después de haber pasado diez minutos» y se usa para contar algo pasado. WITHIN es un plazo máximo: within 24 hours (en 24 horas o antes).",
      ex: [["I'll call you back in five minutes.", "Te llamo dentro de cinco minutos."], ["Critical tickets are answered within four hours.", "Los tickets críticos se responden en menos de cuatro horas."]],
      items: [
        "I'll call you back ___ ten minutes.|in|after|since|Te llamo dentro de diez minutos.",
        "The release is ___ two weeks.|in|after|since|La release es dentro de dos semanas.",
        "Critical tickets must be answered ___ four hours.|within|inside|since|Los tickets críticos se tienen que responder en menos de cuatro horas.",
        "We'll start again ___ a moment.|in|after|since|Volvemos a empezar en un momento."
      ]
    },
    {
      id: "t-end", g: "Tiempo", p: "at the end · in the end · on time · in time", t: "Al final y a tiempo",
      k: "AT THE END OF = al final de algo. IN THE END = finalmente. ON TIME = puntual. IN TIME = con tiempo suficiente.",
      why: "Son pares que en castellano se dicen igual. AT THE END (OF) marca el último momento de algo concreto: at the end of the sprint. IN THE END es «al final de cuentas», el resultado: in the end, we chose the standard. ON TIME es cumplir la hora planificada: the release was on time. IN TIME es llegar antes de que sea tarde: just in time for the demo.",
      ex: [["We'll review it at the end of the sprint.", "Lo revisamos al final del sprint."], ["In the end, we chose the standard option.", "Al final, elegimos la opción estándar."], ["The release was on time.", "La release salió en fecha."], ["We fixed it just in time for the demo.", "Lo arreglamos justo a tiempo para la demo."]],
      items: [
        "We'll have a retro ___ the end of the sprint.|at|in|on|Vamos a hacer una retro al final del sprint.",
        "___ the end, we kept the standard process.|In|At|On|Al final, nos quedamos con el proceso estándar.",
        "The meeting started ___ time.|on|in|at|La reunión empezó puntual.",
        "We finished the fix just ___ time for the demo.|in|on|at|Terminamos el arreglo justo a tiempo para la demo."
      ]
    },
    {
      id: "l-iot", g: "Lugar", p: "in · on · at", t: "Dónde: in, on, at",
      k: "IN = dentro de un espacio. ON = sobre una superficie o línea (piso, pantalla, lista). AT = un punto concreto.",
      why: "En castellano todo es «en». En inglés depende de cómo imaginás el lugar. IN si está adentro de algo con límites: in Asunción, in the warehouse, in the box. ON si está apoyado sobre una superficie o una línea: on the screen, on the second floor, on page 5, on the list. AT si es un punto en el mapa o un lugar donde se hace algo: at work, at the top of the page, at the airport.",
      ex: [["Our warehouse is in Asunción.", "Nuestro almacén está en Asunción."], ["The file is on my desktop.", "El archivo está en mi escritorio (de la compu)."], ["I'm at work.", "Estoy en el trabajo."], ["The meeting room is on the third floor.", "La sala está en el tercer piso."]],
      items: [
        "Our main warehouse is ___ Asunción.|in|at|on|Nuestro almacén principal está en Asunción.",
        "The report is ___ the screen.|on|in|at|El reporte está en la pantalla.",
        "I'm ___ work right now.|at|in|on|Ahora estoy en el trabajo.",
        "The meeting room is ___ the second floor.|on|in|at|La sala de reuniones está en el segundo piso.",
        "Your name is ___ the list.|on|in|at|Tu nombre está en la lista.",
        "Click the button ___ the top of the page.|at|in|to|Hacé clic en el botón de arriba de la página.",
        "Check the details ___ page 5.|on|in|at|Revisá los detalles en la página 5.",
        "She lives ___ Buenos Aires.|in|at|on|Ella vive en Buenos Aires."
      ]
    },
    {
      id: "m-to", g: "Movimiento", p: "to · into · from", t: "Hacia dónde: to, into, from",
      k: "TO = hacia un destino. INTO = hacia adentro. FROM = desde dónde. Pero «go home» va sin TO.",
      why: "IN y AT son para estar; para ir se usa TO: go to the office, send it to the customer. INTO es entrar o pasar algo adentro de otra cosa: copy the data into the new table. FROM es el origen: the goods come from Brazil (no «of», que es pertenencia). Excepción que hay que memorizar: home no lleva TO (go home, get home).",
      ex: [["I'm going to the warehouse.", "Voy al almacén."], ["Copy the data into the new table.", "Copiá los datos a la tabla nueva."], ["The goods come from Brazil.", "La mercadería viene de Brasil."], ["Let's go home.", "Vamos a casa."]],
      items: [
        "Tomorrow I'm going ___ the warehouse.|to|at|in|Mañana voy al almacén.",
        "Send the invoice ___ the customer.|to|at|in|Mandale la factura al cliente.",
        "Copy the data ___ the new table.|into|at|of|Copiá los datos a la tabla nueva.",
        "The goods come ___ Brazil.|from|of|by|La mercadería viene de Brasil.",
        "Let's go ___ home, it's late.|—|to|at|Vamos a casa, es tarde.",
        "We migrated the data ___ the old ERP.|from|of|by|Migramos los datos desde el ERP viejo."
      ]
    },
    {
      id: "m-arrive", g: "Movimiento", p: "arrive in · arrive at · get to", t: "Llegar: arrive in, arrive at, get to",
      k: "ARRIVE nunca lleva TO: arrive IN una ciudad o país, arrive AT un lugar concreto. GET sí lleva TO.",
      why: "«Llegar a» engaña: arrive no es un verbo de dirección sino de llegada, entonces usa las preposiciones de lugar. IN para lugares grandes (arrive in Paraguay, arrive in Asunción) y AT para puntos concretos (arrive at the office, arrive at the warehouse). En cambio GET (llegar, informal) sí se comporta como verbo de movimiento: get to the office.",
      ex: [["We arrived in Asunción on Sunday.", "Llegamos a Asunción el domingo."], ["The truck arrived at the warehouse at 8.", "El camión llegó al almacén a las 8."], ["I'll get to the office at 9.", "Llego a la oficina a las 9."]],
      items: [
        "The truck arrived ___ the warehouse at 8.|at|to|on|El camión llegó al almacén a las 8.",
        "We arrived ___ Paraguay last night.|in|to|on|Llegamos a Paraguay anoche.",
        "When did you arrive ___ the office?|at|to|on|¿A qué hora llegaste a la oficina?",
        "The container will arrive ___ the port tomorrow.|at|to|on|El contenedor llega al puerto mañana.",
        "I'll get ___ the office at 9.|to|at|on|Llego a la oficina a las 9."
      ]
    },
    {
      id: "o-by-with", g: "Otros usos", p: "by · with", t: "Cómo y quién: by, with",
      k: "BY = medio o canal (by email) y quién hace la acción en pasiva. WITH = herramienta o compañía.",
      why: "«Por» y «con» se reparten distinto. BY indica el canal o medio: by email, by phone. También dice quién hizo algo en voz pasiva: approved by the CFO (no «for», que es «para»). WITH es el instrumento que usás o la gente con la que estás: with a script, with the finance team.",
      ex: [["I'll send it by email.", "Lo mando por mail."], ["The order was approved by the manager.", "El pedido fue aprobado por el gerente."], ["We fixed it with a script.", "Lo arreglamos con un script."], ["I'm working with the finance team.", "Estoy trabajando con el equipo de finanzas."]],
      items: [
        "I'll send it ___ email.|by|for|with|Lo mando por mail.",
        "The PO was approved ___ the CFO.|by|for|of|La OC fue aprobada por el CFO.",
        "We loaded the data ___ a script.|with|by|of|Cargamos los datos con un script.",
        "I'm working ___ the finance team this week.|with|by|of|Esta semana trabajo con el equipo de finanzas.",
        "The report is generated ___ the system every night.|by|for|of|El sistema genera el reporte todas las noches."
      ]
    },
    {
      id: "o-for-to", g: "Otros usos", p: "for · to", t: "Para: for, to",
      k: "FOR + sustantivo o persona (para qué, para quién). TO + verbo (para hacer algo).",
      why: "«Para» se traduce de dos formas según lo que sigue. Si viene una cosa o una persona, es FOR: this report is for the CFO, more time for the tests. Si viene una acción, es TO + verbo: I called to ask, more time to finish. Nunca «for to» ni «for + verbo». Y «gracias por» es thanks FOR.",
      ex: [["This document is for the customer.", "Este documento es para el cliente."], ["I called to ask about the invoice.", "Llamé para preguntar por la factura."], ["Thanks for your time.", "Gracias por tu tiempo."]],
      items: [
        "I called ___ ask about the invoice.|to|for|by|Llamé para preguntar por la factura.",
        "This report is ___ the CFO.|for|to|by|Este reporte es para el CFO.",
        "We need more time ___ finish the tests.|to|for|by|Necesitamos más tiempo para terminar las pruebas.",
        "We need more time ___ the tests.|for|to|by|Necesitamos más tiempo para las pruebas.",
        "I'm here ___ help you.|to|for|by|Estoy acá para ayudarte.",
        "Thanks ___ your time.|for|to|by|Gracias por tu tiempo."
      ]
    },
    {
      id: "o-about-of", g: "Otros usos", p: "about · of", t: "De: about, of",
      k: "ABOUT = el tema (hablar de, preguntar por). OF = pertenencia o parte. THINK ABOUT / THINK OF, nunca «think in».",
      why: "«De» tiene muchas caras. Cuando es «sobre qué tema», va ABOUT: talk about, ask about, a meeting about. Cuando es «de quién» o «parte de qué», va OF: the cost of the license, the end of the month. «Pensar en» es think ABOUT (darle vueltas a algo) y «qué opinás de» es what do you think OF. «Think in» es el error clásico.",
      ex: [["Let's talk about the go-live.", "Hablemos del go-live."], ["What do you think of the proposal?", "¿Qué opinás de la propuesta?"], ["I'm thinking about the risks.", "Estoy pensando en los riesgos."], ["The cost of the license is high.", "El costo de la licencia es alto."]],
      items: [
        "Let's talk ___ the cutover plan.|about|of|in|Hablemos del plan de cutover.",
        "What do you think ___ the proposal?|of|in|for|¿Qué opinás de la propuesta?",
        "I'm thinking ___ the risks.|about|in|for|Estoy pensando en los riesgos.",
        "The cost ___ the license is too high.|of|from|for|El costo de la licencia es demasiado alto.",
        "Can I ask you ___ the invoice?|about|for|of|¿Te puedo preguntar por la factura?",
        "The meeting is ___ the new warehouse.|about|of|from|La reunión es sobre el nuevo almacén."
      ]
    },
    {
      id: "none", g: "Sin preposición", p: "(nada)", t: "Verbos que van sin preposición",
      k: "DISCUSS, CALL, CONTACT, ATTEND, ANSWER, REACH, EMAIL van directo al objeto: sin preposición.",
      why: "En castellano decimos «discutir sobre», «llamar al cliente», «contactar con», «asistir a», «llegar a un acuerdo». En inglés estos verbos se pegan directo a lo que sigue: discuss the scope, call the customer, contact the key user, attend the workshop, reach an agreement. Agregarles una preposición es uno de los errores más fáciles de escuchar.",
      ex: [["Let's discuss the scope.", "Discutamos el alcance."], ["I'll call the customer.", "Llamo al cliente."], ["Please contact the key user.", "Contactá al usuario clave."], ["I attended the workshop.", "Asistí al taller."]],
      items: [
        "Let's discuss ___ the scope tomorrow.|—|about|on|Discutamos el alcance mañana.",
        "I'll call ___ the customer after lunch.|—|to|at|Llamo al cliente después del almuerzo.",
        "Please contact ___ the key user.|—|with|to|Contactá al usuario clave.",
        "I attended ___ the workshop yesterday.|—|to|at|Ayer asistí al taller.",
        "We need to answer ___ this email today.|—|to|at|Tenemos que responder este mail hoy.",
        "We finally reached ___ an agreement.|—|to|at|Finalmente llegamos a un acuerdo.",
        "Please email ___ me the file.|—|to|for|Mandame el archivo por mail."
      ]
    },
    {
      id: "c-on", g: "Combinaciones de trabajo", p: "depend on · based on · work on", t: "Verbo + ON",
      k: "DEPEND ON, BASED ON, WORK ON, FOCUS ON, RELY ON, COMMENT ON, AGREE ON, INSIST ON.",
      why: "ON transmite apoyo o foco: algo se apoya sobre otra cosa. Por eso se dice depend ON (no «of» como en «depender de»), based ON (no «in» como en «basado en»), rely ON (contar con), focus ON (enfocarse en) y work ON (estar trabajando en una tarea). AGREE ON es ponerse de acuerdo en un tema concreto.",
      ex: [["It depends on the customer.", "Depende del cliente."], ["The design is based on the standard.", "El diseño se basa en el estándar."], ["I'm working on the FDD.", "Estoy trabajando en el FDD."]],
      items: [
        "It depends ___ the customer.|on|of|from|Depende del cliente.",
        "The design is based ___ the standard process.|on|in|of|El diseño se basa en el proceso estándar.",
        "I'm working ___ the FDD right now.|on|in|at|Ahora estoy trabajando en el FDD.",
        "Let's focus ___ the critical gaps.|on|in|at|Enfoquémonos en los gaps críticos.",
        "We can't rely ___ manual entries.|on|in|of|No podemos depender de cargas manuales.",
        "We finally agreed ___ the price.|on|in|at|Finalmente nos pusimos de acuerdo en el precio.",
        "The customer insists ___ a custom report.|on|in|at|El cliente insiste en un reporte a medida."
      ]
    },
    {
      id: "c-for", g: "Combinaciones de trabajo", p: "responsible for · wait for · ask for", t: "Verbo + FOR",
      k: "RESPONSIBLE FOR, WAIT FOR, ASK FOR, LOOK FOR, PAY FOR, ACCOUNT FOR.",
      why: "FOR expresa objetivo o «a cambio de qué». La trampa es que en castellano «esperar», «pedir», «buscar» y «pagar» van sin preposición o con «a», y en inglés necesitan FOR: wait for the approval, ask for an environment, look for the PO. «Responsable de» es responsible FOR, no «of».",
      ex: [["Who is responsible for the migration?", "¿Quién es responsable de la migración?"], ["We're waiting for the approval.", "Estamos esperando la aprobación."], ["I'm looking for the purchase order.", "Estoy buscando la orden de compra."]],
      items: [
        "Who is responsible ___ the data migration?|for|of|in|¿Quién es responsable de la migración de datos?",
        "We're waiting ___ the customer's approval.|for|—|to|Estamos esperando la aprobación del cliente.",
        "I asked ___ a new environment.|for|—|to|Pedí un ambiente nuevo.",
        "I'm looking ___ the purchase order.|for|—|to|Estoy buscando la orden de compra.",
                "We need to account ___ the freight cost.|for|—|of|Tenemos que contemplar el costo del flete."
      ]
    },
    {
      id: "c-to", g: "Combinaciones de trabajo", p: "related to · assigned to · listen to", t: "Verbo + TO",
      k: "RELATED TO, ASSIGNED TO, LISTEN TO, REPLY TO, BELONG TO, REPORT TO, ACCORDING TO.",
      why: "TO marca dirección: algo apunta hacia otra cosa o persona. «Relacionado con» es related TO (no «with»). «Escuchar», «responder» y «pertenecer» en castellano van sin preposición o con «a», pero en inglés siempre llevan TO: listen to, reply to, belong to. ACCORDING TO es «según».",
      ex: [["This issue is related to the tax setup.", "Este problema está relacionado con la configuración de impuestos."], ["Listen to the recording.", "Escuchá la grabación."], ["According to the contract, support is included.", "Según el contrato, el soporte está incluido."]],
      items: [
        "This issue is related ___ the tax setup.|to|with|of|Este problema está relacionado con la configuración de impuestos.",
        "The task is assigned ___ Fernando.|to|for|of|La tarea está asignada a Fernando.",
        "Listen ___ the recording before the meeting.|to|—|at|Escuchá la grabación antes de la reunión.",
        "Please reply ___ the customer today.|to|—|at|Respondele al cliente hoy.",
        "This warehouse belongs ___ the other company.|to|of|from|Este almacén pertenece a la otra empresa.",
        "According ___ the contract, support is included.|to|with|of|Según el contrato, el soporte está incluido.",
        "I report ___ the project manager.|to|—|at|Le reporto al project manager."
      ]
    },
    {
      id: "c-with", g: "Combinaciones de trabajo", p: "agree with · deal with · comply with", t: "Verbo + WITH",
      k: "AGREE WITH (una persona), DEAL WITH, COMPLY WITH, HELP WITH, FAMILIAR WITH. Ojo: married TO.",
      why: "WITH es compañía o relación. «Estoy de acuerdo con vos» es I agree WITH you (sin «am»: agree ya es verbo). DEAL WITH es ocuparse de un problema, COMPLY WITH es cumplir una norma (no «comply to») y HELP WITH es ayudar con algo. La excepción que engaña: «casado con» es married TO.",
      ex: [["I agree with you.", "Estoy de acuerdo con vos."], ["We have to deal with this issue.", "Tenemos que ocuparnos de este problema."], ["The process must comply with tax rules.", "El proceso tiene que cumplir las normas fiscales."]],
      items: [
        "I agree ___ you.|with|—|to|Estoy de acuerdo con vos.",
        "We have to deal ___ this issue today.|with|—|of|Hoy tenemos que ocuparnos de este problema.",
        "The process must comply ___ local tax rules.|with|to|of|El proceso tiene que cumplir las normas fiscales locales.",
        "Can you help me ___ the setup?|with|in|of|¿Me ayudás con la configuración?",
        "Are you familiar ___ Warehouse Management?|with|to|of|¿Conocés Warehouse Management?",
        "She is married ___ a developer.|to|with|of|Está casada con un desarrollador."
      ]
    },
    {
      id: "c-in", g: "Combinaciones de trabajo", p: "interested in · in charge of · participate in", t: "Verbo + IN",
      k: "INTERESTED IN, IN CHARGE OF, PARTICIPATE IN, INVOLVED IN, RESULT IN, INCREASE IN.",
      why: "IN es estar adentro de una actividad o un área. «Interesado en» coincide con el castellano, pero otros engañan: «estar a cargo de» es IN charge of, «participar en» es participate IN (no «of»), «involucrado en» es involved IN. «Dar como resultado» es result IN. Y un aumento en un área es an increase IN sales (OF va con la cantidad: an increase of 10%).",
      ex: [["Who is in charge of the cutover?", "¿Quién está a cargo del cutover?"], ["The key users will participate in the UAT.", "Los usuarios clave van a participar en las pruebas."], ["We saw an increase in sales.", "Vimos un aumento en las ventas."]],
      items: [
        "Are you interested ___ the new module?|in|on|of|¿Te interesa el nuevo módulo?",
        "Who is ___ charge of the cutover?|in|on|at|¿Quién está a cargo del cutover?",
        "The key users will participate ___ the UAT.|in|of|on|Los usuarios clave van a participar en las pruebas.",
        "We saw an increase ___ sales.|in|of|on|Vimos un aumento en las ventas.",
        "Ten people are involved ___ the project.|in|on|of|Hay diez personas involucradas en el proyecto.",
        "The change resulted ___ fewer errors.|in|of|on|El cambio dio como resultado menos errores."
      ]
    },
    {
      id: "c-of", g: "Combinaciones de trabajo", p: "consist of · aware of · instead of", t: "Verbo + OF",
      k: "CONSIST OF, AWARE OF, INSTEAD OF, BECAUSE OF, ON BEHALF OF, OUT OF.",
      why: "OF une dos ideas como «de». Las que engañan: «consistir en» es consist OF (no «in»), «estar al tanto de» es aware OF (no «about»), «en vez de» es instead OF, «a causa de» es because OF (no «for») y «en nombre de» es on behalf OF.",
      ex: [["The process consists of three steps.", "El proceso consiste en tres pasos."], ["Are you aware of the risk?", "¿Estás al tanto del riesgo?"], ["We used a template instead of a custom report.", "Usamos una plantilla en vez de un reporte a medida."]],
      items: [
        "The process consists ___ three steps.|of|in|on|El proceso consiste en tres pasos.",
        "Are you aware ___ the risk?|of|about|in|¿Estás al tanto del riesgo?",
        "We used a template instead ___ a custom report.|of|from|for|Usamos una plantilla en vez de un reporte a medida.",
        "I'm writing on behalf ___ the project team.|of|from|for|Escribo en nombre del equipo del proyecto.",
        "The delay was because ___ the network.|of|for|from|La demora fue a causa de la red."
      ]
    },
    {
      id: "c-fixed", g: "Combinaciones de trabajo", p: "on hold · in progress · on track · by default", t: "Estados de trabajo",
      k: "ON HOLD, IN PROGRESS, ON TRACK, AT RISK, BY DEFAULT, IN ADVANCE, OUT OF STOCK, UP TO DATE.",
      why: "Son expresiones fijas de proyecto: se aprenden como un bloque, no con lógica. Una ayuda: ON + cómo va el flujo (on hold, on track), IN + algo que está ocurriendo (in progress), AT + nivel de alerta (at risk). BY DEFAULT es «por defecto», IN ADVANCE es «por adelantado» y UP TO DATE es «al día».",
      ex: [["The task is on hold until Monday.", "La tarea está en pausa hasta el lunes."], ["The development is in progress.", "El desarrollo está en curso."], ["We are on track for the go-live.", "Vamos bien encaminados para el go-live."], ["This field is empty by default.", "Este campo viene vacío por defecto."]],
      items: [
        "The task is ___ hold until Monday.|on|in|at|La tarea está en pausa hasta el lunes.",
        "The development is ___ progress.|in|on|at|El desarrollo está en curso.",
        "We are ___ track for the go-live.|on|in|at|Vamos bien encaminados para el go-live.",
        "This field is empty ___ default.|by|for|in|Este campo viene vacío por defecto.",
        "Please send the agenda ___ advance.|in|by|on|Mandá la agenda por adelantado.",
        "The project is ___ risk.|at|in|on|El proyecto está en riesgo.",
        "Keep the master data up ___ date.|to|in|at|Mantené los datos maestros al día.",
        "The item is out ___ stock.|of|from|in|El artículo está sin stock."
      ]
    },
    {
      id: "o-other", g: "Otros usos", p: "per · via · through · between · among", t: "Por cada, a través, entre",
      k: "PER = por cada. VIA = por un canal. THROUGH = de punta a punta. BETWEEN = entre dos. AMONG = entre muchos.",
      why: "«Por» y «entre» tienen versiones más precisas. PER es «por cada»: 90 dollars per user, per month. VIA es el canal por donde pasa algo: via API, via Teams. THROUGH es recorrer algo entero: walk through the process (repasarlo paso a paso). BETWEEN compara o separa dos cosas; AMONG reparte en un grupo.",
      ex: [["The license costs 90 dollars per user.", "La licencia cuesta 90 dólares por usuario."], ["Orders come in via the API.", "Los pedidos entran por la API."], ["Let's walk through the process.", "Repasemos el proceso paso a paso."], ["The budget was shared among the teams.", "El presupuesto se repartió entre los equipos."]],
      items: [
        "The license costs 90 dollars ___ user.|per|by|of|La licencia cuesta 90 dólares por usuario.",
        "The orders come in ___ the API.|via|for|of|Los pedidos entran por la API.",
        "Let's walk ___ the process step by step.|through|for|of|Repasemos el proceso paso a paso.",
        "The difference ___ the two options is the cost.|between|among|of|La diferencia entre las dos opciones es el costo.",
        "The bonus was shared ___ the whole team.|among|between|of|El bono se repartió entre todo el equipo."
      ]
    }
  ];

  const RULES = RAW.map((r, i) => Object.assign({}, r, {
    rank: i + 1,
    items: r.items.map((line, j) => {
      const [s, a, trap, extra, es] = line.split("|");
      return { id: r.id + "-" + j, s, a, trap, extra, es };
    })
  }));
  if (typeof module !== "undefined" && module.exports) module.exports = RULES;
  else root.PREPS = RULES;
})(typeof window !== "undefined" ? window : globalThis);
