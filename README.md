# Tiendas Montana – La Pinturería (web)

Sitio estático multipágina (sin compilación). Cada apartado es una página real con su propia dirección:

| Página       | Dirección        | Archivo                    |
|--------------|------------------|----------------------------|
| Inicio       | `/`              | `index.html`               |
| Productos    | `/productos/`    | `productos/index.html`     |
| Cómo pintar  | `/como-pintar/`  | `como-pintar/index.html`   |
| Catálogo     | `/catalogo/`     | `catalogo/index.html`      |
| Tu kit       | `/tu-kit/`       | `tu-kit/index.html`        |
| No encontrada| —                | `404.html`                 |

Archivos compartidos en `assets/`:

- `css/montana.css`: todos los estilos (incluye las transiciones entre páginas).
- `js/config.js`: **datos de la tienda** (`MONTANA_CONFIG`: WhatsApp, Instagram, mapa, horario…). Es el único sitio donde se cambian.
- `js/app.js`: galones 3D, catálogo, kit, «Tu lista», menú y barra inferior.
- `js/simulador.js`: simulador de color (solo en «Cómo pintar»).
- `js/paginas.js`: Sobre nosotros, Visítanos, pie de página.
- `js/nav.js`: navegación y transición entre páginas en navegadores sin transición nativa.
- `js/intro.js`: presentación de marca (solo en Inicio, una vez por visita).

«Tu lista», el kit y los colores guardados se guardan en el navegador (`localStorage`:
`montanaLista`, `montanaKit`, `montanaColores`), así que se mantienen al cambiar de página o recargar.

`vendor/three`: three.js 0.160 (licencia MIT).
