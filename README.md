# Web de José Rafael Castillo · Certificado energético y valoración (Madrid)

Sitio estático de 7 páginas, sin compilación. Se genera con `generador/gen.py` (python3 gen.py).

| Página | Dirección |
|---|---|
| Inicio | `/` |
| Servicios | `/servicios/` |
| Calcula tu presupuesto | `/presupuesto/` (acepta `?servicio=cee` o `?servicio=valoracion`) |
| Cómo funciona | `/como-funciona/` |
| Preguntas frecuentes | `/preguntas-frecuentes/` |
| Sobre mí | `/sobre-mi/` |
| Contacto | `/contacto/` |

- **Datos y precios:** `assets/js/config.js` (`CEE_CONFIG`). Lo que esté vacío sale como «Próximamente» o «A consultar».
- **Estilos:** `assets/css/web.css` (cristal translúcido sobre foto, escala `--u`, Inter + Inter Tight).
- **Comportamiento:** `assets/js/app.js` (datos, menú, etiqueta A–G, calculadora, transiciones).
- **Foto de fondo:** Gran Vía de Madrid, Unsplash (photo-1539037116277-4db20889f2d4), licencia Unsplash (uso libre, sin atribución obligatoria).
- Copia del estilo anterior («papel técnico»): `../version-papel/`.
