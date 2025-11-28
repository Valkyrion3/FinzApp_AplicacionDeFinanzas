# Nota del autor: este documento fue actualizado manualmente el 29 de octubre de 2025 para mejorar la guía de uso de Android Studio y Device Manager.
# Cambios principales: añadido pasos alternativos, solucionado un ejemplo de ruta y clarificados tiempos de espera.
# Para más detalles revisa el historial de commits.

# 🤖 Android Studio - Guía Completa para Emulador

## 📲 PROBLEMA QUE VISTE:

```
CommandError: No Android connected device found, and no 
emulators could be started automatically.
```

**Significa:** No hay ningún emulador de Android corriendo. Necesitas:
1. Crear un emulador (si no tienes)
2. Lanzarlo
3. Luego ejecutar tu app

---

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Abre Android Studio

**Windows:**
1. Presiona **Windows Key** (tecla de Windows)
2. Escribe: `Android Studio`
3. Presiona **Enter**
4. Espera a que cargue

---

### PASO 2: Accede a Device Manager

Una vez abierto Android Studio:

**Opción A (Recomendada):**
- Mira arriba a la **derecha**
- Busca el icono que se parece a: **📱** o **Device Manager**
- Haz clic

**Opción B:**
- Menu: **Tools**
- Luego: **Device Manager**
- Haz clic

---

### PASO 3: Crea un Emulador (si no tienes uno)

En **Device Manager**:
1. Haz clic en **"Create Device"** o **"+"**
2. Elige un dispositivo (ejemplo: **Pixel 5**)
3. Haz clic **Next**
4. Elige una imagen del sistema:
   - Si es nuevo: Elige **Android 14** o **Android 13**
   - Haz clic **Next**
5. Dale un nombre (predeterminado está bien)
6. Haz clic **Finish**

**Esperarás 2-5 minutos** mientras descarga la imagen

---

### PASO 4: Lanza el Emulador

En Device Manager:
1. Busca tu emulador en la lista
2. En el lado derecho, verás botones
3. Busca el botón **Play ▶️** (triángulo verde)
4. **Haz clic en el Play ▶️**

**Esperarás 30-60 segundos** mientras el emulador inicia

Sabrás que está listo cuando:
- La pantalla del teléfono se vea "completa" (no cargando)
- Ves el homescreen de Android
- Ves la hora y la batería

---

### PASO 5: Verifica la Conexión

En **PowerShell/CMD**, ejecuta:
```bash
adb devices
```

**Deberías ver:**
```
List of attached devices
emulator-5554           device
```

Si ves `emulator-5554` con `device` (verde) ✅ → **¡Está conectado!**

---

## 🔧 TROUBLESHOOTING

### ❌ "adb: command not found"

**Causa:** Las herramientas de Android no están en tu PATH

**Solución:**
1. Abre: **Sistema** (Configuración)
2. Busca: **"Variables de entorno"**
3. Haz clic: **"Editar variables de entorno del sistema"**
4. Haz clic: **"Variables de entorno"** (abajo)
5. En la sección **"Variables del sistema"**, busca: **Path**
6. Haz clic: **Editar**
7. Haz clic: **Nuevo**
8. Agrega: `C:\Users\[TuUsuario]\AppData\Local\Android\Sdk\platform-tools`
9. Haz clic: **OK** en todas las ventanas
10. **Reinicia PowerShell**

Verifica:
```bash
adb devices
# Debería funcionar ahora
```

---

### ❌ "No emulators found"

**Causa:** No creaste ningún emulador

**Solución:**
1. Abre Android Studio
2. Ve a Device Manager
3. Haz clic **Create Device**
4. Sigue PASO 3 de arriba

---

### ❌ Emulador no inicia

**Prueba estas soluciones:**

1. **Cierra y vuelve a abrir:**
   - Device Manager → Haz clic en ⚙️ (gear)
   - Selecciona: **Wipe Data**
   - Vuelve a hacer clic en Play ▶️

2. **Aumenta RAM:**
   - Device Manager → Haz clic en ⚙️
   - Aumenta **Memory** a 4GB o 6GB
   - Aplica cambios
   - Vuelve a lanzar

3. **Cierra otros emuladores:**
   - Device Manager → Busca todos los que están "On"
   - Ciérralos todos
   - Lanza solo UNO

---

## 📋 CHECKLIST FINAL

Antes de ejecutar tu app:

- [ ] ¿Android Studio está instalado?
- [ ] ¿Tienes al menos 1 emulador creado?
- [ ] ¿El emulador está corriendo (ves el homescreen)?
- [ ] ¿`adb devices` muestra `emulator-5554 device`?
- [ ] ¿Tu proyecto está en: `C:\Users\danue\Desktop\FinanzasPersonalesApp-main`?
- [ ] ¿Ejecutaste `npm start`?
- [ ] ¿Presionaste `a` en el menú de Expo?

Si todos los checkboxes están ✅, tu app debería aparecer en 10-20 segundos.
