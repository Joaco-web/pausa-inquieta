"""Contenido del paso a paso (una entrada por subpágina).

IMPORTANTE: los textos siguen el guion original del grupo, con sus mismas palabras.
No agregar interpretaciones ni adelantar lo que pasa después (nada de spoilers).
En el aula la persona nunca se levanta: sigue en su compu; el proyector solo le llama la atención.

Campos:
  carpeta   número de la carpeta de medios (assets/pasos/NN). No cambia aunque se unan secciones:
            el número que se ve en la web sale solo del orden de esta lista.
  lugar     "aula" | "unreal"
  titulo    nombre interno, para ubicarse en este archivo (NO se muestra en la web)
  etiqueta  reemplaza el nombre del lugar en esta sección (opcional)
  donde     título grande de la sección
  encabezado  líneas del título, si se quieren cortar a mano (opcional, en lugar de donde)
  ves       Qué ves (opcional)
  escuchas  lista de sonidos: {"label", "texto", "src"}  (src = None hasta tener el audio; texto vacío = sin descripción)
  pasa      Qué pasa (opcional). [[texto]] = resaltado con flúor
  frase     frase del guion que se muestra grande (opcional)
  nota      líneas del texto del semicírculo que queda en la esquina del video (opcional)
  media     nombres de assets/pasos/NN/<nombre>.* en el orden en que se muestran
  carrusel  True: las imágenes de media pasan solas en el recuadro principal
  abajo     imágenes debajo de los cuadros cuando la principal es un carrusel (opcional)
  pasa_media  video que va dentro del cuadro Qué pasa (opcional)
  ves_media   video que va dentro del cuadro Qué ves (opcional)
  sigue     otro lugar (o una lista de lugares) dentro de la misma página, al seguir scrolleando (opcional):
            {"carpeta", "donde", "ves", "escuchas", "pasa", "carrusel", "media"}
  adentro   segunda parte de la misma sección, al seguir scrolleando (opcional):
            {"carpeta", "texto", "fila": [2 videos], "ves", "pasa", "media"}
  cta       texto del botón para avanzar
  aviso     mensaje de Pausa que aparece abajo al terminar de scrollear (opcional)
Para sumar un audio: poné la ruta en "src" (por ejemplo "assets/pasos/03/latido.mp3"),
y corré  cd tools && python pasos.py  y después  python tools/version.py
"""

PROYECTOR = "En el aula, en tu compu. El proyector general te llama la atención."

PASOS = [
    {
        "carpeta": 1,
        "lugar": "aula", "etiqueta": "Afuera del aula", "titulo": "La puerta",
        "encabezado": ["Antes de", "entrar", "al aula"],
        "ves": "Una proyección de nuestro logo con la promesa. Habrá lentes UV en la puerta para verlo de nuevo.",
        "escuchas": [],
        "pasa": "Nada será revelado.",
        "nota": ["El semicírculo representa un", "papel importante durante", "toda la experiencia:", "simboliza el corazón", "de nuestra pausa."],
        "media": ["entrada", "lentes"],
        "adentro": {
            "carpeta": 2,
            "texto": "Una vez adentro",
            "fila": ["lineas", "caja-abrir"],
            "ves": "En el piso del aula hay una línea que te indica dónde sentarte. El banco está intervenido por las tramas de PI. El teclado está cubierto por una tela y, por encima, hay una caja.",
            "pasa": "Cuando la abrís, ves una tarjeta. Después de unos minutos, el monitor se prende con Unreal para seguir la experiencia allí.",
            "media": ["tela", "caja", "tarjetas"],
        },
        "cta": "Se prende el monitor",
    },
    {
        "carpeta": 3,
        "lugar": "unreal", "titulo": "El salón",
        "encabezado": ["Dentro de", "Unreal, estás", "en un salón", "antiguo."],
        "ves": "Lo primero que ves es el semicírculo con una luz tenue y acentos flúor. Este es Pausa.",
        "escuchas": [
            {"label": "Latido", "texto": "", "src": "assets/pasos/03/sonido-latido.mp3"},
            {"label": "La voz", "texto": "«No hagas nada»", "src": "assets/pasos/03/sonido-voz.mp3"},
        ],
        "pasa": "Apenas avanzás, [[el piso se abre y te caés]], porque hiciste lo contrario de lo que te dijo la voz.",
        "media": ["salon-pausa"],
        "cta": "Mientras tanto, en el aula…",
    },
    {
        "carpeta": 4,
        "lugar": "aula", "titulo": "El proyector",
        "donde": "El proyector se enciende y llama la atención.",
        "ves": "En el proyector general se muestra un video de Pausa, pero de repente se transforma en su opuesto, Inquieta.",
        "escuchas": [
            {"label": "Reloj", "texto": "", "src": "assets/pasos/04/sonido-reloj.mp3"},
            {"label": "Ruido", "texto": "", "src": "assets/pasos/04/sonido-ruido.mp3"},
        ],
        "pasa": "Después vuelve a Pausa. Y cada vez que aparece el ruido, el proyector vuelve después a la normalidad.",
        "ves_media": "proyector",
        "media": ["aula-proyector"],
        "cta": "Volvé a Unreal",
    },
    {
        "carpeta": 5,
        "lugar": "unreal", "titulo": "La caída",
        "donde": "Al caer del primer piso, el ambiente cambió.",
        "ves": "La habitación está hecha de cubos y en el centro de cada pared hay un hueco. En el medio de la habitación, un cubo. Mientras el tiempo pasa y no pongas el cubo, las paredes van a reducir el espacio.",
        "escuchas": [
            {"label": "Tic tac", "texto": "", "src": "assets/pasos/05/sonido-tictac.mp3"},
            {"label": "La voz", "texto": "«Te dije que no hagas nada»", "src": "assets/pasos/05/sonido-voz.mp3"},
        ],
        "pasa": "En el momento en que ponés el cubo en el hueco, se muestra una cinemática del semicírculo transformándose en ruido, «inquieta», por un breve momento.",
        "pasa_media": "cinematica",
        "carrusel": True,
        "media": ["caida-1", "caida-2"],
        "sigue": {
            "carpeta": 6,
            "donde": "Una de las paredes se descompone y te muestra que era falsa. Al atravesarla, te encontrarás en la planta baja del salón.",
            "ves": "En esta sala principal, los objetos tienen tamaños diferentes.",
            "escuchas": [
                {"label": "La sala", "texto": "", "src": "assets/pasos/06/sonido-hostil.mp3"},
            ],
            "pasa": "Algunos se rompen al interactuar, haciendo que la sala sea cada vez más hostil con vos: te tira objetos y te corre muebles.",
            "carrusel": True,
            "media": ["planta-baja-r"],
        },
        "cta": "Girá a la izquierda",
    },
    {
        "carpeta": 7,
        "lugar": "unreal", "titulo": "Pasillo de neón",
        "donde": "Girando a la izquierda de la sala.",
        "ves": "Te encontrás con un pasillo lleno de luces de neón y botones. Al tocarlos, algunas luces se apagan, otras se prenden o cambian de color.",
        "escuchas": [
            {"label": "Botones", "texto": "", "src": "assets/pasos/07/sonido-botones.mp3"},
            {"label": "Cortocircuito", "texto": "", "src": "assets/pasos/07/sonido-cortocircuito.mp3"},
        ],
        "pasa": "Después de tocarlos tanto, hay un cortocircuito que activa una luz de emergencia.",
        "carrusel": True,
        "media": ["pasillo-1", "pasillo-2"],
        "aviso": "No siempre es necesario estar ocupado. A veces, tomarte un momento para no hacer nada es lo mejor para vos.",
        "cta": "Mientras tanto, en el aula…",
    },
    {
        "carpeta": 8,
        "lugar": "aula", "titulo": "Las tres pantallas",
        "donde": "En el aula.",
        "ves": "Se prenden tres pantallas en las que ves una línea haciendo un recorrido, el cual vas a seguir. En la última pantalla hay un mensaje de PI.",
        "escuchas": [
            {"label": "Pantallas", "texto": "", "src": "assets/pasos/08/sonido-pantallas.mp3"},
        ],
        "pasa": "La pantalla se apaga y volvés a la computadora del inicio.",
        "media": ["tres-monitores-img"],
        "cta": "Volvé a Unreal",
    },
    {
        "carpeta": 9,
        "lugar": "unreal", "titulo": "Sala de cuadros",
        "donde": "Después de pasar por el pasillo.",
        "ves": "La sala está llena de cuadros, todos desordenados, de diferentes tamaños: colgados, tirados y rotos.",
        "escuchas": [
            {"label": "Música", "texto": "", "src": "assets/pasos/09/sonido-musica.mp3"},
        ],
        "pasa": "Si los acomodás, otros se tuercen o se caen.",
        "media": ["cuadros-r"],
        "aviso": "Seguís haciendo cosas que nadie te exige y te la estás complicando.",
        "cta": "Mientras tanto, en el aula…",
    },
    {
        "carpeta": 10,
        "lugar": "aula", "titulo": "Los encapuchados",
        "donde": "En el aula.",
        "ves": "De repente aparecen los alumnos encapuchados, con los rostros tapados, dándote la espalda enfrente del monitor y dejándote leer una frase.",
        "escuchas": [],
        "pasa": "Te dan un cuaderno chiquito e inabrible. Después de unos minutos, se alejan.",
        "media": ["encapuchados", "remera-negra-1", "cuaderno", "remera-negra-2"],
        "cta": "Volvé a Unreal",
    },
    {
        "carpeta": 11,
        "lugar": "unreal", "titulo": "Salón de espejos",
        "donde": "En la sala de cuadros ves una puerta.",
        "ves": "Cuando pasás, ves tu reflejo repitiéndose por todos lados. Estás en una sala de espejos.",
        "escuchas": [
            {"label": "Eco", "texto": "", "src": "assets/pasos/11/sonido-eco.mp3"},
        ],
        "carrusel": True,
        "media": ["cuadros-puerta"],
        "sigue": {
            "carpeta": 12,
            "donde": "Mientras avanzás por el entorno, te encontrás con unas esferas de ojos. Están apagados, rodeados de una luz que titila.",
            "pasa": "Al tocarlos se «prenden» y empiezan a levitar sobre la sala. Mientras los mires, no se van a acercar a vos, pero cuando apartes la vista se mueven dentro del espacio y te siguen.",
            "carrusel": True,
            "media": ["esferas-sala"],
        },
        "cta": "Llegá a la salida",
    },
    {
        "carpeta": 13,
        "lugar": "unreal", "titulo": "El pasillo y las teles",
        "donde": "Llegás a la salida, cruzás una puerta y lo único que ves es un pasillo con escaleras de subida.",
        "media": ["pasillo-escalera"],
        "sigue": {
            "carpeta": 13,
            "donde": "Ahora estás en una habitación con una estructura hecha de pantallas de tele con letras. Algunas están tiradas y sin funcionar.",
            "escuchas": [
                {"label": "Teles", "texto": "", "src": "assets/pasos/13/sonido-teles.mp3"},
                {"label": "Escribir", "texto": "", "src": "assets/pasos/13/sonido-escribir.mp3"},
            ],
            "pasa": "Si escribís algo, las palabras se vuelven físicas y flotan alrededor tuyo.",
            "carrusel": True,
            "media": ["teles-r"],
        },
        "aviso": "No siempre es necesario estar ocupado. A veces, tomarte un momento para no hacer nada es lo mejor para vos.",
        "cta": "Andá a la salida",
    },
    {
        "carpeta": 14,
        "lugar": "unreal", "titulo": "La puerta empapelada y el péndulo",
        "donde": "En la salida encontrás unas escaleras.",
        "ves": "Al bajarlas, ves una pared al final del pasillo.",
        "escuchas": [
            {"label": "Escaleras", "texto": "", "src": "assets/pasos/14/sonido-escaleras.mp3"},
        ],
        "pasa": "En el empapelado notás la silueta de una puerta.",
        "carrusel": True,
        "media": ["puertas"],
        "sigue": {
            "carpeta": 16,
            "donde": "Al atravesar la puerta empapelada, te encontrás en una sala donde solo se ilumina el centro.",
            "ves": "Hay unas esferas en fila, colgando de un techo que pareciera no tener fin.",
            "escuchas": [
                {"label": "Péndulo", "texto": "", "src": "assets/pasos/16/sonido-pendulo.mp3"},
                {"label": "Corte de luz", "texto": "", "src": "assets/pasos/16/sonido-corte.mp3"},
            ],
            "pasa": "Al acercarte, movés la esfera de una esquina y causás el efecto del péndulo de Newton. Después de repetir la misma acción varias veces, uno de los hilos se corta, pero no antes de devolver el impulso, haciendo que recibas el impacto. La iluminación se corta y la pantalla queda en negro. Después de unos segundos vuelve a la normalidad y notás que en una de las paredes hay un hueco del que ves una luz que viene del otro lado, y te mandás.",
            "carrusel": True,
            "media": ["pendulo-1", "pendulo-2"],
        },
        "cta": "Mientras tanto, en el aula…",
    },
    {
        "carpeta": 15,
        "lugar": "aula", "titulo": "Vuelven los encapuchados",
        "donde": "En el aula.",
        "ves": "De pronto, los alumnos encapuchados y con los rostros tapados vuelven a ponerse enfrente de tu monitor, dándote la espalda. Pero ahora la frase cambió.",
        "escuchas": [],
        "pasa": "Después de unos minutos, se retiran.",
        "media": ["encapuchados", "remera-blanca", "remera-blanca-2"],
        "cta": "Volvé a Unreal",
    },
    {
        "carpeta": 17,
        "lugar": "unreal", "titulo": "La persecución",
        "donde": "Estás en un pasillo de techo alto.",
        "ves": "Antes de llegar al final del pasillo, aparece Inquieta, saliendo del piso y te empieza a perseguir.",
        "escuchas": [
            {"label": "Persecución", "texto": "", "src": "assets/pasos/17/sonido-persecucion.mp3"},
        ],
        "pasa": "Empezás a correr y vas atravesando obstáculos a través de puertas que parecen no terminar, [[hasta llegar a la última]]. Perdés de vista a Inquieta.",
        "carrusel": True,
        "media": ["persecucion-1", "persecucion-2", "persecucion-3", "persecucion-4", "persecucion-5"],
        "sigue": {
            "carpeta": 18,
            "donde": "Ahora estás en un pasillo y, enfrente, otras escaleras con relojes.",
            "ves": "A medida que vas subiendo, ves que hay una puerta al final, a la que nunca llegás, porque los escalones se hacen infinitos.",
            "escuchas": [
                {"label": "Relojes", "texto": "", "src": "assets/pasos/18/sonido-relojes.mp3"},
                {"label": "Escalones", "texto": "", "src": "assets/pasos/18/sonido-escalera.mp3"},
            ],
            "pasa": "De un momento a otro, las escaleras se mueven de lugar. Te quedás quieto y, cuando se detienen, subís el último escalón. Abrís la puerta.",
            "media": ["escalera-r"],
        },
        "aviso": "Sentiste la presión por hacer algo y ahora eso te persigue.",
        "cta": "Entrá",
    },
    {
        "carpeta": 19,
        "lugar": "unreal", "titulo": "El dominó",
        "donde": "Estás en una sala con varias fichas de dominó blancas colocadas en el piso.",
        "escuchas": [
            {"label": "Dominó", "texto": "", "src": "assets/pasos/19/sonido-domino.mp3"},
        ],
        "pasa": "Al mover la primera pieza generás una reacción en cadena y, al caer la última, ves una oración. Inmediatamente el piso se abre [[dejándote caer por un tobogán, y caés en un pelotero]].",
        "media": ["domino-r"],
        "aviso": "Sentiste la presión por hacer algo y ahora eso te persigue.",
        "cta": "Mientras tanto, en el aula…",
    },
    {
        "carpeta": 20,
        "lugar": "aula", "titulo": "Inquieta, permanente",
        "donde": "En el aula, el proyector general se prende.",
        "escuchas": [
            {"label": "Presión", "texto": "", "src": "assets/pasos/20/sonido-presion.mp3"},
        ],
        "pasa": "Esta vez se termina de transformar en su opuesto, Inquieta, permanentemente.",
        "pasa_media": "proyector-final",
        "media": ["aula-proyector"],
        "cta": "Volvé a Unreal",
    },
    {
        "carpeta": 21,
        "lugar": "unreal", "titulo": "Todo vuelve",
        "donde": "Salís de entre todas las pelotas. Estás en un lugar con objetos gigantes. Partes de él faltan. Si mirás adentro de estos, solo se verá ruido. Todo está sin color.",
        "ves": "Las inquietudes con dificultades que te fuiste generando a lo largo de la experiencia están ahí. Las palabras que te seguían antes lo vuelven a hacer. Te cuesta ver ciertas partes del lugar por las luces que descompusiste. Los ojos flotantes te persiguen. Cuadros se caen, objetos se te lanzan, la experiencia se te complica.",
        "escuchas": [
            {"label": "Susurros", "texto": "", "src": "assets/pasos/21/sonido-susurros.mp3"},
            {"label": "Inquieta", "texto": "", "src": "assets/pasos/21/sonido-inquieta.mp3"},
        ],
        "pasa": "Y cuando ya no había nada que empeorara la situación, ves una figura que no termina de ser humana por completo: es Inquieta personificada.",
        "media": ["objetos-gigantes"],
        "sigue": [
            {
                "carpeta": 22,
                "donde": "Lo único que hay enfrente tuyo es un walkie-talkie.",
                "ves": "Lo agarrás porque empezás a escuchar voces que salen de él.",
                "escuchas": [
                    {"label": "El walkie-talkie", "texto": "", "src": "assets/pasos/22/sonido-walkie.mp3"},
                ],
                "pasa": "El walkie-talkie se descompone por completo. Lo dejás y seguís avanzando.",
                "media": ["walkie-pelotero"],
            },
            {
                "carpeta": 23,
                "donde": "Llegando a la salida.",
                "ves": "Pausa te guía, con las mismas líneas que viste en el piso del aula al principio de la experiencia, hacia un ascensor.",
                "escuchas": [
                    {"label": "Pausa", "texto": "«No soy Inquieta». «Mirá todo lo que rompiste». «Solo tenías que tomarte 25 minutos».", "src": None},
                ],
                "pasa": "Una vez dentro del ascensor, mientras tocás todos los botones para cerrar la puerta, Inquieta te ve y empieza a acercarse queriendo abrir el ascensor para sacarte de ahí. Así, el ascensor se descompone y cae abruptamente a una sala. El sótano.",
                "media": ["salida"],
            },
        ],
        "cta": "El sótano",
    },
    {
        "carpeta": 24,
        "lugar": "unreal", "titulo": "El corazón de Inquieta",
        "donde": "El sótano.",
        "ves": "Enfrente tuyo están Pausa e Inquieta, juntos. Se reproduce una cinemática: PI se abre para mostrarte un túnel largo y deconstruido.",
        "escuchas": [
            {"label": "El corazón de Inquieta", "texto": "", "src": "assets/pasos/24/sonido-corazon.mp3"},
            {"label": "Ruido", "texto": "", "src": "assets/pasos/24/sonido-ruido.mp3"},
        ],
        "pasa": "Al atravesarlo hay una sala con mucho ruido: es el corazón de Inquieta. En el centro hay un pedestal con una caja apoyada, la misma que la del aula. Al abrirla se revela un doble fondo, con una tarjeta oculta. Tu pantalla se congela y produce ruido.",
        "carrusel": True,
        "media": ["sotano-1", "sotano-2", "sotano-3"],
        "abajo": ["tarjeta-y-ahora"],
        "aviso": "Te dije que no hicieras nada y fuiste complicando todo.",
        "cta": "Mientras tanto, en el aula…",
    },
    {
        "carpeta": 25,
        "lugar": "aula", "titulo": "El cierre",
        "donde": "En el aula.",
        "ves": "Todas las computadoras se prenden, cada una produciendo el mismo ruido. En el proyector general se reproduce un video de PI.",
        "escuchas": [
            {"label": "Ruido", "texto": "", "src": "assets/pasos/25/sonido-ruido.mp3"},
            {"label": "PI", "texto": "«Esta experiencia nace de mostrar que muchas veces, cuando no hacemos nada, sentimos la presión por hacer algo. Fijate: si vos no hacías nada, la experiencia avanzaba igual, pero siempre sentiste la necesidad de hacer algo. A veces no hacer nada implica tomarte un momento para vos». «No todo pide algo».", "src": None},
        ],
        "pasa": "Al salir del aula se les entrega un llavero para que reconozcan su ruido interno en el día a día, y se pueden llevar el cuaderno. Ahora la proyección de la puerta del aula cambió: Pausa e Inquieta conviven.",
        "media": [],
        "cta": "Qué te llevás",
    },
]
