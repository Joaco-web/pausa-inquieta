"""Contenido del paso a paso (una entrada por subpágina).

IMPORTANTE: los textos siguen el guion original del grupo, con sus mismas palabras.
No agregar interpretaciones ni adelantar lo que pasa después (nada de spoilers).
En el aula la persona nunca se levanta: sigue en su compu; el proyector solo le llama la atención.

Campos:
  lugar     "aula" | "unreal"
  titulo    nombre interno, para ubicarse en este archivo (NO se muestra en la web)
  etiqueta  reemplaza el nombre del lugar en esta sección (opcional)
  donde     ¿Dónde estás?
  ves       Qué ves
  escuchas  lista de sonidos: {"label", "texto", "src"}  (src = None hasta tener el audio)
  pasa      Qué pasa
  frase     frase del guion que se muestra grande (opcional)
  media     nombres de assets/pasos/NN/<nombre>.* en el orden en que se muestran
  cta       texto del botón para avanzar
Para sumar un audio: poné la ruta en "src" (por ejemplo "assets/pasos/03/latido.mp3"),
y corré  cd tools && python pasos.py  y después  python tools/version.py
"""

PROYECTOR = "En el aula, en tu compu. El proyector general te llama la atención."

PASOS = [
    {  # 01
        "lugar": "aula", "etiqueta": "Afuera del aula", "titulo": "La puerta",
        "donde": "Antes de entrar, en la puerta del aula.",
        "ves": "Una proyección de nuestro logo con la promesa. Habrá lentes UV en la puerta para verlo de nuevo.",
        "escuchas": [],
        "pasa": "El semicírculo representa un papel importante durante toda la experiencia: simboliza el corazón de nuestra pausa.",
        "media": ["proyeccion", "entrada", "lentes"],
        "cta": "Entrá al aula",
    },
    {  # 02
        "lugar": "aula", "titulo": "Tu lugar",
        "donde": "Una vez adentro, frente a la computadora.",
        "ves": "En el piso del aula hay una línea que te indica dónde sentarte. El banco está intervenido por las tramas de PI. El teclado está cubierto por una tela y, por encima, hay una caja.",
        "escuchas": [],
        "pasa": "Cuando la abrís, ves una tarjeta. Después de unos minutos, el monitor se prende con Unreal para seguir la experiencia allí.",
        "frase": "¿Y qué vas a hacer?",
        "media": ["caja-abrir", "lineas", "teclado", "caja", "monitor"],
        "cta": "Se prende el monitor",
    },
    {  # 03
        "lugar": "unreal", "titulo": "El salón",
        "donde": "Dentro de Unreal estás en un salón antiguo.",
        "ves": "Lo primero que ves es el semicírculo con una luz tenue y acentos flúor al final del pasillo. Este es Pausa.",
        "escuchas": [
            {"label": "Latido", "texto": "Pausa produce un sonido de latido de corazón, normal y leve.", "src": "assets/pasos/03/sonido-latido.mp3"},
            {"label": "La voz", "texto": "Una voz interviene y te dice: «No hagas nada».", "src": "assets/pasos/03/sonido-voz.mp3"},
        ],
        "pasa": "Apenas avanzás, el piso se abre y te caés, porque hiciste lo contrario de lo que te dijo la voz.",
        "frase": "No hagas nada.",
        "media": ["salon", "caida"],
        "cta": "Mientras tanto, en el aula…",
    },
    {  # 04
        "lugar": "aula", "titulo": "El proyector",
        "donde": PROYECTOR,
        "ves": "En el proyector general se muestra un video de Pausa, pero de repente el semicírculo se transforma en su opuesto, Inquieta.",
        "escuchas": [
            {"label": "Reloj", "texto": "Inquieta te observa y produce un sonido de reloj leve.", "src": "assets/pasos/04/sonido-reloj.mp3"},
            {"label": "Ruido", "texto": "En distintos tiempos y en cualquier momento de la experiencia, el proyector general reproduce ruido por unos 5 segundos.", "src": "assets/pasos/04/sonido-ruido.mp3"},
        ],
        "pasa": "Después vuelve a Pausa. Y cada vez que aparece el ruido, el proyector vuelve después a la normalidad.",
        "media": ["proyector"],
        "cta": "Volvé a Unreal",
    },
    {  # 05
        "lugar": "unreal", "titulo": "La caída",
        "donde": "Al caer, el ambiente cambió.",
        "ves": "La habitación está hecha de cubos y en el centro de cada pared hay un hueco. En el medio de la habitación, un cubo. Mientras el tiempo pasa y no pongas el cubo, las paredes van a reducir el espacio.",
        "escuchas": [
            {"label": "Tic tac", "texto": "Escuchás un tic tac de fondo que se intensifica.", "src": "assets/pasos/05/sonido-tictac.mp3"},
            {"label": "La voz", "texto": "La voz de antes, pero esta vez te dice: «Te dije que no hagas nada».", "src": "assets/pasos/05/sonido-voz.mp3"},
        ],
        "pasa": "En el momento en que ponés el cubo en el hueco, se muestra una cinemática del semicírculo transformándose en ruido, «inquieta», por un breve momento.",
        "frase": "Te dije que no hagas nada.",
        "media": ["cubos-a", "cubos-paredes", "cubos-b", "cinematica"],
        "cta": "Mirá alrededor",
    },
    {  # 06
        "lugar": "unreal", "titulo": "Planta baja",
        "donde": "Cuando mirás alrededor, te das cuenta de que una de las paredes era falsa. Al atravesarla, te encontrás en la planta baja del salón.",
        "ves": "En esta sala principal, los objetos tienen tamaños diferentes.",
        "escuchas": [
            {"label": "La sala", "texto": "La sala se vuelve cada vez más hostil con vos.", "src": "assets/pasos/06/sonido-hostil.mp3"},
        ],
        "pasa": "Algunos se rompen al interactuar, haciendo que la sala sea cada vez más hostil con vos: te tira objetos y te corre muebles.",
        "media": ["planta-baja-2", "planta-baja-3", "planta-baja"],
        "cta": "Girá a la izquierda",
    },
    {  # 07
        "lugar": "unreal", "titulo": "Pasillo de neón",
        "donde": "Girando a la izquierda de la sala.",
        "ves": "Te encontrás con un pasillo lleno de luces de neón y botones. Al tocarlos, algunas luces se apagan, otras se prenden o cambian de color.",
        "escuchas": [
            {"label": "Botones", "texto": "Al tocar los botones, algunas luces se apagan, otras se prenden o cambian de color.", "src": "assets/pasos/07/sonido-botones.mp3"},
            {"label": "Cortocircuito", "texto": "Después de tocarlos tanto, hay un cortocircuito.", "src": "assets/pasos/07/sonido-cortocircuito.mp3"},
        ],
        "pasa": "Después de tocarlos tanto, hay un cortocircuito que activa una luz de emergencia.",
        "media": ["luces-1", "luces-2", "luces-3"],
        "cta": "Mientras tanto, en el aula…",
    },
    {  # 08
        "lugar": "aula", "titulo": "Las tres pantallas",
        "donde": "En el aula.",
        "ves": "Se prenden tres pantallas en las que ves una línea haciendo un recorrido, el cual vas a seguir. En la última pantalla hay un mensaje de PI.",
        "escuchas": [
            {"label": "Pantallas", "texto": "Las pantallas se prenden y se apagan.", "src": "assets/pasos/08/sonido-pantallas.mp3"},
        ],
        "pasa": "La pantalla se apaga y volvés a la computadora del inicio.",
        "frase": "¿Faltaba algo más?",
        "media": ["tres-monitores", "aula"],
        "cta": "Volvé a Unreal",
    },
    {  # 09
        "lugar": "unreal", "titulo": "Sala de cuadros",
        "donde": "Después de pasar por el pasillo.",
        "ves": "La sala está llena de cuadros, todos desordenados, de diferentes tamaños: colgados, tirados y rotos.",
        "escuchas": [
            {"label": "Música", "texto": "Música clásica en la sala de cuadros.", "src": "assets/pasos/09/sonido-musica.mp3"},
        ],
        "pasa": "Si los acomodás, otros se tuercen o se caen.",
        "media": ["cuadros"],
        "cta": "Mientras tanto, en el aula…",
    },
    {  # 10
        "lugar": "aula", "titulo": "Los encapuchados",
        "donde": "En el aula, en tu compu.",
        "ves": "De repente aparecen los alumnos encapuchados, con los rostros tapados, dándote la espalda enfrente del monitor y dejándote leer una frase.",
        "escuchas": [],
        "pasa": "Te dan un cuaderno chiquito e inabrible. Después de unos minutos, se alejan.",
        "frase": "¿Qué está faltando?",
        "media": ["encapuchada-1", "encapuchada-2", "encapuchada-3", "encapuchada-4", "cuaderno"],
        "cta": "Volvé a Unreal",
    },
    {  # 11
        "lugar": "unreal", "titulo": "Salón de espejos",
        "donde": "En la sala de cuadros ves una puerta.",
        "ves": "Cuando pasás, ves tu reflejo repitiéndose por todos lados: es un salón de espejos.",
        "escuchas": [
            {"label": "Eco", "texto": "Goteo con eco en el salón de espejos.", "src": "assets/pasos/11/sonido-eco.mp3"},
        ],
        "pasa": "Te chocás un par de veces.",
        "media": ["espejos", "puerta", "lugar"],
        "cta": "Seguí avanzando",
    },
    {  # 12
        "lugar": "unreal", "titulo": "Los ojos",
        "donde": "Mientras seguís avanzando por el salón de espejos.",
        "ves": "Te encontrás con unas esferas de ojos. Están «apagados», rodeados de una luz que titila.",
        "escuchas": [],
        "pasa": "Al tocarlos se «prenden» y empiezan a levitar sobre la sala. Mientras los mires, no se van a acercar a vos, pero cuando apartes la vista se mueven dentro del espacio y te siguen.",
        "media": ["ojos-prendidos", "ojos-sala", "ojos-apagados"],
        "cta": "Llegá a la salida",
    },
    {  # 13
        "lugar": "unreal", "titulo": "Las teles",
        "donde": "Llegás a la salida, cruzás una puerta y lo único que ves es un pasillo con escaleras de subida.",
        "ves": "Ahora estás en una habitación con una estructura hecha de pantallas de tele con letras. Algunas están tiradas y sin funcionar.",
        "escuchas": [
            {"label": "Teles", "texto": "Las pantallas de tele de la estructura.", "src": "assets/pasos/13/sonido-teles.mp3"},
            {"label": "Escribir", "texto": "Si escribís algo, las palabras se vuelven físicas.", "src": "assets/pasos/13/sonido-escribir.mp3"},
        ],
        "pasa": "Si escribís algo, las palabras se vuelven físicas y flotan alrededor tuyo.",
        "media": ["teles", "pasillo", "teles-sala"],
        "cta": "Andá a la salida",
    },
    {  # 14
        "lugar": "unreal", "titulo": "La puerta empapelada",
        "donde": "En la salida hay otras escaleras.",
        "ves": "Al bajarlas, ves una pared al final del pasillo.",
        "escuchas": [
            {"label": "Escaleras", "texto": "Las escaleras, al bajarlas.", "src": "assets/pasos/14/sonido-escaleras.mp3"},
        ],
        "pasa": "En el empapelado notás la silueta de una puerta.",
        "media": ["puerta-empapelada-a", "puerta-empapelada-b"],
        "cta": "Mientras tanto, en el aula…",
    },
    {  # 15
        "lugar": "aula", "titulo": "Vuelven los encapuchados",
        "donde": "En el aula, en tu compu.",
        "ves": "De pronto, los alumnos encapuchados y con los rostros tapados vuelven a ponerse enfrente de tu monitor, dándote la espalda. Pero ahora la frase cambió.",
        "escuchas": [],
        "pasa": "Después de unos minutos, se retiran.",
        "frase": "¿Qué te dije que hagas antes?",
        "media": ["encapuchado-1", "encapuchado-2", "encapuchado-3", "encapuchado-4"],
        "cta": "Atravesá la puerta empapelada",
    },
    {  # 16
        "lugar": "unreal", "titulo": "El péndulo",
        "donde": "Al atravesar la puerta empapelada, te encontrás en una sala donde solo se ilumina el centro.",
        "ves": "Hay unas esferas en fila, colgando de un techo que pareciera no tener fin.",
        "escuchas": [
            {"label": "Péndulo", "texto": "El péndulo de Newton.", "src": "assets/pasos/16/sonido-pendulo.mp3"},
            {"label": "Corte de luz", "texto": "La iluminación se corta y la pantalla queda en negro.", "src": "assets/pasos/16/sonido-corte.mp3"},
        ],
        "pasa": "Al acercarte, movés la esfera de una esquina y causás el efecto del péndulo de Newton. Después de repetir la misma acción varias veces, uno de los hilos se corta, pero no antes de devolver el impulso, haciendo que recibas el impacto. La iluminación se corta y la pantalla queda en negro. Después de unos segundos vuelve a la normalidad y notás que en una de las paredes hay un hueco del que ves una luz que viene del otro lado, y te mandás.",
        "media": ["pendulo", "pendulo-video", "hueco-a", "hueco-b"],
        "cta": "Mandate por el hueco",
    },
    {  # 17
        "lugar": "unreal", "titulo": "La persecución",
        "donde": "Estás en un pasillo de techo alto.",
        "ves": "Antes de llegar al final, aparece Inquieta saliendo del piso y te empieza a perseguir.",
        "escuchas": [
            {"label": "Persecución", "texto": "Inquieta te empieza a perseguir.", "src": "assets/pasos/17/sonido-persecucion.mp3"},
        ],
        "pasa": "Empezás a correr y vas atravesando obstáculos a través de puertas que parecen no terminar, hasta llegar a la última. Perdés de vista a Inquieta.",
        "media": ["persecucion", "obstaculos"],
        "cta": "Seguí",
    },
    {  # 18
        "lugar": "unreal", "titulo": "La escalera infinita",
        "donde": "Ahora estás en un pasillo y, enfrente, otras escaleras con relojes.",
        "ves": "A medida que vas subiendo, ves que hay una puerta al final, a la que nunca llegás, porque los escalones se hacen infinitos.",
        "escuchas": [
            {"label": "Relojes", "texto": "Las escaleras con relojes.", "src": "assets/pasos/18/sonido-relojes.mp3"},
            {"label": "Escalones", "texto": "Subís, pero los escalones se hacen infinitos.", "src": "assets/pasos/18/sonido-escalera.mp3"},
        ],
        "pasa": "De un momento a otro, las escaleras se mueven de lugar. Te quedás quieto y, cuando se detienen, subís el último escalón. Abrís la puerta.",
        "media": ["escalera"],
        "cta": "Entrá",
    },
    {  # 19
        "lugar": "unreal", "titulo": "El dominó",
        "donde": "Estás en una sala con varias fichas de dominó de diferentes colores colocadas en el piso.",
        "ves": "Están una frente a otra, formando un camino, o eso parece.",
        "escuchas": [
            {"label": "Dominó", "texto": "La reacción en cadena.", "src": "assets/pasos/19/sonido-domino.mp3"},
        ],
        "pasa": "Al mover la primera pieza generás una reacción en cadena y, al caer la última, ves una oración. Inmediatamente el piso se abre dejándote caer por un tobogán, y caés en un pelotero.",
        "frase": "Te dije que no hagas nada.",
        "media": ["domino-video", "domino", "tobogan"],
        "cta": "Mientras tanto, en el aula…",
    },
    {  # 20
        "lugar": "aula", "titulo": "Inquieta, permanente",
        "donde": PROYECTOR,
        "ves": "En el proyector general se muestra un nuevo video de Pausa.",
        "escuchas": [
            {"label": "Presión", "texto": "Sonidos de intensificación y presión en todo el salón.", "src": "assets/pasos/20/sonido-presion.mp3"},
        ],
        "pasa": "Esta vez se termina de transformar en su opuesto, Inquieta, permanentemente.",
        "media": ["proyector-final"],
        "cta": "Volvé a Unreal",
    },
    {  # 21
        "lugar": "unreal", "titulo": "Todo vuelve",
        "donde": "Salís de entre todas las pelotas.",
        "ves": "Las inquietudes con dificultades que te fuiste generando a lo largo de la experiencia están ahí. Las palabras que te seguían antes lo vuelven a hacer. Te cuesta ver ciertas partes del lugar por las luces que descompusiste. Los ojos flotantes te persiguen.",
        "escuchas": [
            {"label": "Susurros", "texto": "Las inquietudes que te fuiste generando están ahí.", "src": "assets/pasos/21/sonido-susurros.mp3"},
            {"label": "Inquieta", "texto": "Una figura que no termina de ser humana por completo.", "src": "assets/pasos/21/sonido-inquieta.mp3"},
        ],
        "pasa": "Y cuando ya no había nada que empeorara la situación, ves una figura que no termina de ser humana por completo: es Inquieta personificada.",
        "media": ["espacio-2", "espacio-1", "inquieta"],
        "cta": "Seguí",
    },
    {  # 22
        "lugar": "unreal", "titulo": "El walkie-talkie",
        "donde": "Lo único que hay enfrente tuyo es un walkie-talkie.",
        "ves": "Lo agarrás porque empezás a escuchar voces que salen de él. El lugar en el que te encontrás es una combinación de lo vivido anteriormente.",
        "escuchas": [
            {"label": "El walkie-talkie", "texto": "Escuchás voces que salen de él. Mientras más avanzás en el lugar hostil, empiezan a fallar y se vuelven inentendibles.", "src": "assets/pasos/22/sonido-walkie.mp3"},
        ],
        "pasa": "El walkie-talkie se descompone por completo. Lo dejás y seguís avanzando.",
        "media": ["walkie"],
        "cta": "Llegá al final del entorno",
    },
    {  # 23
        "lugar": "unreal", "titulo": "Pausa te guía",
        "donde": "Llegando al final del entorno.",
        "ves": "Pausa te guía, con las mismas líneas que viste en el piso del aula al principio de la experiencia, hacia un ascensor.",
        "escuchas": [
            {"label": "Pausa", "texto": "«No soy Inquieta». «Mirá todo lo que rompiste». «Solo tenías que tomarte 25 minutos».", "src": None},
        ],
        "pasa": "Una vez dentro del ascensor, mientras tocás todos los botones para cerrar la puerta, Inquieta te ve y empieza a acercarse queriendo abrir el ascensor para sacarte de ahí. Así, el ascensor se descompone y cae brutalmente a una sala: el sótano.",
        "frase": "Dentro de la inquietud siempre hay una pausa.",
        "media": ["te-guia", "lineas", "te-habla", "ascensor", "caida"],
        "cta": "El sótano",
    },
    {  # 24
        "lugar": "unreal", "titulo": "El corazón de Inquieta",
        "donde": "El sótano.",
        "ves": "Enfrente tuyo están Pausa e Inquieta juntos. Se reproduce una cinemática: PI se abre para mostrarte un túnel largo y deconstruido.",
        "escuchas": [
            {"label": "El corazón de Inquieta", "texto": "Una sala con mucho ruido.", "src": "assets/pasos/24/sonido-corazon.mp3"},
            {"label": "Ruido", "texto": "Tu pantalla se congela y produce ruido.", "src": "assets/pasos/24/sonido-ruido.mp3"},
        ],
        "pasa": "Al atravesarlo hay una sala con mucho ruido: es el corazón de Inquieta. En el centro hay un pedestal con una caja apoyada, la misma que la del aula. Al abrirla se revela un doble fondo, con una tarjeta oculta. Tu pantalla se congela y produce ruido.",
        "frase": "¿Y ahora?",
        "media": ["pausa-inquieta", "tunel", "masa", "pedestal", "y-ahora"],
        "cta": "Mientras tanto, en el aula…",
    },
    {  # 25
        "lugar": "aula", "titulo": "El cierre",
        "donde": "En el aula.",
        "ves": "Todas las computadoras se prenden, cada una produciendo el mismo ruido. En el proyector general se reproduce un video de PI.",
        "escuchas": [
            {"label": "Ruido", "texto": "Todas las computadoras se prenden, cada una produciendo el mismo ruido.", "src": "assets/pasos/25/sonido-ruido.mp3"},
            {"label": "PI", "texto": "«Esta experiencia nace de mostrar que muchas veces, cuando no hacemos nada, sentimos la presión por hacer algo. Fijate: si vos no hacías nada, la experiencia avanzaba igual, pero siempre sentiste la necesidad de hacer algo. A veces no hacer nada implica tomarte un momento para vos». Y cierra con: «No todo pide algo».", "src": None},
        ],
        "pasa": "Al salir del aula se les entrega un llavero para que reconozcan su ruido interno en el día a día, y se pueden llevar el cuaderno. Ahora la proyección de la puerta del aula cambió: Pausa e Inquieta conviven.",
        "frase": "No todo pide algo.",
        "media": [],
        "cta": "Qué te llevás",
    },
]
