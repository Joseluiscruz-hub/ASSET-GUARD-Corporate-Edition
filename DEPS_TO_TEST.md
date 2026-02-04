Recomendación de versiones para probar (prioridad alta -> baja):

1) xlsx: 0.18.5 (pin actual) — está marcado con CVE; probar la 0.18.7 o superior si está disponible y sin CVEs.
2) exceljs: ^4.4.0 — probar la última 4.x estable o migrar a una versión segura.
3) firebase: ^12.8.0 — probar con la 12.10+ o la 13.x si es compatible.
4) @types/node: ^20.19.0 — OK, verificar compatibilidad con TypeScript ~5.5.0.
5) playwright: ^1.58.1 — considerar usar una versión compatible con tus runners CI.

Pasos sugeridos:
- Crear rama `fix/deps-and-security`.
- Actualizar una dependencia por PR pequeño y probar en CI.
- Repetir hasta cubrir las críticas (xlsx primero).
- Si una dependencia no es necesaria, eliminarlas para minimizar superficie.

Notas:
- `overrides` ya contiene `xlsx: 0.18.5`.
- CI workflow creado: `.github/workflows/ci-pages.yml` para build + deploy.
