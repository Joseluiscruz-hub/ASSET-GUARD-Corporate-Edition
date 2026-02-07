Título: 🔧 Fix: parametrizar URL y usar waitForSelector en scripts/collect-console

Resumen
-----
Este Pull Request parametriza la URL objetivo del script de pruebas `scripts/collect-console.mjs`, sustituye una espera fija por una espera condicional más robusta y añade documentación y un script npm para ejecutar el script de forma reproducible en local y CI.

Cambios realizados
------------------
- scripts/collect-console.mjs
  - Reemplaza la URL hardcodeada por `process.env.TEST_URL || 'https://joseluiscruz-hub.github.io/asset-guard-corporate-edition/'`.
  - Sustituye `page.waitForTimeout(...)` por `await page.waitForSelector('body', { state: 'visible' })` para reducir flakiness en las pruebas.
- package.json
  - Añadido script npm: `"collect-console": "node scripts/collect-console.mjs"`.
- README_COLLECT.md (nuevo)
  - Documentación con pasos para instalar Playwright (navegadores) y ejecutar el script localmente o en CI.

Motivación
---------
- Evitar URLs hardcodeadas facilita probar en entornos distintos (local, preview, CI).
- Reemplazar timeouts fijos por esperas condicionales mejora la estabilidad de las ejecuciones y reduce falsos negativos.
- Facilitar la ejecución con un script npm y documentación ayuda a replicar errores y a integrar la comprobación en CI.

Cómo probar (local)
-------------------
1. Instalar dependencias y navegadores de Playwright:

```powershell
npm ci
npx playwright install --with-deps
```

2. Ejecutar el script con la URL por defecto (GitHub Pages):

```powershell
npm run collect-console
```

3. Ejecutar contra una URL local o preview:

```powershell
# PowerShell
$env:TEST_URL = "http://localhost:4200/"; npm run collect-console

# Bash (alternativa)
# TEST_URL="http://localhost:4200/" npm run collect-console
```

4. Revisar la salida: el script emite PAGE_CONSOLE, PAGE_ERROR y RESPONSE para diagnóstico.

Cómo probar (CI)
----------------
- En el job del runner:
  - `npm ci`
  - `npx playwright install --with-deps`
  - exportar `TEST_URL` apuntando a la build preview o al entorno deseado
  - ejecutar `npm run collect-console` como paso del job

Notas sobre dependencias / seguridad
-----------------------------------
- Este PR NO actualiza dependencias críticas. `xlsx` permanece en `0.18.5` (la versión publicada más reciente en npm al preparar este PR). Intenté apuntar a `xlsx@0.18.7`, pero esa versión no existe en el registro npm (error: No matching version found). Si en el futuro existe una versión parcheada, recomiendo abrir un PR separado para actualizar `package.json` + `package-lock.json` y validar en CI.

Checklist para revisión (necesario antes de merge)
--------------------------------------------------
- [ ] CI: el job de build y tests del PR pasa.
- [ ] Ejecutar `npm run collect-console` localmente o en runner con `playwright install` y confirmar salida sin errores.
- [ ] Verificar que `TEST_URL` llega correctamente desde CI (preview/production según el caso).
- [ ] (Opcional) Añadir job en el workflow de PR que ejecute `npm run collect-console` contra la build de preview.

Archivos tocados (resumen)
-------------------------
- Modified: `scripts/collect-console.mjs`
- Modified: `package.json` (añade script `collect-console`)
- Added: `README_COLLECT.md`

Comandos útiles para crear el PR
-------------------------------
- Usando la CLI `gh` (si la tienes instalada y autenticada):

```powershell
gh pr create --title "🔧 Fix: parametrizar URL y usar waitForSelector en scripts/collect-console" --body-file PR_BODY.md --base main --head fix/collect-console-parametrize
```

- Abrir en el navegador (UI y revisar cambios antes de crear PR):
https://github.com/Joseluiscruz-hub/ASSET-GUARD-Corporate-Edition/compare/main...fix/collect-console-parametrize?expand=1

Etiquetas / revisores sugeridos
- Labels: tests, ci, docs, bug
- Reviewers: responsable(s) de CI/QA o mantenedor(es) del repo
