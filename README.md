# FinzApp 💰

> Aplicación móvil de finanzas personales para el control de gastos, ingresos y administración de múltiples billeteras.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📱 Descripción

**FinzApp** es una aplicación móvil desarrollada con React Native y Expo que permite a los usuarios gestionar sus finanzas personales de manera intuitiva. Cuenta con soporte para múltiples billeteras (efectivo, banco, tarjetas, etc.), estadísticas visuales con gráficos interactivos y una experiencia de usuario moderna.

### ✨ Características Principales

- 🔐 **Autenticación local** - Registro e inicio de sesión seguro
- 💼 **Múltiples billeteras** - Gestiona efectivo, cuentas bancarias, tarjetas, etc.
- 📊 **Estadísticas visuales** - Gráficos de gastos e ingresos por categoría
- 💸 **Transacciones** - Registra ingresos y gastos con categorías personalizadas
- 📱 **Offline-first** - Funciona sin conexión a internet (SQLite local)
- 🌙 **Tema oscuro/claro** - Interfaz adaptable a preferencias del usuario
- 📤 **Exportar/Importar** - Respaldo y restauración de datos

---

## 🛠️ Tecnologías

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| React Native | 0.81.5 | Framework móvil multiplataforma |
| Expo | SDK 54 | Plataforma de desarrollo |
| TypeScript | 5.9.2 | Tipado estático |
| expo-router | 6.0.13 | Navegación basada en archivos |
| expo-sqlite | 16.0.8 | Base de datos local |
| react-native-chart-kit | 6.12.0 | Gráficos y estadísticas |
| AsyncStorage | 2.2.0 | Almacenamiento de sesión |

---

## 📁 Estructura del Proyecto

```
FinzApp/
├── app/                    # Pantallas (expo-router)
│   ├── (auth)/            # Autenticación (login, registro)
│   ├── (tabs)/            # Pestañas principales
│   │   ├── inicio.tsx     # Dashboard principal
│   │   ├── billetera.tsx  # Lista de billeteras
│   │   ├── estadisticas.tsx # Gráficos
│   │   └── perfil.tsx     # Perfil de usuario
│   └── _layout.tsx        # Layout raíz
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI
│   └── ChartCard.tsx     # Tarjetas de gráficos
├── database/             # Capa de datos SQLite
│   ├── db.ts            # Implementación nativa
│   ├── db.web.ts        # Fallback web (localStorage)
│   └── index.ts         # Abstracción de plataforma
├── hooks/                # Custom hooks
│   ├── useAuth.ts       # Autenticación
│   └── useNotification.ts # Notificaciones
├── lib/                  # Utilidades
│   ├── validators.ts    # Validación de inputs
│   └── logger.ts        # Sistema de logs
├── constants/            # Constantes y colores
└── assets/              # Imágenes y fuentes
```

---

## 🚀 Instalación y Uso

### Requisitos Previos

- Node.js >= 18
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio + SDK (para emulador) o dispositivo físico
- Expo Go (app móvil para desarrollo)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/SoyMarko/FinzApp_AplicacionDeFinanzas.git

# Entrar al directorio
cd FinzApp_AplicacionDeFinanzas

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start
```

### Ejecutar en Dispositivo

```bash
# Android (emulador o dispositivo)
npm run android

# iOS (solo macOS)
npm run ios

# Web
npm run web
```

---

## 📦 Generar APK

### Usando EAS Build (Recomendado)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Iniciar sesión en Expo
eas login

# Generar APK de producción
eas build -p android --profile production
```

### Build Local (Requiere Android Studio)

```bash
# Generar proyecto nativo
npx expo prebuild

# Compilar APK
cd android && ./gradlew assembleRelease
```

---

## 📊 Modelo de Datos

### Usuarios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único |
| nombre | TEXT | Nombre del usuario |
| apellido | TEXT | Apellido del usuario |
| correo | TEXT | Correo electrónico (único) |
| contraseña | TEXT | Contraseña encriptada |
| fecha_registro | TEXT | Fecha de creación |

### Billeteras
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único |
| usuario_id | INTEGER | FK a usuarios |
| nombre | TEXT | Nombre de la billetera |
| saldo | REAL | Saldo actual |
| color | TEXT | Color identificador |
| fecha_creacion | TEXT | Fecha de creación |

### Transacciones
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Identificador único |
| billetera_id | INTEGER | FK a billeteras |
| tipo | TEXT | 'ingreso' o 'gasto' |
| categoria | TEXT | Categoría de la transacción |
| monto | REAL | Cantidad |
| descripcion | TEXT | Descripción opcional |
| fecha | TEXT | Fecha de la transacción |

---

## 👨‍💻 Autor

**Mora** - Proyecto escolar de desarrollo móvil

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📚 Documentación Adicional

La documentación técnica completa se encuentra en la carpeta `docs_backup/`:
- `ARQUITECTURA.md` - Arquitectura del sistema
- `GUIA_IMPLEMENTACION.md` - Guía de implementación
- `ANDROID_SETUP.md` - Configuración de Android
