/*
 * Vocabulario de trabajo (palabras 201-1000).
 * #R = las más usadas en las últimas 20 reuniones (proyecto NexGen), en orden de frecuencia.
 * #N = vocabulario de negocios, ERP, finanzas y logística para completar las 1000.
 * Formato por línea:
 *   sustantivos, adjetivos y adverbios: palabra|español|tipo|pronunciación|mnemotecnia|ejemplo|traducción|extras
 *   verbos:                              palabra|español|v|pronunciación|mnemotecnia|extras
 * Mnemotecnia "~" = palabra parecida al castellano (se genera el texto).
 * Extras (separados por ;): c=complemento en inglés, sp=verbo en castellano, post=complemento en castellano,
 *   pre=pronombre en castellano, rf=1 reflexivo, s=1 verbo de estado, sj=it sujeto fijo,
 *   f=formas irregulares separadas por "/", u=1 sin plural.
 * Los ejemplos de los verbos se arman solos con el motor de gramática.
 */
(function (root) {
  const RAW = String.raw`
#R
case|caso|n|kéis|~|In this case, we need approval.|En este caso, necesitamos aprobación.
example|ejemplo|n|igsámpel|~|Can you give me an example?|¿Me podés dar un ejemplo?
asset|activo|n|áset|ASSET → «A SET»: un SET de máquinas son los ACTIVOS de la empresa.|Each asset has a maintenance plan.|Cada activo tiene un plan de mantenimiento.
part|parte / pieza|n|part|~|This part is very important.|Esta parte es muy importante.
cost|costo|n|kost|~|The cost is too high.|El costo es demasiado alto.
system|sistema|n|sístem|~|The system is down.|El sistema está caído.
data|datos|n|déita|~|The data is in the file.|Los datos están en el archivo.|u=1
project|proyecto|n|próyekt|~|The project starts next week.|El proyecto empieza la semana que viene.
line|línea|n|láin|LINE → «LAIN»: la LÍNEA del pedido.|Add a new line to the order.|Agregá una línea nueva al pedido.
account|cuenta|n|akáunt|ACCOUNT → «A COUNT» (contar): en la CUENTA contás la plata.|Check the account balance.|Revisá el saldo de la cuenta.
plan|plan|n|plan|~|We need a plan for next week.|Necesitamos un plan para la semana próxima.
sale|venta|n|séil|SALE → la mercadería SALE de la tienda: una VENTA. On sale = en oferta.|The sale was closed yesterday.|La venta se cerró ayer.
order|pedido / orden|n|órder|ORDER = ORDEN: la orden de compra o de venta, el PEDIDO.|The customer placed an order.|El cliente hizo un pedido.
same|mismo|adj|séim|SAME → «SEIM»: el MISMO de siempre.|We have the same problem.|Tenemos el mismo problema.
group|grupo|n|grup|~|Select the item group.|Seleccioná el grupo de artículos.
maintenance|mantenimiento|n|méintenans|MAINTAIN (mantener) → MAINTENANCE = MANTENIMIENTO.|Maintenance is planned for Monday.|El mantenimiento está planificado para el lunes.|u=1
center|centro|n|sénter|~|This is the cost center.|Este es el centro de costo.
date|fecha|n|déit|DATE → «DEIT»: la FECHA de la cita (date también es «cita»).|What is the due date?|¿Cuál es la fecha de vencimiento?
item|artículo|n|áitem|ITEM → «ÍTEM»: cada ARTÍCULO de la lista.|This item is out of stock.|Este artículo no tiene stock.
topic|tema|n|tópik|TOPIC → «TÓPICO»: el TEMA de la reunión.|What is the next topic?|¿Cuál es el próximo tema?
accounting|contabilidad|n|akáunting|ACCOUNT (cuenta) + ING: llevar las cuentas es la CONTABILIDAD.|Accounting closes the month.|Contabilidad cierra el mes.|u=1
information|información|n|informéishon|~|I need more information.|Necesito más información.|u=1
hour|hora|n|áuer (la H no suena)|HOUR suena igual que OUR: «nuestra HORA».|The meeting takes one hour.|La reunión dura una hora.
customer|cliente|n|kástomer|CUSTOMER viene de CUSTOM (costumbre): el CLIENTE que viene por costumbre.|The customer wants a discount.|El cliente quiere un descuento.
daily|diario|adj|déili|DAY + LY = DIARIO, todos los días.|We have a daily meeting.|Tenemos una reunión diaria.
journal|diario contable|n|yérnal|JOURNAL → «JORNADA»: lo que se anota en la jornada es el DIARIO.|Post the journal today.|Registrá el diario hoy.
module|módulo|n|módyul|~|This module handles inventory.|Este módulo maneja el inventario.
purchase|compra|n|pérchas|PURCHASE → «PERSEGUIR» una oferta para COMPRAR.|The purchase was approved.|La compra fue aprobada.
mode|modo|n|móud|~|Switch to test mode.|Cambiá al modo de prueba.
task|tarea|n|task|TASK → «TASCA»: terminá la TAREA antes de ir a la tasca.|I have three tasks today.|Tengo tres tareas hoy.
category|categoría|n|kátegori|~|Choose the right category.|Elegí la categoría correcta.
location|ubicación|n|lokéishon|LOCATION → «LOCAL»: el LUGAR, la UBICACIÓN.|Check the warehouse location.|Revisá la ubicación del almacén.
code|código|n|kóud|~|Enter the item code.|Ingresá el código del artículo.
invoice|factura|n|ínvois|IN + VOICE (voz): la FACTURA te habla con la voz del contador.|Send the invoice to the customer.|Mandá la factura al cliente.
step|paso|n|step|STEP → el «step» del gimnasio: subir PASO a PASO.|The next step is the approval.|El próximo paso es la aprobación.
user|usuario|n|iúser|USE (usar) + R: el que usa es el USUARIO.|Create a new user.|Creá un usuario nuevo.
container|contenedor|n|kontéiner|~|The container arrived at the port.|El contenedor llegó al puerto.
configuration|configuración|n|konfiguréishon|~|The configuration is ready.|La configuración está lista.
value|valor|n|váliu|~|What is the default value?|¿Cuál es el valor predeterminado?
product|producto|n|pródakt|~|This product sells well.|Este producto se vende bien.
query|consulta|n|kuíri|QUERY → «QUERÍ» saber: una CONSULTA.|Run the query again.|Ejecutá la consulta otra vez.
expense|gasto|n|ekspéns|EXPENSE → «EXPENSAS»: los GASTOS del edificio.|Travel is a big expense.|Viajar es un gasto grande.
inside|dentro / adentro|adv|insáid|IN + SIDE (lado): del lado de ADENTRO.|The file is inside the folder.|El archivo está dentro de la carpeta.
hierarchy|jerarquía|n|jáierarki|~|Check the category hierarchy.|Revisá la jerarquía de categorías.
quantity|cantidad|n|kuóntiti|~|Change the quantity to ten.|Cambiá la cantidad a diez.
request|solicitud|n|rikuést|REQUEST → «REQUISITO»: hacer una SOLICITUD.|I sent a request to IT.|Mandé una solicitud a sistemas.
dimension|dimensión|n|daiménshon|~|Add a financial dimension.|Agregá una dimensión financiera.
form|formulario|n|form|~|Fill in the form, please.|Completá el formulario, por favor.
process|proceso|n|próses|~|The process takes two days.|El proceso tarda dos días.
warehouse|almacén / depósito|n|uérjaus|WARE (mercadería) + HOUSE (casa): la casa de la mercadería es el ALMACÉN.|The goods are in the warehouse.|La mercadería está en el almacén.
tax|impuesto|n|taks|TAX → «TAXI»: el taxi cobra con IMPUESTO incluido.|The price includes tax.|El precio incluye impuestos.
side|lado|n|sáid|SIDE → «SAID»: de un LADO dijo (said) que sí.|On the other side of the screen.|Del otro lado de la pantalla.
team|equipo|n|tim|TEAM → «TIM», el compañero de EQUIPO.|Our team is very good.|Nuestro equipo es muy bueno.
equipment|equipos / equipamiento|n|ikuípment|~|The equipment needs repair.|El equipo necesita reparación.|u=1
idea|idea|n|aidía|~|That is a good idea.|Esa es una buena idea.
basically|básicamente|adv|béisikli|~|Basically, it is the same process.|Básicamente, es el mismo proceso.
problem|problema|n|próblem|~|We have a problem with the server.|Tenemos un problema con el servidor.
layer|capa|n|léier|LAYER → «LEER» capa por capa.|Add another layer of security.|Agregá otra capa de seguridad.
status|estado|n|státus|~|What is the status of the order?|¿Cuál es el estado del pedido?
configure|configurar|v|konfíguier|~|c=the system;sp=configurar;post=el sistema
point|punto|n|póint|~|That is a good point.|Ese es un buen punto.
search|buscar|v|serch|SEARCH → «SERCHA»: BUSCAR en Google.|c=the database;sp=buscar;post=en la base de datos
test|prueba|n|test|TEST = el examen, la PRUEBA.|The test was successful.|La prueba fue exitosa.
budget|presupuesto|n|báyet|BUDGET → «BOLSITA» (bougette): la bolsa de plata es el PRESUPUESTO.|We are over budget.|Estamos pasados de presupuesto.
vendor|proveedor|n|véndor|VENDOR → «VENDEDOR»: el que te VENDE es tu PROVEEDOR.|Pay the vendor this week.|Pagale al proveedor esta semana.
financial|financiero|adj|fainánshal|~|Review the financial report.|Revisá el informe financiero.
preventive|preventivo|adj|privéntiv|~|Preventive maintenance saves money.|El mantenimiento preventivo ahorra plata.
shipment|envío|n|shípment|SHIP (barco) + MENT: lo que va en el barco es el ENVÍO.|The shipment is late.|El envío está atrasado.
unit|unidad|n|iúnit|~|The unit of measure is kilos.|La unidad de medida es kilos.
moment|momento|n|móument|~|Wait a moment, please.|Esperá un momento, por favor.
electrical|eléctrico|adj|iléktrikal|~|There is an electrical problem.|Hay un problema eléctrico.
create|crear|v|kriéit|~|c=a new user;sp=crear;post=un usuario nuevo
engine|motor|n|énchin|ENGINE → «INGENIERO»: el ingeniero arregla el MOTOR.|The engine needs oil.|El motor necesita aceite.
use|usar|v|iús|USE → «USAR», casi igual.|c=the new template;sp=usar;post=la plantilla nueva
general|general|adj|yéneral|~|This is a general rule.|Esta es una regla general.
matrix|matriz|n|méitriks|~|Update the task matrix.|Actualizá la matriz de tareas.|f=matrix/matrices
directly|directamente|adv|dairéktli|~|Call the supplier directly.|Llamá directamente al proveedor.
truth|verdad|n|truz|TRUTH viene de TRUE (verdadero): la VERDAD.|Tell me the truth.|Decime la verdad.|u=1
issue|problema / tema|n|íshu|ISSUE → «ISHU»: un PROBLEMA abierto en el proyecto.|We found an issue in the report.|Encontramos un problema en el informe.
flow|flujo|n|flóu|FLOW → «FLUIR»: el FLUJO del proceso.|Draw the process flow.|Dibujá el flujo del proceso.
level|nivel|n|lével|~|What is your English level?|¿Cuál es tu nivel de inglés?
meeting|reunión|n|míting|MEET (encontrarse) + ING: la REUNIÓN.|The meeting starts at ten.|La reunión empieza a las diez.
doubt|duda|n|dáut (la B no suena)|DOUBT → «DAUT»: la DUDA (la B es muda).|If you have any doubt, ask me.|Si tenés alguna duda, preguntame.
important|importante|adj|impórtant|~|This point is very important.|Este punto es muy importante.
zero|cero|n|zírou|~|The balance is zero.|El saldo es cero.
delivery|entrega|n|dilíveri|DELIVERY: el que trae la comida hace la ENTREGA.|The delivery is tomorrow.|La entrega es mañana.
dock|muelle / andén|n|dok|DOCK → «DOC»: el doctor espera en el ANDÉN de carga.|The truck is at dock three.|El camión está en el andén tres.
number|número|n|námber|~|What is the order number?|¿Cuál es el número de pedido?
monthly|mensual|adj|mánzli|MONTH (mes) + LY = MENSUAL.|We send a monthly report.|Mandamos un informe mensual.
VAT|IVA|n|vi ei ti|VAT = Value Added Tax = IVA (impuesto al valor agregado).|The price includes VAT.|El precio incluye IVA.|u=1
different|diferente|adj|díferent|~|This case is different.|Este caso es diferente.
material|material|n|matírial|~|We need more material.|Necesitamos más material.
service|servicio|n|sérvis|~|The service is excellent.|El servicio es excelente.
list|lista|n|list|~|Make a list of the tasks.|Hacé una lista de las tareas.
adjustment|ajuste|n|ayástment|ADJUST (ajustar) + MENT = AJUSTE.|We need an inventory adjustment.|Necesitamos un ajuste de inventario.
available|disponible|adj|avéilabol|AVAILABLE → «A VALE»: si vale, está DISPONIBLE.|The product is available.|El producto está disponible.
add|agregar|v|ad|ADD → «AD» de ADición: AGREGAR, sumar.|c=a new line;sp=agregar;post=una línea nueva
detail|detalle|n|díteil|~|Check every detail.|Revisá cada detalle.
control|control|n|kontróul|~|We need better control.|Necesitamos un mejor control.
calculation|cálculo|n|kalkiuléishon|~|The calculation is wrong.|El cálculo está mal.
view|vista|n|viú|VIEW → «VIU»: la VISTA desde la ventana.|Open the list view.|Abrí la vista de lista.
directive|directiva|n|dairéktiv|~|The location directive is ready.|La directiva de ubicación está lista.
automotive|automotor|adj|otomóutiv|~|He works in the automotive sector.|Él trabaja en el sector automotor.
management|gestión / dirección|n|mánayment|MANAGE (manejar) + MENT = GESTIÓN.|Management approved the budget.|La dirección aprobó el presupuesto.
change|cambio|n|chéinch|CHANGE → el «cambio» de la moneda: CHANGE.|We need a change in the process.|Necesitamos un cambio en el proceso.
automatically|automáticamente|adv|otomátikli|~|The system sends it automatically.|El sistema lo manda automáticamente.
entry|asiento / entrada|n|éntri|ENTRY → «ENTRAR»: lo que ENTRA al libro es un ASIENTO.|Post the journal entry.|Registrá el asiento contable.
template|plantilla|n|témpleit|TEMPLATE → «TEMPLO»: un molde sagrado, la PLANTILLA.|Use this template for the report.|Usá esta plantilla para el informe.
resource|recurso|n|rísors|~|We need more resources.|Necesitamos más recursos.
price|precio|n|práis|PRICE → «PRAIS», casi PRECIO.|The price went up.|El precio subió.
possibility|posibilidad|n|posibíliti|~|There is a possibility of delay.|Hay posibilidad de demora.
master|maestro / principal|adj|máster|MASTER → «MAESTRO»: el dato MAESTRO.|Update the customer master data.|Actualizá los datos maestros del cliente.
reality|realidad|n|riáliti|~|In reality, it is simple.|En realidad, es simple.
ledger|libro mayor|n|léyer|LEDGER → «LEGAJO»: el gran legajo de cuentas es el LIBRO MAYOR.|Check the general ledger.|Revisá el libro mayor.
start|empezar|v|start|START → el botón de INICIO: EMPEZAR.|c=the project;sp=empezar;post=el proyecto
main|principal|adj|méin|MAIN → «MANO» principal: lo PRINCIPAL.|This is the main screen.|Esta es la pantalla principal.
technical|técnico|adj|téknikal|~|It is a technical problem.|Es un problema técnico.
pump|bomba|n|pamp|PUMP → «PAMP»: el ruido de la BOMBA de agua.|The pump is not working.|La bomba no funciona.
file|archivo|n|fáil|FILE → «FILA» de papeles: el ARCHIVO.|Save the file, please.|Guardá el archivo, por favor.
total|total|n|tóutal|~|What is the total?|¿Cuál es el total?
area|área|n|érea|~|This area is for storage.|Esta área es para almacenamiento.
document|documento|n|dókiument|~|Sign the document.|Firmá el documento.
record|registro|n|rékord|RECORD → un «récord» guardado: un REGISTRO.|Find the customer record.|Buscá el registro del cliente.
forecast|previsión / pronóstico|n|fórkast|FORE (antes) + CAST (lanzar): lanzar antes es PRONOSTICAR.|The sales forecast is good.|La previsión de ventas es buena.
generate|generar|v|yéneréit|~|c=the report;sp=generar;post=el informe
spare|de repuesto|adj|spéer|SPARE → «ESPERA»: el REPUESTO que espera en el estante.|We keep spare parts in stock.|Tenemos repuestos en stock.
carry|llevar|v|kéri|CARRY → «CARRITO»: LLEVAR en el carrito.|c=the boxes;sp=llevar;post=las cajas
measure|medida|n|méshur|MEASURE ≈ «MESURA»: la MEDIDA justa.|The unit of measure is liters.|La unidad de medida es litros.
question|pregunta|n|kuéschon|QUESTION → «CUESTIÓN»: una PREGUNTA.|Can I ask a question?|¿Puedo hacer una pregunta?
parameter|parámetro|n|parámeter|~|Change the parameter value.|Cambiá el valor del parámetro.
table|tabla / mesa|n|téibol|~|Open the customer table.|Abrí la tabla de clientes.
internal|interno|adj|intérnal|~|This is an internal project.|Este es un proyecto interno.
corrective|correctivo|adj|koréktiv|~|We did corrective maintenance.|Hicimos mantenimiento correctivo.
column|columna|n|kólom|~|Add a new column.|Agregá una columna nueva.
build|armar / construir|v|bild|BUILD → el BUILDING: el edificio que CONSTRUYEN.|c=the matrix;sp=armar;post=la matriz;f=build/builds/built/built/building
define|definir|v|difáin|~|c=the rules;sp=definir;post=las reglas
security|seguridad|n|sekiúriti|~|Security is our priority.|La seguridad es nuestra prioridad.|u=1
packing|embalaje|n|páking|PACK (paquete) + ING: armar el paquete es el EMBALAJE.|Packing takes ten minutes.|El embalaje tarda diez minutos.|u=1
load|cargar|v|lóud|LOAD → «LODO»: CARGAR el camión con barro.|c=the data;sp=cargar;post=los datos
element|elemento|n|élement|~|Each element has a code.|Cada elemento tiene un código.
close|cerrar|v|klóus|CLOSE → «CLOSET»: CERRAR el placard.|c=the month;sp=cerrar;post=el mes
error|error|n|érror|~|There is an error in the invoice.|Hay un error en la factura.
statistic|estadística|n|statístik|~|This statistic is useful.|Esta estadística es útil.
salesperson|vendedor|n|séilsperson|SALES (ventas) + PERSON: la persona de ventas es el VENDEDOR.|The salesperson called the customer.|El vendedor llamó al cliente.|f=salesperson/salespeople
rate|tasa / tarifa|n|réit|RATE → «RATA»: la TASA sube como una rata.|The tax rate is ten percent.|La tasa del impuesto es diez por ciento.
calendar|calendario|n|kálendar|~|Check your calendar.|Revisá tu calendario.
standard|estándar|adj|stándard|~|This is the standard process.|Este es el proceso estándar.
tool|herramienta|n|tul|TOOL → «TUL»: las HERRAMIENTAS en la caja de tul.|This tool is very useful.|Esta herramienta es muy útil.
environment|entorno / ambiente|n|enváironment|ENVIRONMENT → «EN VIRÓN»: lo que está alrededor es el ENTORNO.|Use the test environment.|Usá el entorno de prueba.
distribution|distribución|n|distribiúshon|~|Distribution starts at six.|La distribución empieza a las seis.
pending|pendiente|adj|pénding|PENDING → «PENDIENTE», casi igual.|There are three pending tasks.|Hay tres tareas pendientes.
custom|personalizado / a medida|adj|kástom|CUSTOM → «COSTUMBRE»: hecho a tu costumbre, A MEDIDA.|We need a custom report.|Necesitamos un informe a medida.
apply|aplicar|v|aplái|~|c=the discount;sp=aplicar;post=el descuento
default|predeterminado|n|difólt|DEFAULT → «DE FALTA»: lo que queda a falta de otra opción, POR DEFECTO.|Leave the default value.|Dejá el valor predeterminado.
structure|estructura|n|stráktchur|~|The structure is clear.|La estructura es clara.
finance|finanzas|n|fáinans|~|She works in finance.|Ella trabaja en finanzas.|u=1
correct|correcto|adj|korékt|~|The answer is correct.|La respuesta es correcta.
final|final|adj|fáinal|~|This is the final version.|Esta es la versión final.
screen|pantalla|n|skrin|SCREEN → la «screen» del cine: la PANTALLA.|Share your screen, please.|Compartí tu pantalla, por favor.
hand|mano|n|jand|HAND → «HANDBALL»: el deporte con la MANO.|Raise your hand.|Levantá la mano.
approval|aprobación|n|aprúval|APPROVE (aprobar) + AL = APROBACIÓN.|We are waiting for approval.|Estamos esperando la aprobación.
amount|monto|n|amáunt|A + MOUNT (montaña): una montaña de plata, el MONTO.|What is the total amount?|¿Cuál es el monto total?
range|rango|n|réinch|~|The price range is wide.|El rango de precios es amplio.
section|sección|n|sékshon|~|Read this section first.|Leé esta sección primero.
picking|preparación de pedidos|n|píking|PICK (elegir, recoger) + ING: recoger los productos del pedido.|Picking starts at seven.|El picking empieza a las siete.|u=1
execute|ejecutar|v|éksekiut|~|c=the plan;sp=ejecutar;post=el plan
month|mes|n|manz|MONTH → «MANZ» de MANZANA: una manzana por MES.|The project lasts one month.|El proyecto dura un mes.
source|origen / fuente|n|sórs|SOURCE → «SALSA»: la FUENTE de la salsa.|What is the data source?|¿Cuál es la fuente de datos?
discount|descuento|n|dískaunt|DIS + COUNT: contar menos es un DESCUENTO.|We offer a ten percent discount.|Ofrecemos un diez por ciento de descuento.
analysis|análisis|n|análisis|~|The analysis is ready.|El análisis está listo.|f=analysis/analyses
field|campo|n|fild|FIELD → «FILD»: el CAMPO de fútbol (y de un formulario).|This field is mandatory.|Este campo es obligatorio.
check|verificación / control|n|chek|CHECK → «CHEQUEAR»: VERIFICAR.|Do a quick check.|Hacé una verificación rápida.
activity|actividad|n|aktíviti|~|Log the activity in the system.|Registrá la actividad en el sistema.
stocked|inventariable|adj|stokt|STOCK + ED: lo que se guarda en stock es INVENTARIABLE.|This item is stocked.|Este artículo es inventariable.
initial|inicial|adj|iníshal|~|The initial cost is low.|El costo inicial es bajo.
necessary|necesario|adj|nésesari|~|Is it necessary?|¿Es necesario?
verification|comprobación|n|verifikéishon|~|The verification is complete.|La comprobación está completa.
empty|vacío|adj|émpti|EMPTY → «EMPTI»: la caja está VACÍA.|The box is empty.|La caja está vacía.
construction|construcción|n|konstrákshon|~|The building is under construction.|El edificio está en construcción.
consumption|consumo|n|konsámpshon|~|Energy consumption went down.|El consumo de energía bajó.|u=1
comment|comentario|n|kóment|~|Add a comment to the task.|Agregá un comentario a la tarea.
advance|avanzar|v|adváns|~|c=with the project;sp=avanzar;post=con el proyecto
actual|real (¡no «actual»!)|adj|ákchual|Falso amigo: ACTUAL significa REAL. «Actual» en castellano se dice CURRENT.|The actual cost was higher.|El costo real fue más alto.
header|cabecera / encabezado|n|jéder|HEAD (cabeza) + ER = CABECERA.|Check the order header.|Revisá la cabecera del pedido.
return|devolver / volver|v|ritérn|RETURN → «RETORNAR»: VOLVER y DEVOLVER.|c=the product;sp=devolver;post=el producto
button|botón|n|báton|BUTTON → «BOTÓN», casi igual.|Click the green button.|Hacé clic en el botón verde.
period|período|n|píriod|~|The period is closed.|El período está cerrado.
review|revisar|v|riviú|RE + VIEW (ver): volver a ver es REVISAR.|c=the document;sp=revisar;post=el documento
access|acceso|n|ákses|~|I don't have access.|No tengo acceso.|u=1
note|nota|n|nóut|~|Take a note.|Tomá nota.
credit|crédito|n|krédit|~|The customer has credit.|El cliente tiene crédito.
entity|entidad|n|éntiti|~|Each legal entity has its own books.|Cada entidad legal tiene sus propios libros.
modify|modificar|v|módifai|~|c=the order;sp=modificar;post=el pedido
workshop|taller|n|uérkshop|WORK (trabajo) + SHOP (tienda): el lugar donde se trabaja, el TALLER.|The car is in the workshop.|El auto está en el taller.
stock|existencias / stock|n|stok|~|We have stock for two weeks.|Tenemos stock para dos semanas.|u=1
allocation|imputación / asignación|n|alokéishon|ALLOCATION ≈ «ALOCAR»: ubicar el costo, IMPUTARLO.|Review the cost allocation.|Revisá la imputación de costos.
variant|variante|n|vériant|~|Choose a product variant.|Elegí una variante del producto.
site|sitio|n|sáit|~|The site has two warehouses.|El sitio tiene dos almacenes.
fixed|fijo|adj|fikst|FIX (arreglar, fijar) + ED = FIJO.|It is a fixed price.|Es un precio fijo.
administration|administración|n|administréishon|~|Talk to administration.|Hablá con administración.|u=1
option|opción|n|ópshon|~|There is another option.|Hay otra opción.
assignment|asignación|n|asáinment|ASSIGN (asignar) + MENT = ASIGNACIÓN.|Check the task assignment.|Revisá la asignación de tareas.
rule|regla|n|rul|RULE → la REGLA para medir (ruler) y la REGLA del juego.|Follow the rules.|Seguí las reglas.
select|seleccionar|v|selékt|~|c=the right option;sp=seleccionar;post=la opción correcta
result|resultado|n|risált|~|The result is good.|El resultado es bueno.
company|empresa / compañía|n|kámpani|~|Our company has 500 employees.|Nuestra empresa tiene 500 empleados.
inventory|inventario|n|ínventori|~|We count the inventory every month.|Contamos el inventario cada mes.
filter|filtro|n|fílter|~|Apply a filter by date.|Aplicá un filtro por fecha.
difference|diferencia|n|díferens|~|What is the difference?|¿Cuál es la diferencia?
concept|concepto|n|kónsept|~|The concept is simple.|El concepto es simple.
round|ronda|n|ráund|ROUND → «REDONDO»: dar una vuelta redonda es una RONDA.|The technician does a round every week.|El técnico hace una ronda cada semana.
generic|genérico|adj|yenérik|~|Use a generic code.|Usá un código genérico.
requisition|requisición|n|rekuisíshon|~|Create a purchase requisition.|Creá una requisición de compra.
finish|terminar|v|fínish|FINISH → «FIN»: TERMINAR.|c=the report;sp=terminar;post=el informe
share|compartir|v|shéer|SHARE → «CHEER» con amigos: COMPARTIR.|c=the screen;sp=compartir;post=la pantalla
accept|aceptar|v|aksépt|~|c=the proposal;sp=aceptar;post=la propuesta
open|abrir|v|óupen|OPEN = el cartel de ABIERTO: ABRIR.|c=the file;sp=abrir;post=el archivo
worker|trabajador|n|uérker|WORK (trabajo) + ER = TRABAJADOR.|Each worker has a role.|Cada trabajador tiene un rol.
description|descripción|n|diskrípshon|~|Write a short description.|Escribí una descripción corta.
rest|resto / descanso|n|rest|REST → «RESTO»: el RESTO del día es DESCANSO.|I will do the rest tomorrow.|Haré el resto mañana.
format|formato|n|fórmat|~|Change the date format.|Cambiá el formato de la fecha.
member|miembro|n|mémber|MEMBER → «MIEMBRO», como en REMEMBER.|She is a team member.|Ella es miembro del equipo.
label|etiqueta|n|léibel|LABEL → «LÁPIZ»: escribí la ETIQUETA con lápiz.|Print the label.|Imprimí la etiqueta.
billing|facturación|n|bíling|BILL (factura) + ING = FACTURACIÓN.|Billing is on Friday.|La facturación es el viernes.|u=1
special|especial|adj|spéshal|~|This is a special case.|Este es un caso especial.
complete|completar|v|komplít|~|c=the form;sp=completar;post=el formulario
opening|apertura|n|óupening|OPEN (abrir) + ING = APERTURA.|The opening balance is correct.|El saldo de apertura es correcto.
formula|fórmula|n|fórmiula|~|Check the formula in Excel.|Revisá la fórmula en Excel.
logic|lógica|n|lóyik|~|The logic is clear.|La lógica es clara.|u=1
future|futuro|n|fiúcher|~|We will see it in the future.|Lo veremos en el futuro.
sensor|sensor|n|sénsor|~|The sensor measures the temperature.|El sensor mide la temperatura.
role|rol|n|róul|~|Each user has a role.|Cada usuario tiene un rol.
minute|minuto|n|mínit|~|Give me a minute.|Dame un minuto.
delete|borrar|v|dilít|DELETE → la tecla «DEL»: BORRAR.|c=the old line;sp=borrar;post=la línea vieja
closing|cierre|n|klóusing|CLOSE (cerrar) + ING = CIERRE.|The monthly closing is tomorrow.|El cierre mensual es mañana.
model|modelo|n|módel|~|Which model is it?|¿Qué modelo es?
variable|variable|adj|vériabol|~|The cost is variable.|El costo es variable.
menu|menú|n|méniu|~|Open the main menu.|Abrí el menú principal.
piece|pieza / pedazo|n|pis|PIECE → «PIZZA»: un PEDAZO de pizza.|One piece is missing.|Falta una pieza.
scenario|escenario|n|sinério|~|Let's test this scenario.|Probemos este escenario.
creation|creación|n|kriéishon|~|The creation date is today.|La fecha de creación es hoy.
particular|particular|adj|partíkiular|~|In this particular case, yes.|En este caso particular, sí.
profile|perfil|n|próufail|~|Update your profile.|Actualizá tu perfil.
criterion|criterio|n|kraitírion|~|What is the criterion?|¿Cuál es el criterio?|f=criterion/criteria
schedule|horario / programación|n|skéyul|SCHEDULE → «SCHOOL»: el HORARIO del colegio.|What is your schedule today?|¿Cuál es tu horario hoy?
employee|empleado|n|imploií|EMPLOY (emplear) + EE = EMPLEADO.|The employee is on vacation.|El empleado está de vacaciones.
balance|saldo / balance|n|bálans|~|What is the account balance?|¿Cuál es el saldo de la cuenta?
sense|sentido|n|sens|~|It makes sense.|Tiene sentido.
inspection|inspección|n|inspékshon|~|The inspection is weekly.|La inspección es semanal.
circuit|circuito|n|sérkit|~|Explain the approval circuit.|Explicá el circuito de aprobación.
goal|objetivo / meta|n|góul|GOAL → «GOL»: la META del partido.|Our goal is to finish in May.|Nuestro objetivo es terminar en mayo.
air|aire|n|éer|AIR → «AIRE», casi igual.|Check the air conditioning.|Revisá el aire acondicionado.|u=1
similar|parecido / similar|adj|símilar|~|Both cases are similar.|Los dos casos son parecidos.
save|guardar / ahorrar|v|séiv|SAVE → el ícono del disquete: GUARDAR.|c=the changes;sp=guardar;post=los cambios
reason|motivo / razón|n|rízon|REASON → «RAZÓN».|What is the reason for the change?|¿Cuál es el motivo del cambio?
license|licencia|n|láisens|~|We need more licenses.|Necesitamos más licencias.
investment|inversión|n|invéstment|INVEST (invertir) + MENT = INVERSIÓN.|It is a good investment.|Es una buena inversión.
register|registrar|v|réyister|~|c=the hours;sp=registrar;post=las horas
branch|sucursal / rama|n|branch|BRANCH → «RAMA» de un árbol: una SUCURSAL es una rama de la empresa.|We opened a new branch.|Abrimos una sucursal nueva.
current|actual / corriente|adj|kárrent|CURRENT → «CORRIENTE» del río: lo que pasa ahora, lo ACTUAL.|What is the current status?|¿Cuál es el estado actual?
normal|normal|adj|nórmal|~|That is normal.|Eso es normal.
movement|movimiento|n|múvment|MOVE (mover) + MENT = MOVIMIENTO.|Check the stock movements.|Revisá los movimientos de stock.
scheduling|programación de tareas|n|skéyuling|SCHEDULE (horario) + ING: armar los horarios, PROGRAMAR.|Scheduling is done every Monday.|La programación se hace cada lunes.|u=1
counter|contador / mostrador|n|káunter|COUNT (contar) + ER = CONTADOR.|The counter shows 500 hours.|El contador marca 500 horas.
due|vencido / a pagar|adj|diú|DUE → «DÍU»: lo que se DEBE pagar.|The invoice is due today.|La factura vence hoy.
recording|grabación|n|rikórding|RECORD (grabar) + ING = GRABACIÓN.|Watch the meeting recording.|Mirá la grabación de la reunión.
deliver|entregar|v|dilíver|DELIVER → el DELIVERY: ENTREGAR.|c=the order;sp=entregar;post=el pedido
office|oficina|n|ófis|~|I am in the office.|Estoy en la oficina.
second|segundo|n|sékond|~|Wait a second.|Esperá un segundo.
development|desarrollo|n|divélopment|DEVELOP (desarrollar) + MENT = DESARROLLO.|The development will take a month.|El desarrollo llevará un mes.
included|incluido|adj|inklúded|~|Tax is included.|El impuesto está incluido.
manual|manual|adj|mániual|~|This is a manual process.|Este es un proceso manual.
associated|asociado|adj|asóushieited|~|The asset is associated with a location.|El activo está asociado a una ubicación.
update|actualizar|v|apdéit|UP (arriba) + DATE (fecha): poner al día es ACTUALIZAR.|c=the price list;sp=actualizar;post=la lista de precios
unique|único|adj|iuník|~|Each code is unique.|Cada código es único.
allow|permitir|v|aláu|ALLOW → «A LOW» (abajo): bajar la barrera es PERMITIR.|c=the change;sp=permitir;post=el cambio
path|camino / ruta|n|paz|PATH → «PAZ»: un CAMINO tranquilo.|Follow this path.|Seguí este camino.
usage|uso|n|iúsich|USE (usar) + AGE = USO.|Check the machine usage.|Revisá el uso de la máquina.|u=1
installment|cuota|n|instólment|INSTALL + MENT: pagar en partes instaladas, en CUOTAS.|I pay in six installments.|Pago en seis cuotas.
trade|oficio / comercio|n|tréid|TRADE → «TRATO»: hacer un trato es COMERCIO.|Electricity is his trade.|La electricidad es su oficio.
manage|gestionar / administrar|v|mánach|MANAGE → «MANEJAR».|c=the team;sp=gestionar;post=el equipo
combination|combinación|n|kombinéishon|~|Try another combination.|Probá otra combinación.
debit|débito|n|débit|~|Pay with a debit card.|Pagá con tarjeta de débito.
cash|efectivo / caja|n|kash|CASH → «CASH»: la plata EN EFECTIVO.|Do you pay in cash?|¿Pagás en efectivo?|u=1
transfer|transferencia|n|tránsfer|~|Make a bank transfer.|Hacé una transferencia bancaria.
week|semana|n|uík|WEEK → «WIKI»: una wiki nueva cada SEMANA.|See you next week.|Nos vemos la semana que viene.
tab|pestaña|n|tab|TAB → la tecla TAB salta a la siguiente PESTAÑA.|Open the general tab.|Abrí la pestaña general.
perform|realizar / desempeñar|v|perfórm|PERFORM → «PERFORMANCE»: REALIZAR un show.|c=the inspection;sp=realizar;post=la inspección
possible|posible|adj|pósibol|~|Is it possible?|¿Es posible?
tree|árbol|n|tri|TREE → «TRI»: tres ramas en el ÁRBOL.|The category tree has three levels.|El árbol de categorías tiene tres niveles.
wholesale|mayorista|adj|jóulseil|WHOLE (todo) + SALE (venta): vender todo junto es MAYORISTA.|We sell at wholesale prices.|Vendemos a precios mayoristas.
tracking|seguimiento|n|tráking|TRACK (pista) + ING: seguir la pista, el SEGUIMIENTO.|Send me the tracking number.|Mandame el número de seguimiento.|u=1
transaction|transacción|n|tranzákshon|~|The transaction was posted.|La transacción se registró.
allocate|imputar / asignar|v|álokeit|ALLOCATE ≈ «ALOCAR»: ubicar el costo, IMPUTAR.|c=the cost;sp=imputar;post=el costo
wheel|rueda|n|uíl|WHEEL → «HUIL»: la RUEDA hace «huiiil» al girar.|The truck has a flat wheel.|El camión tiene una rueda pinchada.
import|importar|v|impórt|~|c=the data;sp=importar;post=los datos
brand|marca|n|brand|BRAND → «BRANDO», el actor de MARCA.|What brand is the engine?|¿De qué marca es el motor?
click|hacer clic|v|klik|CLICK = el ruido del mouse: HACER CLIC.|c=the button;sp=presionar;post=el botón
indicate|indicar|v|índikeit|~|c=the quantity;sp=indicar;post=la cantidad
simple|simple|adj|símpol|~|The solution is simple.|La solución es simple.
zone|zona|n|zóun|~|This is the picking zone.|Esta es la zona de picking.
interval|intervalo|n|ínterval|~|Set the maintenance interval.|Definí el intervalo de mantenimiento.
responsible|responsable|adj|rispónsibol|~|Who is responsible for this?|¿Quién es responsable de esto?
permission|permiso|n|permíshon|~|You need permission.|Necesitás permiso.
net|neto|adj|net|NET → «NETO»: lo que queda en la red.|The net amount is 900.|El monto neto es 900.
text|texto|n|tekst|~|Copy the text.|Copiá el texto.
revenue|ingresos|n|révenu|REVENUE → «REVENIR», lo que vuelve: los INGRESOS.|Revenue grew ten percent.|Los ingresos crecieron diez por ciento.|u=1
billable|facturable|adj|bílabol|BILL (factura) + ABLE = FACTURABLE.|These hours are billable.|Estas horas son facturables.
design|diseño|n|disáin|~|We approved the design.|Aprobamos el diseño.
department|departamento|n|dipártment|~|Which department do you work in?|¿En qué departamento trabajás?
weight|peso|n|uéit|WEIGHT suena igual que WAIT: ESPERÁ mientras te pesan.|What is the weight of the box?|¿Cuál es el peso de la caja?
collection|cobranza / colección|n|kolékshon|COLLECT (juntar) + ION: juntar la plata es la COBRANZA.|Collection is late this month.|La cobranza está atrasada este mes.
original|original|adj|oríyinal|~|Keep the original document.|Guardá el documento original.
object|objeto|n|óbyekt|~|Select the object.|Seleccioná el objeto.
space|espacio|n|spéis|~|There is no space in the warehouse.|No hay espacio en el almacén.
reporting|informes / reportería|n|ripórting|REPORT (informe) + ING = REPORTERÍA.|Reporting is done in Power BI.|Los informes se hacen en Power BI.|u=1
shipping|despacho / envío|n|shíping|SHIP (barco) + ING: mandar en barco, DESPACHAR.|Shipping costs are high.|Los costos de envío son altos.|u=1
package|paquete|n|pákech|~|The package arrived.|Llegó el paquete.
commission|comisión|n|komíshon|~|The sales commission is five percent.|La comisión de venta es del cinco por ciento.
exempt|exento|adj|igsémpt|~|This product is tax exempt.|Este producto está exento de impuestos.
goods|mercadería|n|guds|GOOD (bueno) + S: las cosas buenas que vendés son la MERCADERÍA.|The goods arrived damaged.|La mercadería llegó dañada.|u=1
past|pasado|n|past|PAST → «PASÓ»: lo que ya PASÓ es el PASADO.|That is in the past.|Eso es pasado.
enter|ingresar / entrar|v|énter|ENTER = la tecla ENTER: INGRESAR.|c=the data;sp=ingresar;post=los datos
assign|asignar|v|asáin|~|c=the task;sp=asignar;post=la tarea
offset|contrapartida|n|ófset|OFF (fuera) + SET (poner): poner del otro lado es la CONTRAPARTIDA.|Choose the offset account.|Elegí la cuenta de contrapartida.
action|acción|n|ákshon|~|What is the next action?|¿Cuál es la próxima acción?
report|informe|n|ripórt|REPORT → «REPORTE»: el INFORME.|The report is ready.|El informe está listo.
fiscal|fiscal|adj|fískal|~|The fiscal year ends in December.|El año fiscal termina en diciembre.
relationship|relación|n|riléishonship|RELATION (relación) + SHIP (barco): el barco de la RELACIÓN.|We have a good relationship.|Tenemos una buena relación.
beginning|principio|n|bigíning|BEGIN (empezar) + ING = PRINCIPIO.|Let's start from the beginning.|Empecemos desde el principio.
withholding|retención|n|uizjóulding|WITH (con) + HOLD (retener): lo que se RETIENE.|Calculate the tax withholding.|Calculá la retención del impuesto.|u=1
focus|foco / enfoque|n|fóukus|~|Our focus is the customer.|Nuestro foco es el cliente.
definition|definición|n|definíshon|~|We need a clear definition.|Necesitamos una definición clara.
traceability|trazabilidad|n|treisabíliti|TRACE (rastro) + ABILITY: poder seguir el rastro es la TRAZABILIDAD.|Lot numbers give traceability.|Los números de lote dan trazabilidad.|u=1
sector|sector|n|séktor|~|He works in the public sector.|Él trabaja en el sector público.
bridge|puente|n|brich|BRIDGE → «BRICH»: el PUENTE de Brooklyn.|It works as a bridge account.|Funciona como una cuenta puente.
send|enviar / mandar|v|send|SEND → «SENDA»: MANDAR algo por la senda.|c=the invoice;sp=enviar;post=la factura;f=send/sends/sent/sent/sending
obtain|obtener|v|obtéin|~|c=the data;sp=obtener;post=los datos
assessment|evaluación|n|asésment|ASSESS (evaluar) + MENT = EVALUACIÓN.|The condition assessment is done.|La evaluación de estado está hecha.
fix|arreglar / corregir|v|fiks|FIX → «FIJAR»: dejar fijo, ARREGLADO.|c=the error;sp=corregir;post=el error
handle|manejar|v|jándel|HANDLE = la MANIJA: MANEJAR algo con la mano.|c=the returns;sp=manejar;post=las devoluciones
phase|fase|n|féis|~|We are in phase two.|Estamos en la fase dos.
require|requerir|v|rikuáier|~|c=approval;sp=requerir;post=aprobación
condition|condición / estado|n|kondíshon|~|The machine is in good condition.|La máquina está en buenas condiciones.
downtime|parada / tiempo muerto|n|dáuntaim|DOWN (abajo) + TIME: el tiempo con la máquina abajo es la PARADA.|Downtime was two hours.|La parada fue de dos horas.|u=1
operator|operario|n|ópereitor|~|The operator starts the machine.|El operario arranca la máquina.
charge|cobrar|v|charch|CHARGE → «CARGAR» a la cuenta: COBRAR.|c=the customer;sp=cobrar;post=al cliente
address|dirección|n|adrés|ADDRESS → «ADRESA»: la DIRECCIÓN de la casa.|What is the delivery address?|¿Cuál es la dirección de entrega?
plant|planta|n|plant|~|The plant works 24 hours.|La planta trabaja 24 horas.
printing|impresión|n|prínting|PRINT (imprimir) + ING = IMPRESIÓN.|Printing takes a minute.|La impresión tarda un minuto.|u=1
allowance|viático / asignación|n|aláuans|ALLOW (permitir) + ANCE: lo que te permiten gastar, el VIÁTICO.|The travel allowance is 50 dollars.|El viático es de 50 dólares.
availability|disponibilidad|n|aveilabíliti|AVAILABLE (disponible) + ITY = DISPONIBILIDAD.|Check the stock availability.|Revisá la disponibilidad de stock.|u=1
percentage|porcentaje|n|persénteich|PER CENT (por ciento) + AGE = PORCENTAJE.|What percentage is it?|¿Qué porcentaje es?
instance|instancia / caso|n|ínstans|~|For instance, this item.|Por ejemplo, este artículo.
output|salida / resultado|n|áutput|OUT (afuera) + PUT (poner): lo que sale es la SALIDA.|Check the output of the process.|Revisá la salida del proceso.
compressor|compresor|n|komprésor|~|The compressor is noisy.|El compresor hace ruido.
idle|inactivo|adj|áidel|IDLE → «ÍDOLO»: el ídolo que no hace nada, INACTIVO.|The machine is idle.|La máquina está inactiva.
solution|solución|n|solúshon|~|We found a solution.|Encontramos una solución.
distribute|distribuir|v|distríbiut|~|c=the goods;sp=distribuir;post=la mercadería
frequency|frecuencia|n|fríkuensi|~|What is the frequency?|¿Cuál es la frecuencia?
registration|matrícula / registro|n|reyistréishon|~|Check the vehicle registration.|Revisá la matrícula del vehículo.
station|estación|n|stéishon|~|This is the packing station.|Esta es la estación de embalaje.
award|premio|n|auórd|AWARD → «A WARD»: el premio que entrega la guardia.|She won an award.|Ella ganó un premio.
sum|suma|n|sam|SUM → «SAM»: la SUMA de todo.|The sum is correct.|La suma es correcta.
buyer|comprador|n|báier|BUY (comprar) + ER = COMPRADOR.|The buyer approved the order.|El comprador aprobó el pedido.
buy|comprar|v|bái|BUY → «BAI»: ¡BYE, me voy a COMPRAR!|c=new tools;sp=comprar;post=herramientas nuevas;f=buy/buys/bought/bought/buying
confirm|confirmar|v|konférm|~|c=the order;sp=confirmar;post=el pedido
scope|alcance|n|skóup|SCOPE → «TELESCOPIO»: hasta dónde llega, el ALCANCE.|This is out of scope.|Esto está fuera del alcance.
enable|habilitar|v|enéibol|EN + ABLE (capaz): hacer capaz es HABILITAR.|c=the feature;sp=habilitar;post=la función
authorize|autorizar|v|ózoraiz|~|c=the payment;sp=autorizar;post=el pago
mandatory|obligatorio|adj|mándatori|MANDATORY → «MANDATO»: es OBLIGATORIO.|This field is mandatory.|Este campo es obligatorio.
holiday|feriado / vacaciones|n|jólidei|HOLY (santo) + DAY: el día santo es FERIADO.|Monday is a holiday.|El lunes es feriado.
warranty|garantía|n|uórranti|WARRANTY → «GUARANTÍA», casi GARANTÍA.|The product has a one-year warranty.|El producto tiene un año de garantía.
courtesy|cortesía|n|kértesi|~|It was a courtesy to the customer.|Fue una cortesía al cliente.
labor|mano de obra|n|léibor|LABOR → «LABOR»: el trabajo de la MANO DE OBRA.|Labor costs went up.|Los costos de mano de obra subieron.|u=1
lubricant|lubricante|n|lúbrikant|~|Buy more lubricant.|Comprá más lubricante.
grease|grasa|n|gris|GREASE → «GRIS»: la GRASA gris de la máquina.|Use grease on the wheel.|Usá grasa en la rueda.|u=1
drum|tambor|n|dram|DRUM → «DRAM»: el TAMBOR hace dram dram.|The oil comes in a drum.|El aceite viene en un tambor.
liter|litro|n|líter|~|We need ten liters of oil.|Necesitamos diez litros de aceite.
manufacturer|fabricante|n|maniufákchurer|MANUFACTURE (fabricar) + ER = FABRICANTE.|Contact the manufacturer.|Contactá al fabricante.
acquisition|adquisición|n|akuisíshon|~|The acquisition was approved.|La adquisición fue aprobada.
quarter|trimestre / cuarto|n|kuórter|QUARTER → «CUARTO»: un cuarto del año es un TRIMESTRE.|Sales grew this quarter.|Las ventas crecieron este trimestre.
vehicle|vehículo|n|víikel|~|The vehicle is in the workshop.|El vehículo está en el taller.
mechanic|mecánico|n|mekánik|~|The mechanic fixed the engine.|El mecánico arregló el motor.
supervisor|supervisor|n|súpervaisor|~|Talk to your supervisor.|Hablá con tu supervisor.
risk|riesgo|n|risk|~|There is a high risk.|Hay un riesgo alto.
accident|accidente|n|áksident|~|There was an accident at the plant.|Hubo un accidente en la planta.
audit|auditoría|n|ódit|~|The audit is next month.|La auditoría es el mes que viene.
onboarding|inducción / incorporación|n|onbórding|ON + BOARD (a bordo): subir a bordo es la INDUCCIÓN.|Onboarding takes one week.|La inducción lleva una semana.|u=1
dangerous|peligroso|adj|déinyeros|DANGER (peligro) + OUS = PELIGROSO.|This job is dangerous.|Este trabajo es peligroso.
height|altura|n|jáit|HEIGHT viene de HIGH (alto): la ALTURA.|Work at height needs a permit.|El trabajo en altura necesita un permiso.
guide|guía|n|gáid|~|Follow the user guide.|Seguí la guía del usuario.
inflation|inflación|n|infléishon|~|Inflation is high this year.|La inflación es alta este año.|u=1
oil|aceite|n|óil|OIL → «OIL», el aceite de oliva (olive oil).|Change the engine oil.|Cambiá el aceite del motor.|u=1
gap|brecha / GAP|n|gap|GAP → el «hueco» entre lo que el sistema hace y lo que se necesita.|This gap needs a custom development.|Este GAP necesita un desarrollo a medida.
workflow|flujo de trabajo|n|uérkflou|WORK + FLOW (flujo) = FLUJO DE TRABAJO.|The workflow needs two approvals.|El flujo de trabajo necesita dos aprobaciones.
post|contabilizar / registrar|v|póust|POST → «POSTEAR»: publicar el asiento en el libro.|c=the invoice;sp=registrar;post=la factura
demo|demostración|n|démo|~|Let's do a quick demo.|Hagamos una demo rápida.
#N
agenda|agenda / orden del día|n|ayénda|~|What is on the agenda?|¿Qué hay en la agenda?
deadline|fecha límite|n|dédlain|DEAD (muerto) + LINE (línea): la línea que no podés cruzar es la FECHA LÍMITE.|The deadline is Friday.|La fecha límite es el viernes.
milestone|hito|n|máilstoun|MILE (milla) + STONE (piedra): la piedra que marca cada milla es un HITO.|We reached the first milestone.|Alcanzamos el primer hito.
stakeholder|interesado|n|stéikjoulder|STAKE (apuesta) + HOLDER (el que tiene): el que tiene algo en juego.|Invite all the stakeholders.|Invitá a todos los interesados.
feedback|comentarios / devolución|n|fídbak|FEED (alimentar) + BACK (de vuelta): lo que te devuelven para mejorar.|Thanks for your feedback.|Gracias por tus comentarios.|u=1
proposal|propuesta|n|propóusal|PROPOSE (proponer) + AL = PROPUESTA.|We sent the proposal.|Mandamos la propuesta.
contract|contrato|n|kóntrakt|~|Sign the contract.|Firmá el contrato.
agreement|acuerdo|n|agríment|AGREE (estar de acuerdo) + MENT = ACUERDO.|We reached an agreement.|Llegamos a un acuerdo.
negotiation|negociación|n|negoushiéishon|~|The negotiation was hard.|La negociación fue difícil.
deal|trato / negocio|n|dil|DEAL → «DIL»: cerrar un TRATO.|It's a deal!|¡Trato hecho!
profit|ganancia|n|prófit|PROFIT → «PROVECHO»: la GANANCIA.|The profit was high this year.|La ganancia fue alta este año.
loss|pérdida|n|los|LOSS viene de LOSE (perder): una PÉRDIDA.|The company had a loss.|La empresa tuvo una pérdida.
margin|margen|n|máryin|~|The margin is too low.|El margen es muy bajo.
payroll|nómina / sueldos|n|péiroul|PAY (pagar) + ROLL (lista): la lista de pagos es la NÓMINA.|Payroll is on the 30th.|Los sueldos se pagan el 30.|u=1
salary|sueldo|n|sálari|SALARY → «SALARIO».|My salary is paid monthly.|Mi sueldo se paga mensualmente.
bonus|bono / premio|n|bóunus|~|We got a bonus this year.|Recibimos un bono este año.
receipt|recibo|n|risít (la P no suena)|RECEIPT → «RECIBIR»: el RECIBO (la P es muda).|Keep the receipt.|Guardá el recibo.
payment|pago|n|péiment|PAY (pagar) + MENT = PAGO.|The payment is late.|El pago está atrasado.
pay|pagar|v|péi|PAY → «PEI»: PAGAR con PayPal.|c=the supplier;sp=pagar;post=al proveedor;f=pay/pays/paid/paid/paying
refund|reembolso|n|rífand|RE + FUND (fondos): te devuelven los fondos, un REEMBOLSO.|I asked for a refund.|Pedí un reembolso.
debt|deuda|n|det (la B no suena)|DEBT → «DET», casi DEUDA (la B es muda).|We paid the debt.|Pagamos la deuda.
loan|préstamo|n|lóun|LOAN → «LONA»: te PRESTAN una lona.|The bank gave us a loan.|El banco nos dio un préstamo.
interest|interés|n|íntrest|~|The interest rate is high.|La tasa de interés es alta.
liability|pasivo / responsabilidad|n|laiabíliti|LIABLE (responsable) + ITY: lo que debés, el PASIVO.|Debts are liabilities.|Las deudas son pasivos.
equity|patrimonio|n|ékuiti|EQUITY → «EQUIDAD»: lo que es tuyo de verdad, el PATRIMONIO.|The company's equity grew.|El patrimonio de la empresa creció.|u=1
depreciation|depreciación / amortización|n|diprishiéishon|~|Calculate the asset depreciation.|Calculá la depreciación del activo.|u=1
compliance|cumplimiento|n|kompláians|COMPLY (cumplir) + ANCE = CUMPLIMIENTO.|Compliance is mandatory.|El cumplimiento es obligatorio.|u=1
policy|política|n|pólisi|~|Read the company policy.|Leé la política de la empresa.
procedure|procedimiento|n|prosíyur|~|Follow the procedure.|Seguí el procedimiento.
guideline|pauta / lineamiento|n|gáidlain|GUIDE (guía) + LINE (línea): la línea que te guía es una PAUTA.|Follow the design guidelines.|Seguí las pautas de diseño.
requirement|requisito|n|rikuáierment|REQUIRE (requerir) + MENT = REQUISITO.|This is a key requirement.|Este es un requisito clave.
specification|especificación|n|spesifikéishon|~|Read the technical specification.|Leé la especificación técnica.
bug|error de software|n|bag|BUG → «BICHO»: el bicho que mete ERRORES en el programa.|We found a bug.|Encontramos un error.
release|versión / lanzamiento|n|rilís|RELEASE → «LIBERAR»: soltar una versión nueva.|The new release is ready.|La nueva versión está lista.
deployment|despliegue|n|diplóiment|DEPLOY (desplegar) + MENT = DESPLIEGUE.|The deployment is on Sunday.|El despliegue es el domingo.
training|capacitación|n|tréining|TRAIN (entrenar) + ING = CAPACITACIÓN.|The training starts Monday.|La capacitación empieza el lunes.|u=1
support|soporte / apoyo|n|supórt|~|Call technical support.|Llamá a soporte técnico.|u=1
ticket|ticket / incidencia|n|tíket|~|Open a support ticket.|Abrí un ticket de soporte.
incident|incidente|n|ínsident|~|Report the incident.|Informá el incidente.
priority|prioridad|n|praióriti|~|This is our top priority.|Esta es nuestra máxima prioridad.
urgent|urgente|adj|éryent|~|This task is urgent.|Esta tarea es urgente.
presentation|presentación|n|presentéishon|~|The presentation went well.|La presentación salió bien.
slide|diapositiva|n|sláid|SLIDE → el TOBOGÁN: las DIAPOSITIVAS se deslizan una tras otra.|Go to the next slide.|Pasá a la siguiente diapositiva.
dashboard|tablero|n|dáshbord|DASH (rápido) + BOARD (tablero): el TABLERO del auto.|Check the sales dashboard.|Revisá el tablero de ventas.
chart|gráfico|n|chart|CHART → la carta de navegación: un GRÁFICO.|The chart shows the trend.|El gráfico muestra la tendencia.
trend|tendencia|n|trend|TREND → «TREN»: la moda que pasa como un tren, la TENDENCIA.|The trend is positive.|La tendencia es positiva.
growth|crecimiento|n|gróuz|GROW (crecer) + TH = CRECIMIENTO.|We expect growth this year.|Esperamos crecimiento este año.|u=1
increase|aumentar|v|inkrís|INCREASE → «INCREMENTAR».|c=sales;sp=aumentar;post=las ventas
decrease|disminuir|v|dikrís|DE + CREASE: lo contrario de increase, DISMINUIR.|c=the costs;sp=disminuir;post=los costos
reduce|reducir|v|ridiús|~|c=the waste;sp=reducir;post=el desperdicio
improve|mejorar|v|imprúv|IMPROVE → «IMPROVISAR» para MEJORAR.|c=the process;sp=mejorar;post=el proceso
improvement|mejora|n|imprúvment|IMPROVE (mejorar) + MENT = MEJORA.|We need continuous improvement.|Necesitamos mejora continua.
efficiency|eficiencia|n|ifíshensi|~|Efficiency is key.|La eficiencia es clave.|u=1
performance|rendimiento / desempeño|n|perfórmans|PERFORM (realizar) + ANCE = DESEMPEÑO.|The system performance is slow.|El rendimiento del sistema es lento.
productivity|productividad|n|prodaktíviti|~|Productivity went up.|La productividad subió.|u=1
quality|calidad|n|kuóliti|QUALITY → «CUALIDAD», casi CALIDAD.|Quality comes first.|La calidad es lo primero.
target|meta / objetivo|n|tárget|TARGET → el blanco del tiro: el OBJETIVO.|We met the sales target.|Cumplimos la meta de ventas.
strategy|estrategia|n|strátegi|~|What is the strategy?|¿Cuál es la estrategia?
roadmap|hoja de ruta|n|róudmap|ROAD (camino) + MAP (mapa) = HOJA DE RUTA.|Share the product roadmap.|Compartí la hoja de ruta del producto.
vision|visión|n|víshon|~|The director shared her vision.|La directora compartió su visión.
client|cliente|n|kláient|~|The client is happy.|El cliente está contento.
partner|socio|n|pártner|PARTNER → «PARTE»: tu SOCIO tiene una parte.|Microsoft is our partner.|Microsoft es nuestro socio.
supplier|proveedor|n|supláier|SUPPLY (abastecer) + ER = PROVEEDOR.|Find a new supplier.|Buscá un proveedor nuevo.
quote|cotización|n|kuóut|QUOTE → «COTA»: el precio cotizado, la COTIZACIÓN.|Send me a quote.|Mandame una cotización.
estimate|estimación|n|éstimet|~|This is a rough estimate.|Esta es una estimación aproximada.
bill|factura / cuenta|n|bil|BILL → «BILLETE»: la CUENTA que pagás con billetes.|Can I have the bill, please?|¿Me trae la cuenta, por favor?
statement|extracto / declaración|n|stéitment|STATE (declarar) + MENT = DECLARACIÓN.|Check the bank statement.|Revisá el extracto bancario.
posting|contabilización|n|póusting|POST (registrar) + ING = CONTABILIZACIÓN.|The posting failed.|La contabilización falló.
reconciliation|conciliación|n|rekonsiliéishon|RECONCILIATION ≈ «RECONCILIACIÓN»: hacer que las cuentas se amiguen.|Do the bank reconciliation.|Hacé la conciliación bancaria.
accrual|devengamiento|n|akrúal|ACCRUE (acumular) + AL = DEVENGADO.|Record the accrual at month end.|Registrá el devengamiento a fin de mes.
freight|flete|n|fréit (la GH no suena)|FREIGHT → «FLETE», casi igual.|Freight is included.|El flete está incluido.|u=1
carrier|transportista|n|kárrier|CARRY (llevar) + ER: el que lleva, el TRANSPORTISTA.|Call the carrier.|Llamá al transportista.
route|ruta|n|rut|~|Plan the delivery route.|Planificá la ruta de entrega.
truck|camión|n|trak|TRUCK → «TRUCO»: el camión del truco.|The truck is late.|El camión está atrasado.
pallet|pallet / tarima|n|pálet|~|Put the boxes on the pallet.|Poné las cajas sobre el pallet.
box|caja|n|boks|BOX → «BOXEO»: el ring es una CAJA.|Open the box.|Abrí la caja.
barcode|código de barras|n|bárkoud|BAR (barra) + CODE (código) = CÓDIGO DE BARRAS.|Scan the barcode.|Escaneá el código de barras.
scan|escanear|v|skan|~|c=the label;sp=escanear;post=la etiqueta
bin|ubicación / casillero|n|bin|BIN → el cesto: el casillero donde va la mercadería.|Put it in bin A3.|Ponelo en la ubicación A3.
aisle|pasillo|n|áil (la S no suena)|AISLE → «AISLADO»: el PASILLO aislado entre estanterías.|Go to aisle five.|Andá al pasillo cinco.
shelf|estante|n|shelf|SHELF → «CHELF»: el ESTANTE de la cocina.|The box is on the top shelf.|La caja está en el estante de arriba.|f=shelf/shelves
rack|estantería / rack|n|rak|~|The rack is full.|El rack está lleno.
receiving|recepción de mercadería|n|risíving|RECEIVE (recibir) + ING = RECEPCIÓN.|Receiving is at dock one.|La recepción es en el andén uno.|u=1
pick|preparar / recoger|v|pik|PICK → «PICAR»: picar los productos del estante.|c=the order;sp=preparar;post=el pedido
pack|empacar|v|pak|PACK → «PAQUETE»: EMPACAR.|c=the boxes;sp=empacar;post=las cajas
ship|despachar|v|ship|SHIP = BARCO: mandar en barco es DESPACHAR.|c=the goods;sp=despachar;post=la mercadería
dispatch|despacho|n|dispách|~|Dispatch is at noon.|El despacho es al mediodía.|u=1
supply|suministro|n|supláí|SUPPLY → «SUPLIR»: el SUMINISTRO.|The supply chain is broken.|La cadena de suministro está rota.
demand|demanda|n|dimánd|~|Demand is growing.|La demanda está creciendo.
procurement|abastecimiento / compras|n|prokiúrment|PROCURE (conseguir) + MENT = ABASTECIMIENTO.|Procurement approved the order.|Compras aprobó el pedido.|u=1
approve|aprobar|v|aprúv|~|c=the budget;sp=aprobar;post=el presupuesto
reject|rechazar|v|riyékt|REJECT → «REYECTAR», casi RECHAZAR.|c=the invoice;sp=rechazar;post=la factura
cancel|cancelar|v|kánsel|~|c=the meeting;sp=cancelar;post=la reunión
submit|presentar / enviar|v|sabmít|SUB (abajo) + MIT (mandar): mandar para revisión, PRESENTAR.|c=the report;sp=presentar;post=el informe
sign|firmar|v|sáin (la G no suena)|SIGN → «SEÑAL»: tu firma es tu señal.|c=the contract;sp=firmar;post=el contrato
signature|firma|n|sígnachur|SIGN (firmar) + ATURE = FIRMA.|Your signature is missing.|Falta tu firma.
draft|borrador|n|draft|DRAFT → «DRAFT»: el BORRADOR que todavía no está listo.|Send me the draft.|Mandame el borrador.
version|versión|n|vérshon|~|This is version two.|Esta es la versión dos.
database|base de datos|n|déitabeis|DATA (datos) + BASE = BASE DE DATOS.|The database is full.|La base de datos está llena.
server|servidor|n|sérver|SERVE (servir) + ER = SERVIDOR.|The server is down.|El servidor está caído.
cloud|nube|n|kláud|CLOUD → «CLAUDIO» vive en la NUBE.|Our data is in the cloud.|Nuestros datos están en la nube.
network|red|n|nétuerk|NET (red) + WORK: la RED que trabaja.|The network is slow.|La red está lenta.
software|software|n|sóftuer|SOFT (blando) + WARE (cosa): la parte blanda de la compu.|We need new software.|Necesitamos software nuevo.|u=1
hardware|hardware / equipos|n|járduer|HARD (duro) + WARE: la parte dura de la compu.|The hardware is old.|El hardware es viejo.|u=1
device|dispositivo|n|diváis|DEVICE → «DIVISO»: un DISPOSITIVO que divisás en la mano.|Restart your device.|Reiniciá tu dispositivo.
laptop|notebook / portátil|n|láptop|LAP (regazo) + TOP (arriba): arriba de las piernas, la PORTÁTIL.|My laptop is slow.|Mi notebook está lenta.
keyboard|teclado|n|kíbord|KEY (tecla) + BOARD (tabla) = TECLADO.|The keyboard is broken.|El teclado está roto.
password|contraseña|n|pásuerd|PASS (pasar) + WORD (palabra): la palabra para pasar es la CONTRASEÑA.|Change your password.|Cambiá tu contraseña.
login|inicio de sesión|n|lóguin|LOG IN: entrar al registro, INICIAR SESIÓN.|The login failed.|El inicio de sesión falló.
backup|copia de seguridad|n|bákap|BACK (atrás) + UP: guardar atrás, la COPIA DE SEGURIDAD.|Make a backup first.|Hacé una copia de seguridad primero.
sort|ordenar|v|sort|SORT → «SUERTE»: ORDENAR las cartas de la suerte.|c=the list;sp=ordenar;post=la lista
export|exportar|v|ekspórt|~|c=the report;sp=exportar;post=el informe
upload|subir un archivo|v|aplóud|UP (arriba) + LOAD (cargar) = SUBIR.|c=the file;sp=subir;post=el archivo
download|descargar|v|dáunloud|DOWN (abajo) + LOAD (cargar) = DESCARGAR.|c=the app;sp=descargar;post=la aplicación
install|instalar|v|instól|~|c=the update;sp=instalar;post=la actualización
upgrade|actualización de versión|n|ápgreid|UP (arriba) + GRADE (grado): subir de grado, MEJORA DE VERSIÓN.|The upgrade is in May.|La actualización es en mayo.
integration|integración|n|integréishon|~|The integration is working.|La integración funciona.
interface|interfaz|n|ínterfeis|~|The new interface is easier.|La nueva interfaz es más fácil.
manager|gerente|n|mánayer|MANAGE (gestionar) + ER = GERENTE.|Talk to the manager.|Hablá con el gerente.
leader|líder|n|líder|~|She is a good leader.|Ella es una buena líder.
boss|jefe|n|bos|BOSS → el «boss» del videojuego: el JEFE final.|My boss is on vacation.|Mi jefe está de vacaciones.
colleague|colega / compañero|n|kólig|~|My colleague can help you.|Mi colega te puede ayudar.
staff|personal|n|staf|STAFF → el PERSONAL de la empresa (staff del evento).|The staff is ready.|El personal está listo.|u=1
hire|contratar|v|jáier|HIRE → «HIGHER»: subir a alguien al equipo, CONTRATAR.|c=a new analyst;sp=contratar;post=a un analista nuevo
career|carrera profesional|n|karíer|~|She has a great career.|Ella tiene una gran carrera.
skill|habilidad|n|skil|SKILL → «ESQUÍ»: esquiar requiere HABILIDAD.|Communication is a key skill.|La comunicación es una habilidad clave.
experience|experiencia|n|ekspíriens|~|He has ten years of experience.|Él tiene diez años de experiencia.|u=1
knowledge|conocimiento|n|nólich (la K no suena)|KNOW (saber) + LEDGE: lo que sabés, tu CONOCIMIENTO.|Share your knowledge.|Compartí tu conocimiento.|u=1
expertise|pericia / experiencia|n|ekspertís|EXPERT (experto) + ISE = PERICIA.|We need your expertise.|Necesitamos tu pericia.|u=1
consultant|consultor|n|konsáltant|~|I am a functional consultant.|Soy consultor funcional.
advice|consejo|n|adváis|ADVICE → «AVISO»: un CONSEJO de amigo.|Thanks for the advice.|Gracias por el consejo.|u=1
challenge|desafío|n|chálench|CHALLENGE → el «challenge» de las redes: un DESAFÍO.|This project is a challenge.|Este proyecto es un desafío.
opportunity|oportunidad|n|oportiúniti|~|It is a great opportunity.|Es una gran oportunidad.
threat|amenaza|n|zret|THREAT → «TRETA»: una AMENAZA.|Competition is a threat.|La competencia es una amenaza.
strength|fortaleza|n|strengz|STRONG (fuerte) → STRENGTH = FORTALEZA.|Our strength is the team.|Nuestra fortaleza es el equipo.
weakness|debilidad|n|uíknes|WEAK (débil) + NESS = DEBILIDAD.|What is our weakness?|¿Cuál es nuestra debilidad?
decision|decisión|n|disíshon|~|We made a decision.|Tomamos una decisión.
decide|decidir|v|disáid|~|c=the next step;sp=decidir;post=el próximo paso
choose|elegir|v|chus|CHOOSE → «CHUS»: ELEGIR el chupetín.|c=a supplier;sp=elegir;post=un proveedor;f=choose/chooses/chose/chosen/choosing
alternative|alternativa|n|oltérnativ|~|Is there an alternative?|¿Hay una alternativa?
advantage|ventaja|n|advántich|ADVANTAGE → «AVANZAR»: ir adelante, la VENTAJA.|Speed is our advantage.|La velocidad es nuestra ventaja.
benefit|beneficio|n|bénefit|~|What is the benefit?|¿Cuál es el beneficio?
impact|impacto|n|ímpakt|~|What is the impact on costs?|¿Cuál es el impacto en los costos?
effect|efecto|n|ifékt|~|The change had a good effect.|El cambio tuvo un buen efecto.
cause|causa|n|kos|~|What is the root cause?|¿Cuál es la causa raíz?
outcome|resultado|n|áutkam|OUT (afuera) + COME (venir): lo que sale, el RESULTADO.|The outcome was positive.|El resultado fue positivo.
evidence|evidencia / pruebas|n|évidens|~|Do we have evidence?|¿Tenemos evidencia?|u=1
fact|hecho / dato|n|fakt|FACT → «de facto»: un HECHO.|That is a fact.|Eso es un hecho.
figure|cifra|n|fíguer|FIGURE → «FIGURA»: los números son figuras, CIFRAS.|Check the sales figures.|Revisá las cifras de ventas.
average|promedio|n|ávereich|AVERAGE → «A VER EL MEDIO»: el PROMEDIO.|The average is 50.|El promedio es 50.
ratio|proporción / ratio|n|réishio|~|The ratio is two to one.|La proporción es de dos a uno.
market|mercado|n|márket|~|The market is growing.|El mercado está creciendo.
industry|industria|n|índustri|~|We work in the food industry.|Trabajamos en la industria alimenticia.
competitor|competidor|n|kompétitor|~|Our competitor lowered prices.|Nuestro competidor bajó los precios.
competition|competencia|n|kompetíshon|~|Competition is strong.|La competencia es fuerte.|u=1
feature|funcionalidad / característica|n|fícher|FEATURE → «FIGURA» del producto: su CARACTERÍSTICA.|This feature is new.|Esta funcionalidad es nueva.
function|función|n|fánkshon|~|What is its function?|¿Cuál es su función?
fit|encaje / ajuste|n|fit|FIT → la ropa «fit»: que ENCAJE bien.|It is a good fit for us.|Encaja bien con nosotros.
invest|invertir|v|invést|~|c=money;sp=invertir;post=dinero
fund|fondo|n|fand|FUND → «FONDO» de inversión.|We have a fund for training.|Tenemos un fondo para capacitación.
capital|capital|n|kápital|~|We need more capital.|Necesitamos más capital.|u=1
retail|venta minorista|n|ríteil|RETAIL → «RETAZO»: vender de a retazos, al por MENOR.|We sell retail and wholesale.|Vendemos al por menor y al por mayor.|u=1
store|tienda|n|stor|STORE → la «store» de apps: la TIENDA.|The store opens at nine.|La tienda abre a las nueve.
shop|negocio / tienda|n|shop|SHOP → el SHOPPING: TIENDAS.|I bought it at a small shop.|Lo compré en un negocio chico.
cashier|cajero|n|kashíer|CASH (efectivo) + IER = CAJERO.|Pay at the cashier.|Pagá en la caja.
coupon|cupón|n|kúpon|~|Use this coupon.|Usá este cupón.
loyalty|lealtad / fidelidad|n|lóialti|LOYAL (leal) + TY = LEALTAD.|Join our loyalty program.|Sumate a nuestro programa de fidelidad.|u=1
promotion|promoción / ascenso|n|promóushon|~|She got a promotion.|Ella consiguió un ascenso.
campaign|campaña|n|kampéin (la G no suena)|~|The campaign starts in May.|La campaña empieza en mayo.
advertising|publicidad|n|ádvertaising|ADVERTISE (anunciar) + ING = PUBLICIDAD.|We spend a lot on advertising.|Gastamos mucho en publicidad.|u=1
marketing|marketing|n|márketing|~|Marketing prepared the campaign.|Marketing preparó la campaña.|u=1
email|correo electrónico|n|ímeil|~|I sent you an email.|Te mandé un correo.
message|mensaje|n|mésich|~|Leave a message.|Dejá un mensaje.
mail|correo|n|méil|MAIL → «MEIL»: el CORREO.|Check your mail.|Revisá tu correo.|u=1
attachment|adjunto|n|atáchment|ATTACH (adjuntar) + MENT = ADJUNTO.|Open the attachment.|Abrí el adjunto.
folder|carpeta|n|fóulder|FOLD (doblar) + ER: el papel doblado es una CARPETA.|Save it in the shared folder.|Guardalo en la carpeta compartida.
link|enlace / vínculo|n|link|LINK → «LINK»: un ENLACE.|Send me the link.|Mandame el enlace.
website|sitio web|n|uébsait|WEB + SITE (sitio) = SITIO WEB.|Visit our website.|Visitá nuestro sitio web.
page|página|n|péich|~|Go to page ten.|Andá a la página diez.
window|ventana|n|uíndou|WINDOW → «WINDOWS»: VENTANAS.|Close that window.|Cerrá esa ventana.
print|imprimir|v|print|PRINT → la tecla PRINT: IMPRIMIR.|c=the labels;sp=imprimir;post=las etiquetas
copy|copiar|v|kópi|~|c=the text;sp=copiar;post=el texto
paste|pegar|v|péist|PASTE → «PASTA»: PEGAR con pasta.|c=the data;sp=pegar;post=los datos
edit|editar|v|édit|~|c=the document;sp=editar;post=el documento
remove|quitar / eliminar|v|rimúv|RE + MOVE (mover): mover afuera es QUITAR.|c=the old items;sp=quitar;post=los artículos viejos
replace|reemplazar|v|ripléis|RE + PLACE (lugar): poner en el lugar de otro, REEMPLAZAR.|c=the part;sp=reemplazar;post=la pieza
verify|verificar|v|vérifai|~|c=the data;sp=verificar;post=los datos
validate|validar|v|válideit|~|c=the results;sp=validar;post=los resultados
launch|lanzar|v|lonch|LAUNCH → LANZAR el cohete (no confundir con LUNCH, almuerzo).|c=the new product;sp=lanzar;post=el producto nuevo
lead|liderar / dirigir|v|lid|LEAD → «LÍDER»: LIDERAR.|c=the project;sp=liderar;post=el proyecto;f=lead/leads/led/led/leading
organize|organizar|v|órganaiz|~|c=the meeting;sp=organizar;post=la reunión
prepare|preparar|v|pripéer|~|c=the presentation;sp=preparar;post=la presentación
discuss|conversar / tratar|v|diskás|DISCUSS no es pelear: es CONVERSAR un tema.|c=the budget;sp=conversar;post=sobre el presupuesto
explain|explicar|v|ekspléin|~|c=the process;sp=explicar;post=el proceso
agree|estar de acuerdo|v|agrí|AGREE → «AGRADAR»: lo que te agrada, con eso ESTÁS DE ACUERDO.|c=with the plan;sp=coincidir;post=con el plan;s=1
suggest|sugerir|v|sayést|~|c=a solution;sp=sugerir;post=una solución
propose|proponer|v|propóus|~|c=a new date;sp=proponer;post=una fecha nueva
recommend|recomendar|v|rekománd|~|c=this supplier;sp=recomendar;post=este proveedor
provide|brindar / proveer|v|prováid|PROVIDE → «PROVEER».|c=support;sp=brindar;post=soporte
offer|ofrecer|v|ófer|OFFER → «OFERTA»: OFRECER.|c=a discount;sp=ofrecer;post=un descuento
receive|recibir|v|risív|~|c=the goods;sp=recibir;post=la mercadería
attend|asistir|v|aténd|Falso amigo: ATTEND es ASISTIR a una reunión (no «atender»).|c=the meeting;sp=asistir;post=a la reunión
join|sumarse / unirse|v|yóin|JOIN → «YOIN»: SUMARSE al grupo.|c=the call;sp=sumar;post=a la llamada;rf=1
follow|seguir|v|fólou|FOLLOW → los FOLLOWERS te SIGUEN.|c=the instructions;sp=seguir;post=las instrucciones
prioritize|priorizar|v|praióritaiz|~|c=the urgent tasks;sp=priorizar;post=las tareas urgentes
achieve|lograr|v|achív|ACHIEVE → «ACHIVE»: LOGRAR el objetivo.|c=the goal;sp=lograr;post=el objetivo
reach|alcanzar / llegar|v|rich|REACH → «RICH» (rico): ALCANZAR la riqueza.|c=the target;sp=alcanzar;post=la meta
meet|reunirse / conocer|v|mit|MEET → el MEETING: REUNIRSE.|c=the client;sp=reunir;post=con el cliente;rf=1;f=meet/meets/met/met/meeting
calculate|calcular|v|kálkiuleit|~|c=the total;sp=calcular;post=el total
compare|comparar|v|kompéer|~|c=the prices;sp=comparar;post=los precios
analyze|analizar|v|ánalaiz|~|c=the data;sp=analizar;post=los datos
describe|describir|v|diskráib|~|c=the problem;sp=describir;post=el problema
include|incluir|v|inklúd|~|c=the tax;sp=incluir;post=el impuesto
contain|contener|v|kontéin|~|c=errors;sp=contener;post=errores;s=1
depend|depender|v|dipénd|~|c=on the budget;sp=depender;post=del presupuesto;s=1
involve|involucrar|v|invólv|~|c=the whole team;sp=involucrar;post=a todo el equipo
affect|afectar|v|afékt|~|c=the price;sp=afectar;post=el precio
solve|resolver|v|solv|SOLVE → «SOLVENTAR»: RESOLVER.|c=the problem;sp=resolver;post=el problema
avoid|evitar|v|avóid|AVOID → «A VOID» (al vacío): mandarlo al vacío, EVITAR.|c=delays;sp=evitar;post=demoras
prevent|prevenir|v|privént|~|c=accidents;sp=prevenir;post=accidentes
ensure|asegurar|v|enshúr|EN + SURE (seguro) = ASEGURAR.|c=quality;sp=asegurar;post=la calidad
busy|ocupado|adj|bízi|BUSY → «BISI»: ocupado como una abeja (busy bee).|I am busy right now.|Estoy ocupado ahora.
free|libre / gratis|adj|fri|FREE → «FRÍO»: tenés la tarde LIBRE para tomar algo frío.|Are you free tomorrow?|¿Estás libre mañana?
ready|listo|adj|rédi|READY → «REDI»: ¡LISTO, ya!|The report is ready.|El informe está listo.
early|temprano|adv|érli|EARLY → «ERLI»: el que madruga llega TEMPRANO.|Please come early.|Por favor vení temprano.
late|tarde / atrasado|adj|léit|LATE → «LEIT»: LLEGASTE TARDE.|Sorry, I am late.|Perdón, llego tarde.
quick|rápido|adj|kuík|QUICK → «QUIQUE» corre RÁPIDO.|Let's have a quick call.|Hagamos una llamada rápida.
fast|rápido|adj|fast|FAST FOOD es comida RÁPIDA.|The new server is fast.|El servidor nuevo es rápido.
slow|lento|adj|slóu|SLOW MOTION es cámara LENTA.|The system is slow today.|El sistema está lento hoy.
easy|fácil|adj|ízi|EASY → «ISI»: ¡qué FÁCIL!|It is an easy task.|Es una tarea fácil.
difficult|difícil|adj|dífikalt|~|This is a difficult case.|Este es un caso difícil.
hard|difícil / duro|adj|jard|HARD ROCK es música DURA.|It is hard to explain.|Es difícil de explicar.
complex|complejo|adj|kómpleks|~|The process is complex.|El proceso es complejo.
clear|claro|adj|klíer|CLEAR → «CLARO», casi igual.|Is it clear?|¿Está claro?
accurate|preciso / exacto|adj|ákiurat|ACCURATE → «A CURA»: preciso como un cirujano que cura.|The data is accurate.|Los datos son precisos.
valid|válido|adj|válid|~|This code is not valid.|Este código no es válido.
previous|anterior|adj|príviós|PREVIOUS → «PREVIO», el ANTERIOR.|Go back to the previous screen.|Volvé a la pantalla anterior.
following|siguiente|adj|fólouing|FOLLOW (seguir) + ING = SIGUIENTE.|Read the following steps.|Leé los siguientes pasos.
key|clave|adj|ki|KEY = LLAVE: lo que abre todo es la CLAVE.|This is a key point.|Este es un punto clave.
critical|crítico|adj|krítikal|~|This asset is critical.|Este activo es crítico.
optional|opcional|adj|ópshonal|~|This field is optional.|Este campo es opcional.
flexible|flexible|adj|fléksibol|~|We need a flexible solution.|Necesitamos una solución flexible.
efficient|eficiente|adj|ifíshent|~|The new process is efficient.|El proceso nuevo es eficiente.
effective|eficaz|adj|iféktiv|~|It was an effective meeting.|Fue una reunión eficaz.
successful|exitoso|adj|saksésful|SUCCESS (éxito) + FUL = EXITOSO.|The launch was successful.|El lanzamiento fue exitoso.
reliable|confiable|adj|riláiabol|RELY (confiar) + ABLE = CONFIABLE.|He is a reliable supplier.|Es un proveedor confiable.
expensive|caro|adj|ekspénsiv|EXPENSE (gasto) + IVE: lo que te hace gastar es CARO.|This tool is expensive.|Esta herramienta es cara.
cheap|barato|adj|chip|CHEAP → «CHIP»: un chip BARATO.|The other option is cheap.|La otra opción es barata.
profitable|rentable|adj|prófitabol|PROFIT (ganancia) + ABLE = RENTABLE.|The product is profitable.|El producto es rentable.
weekly|semanal|adj|uíkli|WEEK (semana) + LY = SEMANAL.|We have a weekly review.|Tenemos una revisión semanal.
annual|anual|adj|ániual|~|The annual report is out.|Salió el informe anual.
quarterly|trimestral|adj|kuórterli|QUARTER (trimestre) + LY = TRIMESTRAL.|We do a quarterly inspection.|Hacemos una inspección trimestral.
global|global|adj|glóubal|~|It is a global company.|Es una empresa global.
local|local|adj|lóukal|~|We use a local supplier.|Usamos un proveedor local.
international|internacional|adj|internáshonal|~|We ship to international customers.|Enviamos a clientes internacionales.
public|público|adj|páblik|~|This is public information.|Esta es información pública.
private|privado|adj|práivet|~|This is a private meeting.|Esta es una reunión privada.
external|externo|adj|ekstérnal|~|We hired an external consultant.|Contratamos a un consultor externo.
legal|legal|adj|lígal|~|Check the legal requirements.|Revisá los requisitos legales.
functional|funcional|adj|fánkshonal|~|I wrote the functional design.|Escribí el diseño funcional.
operational|operativo|adj|operéishonal|~|The plant is operational.|La planta está operativa.
commercial|comercial|adj|komérshal|~|Talk to the commercial team.|Hablá con el equipo comercial.
digital|digital|adj|díyital|~|We sign digital invoices.|Firmamos facturas digitales.
automatic|automático|adj|otomátik|~|The backup is automatic.|La copia de seguridad es automática.
already|ya|adv|olrédi|ALL + READY (listo): todo listo, YA.|I already sent it.|Ya lo mandé.
usually|generalmente|adv|iúshuali|USUAL (habitual) + LY = GENERALMENTE.|I usually start at eight.|Generalmente empiezo a las ocho.
often|a menudo|adv|ófen (la T no suena)|OFTEN → «OFTEN»: lo hacés A MENUDO.|We often work late.|A menudo trabajamos hasta tarde.
sometimes|a veces|adv|sámtaims|SOME (algunas) + TIMES (veces) = A VECES.|Sometimes the system fails.|A veces el sistema falla.
rarely|rara vez|adv|réerli|RARE (raro) + LY = RARA VEZ.|He rarely misses a meeting.|Él rara vez falta a una reunión.
soon|pronto|adv|sun|SOON → «SUN» (sol): PRONTO sale el sol.|See you soon.|Nos vemos pronto.
later|más tarde|adv|léiter|LATE (tarde) + R = MÁS TARDE.|I will call you later.|Te llamo más tarde.
recently|recientemente|adv|rísentli|~|We recently changed suppliers.|Recientemente cambiamos de proveedor.
currently|actualmente|adv|kárrentli|CURRENT (actual) + LY = ACTUALMENTE.|We are currently testing.|Actualmente estamos probando.
finally|finalmente|adv|fáinali|~|We finally finished.|Finalmente terminamos.
actually|en realidad (¡no «actualmente»!)|adv|ákchuali|Falso amigo: ACTUALLY es EN REALIDAD.|Actually, it is easier.|En realidad, es más fácil.
especially|especialmente|adv|ispéshali|~|Especially in December.|Especialmente en diciembre.
probably|probablemente|adv|próbabli|~|It will probably rain.|Probablemente llueva.
certainly|sin duda|adv|sértenli|CERTAIN (cierto) + LY: CIERTAMENTE, sin duda.|We will certainly finish.|Sin duda vamos a terminar.
exactly|exactamente|adv|igsáktli|~|That is exactly the problem.|Ese es exactamente el problema.
quickly|rápidamente|adv|kuíkli|QUICK (rápido) + LY = RÁPIDAMENTE.|Please reply quickly.|Por favor respondé rápido.
carefully|con cuidado|adv|kéerfuli|CARE (cuidado) + FUL + LY = CON CUIDADO.|Read it carefully.|Leelo con cuidado.
almost|casi|adv|ólmoust|ALL + MOST: casi todo, CASI.|We are almost done.|Ya casi terminamos.
quite|bastante|adv|kuáit|QUITE → «CUÁIT»: BASTANTE (no confundir con QUIET, silencioso).|It is quite expensive.|Es bastante caro.
instead|en cambio / en lugar de eso|adv|instéd|IN + STEAD (lugar) = EN LUGAR DE.|Use this one instead.|Usá este en cambio.
however|sin embargo|adv|jauéver|HOW + EVER: como sea, SIN EMBARGO.|However, we need approval.|Sin embargo, necesitamos aprobación.
therefore|por lo tanto|adv|déerfor|THERE + FORE: por eso, POR LO TANTO.|Therefore, we cancel the order.|Por lo tanto, cancelamos el pedido.
otherwise|de lo contrario|adv|ódersuaiz|OTHER (otro) + WISE (modo): de otro modo, SI NO.|Pay today, otherwise you pay a fee.|Pagá hoy; de lo contrario pagás un recargo.
meanwhile|mientras tanto|adv|mínuail|MEAN + WHILE (mientras) = MIENTRAS TANTO.|Meanwhile, check the data.|Mientras tanto, revisá los datos.
anyway|de todos modos|adv|éniuei|ANY (cualquier) + WAY (camino) = DE TODOS MODOS.|Thanks anyway.|Gracias de todos modos.
yet|todavía|adv|iet|YET → «not yet»: TODAVÍA no.|I haven't finished yet.|Todavía no terminé.
ago|hace (tiempo)|adv|agóu|AGO → «A GO» (se fue): hace tiempo que se fue.|I called him two days ago.|Lo llamé hace dos días.
approximately|aproximadamente|adv|apróksimatli|~|It takes approximately an hour.|Tarda aproximadamente una hora.
mainly|principalmente|adv|méinli|MAIN (principal) + LY = PRINCIPALMENTE.|We mainly sell oil.|Principalmente vendemos aceite.
mostly|mayormente|adv|móustli|MOST (la mayoría) + LY = MAYORMENTE.|The team is mostly remote.|El equipo es mayormente remoto.
completely|completamente|adv|komplítli|~|I completely agree.|Estoy completamente de acuerdo.
correctly|correctamente|adv|koréktli|~|Fill it in correctly.|Completalo correctamente.
simply|simplemente|adv|símpli|~|Simply click here.|Simplemente hacé clic acá.
specifically|específicamente|adv|spesífikli|~|Specifically, the tax module.|Específicamente, el módulo de impuestos.
unfortunately|lamentablemente|adv|anfórchunatli|UN (no) + FORTUNATE (afortunado) = LAMENTABLEMENTE.|Unfortunately, it failed.|Lamentablemente, falló.
hopefully|ojalá|adv|jóupfuli|HOPE (esperanza) + FUL + LY = OJALÁ.|Hopefully, we finish today.|Ojalá terminemos hoy.
obviously|obviamente|adv|óbviosli|~|Obviously, we need more time.|Obviamente, necesitamos más tiempo.
eventually|al final (¡no «eventualmente»!)|adv|ivénchuali|Falso amigo: EVENTUALLY es AL FINAL, tarde o temprano.|Eventually, they agreed.|Al final, estuvieron de acuerdo.
become|convertirse|v|bikám|BE + COME: venir a ser, CONVERTIRSE.|c=a manager;sp=convertir;post=en gerente;rf=1;f=become/becomes/became/become/becoming
begin|comenzar|v|biguín|BEGIN → «BEGUÍN»: COMENZAR.|c=the meeting;sp=comenzar;post=la reunión;f=begin/begins/began/begun/beginning
bring|traer|v|bring|BRING → «BRINDAR»: TRAER algo para el brindis.|c=the documents;sp=traer;post=los documentos;f=bring/brings/brought/brought/bringing
cut|recortar / cortar|v|kat|CUT → «CORTAR».|c=costs;sp=recortar;post=costos;f=cut/cuts/cut/cut/cutting
draw|dibujar|v|dro|DRAW → «DRO»: DIBUJAR un dragón.|c=the diagram;sp=dibujar;post=el diagrama;f=draw/draws/drew/drawn/drawing
drive|manejar un vehículo|v|dráiv|DRIVE → el DRIVER es el que MANEJA.|c=the truck;sp=manejar;post=el camión;f=drive/drives/drove/driven/driving
eat|comer|v|it|EAT → «IT»: COMER.|c=lunch at noon;sp=almorzar;post=al mediodía;f=eat/eats/ate/eaten/eating
fill|llenar / completar|v|fil|FILL → «FILA»: LLENAR la fila.|c=the form;sp=llenar;post=el formulario
forget|olvidar|v|forguét|FOR + GET: lo que no conseguís recordar, lo OLVIDÁS.|c=the password;sp=olvidar;post=la contraseña;f=forget/forgets/forgot/forgotten/forgetting
hope|esperar (con esperanza)|v|jóup|HOPE → «JOP»: la ESPERANZA.|c=for good news;sp=esperar;post=buenas noticias;s=1
learn|aprender|v|lern|LEARN → «LERN»: APRENDER inglés.|c=English;sp=aprender;post=inglés
lose|perder|v|luz|LOSE → «LUZ»: PERDER la luz.|c=the file;sp=perder;post=el archivo;f=lose/loses/lost/lost/losing
matter|importar|v|máter|MATTER → «MATERIA»: lo que tiene materia IMPORTA.|c=;sp=importar;post=;sj=it;s=1
miss|perder / extrañar|v|mis|MISS → «MISS»: EXTRAÑAR a alguien, PERDER el tren.|c=the deadline;sp=perder;post=la fecha límite
move|mover|v|muv|MOVE → «MUV»: MOVER.|c=the meeting;sp=mover;post=la reunión
read|leer|v|rid|READ → «RID»: LEER (en pasado se dice «red»).|c=the contract;sp=leer;post=el contrato;f=read/reads/read/read/reading
run|ejecutar / correr|v|ran|RUN → «RAN»: CORRER y EJECUTAR un proceso.|c=the report;sp=ejecutar;post=el informe;f=run/runs/ran/run/running
sell|vender|v|sel|SELL → «SELLO»: VENDER con sello.|c=more products;sp=vender;post=más productos;f=sell/sells/sold/sold/selling
set|fijar / configurar|v|set|SET → «SET»: FIJAR, poner en su lugar.|c=a deadline;sp=fijar;post=una fecha límite;f=set/sets/set/set/setting
sit|sentarse|v|sit|SIT DOWN → SENTATE.|c=next to the window;sp=sentar;post=junto a la ventana;rf=1;f=sit/sits/sat/sat/sitting
sleep|dormir|v|slip|SLEEP → «SLIP»: DORMIR en slip.|c=eight hours;sp=dormir;post=ocho horas;f=sleep/sleeps/slept/slept/sleeping
speak|hablar|v|spik|SPEAK → el SPEAKER (parlante) HABLA.|c=English;sp=hablar;post=inglés;f=speak/speaks/spoke/spoken/speaking
spend|gastar / pasar tiempo|v|spend|SPEND → «EXPENDER»: GASTAR plata.|c=money;sp=gastar;post=dinero;f=spend/spends/spent/spent/spending
teach|enseñar|v|tich|TEACH → el TEACHER ENSEÑA.|c=the new users;sp=enseñar;post=a los usuarios nuevos;f=teach/teaches/taught/taught/teaching
turn|encender / girar|v|tern|TURN → «TURNO»: tu turno de ENCENDER la máquina.|c=on the computer;sp=encender;post=la computadora
walk|caminar|v|uók (la L no suena)|WALK → el WALKMAN: CAMINAR con música.|c=to the office;sp=caminar;post=a la oficina
win|ganar|v|uín|WIN → el WINNER: GANAR.|c=the contract;sp=ganar;post=el contrato;f=win/wins/won/won/winning
write|escribir|v|ráit|WRITE → el WRITER: ESCRIBIR.|c=the minutes;sp=escribir;post=la minuta;f=write/writes/wrote/written/writing
seem|parecer|v|sim|SEEM → «SIM»: PARECE que sí.|c=fine;sp=parecer;post=bien;sj=it;s=1
appear|aparecer|v|apíer|~|c=on the screen;sp=aparecer;post=en la pantalla;sj=it
expect|esperar (algo)|v|ekspékt|EXPECT → «EXPECTATIVA».|c=a delay;sp=esperar;post=una demora;s=1
consider|considerar|v|konsíder|~|c=other options;sp=considerar;post=otras opciones
continue|continuar|v|kontíniu|~|c=the meeting;sp=continuar;post=la reunión
develop|desarrollar|v|divélop|DEVELOP → el DEVELOPER DESARROLLA.|c=a new module;sp=desarrollar;post=un módulo nuevo
imagine|imaginar|v|imáyin|~|c=the result;sp=imaginar;post=el resultado;s=1
prefer|preferir|v|prifér|~|c=email;sp=preferir;post=el correo;s=1
produce|producir|v|prodiús|~|c=spare parts;sp=producir;post=repuestos
raise|subir / plantear|v|réiz|RAISE → «RAÍZ»: levantar desde la raíz, SUBIR.|c=the prices;sp=subir;post=los precios
realize|darse cuenta|v|ríalaiz|Falso amigo: REALIZE es DARSE CUENTA (no «realizar»).|c=the mistake;sp=dar;post=cuenta del error;rf=1;s=1
recognize|reconocer|v|rékognaiz|~|c=the problem;sp=reconocer;post=el problema
remain|permanecer|v|riméin|~|c=open;sp=permanecer;post=abierto;sj=it;s=1
serve|atender / servir|v|serv|~|c=the customers;sp=atender;post=a los clientes
worry|preocuparse|v|uórri|WORRY → «GÜERRI»: PREOCUPARSE por la guerra.|c=about the deadline;sp=preocupar;post=por la fecha límite;rf=1
wish|desear|v|uísh|WISH → la WISHLIST: lo que DESEÁS.|c=you luck;sp=desear;pre=te;post=suerte;s=1
reply|responder|v|ripláí|REPLY → «REPLICAR»: RESPONDER.|c=the email;sp=responder;post=el correo
minutes|minuta / acta|n|mínits|MINUTES: los minutos anotados de la reunión, la MINUTA.|Send the meeting minutes.|Mandá la minuta de la reunión.|u=1
trip|viaje|n|trip|TRIP → «TRIPA»: el VIAJE te revuelve la tripa.|I have a business trip.|Tengo un viaje de negocios.
shift|turno|n|shift|SHIFT → la tecla SHIFT cambia: el TURNO que cambia.|I work the night shift.|Trabajo en el turno noche.
overtime|horas extra|n|óuvertaim|OVER (de más) + TIME = HORAS EXTRA.|We worked overtime.|Hicimos horas extra.|u=1
contractor|contratista|n|kontráktor|~|The contractor fixed the roof.|El contratista arregló el techo.
headquarters|casa central|n|jedkuórters|HEAD (cabeza) + QUARTERS (cuarteles) = CASA CENTRAL.|Headquarters is in Asunción.|La casa central está en Asunción.|u=1
board|directorio / tablero|n|bord|BOARD → «BORDE» de la mesa del DIRECTORIO.|The board approved the budget.|El directorio aprobó el presupuesto.
shareholder|accionista|n|shéerjoulder|SHARE (acción) + HOLDER (tenedor) = ACCIONISTA.|Shareholders want profit.|Los accionistas quieren ganancias.
complaint|reclamo / queja|n|kompléint|COMPLAIN (quejarse) + T = RECLAMO.|We received a complaint.|Recibimos un reclamo.
claim|reclamo|n|kléim|CLAIM → «CLAMAR»: RECLAMAR.|File a warranty claim.|Presentá un reclamo de garantía.
fee|cargo / honorario|n|fi|FEE → «FI»: la FICHA que pagás, el CARGO.|There is a small fee.|Hay un pequeño cargo.
currency|moneda|n|kárrensi|CURRENCY → «CORRIENTE»: la plata que corre, la MONEDA.|The currency is the guaraní.|La moneda es el guaraní.
exchange|cambio / intercambio|n|ikschéinch|EX + CHANGE (cambio) = INTERCAMBIO.|Check the exchange rate.|Revisá el tipo de cambio.
bank|banco|n|bank|~|Go to the bank.|Andá al banco.
spreadsheet|planilla de cálculo|n|spréidshit|SPREAD (extender) + SHEET (hoja) = PLANILLA.|Send me the spreadsheet.|Mandame la planilla.
sheet|hoja|n|shit|SHEET → una hoja de papel (SPREADSHEET = planilla).|Use a new sheet.|Usá una hoja nueva.
row|fila|n|róu|ROW → «ROU»: la FILA de remeros (to row es remar).|Delete this row.|Borrá esta fila.
cell|celda|n|sel|~|Click the cell.|Hacé clic en la celda.
batch|lote|n|bach|BATCH → «BACHE»: un LOTE de baches.|This batch is defective.|Este lote está defectuoso.
serial|de serie|adj|sírial|~|Write down the serial number.|Anotá el número de serie.
expiration|vencimiento|n|ekspiréishon|EXPIRE (expirar) + ATION = VENCIMIENTO.|Check the expiration date.|Revisá la fecha de vencimiento.
damage|daño|n|dámich|DAMAGE → DAÑO hecho con MAGIA mala.|There is damage to the box.|La caja tiene un daño.
defect|defecto|n|dífekt|~|We found a defect.|Encontramos un defecto.
repair|reparación|n|ripéer|REPAIR ≈ «REPARAR».|The repair took two days.|La reparación tardó dos días.
safety|seguridad física|n|séifti|SAFE (seguro) + TY = SEGURIDAD.|Safety first.|La seguridad primero.|u=1
permit|permiso (documento)|n|pérmit|~|You need a work permit.|Necesitás un permiso de trabajo.
machine|máquina|n|mashín|~|The machine stopped.|La máquina se detuvo.
fleet|flota|n|flit|FLEET → «FLOTA», casi igual.|The company has a big fleet.|La empresa tiene una flota grande.
fuel|combustible|n|fiúel|FUEL → «FUEGO»: lo que alimenta el fuego, el COMBUSTIBLE.|Fuel prices went up.|Subieron los precios del combustible.|u=1
mileage|kilometraje|n|máileich|MILE (milla) + AGE = KILOMETRAJE.|What is the mileage?|¿Cuál es el kilometraje?|u=1
appointment|cita / turno|n|apóintment|APPOINT (designar) + MENT = CITA.|I have an appointment at three.|Tengo un turno a las tres.
reminder|recordatorio|n|rimáinder|REMIND (recordar) + ER = RECORDATORIO.|Set a reminder.|Poné un recordatorio.
progress|avance / progreso|n|prógres|~|We made good progress.|Hicimos un buen avance.|u=1
delay|demora|n|diléi|DELAY → «DILEI»: DEMORA, como «dilatar».|Sorry for the delay.|Perdón por la demora.
workload|carga de trabajo|n|uérkloud|WORK + LOAD (carga) = CARGA DE TRABAJO.|My workload is heavy.|Mi carga de trabajo es pesada.|u=1
summary|resumen|n|sámari|SUM (suma) + MARY: la suma de todo, el RESUMEN.|Write a short summary.|Escribí un resumen corto.
conclusion|conclusión|n|konklúshon|~|What is the conclusion?|¿Cuál es la conclusión?
overview|panorama general|n|óuverviu|OVER (sobre) + VIEW (vista): la vista desde arriba, el PANORAMA.|Give me an overview.|Dame un panorama general.
background|antecedentes / fondo|n|bákgraund|BACK (atrás) + GROUND (suelo): lo que está atrás, el FONDO.|What is your background?|¿Cuál es tu formación?
purpose|propósito|n|pérpos|~|What is the purpose of the meeting?|¿Cuál es el propósito de la reunión?
answer|respuesta|n|ánser (la W no suena)|ANSWER → «ANSER»: la RESPUESTA.|I need an answer today.|Necesito una respuesta hoy.
notice|aviso|n|nóutis|NOTICE → «NOTICIA»: un AVISO.|We got a notice from the bank.|Recibimos un aviso del banco.
announcement|anuncio|n|anáunsment|ANNOUNCE (anunciar) + MENT = ANUNCIO.|Read the announcement.|Leé el anuncio.
invitation|invitación|n|invitéishon|~|Accept the meeting invitation.|Aceptá la invitación a la reunión.
conference|conferencia|n|kónferens|~|The conference is in May.|La conferencia es en mayo.
speaker|orador / parlante|n|spíker|SPEAK (hablar) + ER: el que habla, el ORADOR.|The speaker was great.|El orador estuvo genial.
audience|público|n|ódiens|~ (AUDIENCE ≈ AUDIENCIA)|The audience liked it.|Al público le gustó.
lesson|lección|n|léson|~|We learned a lesson.|Aprendimos una lección.
mistake|error / equivocación|n|mistéik|MIS (mal) + TAKE (tomar): tomar mal, EQUIVOCARSE.|It was my mistake.|Fue mi error.
failure|falla / fracaso|n|féiliur|FAIL (fallar) + URE = FALLA.|There was a system failure.|Hubo una falla del sistema.
success|éxito|n|saksés|SUCCESS → «SUCESO»: un suceso feliz es un ÉXITO.|The project was a success.|El proyecto fue un éxito.
approach|enfoque|n|apróuch|APPROACH → «APROXIMAR»: tu forma de acercarte, el ENFOQUE.|Let's try a new approach.|Probemos un enfoque nuevo.
method|método|n|mézod|~|This method works.|Este método funciona.
capacity|capacidad|n|kapásiti|~|The warehouse is at full capacity.|El almacén está a plena capacidad.
volume|volumen|n|vóliúm|~|The sales volume grew.|El volumen de ventas creció.
size|tamaño|n|sáiz|SIZE → «SAIS»: ¿de qué TAMAÑO es? (también talle).|What size is the box?|¿De qué tamaño es la caja?
length|longitud / duración|n|lengz|LONG (largo) → LENGTH = LONGITUD.|What is the length of the cable?|¿Cuál es la longitud del cable?
width|ancho|n|uídz|WIDE (ancho) → WIDTH = ANCHO.|Measure the width.|Medí el ancho.
temperature|temperatura|n|témperachur|~|Check the temperature.|Revisá la temperatura.
pressure|presión|n|préshur|~|The oil pressure is low.|La presión del aceite es baja.
energy|energía|n|éneryi|~|We want to save energy.|Queremos ahorrar energía.|u=1
power|energía / poder|n|páuer|POWER → «POWER»: la ENERGÍA, el PODER.|There is no power in the plant.|No hay energía en la planta.|u=1
water|agua|n|uóter|WATER → «WÁTER»: el baño tiene AGUA.|The pump moves water.|La bomba mueve agua.|u=1
waste|desperdicio / residuo|n|uéist|WASTE → «GÜEIST»: gastar de más es DESPERDICIO.|Reduce waste.|Reducí el desperdicio.|u=1
`;

  /* ---------- armado de las entradas ---------- */
  const isNode = typeof module !== "undefined" && module.exports;
  const BASE = isNode ? require("./words.js") : root.WORDS;
  const G = isNode ? require("./grammar.js") : root.Grammar;
  const TOTAL = 1000;

  // Verbos regulares que duplican la última consonante (stopped, planning).
  const DOUBLE = new Set(["plan", "ship", "scan", "submit", "admit", "commit", "prefer", "refer", "transfer", "stop", "drop", "chat", "log", "tap"]);

  function third(b) {
    if (/(s|x|z|ch|sh)$/.test(b)) return b + "es";
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ies";
    if (/o$/.test(b)) return b + "es";
    return b + "s";
  }
  function past(b) {
    if (/e$/.test(b)) return b + "d";
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ied";
    if (DOUBLE.has(b)) return b + b.slice(-1) + "ed";
    return b + "ed";
  }
  function ing(b) {
    if (/ie$/.test(b)) return b.slice(0, -2) + "ying";
    if (/[^eoy]e$/.test(b)) return b.slice(0, -1) + "ing";
    if (DOUBLE.has(b)) return b + b.slice(-1) + "ing";
    return b + "ing";
  }
  function plural(n) {
    if (/(s|x|z|ch|sh)$/.test(n)) return n + "es";
    if (/[^aeiou]y$/.test(n)) return n.slice(0, -1) + "ies";
    return n + "s";
  }

  function cognate(w, es) {
    return "Se parece al castellano: " + w.toUpperCase() + " ≈ «" + es.split(" / ")[0].replace(/ \(.*\)$/, "") + "». ¡Ya la conocés!";
  }

  function parse() {
    const lists = { R: [], N: [] };
    let src = "R";
    RAW.split("\n").forEach(line => {
      line = line.trim();
      if (!line) return;
      if (line === "#R" || line === "#N") { src = line[1]; return; }
      const p = line.split("|");
      const t = p[2];
      const isVerb = t === "v";
      const [w, es, , pr, mn] = p;
      const extraRaw = isVerb ? p[5] : p[7];
      const x = {};
      (extraRaw || "").split(";").filter(Boolean).forEach(kv => {
        const i = kv.indexOf("=");
        x[kv.slice(0, i)] = kv.slice(i + 1);
      });
      const e = { w, es, t, pr, src };
      e.mn = mn === "~" ? cognate(w, es) : mn;
      if (isVerb) {
        e.f = x.f ? x.f.split("/").join("|") : [w, third(w), past(w), past(w), ing(w)].join("|");
        e.c = x.c || "";
        if (x.s) e.s = 1;
        if (x.sj) e.sj = x.sj;
        e.spx = { v: x.sp, post: x.post || "" };
        if (x.pre) e.spx.pre = x.pre;
        if (x.rf) e.spx.rf = 1;
      } else {
        e.ex = p[5];
        e.xe = p[6];
        if (x.f) e.f = x.f.split("/").join("|");
        else if (t === "n" && !x.u) e.f = w + "|" + plural(w);
      }
      lists[src].push(e);
    });
    return lists;
  }

  function extend() {
    if (BASE.length >= TOTAL || BASE.workAdded) return BASE;
    const have = new Set(BASE.map(e => e.w.toLowerCase()));
    const { R, N } = parse();
    const pickNew = l => l.filter(e => { const k = e.w.toLowerCase(); if (have.has(k)) return false; have.add(k); return true; });
    const r = pickNew(R), n = pickNew(N);
    // Intercaladas: una de las reuniones, una de negocios, siguiendo el orden de frecuencia.
    const mixed = [];
    for (let i = 0; i < Math.max(r.length, n.length); i++) {
      if (r[i]) mixed.push(r[i]);
      if (n[i]) mixed.push(n[i]);
    }
    mixed.slice(0, TOTAL - BASE.length).forEach(e => {
      e.rank = BASE.length + 1;
      if (e.t === "v") {
        const b = G.build(e, "present", e.sj ? "it" : "I", "aff");
        e.ex = b.en;
        e.xe = b.es;
      }
      BASE.push(e);
    });
    BASE.workAdded = true;
    return BASE;
  }

  const ALL = extend();
  if (isNode) module.exports = ALL;
  else root.WORDS = ALL;
})(typeof window !== "undefined" ? window : globalThis);
