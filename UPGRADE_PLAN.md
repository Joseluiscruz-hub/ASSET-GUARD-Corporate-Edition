Upgrade plan - fix/deps-and-security

Objetivo: eliminar overrides y el uso de `--legacy-peer-deps`, arreglar vulnerabilidades (p.ej. xlsx) y dejar `npm ci` funcionando sin errores.

1) Crear rama: ya creada `fix/deps-and-security`.

2) Dependencias candidatas a revisar/actualizar
- @types/node -> ^20.19.0 (compatibilidad con vite@7.x)
- vite -> ^7.3.1
- vitest -> ^4.0.18
- xlsx -> ^0.18.6 (mitigar CVE si se parchea en esta versión)

3) Pasos propuestos (iterativos)
- Actualizar una dependencia a la vez y ejecutar `npm ci`.
- Si `npm ci` falla, anotar conflicto y probar la versión siguiente compatible.

Comandos de ejemplo
```powershell
# actualizar @types/node
npm install --save-dev @types/node@^20.19.0
# actualizar xlsx
npm install xlsx@^0.18.6
# regenerar lockfile
rm package-lock.json
npm ci
```

4) Pruebas después de cada cambio
- `npm ci` (sin legacy flags)
- `npm run build`
- `npm test` (si existe)

5) Cuando todo esté OK
- Eliminar `overrides` de `package.json`
- Commit y push
- Abrir PR contra `main` para revisión

6) CI/CD
- Ya añadimos `.github/workflows/ci-gh-pages.yml` que intentará `npm ci` y hará fallback a `--legacy-peer-deps` si falla. Una vez que `npm ci` funcione limpio, la fallback puede eliminarse.

Notas
- Algunas actualizaciones pueden requerir pequeños cambios en configuración (por ejemplo, `vite.config` / `tsconfig`).
- En caso de `xlsx` sin fix, considerar reemplazar o aislar su uso.

Si estás de acuerdo, empiezo actualizando `@types/node` y `xlsx` en la rama y ejecuto `npm ci` para ver el resultado; luego continúo con `vite`/`vitest` si hace falta.
