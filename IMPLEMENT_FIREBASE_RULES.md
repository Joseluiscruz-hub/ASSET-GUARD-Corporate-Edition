# 🔒 Guía de Implementación - Firebase Security Rules

## Objetivo
Proteger tu Firebase Realtime Database contra accesos no autorizados.

---

## 📋 Paso a Paso para Implementar las Reglas

### Opción A: Desde Firebase Console (Recomendado - 5 minutos)

#### Paso 1: Abrir Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **asset-guard-demo**

#### Paso 2: Navegar a Realtime Database
1. En el menú lateral izquierdo, haz clic en **"Build"**
2. Haz clic en **"Realtime Database"**

#### Paso 3: Ir a la pestaña de Reglas
1. En la parte superior, verás pestañas: "Data", "Rules", "Usage"
2. Haz clic en **"Rules"**

#### Paso 4: Copiar y Pegar las Reglas

Copia el siguiente código y pégalo en el editor de reglas:

```json
{
  "rules": {
    ".read": "auth !== null",
    ".write": "auth !== null",
    
    "assets": {
      ".read": "auth !== null",
      ".write": "auth !== null",
      "$assetId": {
        ".validate": "auth !== null && newData.hasChildren(['id', 'status'])"
      }
    },
    
    "failures": {
      ".read": "auth !== null",
      ".write": "auth !== null",
      "$failureId": {
        ".validate": "auth !== null && newData.hasChildren(['economico', 'falla', 'reporta'])",
        "estatus": {
          ".validate": "newData.val() === 'Abierta' || newData.val() === 'En Proceso' || newData.val() === 'Cerrada'"
        },
        "prioridad": {
          ".validate": "newData.val() === 'Alta' || newData.val() === 'Media' || newData.val() === 'Baja'"
        }
      },
      ".indexOn": ["estatus", "prioridad", "economico", "fechaIngreso"]
    },
    
    "reports": {
      ".read": "auth !== null",
      ".write": "auth !== null",
      "$reportId": {
        ".validate": "auth !== null && newData.hasChildren(['assetId', 'entryDate'])"
      }
    },
    
    "settings": {
      ".read": "auth !== null",
      ".write": "auth !== null",
      "kioskMode": {
        ".validate": "newData.isBoolean()"
      }
    },
    
    "assets": {
      ".indexOn": ["status", "id"]
    }
  }
}
```

#### Paso 5: Publicar las Reglas
1. Haz clic en el botón **"Publish"** (azul, arriba a la derecha)
2. Confirma que quieres reemplazar las reglas actuales

✅ **¡Listo! Tus reglas están activas.**

---

### Opción B: Usando Firebase CLI (Para usuarios avanzados)

#### Prerrequisitos
- Tener Firebase CLI instalado: `npm install -g firebase-tools`
- Tener sesión iniciada: `firebase login`

#### Pasos

1. **Inicializar Firebase (si no lo has hecho)**
   ```bash
   firebase init
   ```
   - Selecciona: `Database`
   - Elige tu proyecto: `asset-guard-demo`
   - Archivo de reglas: `database.rules.json`

2. **Reemplazar el contenido de `database.rules.json`**
   - Usa el archivo que ya creamos en este proyecto

3. **Desplegar las reglas**
   ```bash
   firebase deploy --only database:rules
   ```

---

## 🔍 Verificación de Reglas

### ¿Cómo sé si las reglas funcionan?

1. **Abre Firebase Console** → Realtime Database → Rules
2. Deberías ver las reglas que acabas de publicar
3. El simulador de reglas (abajo) te permite probar accesos

### Pruebas Recomendadas

#### ✅ Prueba 1: Usuario no autenticado (DEBE FALLAR)
1. En el simulador de reglas, selecciona "Run"
2. Tipo: `read`
3. Location: `/assets`
4. Resultado esperado: ❌ **Denied**

#### ✅ Prueba 2: Usuario autenticado (DEBE FUNCIONAR)
1. En el simulador, haz clic en "Add authentication"
2. Selecciona un provider (ej: Google)
3. Tipo: `read`
4. Location: `/assets`
5. Resultado esperado: ✅ **Allowed**

---

## 📊 Explicación de las Reglas

### Regla General
```json
".read": "auth !== null",
".write": "auth !== null"
```
- **Significado**: Solo usuarios autenticados pueden leer y escribir
- **Propósito**: Previene acceso anónimo a tus datos

### Nodo `failures` (Reportes de Fallas)
```json
"failures": {
  ".validate": "auth !== null && newData.hasChildren(['economico', 'falla', 'reporta'])"
}
```
- **Validación**: Requiere campos: economico, falla, reporta
- **Propósito**: Evita datos incompletos o mal formados

### Validación de Estatus
```json
"estatus": {
  ".validate": "newData.val() === 'Abierta' || newData.val() === 'En Proceso' || newData.val() === 'Cerrada'"
}
```
- **Significado**: Solo permite valores específicos
- **Propósito**: Previene valores inválidos o typos

### Índices para Rendimiento
```json
".indexOn": ["estatus", "prioridad", "economico", "fechaIngreso"]
```
- **Propósito**: Mejora velocidad de consultas filtradas
- **Impacto**: Queries más rápidas en el dashboard

---

## ⚠️ Advertencias Importantes

### 1. Backup de Datos Actuales
Antes de aplicar las reglas:
1. Ve a Realtime Database → Data
2. Haz clic en los 3 puntos verticales (⋮) junto a "Realtime Database"
3. Selecciona **"Download JSON"**
4. Guarda el archivo como backup

### 2. Usuarios Existentes
- Las reglas requieren autenticación
- Si tienes usuarios existentes, asegúrate de que puedan loguearse
- Prueba el login con cada cuenta antes de desplegar a producción

### 3. Modo Offline
- La aplicación tiene modo offline
- Las reglas se aplican cuando hay conexión
- Los cambios offline se sincronizan cuando vuelve la conexión

---

## 🚨 Solución de Problemas

### Problema: "Permission denied" después de aplicar reglas

**Causa**: Usuario no autenticado
**Solución**:
1. Verifica que el usuario haya iniciado sesión
2. Revisa Firebase Authentication → Users
3. El usuario debe existir

### Problema: Datos no se guardan

**Causa**: Validación de campos fallida
**Solución**:
1. Verifica que todos los campos requeridos estén presentes
2. Revisa la consola del navegador para errores
3. Usa el simulador de reglas para depurar

### Problema: Consultas lentas

**Causa**: Índices faltantes
**Solución**:
1. Asegúrate de que `.indexOn` esté configurado
2. Firebase Console → Realtime Database → Rules
3. Verifica los índices en las reglas

---

## 📞 Soporte

Si tienes problemas:

1. **Documentación Oficial**: https://firebase.google.com/docs/database/security
2. **Simulador de Reglas**: Úsalo para probar antes de publicar
3. **Logs de Firebase**: Firebase Console → Project Settings → Usage

---

## ✅ Checklist de Implementación

- [ ] Abrir Firebase Console
- [ ] Navegar a Realtime Database → Rules
- [ ] Copiar reglas del archivo `database.rules.json`
- [ ] Pegar en el editor de Firebase Console
- [ ] Publicar reglas
- [ ] Probar con usuario no autenticado (debe fallar)
- [ ] Probar con usuario autenticado (debe funcionar)
- [ ] Verificar que la app funcione correctamente
- [ ] Hacer backup de datos actuales

---

## 🎯 Estado Después de la Implementación

| Antes | Después |
|-------|---------|
| 🔓 Público (cualquiera puede leer/escribir) | 🔒 Privado (solo autenticados) |
| ❌ Sin validación de datos | ✅ Validación de campos requeridos |
| ❌ Sin índices de rendimiento | ✅ Índices configurados |
| ❌ Vulnerable a ataques | ✅ Protegido |

---

**¡Tu base de datos ahora está segura! 🎉**
