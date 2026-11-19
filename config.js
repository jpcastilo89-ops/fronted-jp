/*
  ZETA · Archivo de datos
  Todos los datos de contacto y del negocio van aquí.
  Cambia un dato aquí y se cambia en toda la web.
  Lo que esté vacío ("") se muestra como "Información próximamente".
*/
window.ZETA = {
  nombre: "ZETA",
  frase: "Premium Wear",
  lema: "Viste diferente. Viste ZETA.",
  ciudad: "Carora, Lara, Venezuela",
  envios: "Envíos a todo el país · Entregas personales en Carora",

  // WhatsApp con código de país, solo números. Ejemplo: "584121234567"
  // PENDIENTE: Juanpo aún no lo ha dado.
  whatsapp: "",
  // Enlace de WhatsApp que ya usa el Instagram. Se usa mientras no haya número.
  whatsappEnlace: "https://wa.link/nyzma9",
  mensajeWhatsApp: "Hola ZETA, vengo de la web y quiero hacer un pedido.",

  instagram: "zetabox_ve",
  direccion: "",   // Solo tienda online (confirmado por Juanpo)
  horario: "",     // PENDIENTE
  historia: "",    // PENDIENTE: 3 o 4 frases para "Sobre nosotros"
  valores: "Calidad premium · Máxima comodidad",
  mapa: "",        // No aplica: solo online

  // Producto de muestra mientras no hay catálogo (decisión de Juanpo, 19-11-2026).
  // Colores elegidos por Juanpo (19-11-2026). Los tonos exactos se pueden ajustar.
  producto: {
    nombre: "Franela oversized",
    tallas: ["S", "M", "L"],
    material: "Algodón jersey 20/1 (220 gr)",
    // Texto real del Instagram de ZETA
    descripcion: "Diseñada con el corte perfecto, con la caída exacta y la densidad ideal, para que tus outfits se vean completos sin esfuerzo.",
    materialDetalle: "Fresco, suave y de alta durabilidad.",
    corte: "Oversized",
    medidas: "", // PENDIENTE: medidas en cm de S, M y L
    precio: "", // PENDIENTE: no se muestra precio hasta tenerlo
    colores: [
      { nombre: "Negro", hex: "#141414" },
      { nombre: "Blanco", hex: "#f2f2f0" },
      { nombre: "Gris", hex: "#8a8a8a" },
      { nombre: "Verde", hex: "#2f6b3f" },
      { nombre: "Rojo", hex: "#b3261e" },
      { nombre: "Azul", hex: "#1f3f8f" }
    ]
  }
};
