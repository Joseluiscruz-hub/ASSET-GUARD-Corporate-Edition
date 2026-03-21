# Firebase Security Rules - ASSET-GUARD Corporate Edition

## Ubicación
Estas reglas deben configurarse en Firebase Console:
https://console.firebase.google.com/project/asset-guard-demo/database/rules

## Reglas de Seguridad para Firebase Realtime Database

```json
{
  "rules": {
    // Solo usuarios autenticados pueden leer y escribir
    ".read": "auth !== null",
    ".write": "auth !== null",
    
    // Nodos específicos
    "assets": {
      ".read": "auth !== null",
      // Solo permitir escritura si el usuario está autenticado
      ".write": "auth !== null",
      "$assetId": {
        ".validate": "auth !== null && newData.hasChildren(['id', 'status'])"
      }
    },
    
    "failures": {
      ".read": "auth !== null",
      ".write": "auth !== null",
      "$failureId": {
        // Validar que los nuevos reportes de fallas tengan los campos requeridos
        ".validate": "auth !== null && newData.hasChildren(['economico', 'falla', 'reporta'])",
        "estatus": {
          ".validate": "newData.val() === 'Abierta' || newData.val() === 'En Proceso' || newData.val() === 'Cerrada'"
        },
        "prioridad": {
          ".validate": "newData.val() === 'Alta' || newData.val() === 'Media' || newData.val() === 'Baja'"
        }
      }
    },
    
    "reports": {
      ".read": "auth !== null",
      ".write": "auth !== null",
      "$reportId": {
        ".validate": "auth !== null && newData.hasChildren(['assetId', 'entryDate'])"
      }
    },
    
    // Índice para consultas eficientes
    "failures": {
      ".indexOn": ["estatus", "prioridad", "economico", "fechaIngreso"]
    },
    "assets": {
      ".indexOn": ["status", "id"]
    }
  }
}
```

## Reglas de Seguridad para Firebase Storage (si se usa)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Solo usuarios autenticados pueden subir archivos
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.resource.size < 5 * 1024 * 1024 // Máximo 5MB
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Consideraciones de Seguridad

### 1. Autenticación Requerida
- Todas las operaciones de lectura y escritura requieren autenticación
- Esto previene acceso no autorizado a los datos

### 2. Validación de Datos
- Se validan los campos requeridos en cada documento
- Se restringen los valores posibles para campos enum (estatus, prioridad)

### 3. Índices
- Se configuran índices para consultas eficientes
- Mejora el rendimiento de las queries por estatus y prioridad

### 4. Límites de Tamaño
- Storage limita archivos a 5MB
- Previene abuso del almacenamiento

## Implementación

1. Ve a Firebase Console
2. Selecciona el proyecto `asset-guard-demo`
3. Navega a Realtime Database → Rules
4. Copia y pega las reglas anteriores
5. Publica las reglas

## Notas Importantes

⚠️ **ADVERTENCIA**: Las reglas actuales del proyecto pueden ser permisivas. Es crítico actualizarlas antes de poner la aplicación en producción.

Para verificar las reglas actuales:
```bash
firebase database:rules:get --project asset-guard-demo
```

Para desplegar nuevas reglas:
```bash
firebase database:rules:set --project asset-guard-demo rules.json
```

## Referencias
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/database/security)
- [Firebase Rules Testing](https://firebase.google.com/docs/database/security/test-rules-emulator)
