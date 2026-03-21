<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ASSET-GUARD — Corporate Edition

<div align="center">

[![Security Status](https://img.shields.io/badge/Security-Protected-brightgreen)](SECURITY_VERIFICATION.md)
[![Firebase Rules](https://img.shields.io/badge/Firebase-Rules%20Applied-success)](database.rules.json)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()
[![Angular](https://img.shields.io/badge/Angular-19-red)](https://angular.io/)

**Estado de Seguridad:** ✅ Protegido | ✅ Firebase Rules Activas | ✅ XSS Previnido

</div>

Aplicación web empresarial para gestión y monitorización de activos corporativos con seguridad mejorada, autenticación Firebase, AI integration y paneles en tiempo real.

## 🔒 Seguridad Implementada

- ✅ **Firebase Security Rules** activas y configuradas
- ✅ **API Keys protegidas** con variables de entorno
- ✅ **XSS Prevention** con DOMPurify en todo contenido AI
- ✅ **Auth Guards** para protección de rutas
- ✅ **Validación de datos** en tiempo real
- ✅ **Índices de rendimiento** configurados

Ver [SECURITY_VERIFICATION.md](SECURITY_VERIFICATION.md) para detalles completos.

## Funciones y características

   - Gestión de activos: listado (`asset-list`) y vista detallada (`asset-detail`) de cada activo.
   - Panel de control (dashboard) con tarjetas KPI y métricas clave.
   - Autenticación y roles: login y panel de administración (`admin`) para usuarios con permisos.
   - Paneles especializados: `service-panel` y `solicitor-panel` para flujos operativos distintos.
   - Integración con AI: servicio `gemini.service.ts` preparado para llamadas a APIs de modelos (p. ej. Google Gemini).
   - Servicios de datos: `data.service.ts` para acceso y transformación de datos; incluye dataset de ejemplo `data/real-fleet.ts`.
   - Arquitectura modular con componentes reutilizables en `components/ui`.
   - Integración preparada para Firebase (configuración en variables de entorno).

   ## Estructura principal del proyecto

   - `src/components/` — componentes UI y páginas (admin, dashboard, login, asset-list, asset-detail, etc.).
   - `src/services/` — servicios compartidos (`auth.service.ts`, `data.service.ts`, `gemini.service.ts`).
   - `src/data/` — datos de ejemplo y fixtures (`real-fleet.ts`).
   - `environments/` — ejemplos y configuraciones por entorno (`environment.ts`, `environment.prod.ts`).

   ## Tecnologías

   - Angular + TypeScript
   - Tailwind CSS / PostCSS (configuración incluidas)
   - Firebase (opcional, para auth y backend)
   - Integración con APIs de modelos (Gemini u otros)

   ## Requisitos previos

   - Node.js (recomendado 18+)
   - npm o yarn

   ## Ejecutar en local

   1. Instala dependencias:

   ```bash
   npm install
   ````

   2. Crea el archivo de entorno copiando el ejemplo:

   ```bash
   cp .env.local.example .env.local
   ```

   3. Configura las variables en `.env.local`:
   - Clave API de Gemini (si la usas): obténla en https://ai.google.dev/
   - Configuración de Firebase (si usas Firebase): https://console.firebase.google.com/
   4. Ejecuta la app en modo desarrollo:

   ```bash
   npm run dev
   ```

   ## Construir y desplegar
   - Para construir para producción:

   ```bash
   npm run build
   ```

   - El contenido de `dist/` puede desplegarse en cualquier host estático o integrarse en un backend.

   ## Cómo contribuir
   - Abrir issues para bugs o propuestas de mejora.
   - Crear pull requests con cambios pequeños y tests cuando corresponda.

> Tip: Antes de abrir un PR, ejecuta `npm run check:lock` para validar que `package-lock.json` está sincronizado con `package.json`. Si falla, ejecuta `npm install` y commitea el nuevo `package-lock.json`.

## Smoke tests (Playwright) 🔬

He añadido un test de humo con Playwright en `tests/smoke.spec.ts` y configuración en `playwright.config.ts`.

- Ejecutar localmente (instala dependencias y deps de navegador si es necesario):

```bash
npm install
npx playwright install --with-deps
npm run test:smoke
```

Esto abre una comprobación rápida que carga la página principal y toma una captura `tmp/smoke.png` para revisión.
Si necesitas ayuda o quieres colaborar, abre un issue en este repositorio.

---

Si quieres, lo traduzco al inglés o añado instrucciones de despliegue específicas (Firebase, Vercel, Netlify).
