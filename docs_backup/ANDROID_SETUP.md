# Nota del autor: este documento fue actualizado manualmente el 29 de octubre de 2025 para clarificar los pasos de configuración del emulador Android.
# Cambios principales: he simplificado comandos, añadido comprobaciones de variables de entorno y anotado soluciones comunes.
# Para más detalles revisa el historial de commits.

# 🔧 GUÍA - Ejecutar en Android Studio Emulator

## ✅ Pasos para Configurar Android Studio

### PASO 1: Verificar que Android Studio esté instalado
```bash
# Verifica que tienes Android Studio
# Windows: Busca "Android Studio" en inicio
```

---

### PASO 2: Crear o Abrir un Emulador

#### Opción A: Abrir Android Studio
1. Busca **Android Studio** en tu menú Inicio
2. Haz clic para abrir

#### Opción B: Desde Terminal (Línea de comandos)
```bash
# Si tienes Android Studio instalado en default
"C:\Program Files\Android\Android Studio\bin\studio64.exe"
```

---

### PASO 3: Crear un Emulador (si no tienes uno)

En Android Studio:
1. Ve a **AVD Manager** (esquina superior derecha)
2. O ve a: **Tools** → **Device Manager** → **Virtual**
3. Haz clic en **"Create Device"**
4. Selecciona un dispositivo (ej: **Pixel 5**)
5. Selecciona una imagen del sistema (ej: **Android 14**)
6. Completa la configuración
7. Haz clic en **"Finish"**

---

### PASO 4: Iniciar el Emulador

#### Opción A: Desde Android Studio
1. En **Device Manager**, busca tu emulador
2. Haz clic en el triángulo de **Play** ▶️
3. Espera a que cargue (~30-60 segundos)

#### Opción B: Desde Terminal
```bash
# Lista emuladores disponibles
emulator -list-avds

# Inicia un emulador (reemplaza "nombre" con tu emulador)
emulator -avd nombre_del_emulador
```

---

### PASO 5: Verificar que el Emulador esté conectado

En **otra ventana de terminal**, ejecuta:
```bash
adb devices
```

**Deberías ver algo como:**
```
List of attached devices
emulator-5554           device
```

---

## 🚨 Problemas Comunes

### ❌ "Emulator not found"
**Solución:** configura ANDROID_HOME y agrega emulator a PATH

### ❌ "adb: command not found"
**Solución:** agregar platform-tools a PATH o usar ruta completa

### ❌ Emulador muy lento
**Solución:** aumentar RAM, CPU cores, habilitar aceleración

---

¿Necesitas ayuda con algún paso específico? 🤔