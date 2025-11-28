# AppGastos

Aplicación móvil para el control de gastos personales y administración de múltiples billeteras, desarrollada con Expo y React Native.

---

## Descripción General
AppGastos permite a los usuarios registrar, visualizar y analizar sus gastos e ingresos de manera intuitiva, con soporte para múltiples billeteras (efectivo, banco, etc.), estadísticas visuales y una experiencia moderna y responsiva.

---

## Tecnologías Utilizadas
- **React Native** (Expo SDK 53+)
- **TypeScript**
- **expo-router** (Navegación)
- **expo-sqlite/legacy** (Base de datos local persistente)
- **@react-native-picker/picker** (Selector de billetera)
- **react-native-chart-kit** (Gráficas y estadísticas)
- **@expo/vector-icons** (Iconografía)
- **React Native Paper** (opcional, para UI)

---

## Estructura del Proyecto
# AppGastos — Resumen y guía rápida

AppGastos es una app Expo/React Native para llevar control de gastos e ingresos con soporte para múltiples billeteras y estadísticas locales.

Archivos de documentación completos se movieron a `docs_backup/` para dejar la raíz limpia. Si necesitas detalles, revisa esa carpeta.

Resumen rápido de uso (Windows / PowerShell):

- Requisitos mínimos:
  - Node >= 16
  - npm o yarn
  - Expo CLI / EAS CLI (opcional para builds)
  - Android Studio + SDK (para emulador) o dispositivo físico

- Instalar y ejecutar en desarrollo:
  1. npm install
  2. npm start
  3. Usa Expo Go (QR) o presiona "a" para abrir en emulador Android

- Generar APK con EAS (recomendado - cloud):
  1. npm install -g eas-cli   # o usa npx
  2. eas login
  3. eas build -p android --profile production
  4. Descargar el .apk desde la URL que entrega EAS

- Generar AAB (para Play Store):
  - Edita `eas.json` -> profile production -> set "android.buildType": "app-bundle"
  - Luego: eas build -p android --profile production

- Instalar el APK en dispositivo/emulador (PowerShell):
  - adb install -r path\to\app.apk

Notas importantes:
- La configuración del package Android está en `app.json` (android.package).
- Las builds por EAS pueden requerir que inicies sesión con la cuenta que administra el proyecto (eas login / eas whoami).
- Se crearon copias de seguridad de todos los documentos originales en `docs_backup/`.

Si quieres que deje SOLO un archivo .md en la raíz (el README actual) y reduzca o elimine los pointers restantes, dime y lo dejo exactamente así.

---

Archivos movidos a `docs_backup/` (resumen):
- CHECKLIST.md
- ARQUITECTURA.md
- RESUMEN_MEJORAS.md
- RESULTADO_FINAL.md
- RECOMMENDED_DEPENDENCIES.md
- MEJORAS_README.md
- INDICE_CAMBIOS.md
- GUIA_IMPLEMENTACION.md
- ANDROID_STUDIO_CONFIG.md
- ANDROID_SETUP.md
- ANALISIS_Y_MEJORAS.md
- api/README.md

---

Si quieres, puedo:
1. Reducir todos los .md en la raíz a un solo README (ya preparé este).  
2. Hacer commit con un mensaje claro (si me das permiso para ejecutar comandos).  
3. Actualizar `eas.json` para AAB si vas a publicar en Play.

Di qué prefieres y lo hago.
2. Agrega ingresos y gastos con categoría
# FinzApp_AplicacionDeFinanzas
