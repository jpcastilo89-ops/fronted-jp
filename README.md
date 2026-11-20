# Web del U.E. Instituto María Inmaculada (Carora)

Sitio estático de una sola página: `index.html` + `config.js` (datos de contacto) + `contenido.js` (noticias y galería) + `assets/`.

- Cambiar teléfono, WhatsApp, horario, dirección: **solo en `config.js`**.
- Añadir una noticia o álbum: copiar un bloque en `contenido.js`.
- Publicado en Render como sitio estático (sin compilación, carpeta raíz `./`). Cada `git push` a `main` vuelve a publicar solo.
- Pruebas: `?lite` fuerza la versión ligera (sin animaciones), `?fx` fuerza las animaciones.
