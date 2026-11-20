/* ==========================================================
   NOTICIAS Y GALERÍA — textos y fotos tomados de la web actual
   del colegio (mariainmaculadacarora.com.ve), noviembre 2026.
   Para añadir una noticia, copia un bloque y cambia los datos.
   ========================================================== */
window.IMI_CONTENIDO = [
  {
    id: "n15582", tipo: "noticia", titulo: "Primera convocatoria",
    fecha: "20 de noviembre de 2026", autor: "Dirección",
    fotos: ["assets/noticias/15582.webp"], ancho: 512, alto: 264,
    texto: [
      "Primera convocatoria del año escolar 2026-2027. Se convoca con carácter de obligatoriedad a la Asamblea Extraordinaria de Padres, Madres, Representantes y Responsables.",
      "Punto único: mensualidad del año escolar 2026-2027.",
      "Fecha: 23 de noviembre de 2026, a las 4:00 p. m. Lugar: Auditorio de la Institución. La asistencia es obligatoria para todos los representantes."
    ]
  },
  {
    id: "g2112", tipo: "galeria", titulo: "Misa de Grado Promo 44",
    fotos: rango("2112", 12), portada: 0, ancho: 400, alto: 184
  },
  {
    id: "n15057", tipo: "noticia", titulo: "Inscripciones 2026-2027",
    fecha: "15 de julio de 2026", autor: "Dirección",
    fotos: ["assets/noticias/15057.webp"], ancho: 510, alto: 257,
    adjunto: "https://www.dropbox.com/scl/fi/y52fvut5jhui14e0ioamn/15057.jpg?rlkey=g4m716n85djedrvz93clcznfh&dl=1",
    texto: [
      "Se les recuerda a los representantes que es su obligación realizar en el mes de julio la actualización de datos de los estudiantes regulares y la inscripción 2026-2027.",
      "Preescolar: del 17/07/2026 al 23/07/2026. Primaria y Secundaria: del 20/07/2026 al 28/07/2026.",
      "Entrega de boletas (solventes hasta agosto 2026): 17/07/2026, de 8:00 a. m. a 12:00 m."
    ]
  },
  {
    id: "g2102", tipo: "galeria", titulo: "Promo 44",
    fotos: rango("2102", 16), portada: 3, ancho: 400, alto: 184
  },
  {
    id: "n15128", tipo: "noticia", titulo: "Acto de Graduación",
    fecha: "29 de julio de 2026", autor: "Bachilleres",
    fotos: ["assets/noticias/15128.webp"], ancho: 512, alto: 286,
    texto: [
      "El personal directivo, docente, administrativo, obrero y estudiantes de la XLV Promoción «Bicentenario de la Unidad Americana: Congreso Anfictiónico de Panamá» del Instituto María Inmaculada invitan a su acto de graduación.",
      "Lugar: Instituto María Inmaculada. Hora: 8:30 a. m. Carora, 30 de julio de 2026."
    ]
  },
  {
    id: "g2111", tipo: "galeria", titulo: "Confirmación Promo 44",
    fotos: rango("2111", 9), portada: 0, ancho: 400, alto: 184
  },
  {
    id: "n13899", tipo: "noticia", titulo: "Entrega de Boletas",
    fecha: "11 de diciembre de 2025", autor: "Dirección",
    fotos: ["assets/noticias/13899.webp"], ancho: 512, alto: 196,
    texto: [
      "Viernes 12: entrega de boletines informativos desde las 7:30 a. m. hasta las 12:00 m.",
      "La oficina administrativa estará laborando hasta el martes 16."
    ]
  },
  {
    id: "g2157", tipo: "galeria", titulo: "Aniversario de AVEC 80",
    fotos: rango("2157", 6), portada: 0, ancho: 400, alto: 184
  },
  {
    id: "n13857", tipo: "noticia", titulo: "Celebración María Inmaculada",
    fecha: "2 de diciembre de 2025", autor: "Jubileo",
    fotos: ["assets/noticias/13857.webp"], ancho: 512, alto: 196,
    texto: [
      "Acompáñanos este lunes 8 de diciembre a la celebración del Jubileo 2025 en nuestra Catedral San Juan Bautista a las 7:30 a. m.",
      "Nota: estudiantes de 4.º, 5.º y 6.º grado de Educación Primaria y todos los estudiantes de Educación Media General y sus representantes."
    ]
  },
  {
    id: "g1532", tipo: "galeria", titulo: "Día de la Alimentación y Derechos de los Niños",
    fotos: rango("1532", 3), portada: 0, ancho: 400, alto: 184
  },
  {
    id: "g1531", tipo: "galeria", titulo: "Celebración del cumpleaños de la Srta. Ermila",
    fotos: rango("1531", 3), portada: 0, ancho: 400, alto: 184
  }
];
function rango(album, n){ var a = []; for (var i = 1; i <= n; i++) a.push("assets/galeria/" + album + "-" + i + ".webp"); return a; }
