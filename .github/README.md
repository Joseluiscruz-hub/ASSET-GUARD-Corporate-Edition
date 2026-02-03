CI / Build & Deploy

Este workflow construye el proyecto y publica `dist` en la rama `gh-pages` cuando hay pushes a `main`.

Comportamiento:
- Intenta `npm ci` (instalación limpia). Si falla, hace fallback a `npm install --legacy-peer-deps` para evitar roturas por peer-deps.
- Ejecuta `npm run build` y publica el contenido de `dist` en `gh-pages` usando `peaceiris/actions-gh-pages@v3`.

Notas:
- Es recomendable resolver las incompatibilidades de dependencias para que `npm ci` funcione sin fallback.
- Ajusta `node-version` en el workflow si tu proyecto requiere otra versión de Node.js.
