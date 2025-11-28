# Nota del autor: este documento fue actualizado manualmente el 29 de octubre de 2025 para dejar constancia de los ajustes realizados en la arquitectura.
# Cambios principales: clarificación de capas, corrección en el flujo de notificaciones y anotaciones sobre responsabilidades de módulos.
# Para más detalles revisa el historial de commits.

# 🏗️ ARQUITECTURA DE MEJORAS - Mora Finance App

## Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│              (Input form, Button click, etc)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   INPUT VALIDATION LAYER     │
        │   (validators.ts)            │
        ├──────────────────────────────┤
        │ • validarEmail()             │
        │ • validarMonto()             │
        │ • validarNombre()            │
        │ • sanitizar()                │
        └──────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
      ✅ VÁLIDO              ❌ INVÁLIDO
           │                       │
           ▼                       ▼
    ┌────────────────┐    ┌──────────────────┐
    │ Proceder con   │    │ NOTIFICATION     │
    │ lógica app     │    │ (Toast)          │
    │                │    ├──────────────────┤
    │ • Guardar DB   │    │ notify.error()   │
    │ • Actualizar   │    │ Show error toast │
    │ • Navegar      │    │ Log warning      │
    └────────────────┘    └──────────────────┘
           │
           ▼
    ┌──────────────────────────────┐
    │   DATABASE OPERATIONS        │
    │   (SQLite via db.ts)         │
    └──────────────────────────────┘
           │
      ┌────┴────┐
   ✅ OK    ❌ ERROR
      │         │
      ▼         ▼
   SUCCESS   ERROR HANDLING
   TOAST     ├─ Log.error()
      │      ├─ notify.error()
      ▼      ├─ ErrorBoundary catches
      END    └─ User sees friendly UI
```

---

## Arquitectura en Capas

```
┌───────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                        │
│  (Components: Toast, PrimaryButton, TextField, etc)   │
├───────────────────────────────────────────────────────┤
│           
│  ┌─ CONTEXT LAYER
│  │  NotificationContext (Global notification state)
│  │  ErrorBoundary (Error recovery)
│  │
└──┼─────────────────────────────────────────────────────┐
   │              LOGIC LAYER (HOOKS)                    │
   │  ├─ useAuth (Authentication state)                │
   │  ├─ useNotification (Notification management)     │
   │  └─ Custom hooks (useFocusEffect, etc)            │
   │
   └──┬─────────────────────────────────────────────────┐
      │           VALIDATION & UTILITY LAYER            │
      │  ├─ validators.ts (Input validation)           │
      │  ├─ logger.ts (Structured logging)             │
      │  ├─ constants/ (Colors, Spacing, etc)          │
      │  └─ helpers/ (Utility functions)               │
      │
      └──┬─────────────────────────────────────────────┐
         │        DATA PERSISTENCE LAYER                │
         │  ├─ AsyncStorage (Session persistence)      │
         │  ├─ SQLite (Main data - billeteras, etc)    │
         │  └─ SecureStore (Future: sensitive data)    │
         │
         └──────────────────────────────────────────────
```

---

## Flujo de Notificaciones

```
Component renders
       │
       ▼
useNotificationContext() hook
       │
       ├─ notify.success("Mensaje")
       ├─ notify.error("Error")
       ├─ notify.warning("Advertencia")
       └─ notify.info("Info")
       │
       ▼
NotificationProvider receives action
       │
       ├─ Creates notification object
       ├─ Adds to notifications array
       └─ Sets auto-dismiss timeout
       │
       ▼
ToastContainer renders Toast component
       │
       ├─ Spring animation (entrada)
       ├─ Display for duration
       └─ Slide animation (salida)
       │
       ▼
Remove from array
       │
       └─ Toast disappears
```

---

## Flujo de Error Handling

```
Component renders (Error occurs)
       │
       ├─ Error in component tree
       │  OR
       ├─ Error in child component
       │
       ▼
ErrorBoundary.componentDidCatch()
       │
       ├─ Catch error
       ├─ Log with logger.ts
       ├─ Update state: { hasError: true }
       └─ Send to Sentry (optional)
       │
       ▼
Render error UI instead of component
       │
       ├─ Show error message
       ├─ Show stack (dev mode only)
       ├─ Offer "Reintentar" button
       └─ Option to "Share Error" (dev)
       │
       ▼
User clicks "Reintentar"
       │
       └─ Reset state & re-render normally
```

---

## Flujo de Autenticación Mejorado

```
┌─────────────────────────────────────────┐
│   User opens app                        │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌──────────────────────┐
        │ useAuth hook         │
        │ verificarSesion()    │
        └────────┬─────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    ✅ SESSION        ❌ NO SESSION
    FOUND            FOUND
        │                 │
        ▼                 ▼
   Set usuario      usuario = null
   Set loading:false
        │                 │
        └────────┬────────┘
                 │
                 ▼
            App renders
                 │
        ┌────────┴────────┐
        │                 │
    AUTENTICADO      SIN AUTENTICAR
        │                 │
        ▼                 ▼
   Navigate to      Navigate to
   (tabs)/inicio    (auth)/iniciar-sesion
        │                 │
        └────────┬────────┘
                 │
                 ▼
            User continues
```

---

## Flujo de Validación de Login

```
User enters email & password
       │
       ▼
Click "Iniciar sesión"
       │
       ▼
validarCredencialesLogin(email, pass)
       │
       ├─ Check email format
       │  ├─ Valid? ✅
       │  └─ Invalid? ❌ → notify.error()
       │
       ├─ Check password exists
       │  ├─ Exists? ✅
       │  └─ Missing? ❌ → notify.error()
       │
       ▼
All validations pass? ✅
       │
       ├─ Call database.iniciarSesion()
       ├─ Credentials correct?
       │  │
       │  ├─ Yes ✅ → guardarSesion() → Redirect
       │  └─ No ❌ → notify.error() → Show error
       │
       └─ User continues
```

---

## Estructura de Carpetas Final

```
FinanzasPersonalesApp-main/
│
├── app/                           ← Screens (Expo Router)
│   ├── _layout.tsx               ← ROOT (Wrap with ErrorBoundary + NotificationProvider)
│   ├── index.tsx                 ← Welcome screen
│   ├── login.tsx
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── iniciar-sesion.tsx   ← ✅ MEJORADO (+Validation, +Logging, +Toast)
│   │   ├── registro.tsx         ← TODO: Integrate validators
│   │   └── ...
│   │
│   └── (tabs)/
│       ├── inicio.tsx
│       ├── nueva-billetera.tsx  ← TODO: Add validation
│       ├── nueva-transaccion.tsx ← TODO: Add validation
│       └── ...
│
├── components/
│   ├── Toast.tsx                 ← ✅ NUEVO (Notification UI)
│   ├── ErrorBoundary.tsx        ← ✅ NUEVO (Error recovery)
│   ├── ui/
│   │   ├── GlassCard.tsx
│   │   ├── PrimaryButton.tsx
+│   │   ├── TextField.tsx
   │   └── ...
│   └── ...
│
├── context/
│   └── NotificationContext.tsx  ← ✅ NUEVO (Global notifications)
│
├── constants/
│   ├── Colors.tsx
│   ├── Spacing.ts               ← TODO: Create
+│   └── FontSizes.ts             ← TODO: Create
│
├── database/
│   ├── db.ts
│   ├── db.web.ts
│   └── index.ts
│
├── hooks/
│   ├── useAuth.ts               ← ✅ MEJORADO (+Error state, +Sanitization)
│   ├── useNotification.ts       ← ✅ NUEVO (Notification management)
│   ├── useConfirm.ts            ← TODO: Create
│   └── useColorScheme.ts
│
├── lib/
│   ├── validators.ts            ← ✅ NUEVO (Input validation)
│   ├── logger.ts                ← ✅ NUEVO (Structured logging)
   │   ├── secure-storage.ts        ← TODO: Create (Encryption)
│   └── ...
│
├── assets/
│   ├── fonts/
│   └── images/
│
├── MEJORAS_README.md            ← ✅ NUEVO (Overview)
├── RESUMEN_MEJORAS.md           ← ✅ NUEVO (Summary)
├── GUIA_IMPLEMENTACION.md       ← ✅ NUEVO (Step-by-step)
├── ANALISIS_Y_MEJORAS.md        ← ✅ NUEVO (Deep analysis)
├── CHECKLIST.md                 ← ✅ NUEVO (Tasks)
├── RECOMMENDED_DEPENDENCIES.md  ← ✅ NUEVO (Dependencies)
├── QUICK_START.sh               ← ✅ NUEVO (Interactive guide)
│
├── package.json                 ← Update: Add new dependencies
├── tsconfig.json
├── app.json
└── ...

✅ = Completado
🔄 = In Progress
❌ = Not Started
TODO = Future implementation

---

## Ciclo de Desarrollo Recomendado

```
WEEK 1: INTEGRATION
┌────────────────────────────────┐
│ 1. Read GUIA_IMPLEMENTACION.md│
│ 2. Wrap _layout.tsx           │
│ 3. Test Error Boundary        │
│ 4. Integrate Toast in 2-3     │
│    pantallas importantes      │
│ 5. Check: npm start works     │
└────────────────────────────────┘
                │
                ▼
WEEK 2: VALIDATION
┌────────────────────────────────┐
│ 1. Add validators to forms     │
│ 2. Show inline errors          │
│ 3. Test all validations        │
│ 4. Commit with git             │
└────────────────────────────────┘
                │
                ▼
WEEK 3: SECURITY
┌────────────────────────────────┐
│ 1. Install secure-store        │
│ 2. Implement encryption        │
│ 3. Hash passwords              │
│ 4. Sanitize at DB level        │
└────────────────────────────────┘
                │
                ▼
WEEK 4+: PERFORMANCE & TESTING
┌────────────────────────────────┐
│ 1. Memoize components          │
│ 2. Setup Jest                  │
│ 3. Write tests                 │
│ 4. Optimize queries            │
└────────────────────────────────┘

---

## Data Flow Ejemplo: Crear Billetera

```
1. User fills form
   ├─ nombre: "Mi Billetera"
   └─ saldo: "1000"
       │
       ▼
2. Click "Crear" button
       │
       ▼
3. validarNombreBilletera(nombre)
   ├─ Check length
   ├─ Check format
   └─ Result: { valido: true }
       │
       ▼
4. validarMonto(saldo)
   ├─ Check number
   ├─ Check > 0
   └─ Result: { valido: true }
       │
       ▼
5. sanitizar() both inputs
   ├─ nombre: "Mi Billetera"
   └─ saldo: "1000"
       │
       ▼
6. crearBilletera(usuario_id, data)
   ├─ Call database
   ├─ DB validates again
   └─ Insert into SQLite
       │
       ├─ Success ✅
       │  ├─ log.info("Billetera creada")
       │  ├─ notify.success("¡Éxito!")
       │  ├─ Refresh billeteras list
       │  └─ Navigate back
       │
       └─ Error ❌
          ├─ log.error("DB error", error)
