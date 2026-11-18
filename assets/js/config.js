/* ===== Datos de la tienda (única fuente de datos de contacto) =====
   Rellena estos campos y la web los mostrará sola en «Visítanos» y en las consultas.
   Deja "" (vacío) lo que todavía no tengas: se mostrará «Información próximamente».
*/
window.MONTANA_CONFIG = {
  address: "",        /* dirección exacta, p. ej. "Av. Francisco de Miranda, local 3, Carora, Lara" */
  phone: "",          /* teléfono tal como quieras mostrarlo, p. ej. "0252-000 0000" */
  whatsapp: "584129939022",       /* solo números con código de país, p. ej. "584121234567" */
  hours: "",          /* horario; usa \n para varias líneas, p. ej. "Lunes a viernes: 8:00 a 17:00\nSábados: 8:00 a 13:00" */
  instagram: "tiendasmontana.carora",      /* usuario (@tiendasmontana) o enlace completo del perfil */
  mapsUrl: "https://maps.app.goo.gl/s71HtNyvrHgZjJDZA",   /* enlace «Cómo llegar» que envió Juanpo (2026-11-18) */
  mapsEmbedUrl: "https://www.google.com/maps?q=10.1685125,-70.0774844&z=17&output=embed",   /* enlace del mapa para incrustar: Google Maps > Compartir > Insertar un mapa > copia solo el src="..." */
  wazeUrl: "https://waze.com/ul?ll=10.1685125,-70.0774844&navigate=yes",   /* misma ubicación que mapsUrl (Plus Code 5W9F+C22 Carora) */
  fotoNosotros: "",   /* foto real de la tienda para «Sobre nosotros», p. ej. "fotos/tienda.jpg" */
  colorDelMes: "Verde salvia",  /* nombre de un color del simulador para «Color del mes»; vacío ("") lo oculta */
  /* ===== Confianza: la sección «Hecho en Carora» solo aparece cuando hay contenido real aquí ===== */
  fotosTienda: [      /* fotos reales: { src: "img/tienda-fachada.webp", alt: "Fachada de Tiendas Montana", pie: "Nuestra tienda en Carora" } */
  ],
  trabajos: [         /* antes y después de trabajos reales: { antes: "img/obra1-antes.webp", despues: "img/obra1-despues.webp", texto: "Fachada en el centro de Carora · ImperCoat Plus" } */
  ],
  opiniones: [        /* SOLO opiniones reales y con permiso del cliente: { nombre: "María G.", barrio: "Centro", texto: "…", estrellas: 5 } */
  ]
};
