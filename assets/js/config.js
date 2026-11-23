/* ===== Datos de José Rafael Castillo (única fuente de datos de la web) =====
   Cambia aquí lo que quieras y la web lo mostrará sola en todas las páginas.
   Deja "" (vacío) o null lo que todavía no tengas: se mostrará «Próximamente» o «A consultar».
*/
window.CEE_CONFIG = {
  nombre: "José Rafael Castillo",
  titulo: "Ingeniero civil",
  marca: "",             /* nombre comercial o de marca, si lo hay. Vacío = se usa el nombre */
  logo: "",              /* ruta del logo, p. ej. "/assets/img/logo.png". Vacío = iniciales JR */
  foto: "",              /* foto profesional, p. ej. "/assets/img/jose-rafael.jpg". Vacío = iniciales */
  whatsapp: "34623120913",          /* solo números con código de país */
  telefono: "+34 623 12 09 13",     /* como se muestra en la web */
  email: "",             /* correo de contacto. Vacío = «Próximamente» */
  colegiado: "",         /* número de colegiado, p. ej. "Colegiado n.º 00000". Vacío = no se muestra */
  zona: "Madrid capital",
  plazo: "48 h",         /* plazo de entrega que se muestra en la web */
  horario: "Con cita previa",           /* p. ej. "Lunes a viernes, 9:00 a 19:00". Vacío = «Próximamente» */
  instagram: "",         /* usuario o enlace. Vacío = no se muestra */
  linkedin: "",          /* enlace del perfil. Vacío = no se muestra */

  /* ===== Precios de la calculadora =====
     base: precio en euros (sin IVA o con IVA, según lo indiques en notaPrecios).
     porM2: euros que se suman por cada m² (0 si el precio es fijo).
     Si base es null, la calculadora dice «A consultar» y el mensaje de WhatsApp pide presupuesto. */
  notaPrecios: "Precio orientativo. El presupuesto final se confirma por WhatsApp.",
  precios: {
    cee: {
      piso:     { base: null, porM2: 0 },
      unifamiliar: { base: null, porM2: 0 },
      local:    { base: null, porM2: 0 },
      oficina:  { base: null, porM2: 0 }
    },
    valoracion: {
      piso:     { base: null, porM2: 0 },
      unifamiliar: { base: null, porM2: 0 },
      local:    { base: null, porM2: 0 },
      oficina:  { base: null, porM2: 0 }
    }
  },

  /* La valoración NO es una tasación oficial para hipoteca (requiere sociedad de tasación homologada).
     Cambia a true solo si José Rafael confirma lo contrario. */
  valoracionOficial: false,

  /* SOLO opiniones reales y con permiso: { nombre: "María G.", zona: "Chamberí", texto: "…" } */
  opiniones: []
};
