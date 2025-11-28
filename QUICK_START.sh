#!/usr/bin/env bash
# 🚀 QUICK START GUIDE - Activar mejoras en 5 minutos
#
# Este archivo contiene los pasos para activar todas las mejoras
# implementadas. Sigue estos pasos EN ORDEN.

# ============================================================================
# PASO 0: Verificar que estés en la carpeta correcta
# ============================================================================

# Verifica que estés en el root del proyecto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en la carpeta del proyecto"
    echo "📂 Navega a: c:/Users/danue/Desktop/FinanzasPersonalesApp-main"
    exit 1
fi

echo "✅ Estás en el directorio correcto"

# ============================================================================
# PASO 1: Actualizar app/_layout.tsx
# ============================================================================

echo ""
echo "📝 PASO 1: Actualizar app/_layout.tsx"
echo "─────────────────────────────────────"
echo ""
echo "Abre: app/_layout.tsx"
echo ""
echo "1. Importa ErrorBoundary al inicio:"
echo "   import { ErrorBoundary } from '@/components/ErrorBoundary';"
echo ""
echo "2. Importa NotificationProvider:"
echo "   import { NotificationProvider } from '@/context/NotificationContext';"
echo ""
echo "3. Reemplaza el return() de tu RootLayout con:"
echo ""
echo '    <ErrorBoundary>'
echo '      <NotificationProvider>'
echo '        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>'
echo '          <Stack>'
echo '            {/* resto de tu Stack */}'
echo '          </Stack>'
echo '          <StatusBar style="auto" />'
echo '        </ThemeProvider>'
echo '      </NotificationProvider>'
echo '    </ErrorBoundary>'
echo ""
echo "4. Guarda el archivo"
echo ""
read -p "¿Terminaste Paso 1? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# ============================================================================
# PASO 2: Importar NotificationContext en app/(auth)/registro.tsx
# ============================================================================

echo ""
echo "📝 PASO 2: Mejorar app/(auth)/registro.tsx"
echo "────────────────────────────────────────────"
echo ""
echo "Abre: app/(auth)/registro.tsx"
echo ""
echo "1. Agregua estos imports:"
echo "   import { validarRegistro } from '@/lib/validators';"
echo "   import { useNotificationContext } from '@/context/NotificationContext';"
echo "   import { log } from '@/lib/logger';"
echo ""
echo "2. En el componente, agrega:"
echo "   const notify = useNotificationContext();"
echo ""
echo "3. Reemplaza Alert.alert() con notify.error()"
echo "   Ejemplo:"
echo "   // ANTES: Alert.alert('Error', 'Email inválido')"
echo "   // AHORA: notify.error('Email inválido')"
echo ""
echo "4. Reemplaza console.log() con log:"
echo "   // ANTES: console.log('Registrando...')"
echo "   // AHORA: log.info('Usuario registrándose', { correo })"
echo ""
read -p "¿Terminaste Paso 2? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# ============================================================================
# PASO 3: Mejorar app/(tabs)/nueva-billetera.tsx
# ============================================================================

echo ""
echo "📝 PASO 3: Mejorar app/(tabs)/nueva-billetera.tsx"
echo "──────────────────────────────────────────────────"
echo ""
echo "Abre: app/(tabs)/nueva-billetera.tsx"
echo ""
echo "1. Agrega imports:"
echo "   import { validarNombreBilletera, validarMonto } from '@/lib/validators';"
echo "   import { useNotificationContext } from '@/context/NotificationContext';"
echo "   import { log } from '@/lib/logger';"
echo ""
echo "2. En el componente:"
echo "   const notify = useNotificationContext();"
echo ""
echo "3. Al guardar billetera, valida:"
echo "   const valNombre = validarNombreBilletera(nombre);"
echo "   if (!valNombre.valido) {"
echo "     notify.error(valNombre.error);"
echo "     return;"
echo "   }"
echo ""
echo "   const valMonto = validarMonto(saldo);"
echo "   if (!valMonto.valido) {"
echo "     notify.error(valMonto.error);"
echo "     return;"
echo "   }"
echo ""
echo "4. Usa notificaciones:"
echo "   notify.success('Billetera creada ✓');"
echo ""
read -p "¿Terminaste Paso 3? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# ============================================================================
# PASO 4: Mejorar app/(tabs)/nueva-transaccion.tsx
# ============================================================================

echo ""
echo "📝 PASO 4: Mejorar app/(tabs)/nueva-transaccion.tsx"
echo "───────────────────────────────────────────────────"
echo ""
echo "Abre: app/(tabs)/nueva-transaccion.tsx"
echo ""
echo "Sigue el mismo patrón del Paso 3:"
echo ""
echo "1. Imports:"
echo "   import { validarMonto, validarCategoria, validarDescripcion } from '@/lib/validators';"
echo "   import { useNotificationContext } from '@/context/NotificationContext';"
echo ""
echo "2. Hook:"
echo "   const notify = useNotificationContext();"
echo ""
echo "3. Validar antes de guardar:"
echo "   validarMonto(monto)"
echo "   validarCategoria(categoria)"
echo "   validarDescripcion(descripcion)"
echo ""
echo "4. Notificar:"
echo "   notify.success('Transacción registrada ✓');"
echo ""
read -p "¿Terminaste Paso 4? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# ============================================================================
# PASO 5: Reemplazar Alerts en app/(tabs)/editar-transaccion.tsx
# ============================================================================

echo ""
echo "📝 PASO 5: Mejorar app/(tabs)/editar-transaccion.tsx"
echo "────────────────────────────────────────────────────"
echo ""
echo "Abre: app/(tabs)/editar-transaccion.tsx"
echo ""
echo "1. Agrega el mismo pattern de validación"
echo "2. Reemplaza Alerts con Toasts"
echo "3. IMPORTANTE: Al eliminar, pide confirmación:"
echo ""
echo "   const [confirmarEliminar, setConfirmarEliminar] = useState(false);"
echo ""
echo "   if (confirmarEliminar) {"
echo "     Alert.alert("
echo '       "⚠️ Eliminar",,'
echo '       "¿Estás seguro? No se puede deshacer.",'
echo "       ["
echo '         { text: "Cancelar", style: "cancel" },'
echo '         { text: "Eliminar", onPress: () => { /* delete */ }, style: "destructive" }'
echo "       ]"
echo "     );"
echo "   }"
echo ""
read -p "¿Terminaste Paso 5? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# ============================================================================
# PASO 6: Test de lo que hiciste
# ============================================================================

echo ""
echo "✅ AHORA VAMOS A TESTEAR TODO"
echo "────────────────────────────"
echo ""
echo "Abre una terminal y corre:"
echo "  npm start"
echo ""
echo "Luego prueba esto:"
echo ""
echo "1. Login con credenciales inválidas"
echo "   → Deberías ver Toast con error"
echo ""
echo "2. Crear una billetera con nombre vacío"
echo "   → Deberías ver Toast con error de validación"
echo ""
echo "3. Crear transacción con monto negativo"
echo "   → Deberías ver Toast con error"
echo ""
echo "4. Eliminar billetera"
echo "   → Deberías ver confirmación ANTES de eliminar"
echo ""
echo "5. Ver logs en console"
echo "   → Deberías ver [INFO], [WARN], [ERROR] estructurados"
echo ""
read -p "¿Probaste todo? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 1
fi

# ============================================================================
# PASO 7: Próximos pasos
# ============================================================================

echo ""
echo "🎉 ¡FELICIDADES! Has activado las mejoras"
echo "════════════════════════════════════════"
echo ""
echo "📚 DOCUMENTACIÓN:"
echo "   • RESUMEN_MEJORAS.md - Overview de todo"
echo "   • GUIA_IMPLEMENTACION.md - Pasos detallados"
echo "   • ANALISIS_Y_MEJORAS.md - Análisis profundo"
echo ""
echo "🔐 PRÓXIMAS PRIORIDADES:"
echo "   1. Instalar expo-secure-store (para encripción)"
echo "   2. Agregar validación en la base de datos"
echo "   3. Implementar confirmación de eliminación"
echo "   4. Setup de testing (Jest)"
echo ""
echo "📖 Para aprender más:"
echo "   • Lee GUIA_IMPLEMENTACION.md"
echo "   • Mira ejemplos en app/(auth)/iniciar-sesion.tsx"
echo ""
echo "💡 TIPS:"
echo "   • Usa validadores en TODOS los formularios"
echo "   • Reemplaza TODOS los Alerts con Toasts"
echo "   • Siempre loguea eventos importantes"
echo "   • Envuelve componentes críticos en ErrorBoundary"
echo ""
echo "¿Dudas? Revisa los comentarios en los archivos creados"
echo ""
echo "Happy coding! 🚀"
echo ""

# ============================================================================
# Optional: Instalar dependencias recomendadas
# ============================================================================

read -p "¿Quieres instalar las dependencias recomendadas? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "📦 Instalando dependencias críticas..."
    echo "   • expo-secure-store (encriptación)"
    echo "   • expo-crypto (hashing)"
    echo ""
    
    npm install expo-secure-store expo-crypto
    
    echo ""
    echo "✅ Dependencias instaladas"
    echo ""
    echo "Próximo: Lee RECOMMENDED_DEPENDENCIES.md para más info"
fi

echo ""
echo "════════════════════════════════════════"
echo "Gracias por mejorar Mora Finance App! 🎉"
echo "════════════════════════════════════════"
