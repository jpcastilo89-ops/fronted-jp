# Tiendas Montana – La Pinturería (web)

Sitio estático: `index.html` + `vendor/three` (three.js 0.160, licencia MIT).
Los datos de la tienda se editan en `MONTANA_CONFIG`, al principio de `index.html`.

- `img/`: logo, etiquetas de los galones (texturas 3D) y `galon-*.webp` (imagen plana de cada galón,
  renderizada con el mismo modelo 3D; se usa en catálogo, kit y cuando el teléfono no tiene WebGL).
- `img/simulador/`: fotos (Unsplash), miniaturas y máscaras de pared del simulador de color.
- `fonts/`: Bricolage Grotesque (woff2).
- `robots.txt`, `sitemap.xml`, `favicon.png`, `apple-touch-icon.png`, `og-montana.jpg`.

La web se debe abrir desde el servidor (enlace publicado), no como archivo suelto.
