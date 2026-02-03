Resumen de TODOs y tareas prioritarias

Este archivo agrupa las tareas pendientes detectadas en el repositorio y los pasos recomendados para resolver dependencias, seguridad y automatización del despliegue en GitHub Pages.

Resultado de búsqueda de marcas TODO/FIXME
- No se encontraron marcas TODO o FIXME en `src/` (código de la aplicación).
- Las marcas TODO encontradas están dentro de `node_modules/` (dependencias). No requieren edición directa en la dependencia: se deben solucionar actualizando dependencias o reportando issues upstream.

Tareas prioritarias (alto -> bajo)

1) Arreglar dependencias y eliminar "overrides" / `--legacy-peer-deps`
   - Objetivo: que `npm ci` pase limpio sin usar `--legacy-peer-deps` ni `overrides` en `package.json`.
   - Pasos:
     - Crear rama: `git checkout -b fix/deps-and-security`
     - Probar actualizar paquetes conflictivos (`vite`, `vitest`, `@types/node`, `xlsx`) a versiones compatibles.
     - Ejecutar: `npm ci` y resolver conflictos hasta que pase.
   - Comandos útiles:
```powershell
npm install --save-dev @types/node@^20.19.0
npm install xlsx@^0.18.6
# o ajustar versiones según resultados
npm ci
```

2) Revisar y mitigar vulnerabilidades (npm audit)
   - Ejecuta: `npm audit` y revisa `audit.json`.
   - Si una dependencia (p.ej. `xlsx`) tiene CVE sin fix, evaluar:
     - actualizar a versión parcheada si existe, o
     - reemplazar la librería por alternativa, o
     - mitigar el uso (mover al backend, limitar inputs, sanitizar).

3) Eliminar `overrides` después de verificar (limpieza)
   - Cuando `npm ci` pase sin `legacy-peer-deps`, quitar la sección `overrides` de `package.json` y regenerar lockfile.
```powershell
# en rama fix/deps-and-security
# editar package.json para quitar overrides
rm -rf node_modules package-lock.json
npm ci
```

4) Añadir CI que reproduzca el entorno y despliegue a `gh-pages`
   - Agregar workflow GitHub Actions que haga:
     - checkout
     - setup-node
     - npm ci
     - npm run build
     - publicar `dist` en `gh-pages`
   - Ejemplo (simplificado):
```yaml
name: CI / Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

5) Documentación y tracking
   - Añadir este `TODO.md` (ya creado) y abrir PRs por cada cambio mayor.
   - Habilitar Dependabot (si no está) para PRs automáticos.

6) Verificación final y limpieza
   - Probar `npm run build` localmente.
   - Confirmar despliegue automático desde CI y eliminar soluciones temporales.

Cómo puedo ayudarte ahora
- Puedo crear la rama `fix/deps-and-security`, aplicar actualizaciones de dependencias poco a poco y abrir la PR con los cambios probados (opción recomendada).
- O puedo crear el workflow de GitHub Actions para CI/CD y añadirlo al repo.
- O solo listar las actualizaciones de versión que deberías probar manualmente.

Dime qué opción prefieres (crear rama y actualizar dependencias / crear workflow CI / solo listado de versión a probar) y lo implemento ahora.
