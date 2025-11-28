import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { exportarDatos as exportarDatosDB, importarDatos as importarDatosDB, obtenerEstadisticas, obtenerTransacciones, resetearDatos as resetearDatosDB } from '../../database';
import { useAuth } from '../../hooks/useAuth';
import { useSafeBack } from '../../hooks/useSafeBack';

// Configurar el handler de notificaciones para mostrar en primer plano
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function Configuracion() {
    const router = useRouter();
    const safeBack = useSafeBack()
    const { usuario } = useAuth();

    const [notificaciones, setNotificaciones] = useState(true);
    const [recordatorios, setRecordatorios] = useState(false);

    // ====== CONFIGURACIÓN DE NOTIFICACIONES PUSH ======
    // Intervalo de tiempo entre notificaciones (en milisegundos)
    // 6 horas = 6 * 60 * 60 * 1000 = 21600000 ms
    // Para pruebas: 30000 ms = 30 segundos
    const NOTIF_INTERVAL = 30000; // <-- Cambia aquí el tiempo (6 horas por defecto)
    //const NOTIF_INTERVAL = 21600000; // 6 horas

    // 50 consejos financieros y motivacionales
    const CONSEJOS_FINANCIEROS = [
        // === AHORRO ===
        { titulo: '💰 Ahorro', mensaje: 'Ahorra al menos el 10% de tus ingresos cada mes. ¡Tu yo del futuro te lo agradecerá!' },
        { titulo: '💰 Ahorro', mensaje: 'Págate a ti mismo primero. Antes de gastar, separa tu ahorro.' },
        { titulo: '💰 Ahorro', mensaje: 'Automatiza tus ahorros. Lo que no ves, no lo gastas.' },
        { titulo: '💰 Ahorro', mensaje: 'Cada peso cuenta. Los pequeños ahorros construyen grandes fortunas.' },
        { titulo: '💰 Ahorro', mensaje: 'El ahorro no es lo que sobra, es lo que apartas primero.' },
        { titulo: '💰 Ahorro', mensaje: 'Ahorrar es un hábito, no un sacrificio. Empieza pequeño y crece.' },
        { titulo: '💰 Ahorro', mensaje: 'Un peso ahorrado es un peso ganado. ¡Sigue así!' },
        
        // === GASTOS ===
        { titulo: '📊 Control de gastos', mensaje: 'Revisa tus gastos semanalmente. Conocer a dónde va tu dinero es el primer paso para controlarlo.' },
        { titulo: '📊 Control de gastos', mensaje: 'Registra cada gasto, por pequeño que sea. La información es poder.' },
        { titulo: '📊 Control de gastos', mensaje: 'Clasifica tus gastos en necesarios y opcionales. Te sorprenderás.' },
        { titulo: '📊 Control de gastos', mensaje: '¿Ya registraste tus gastos de hoy? Abre FinzApp y hazlo ahora.' },
        { titulo: '☕ Gastos hormiga', mensaje: 'Los pequeños gastos diarios suman mucho al mes. Ese café diario puede ser $1,500 al mes.' },
        { titulo: '☕ Gastos hormiga', mensaje: 'Revisa tus suscripciones. ¿Realmente usas todas?' },
        { titulo: '☕ Gastos hormiga', mensaje: 'Los antojos de hoy son los arrepentimientos de mañana. Piénsalo dos veces.' },
        
        // === METAS ===
        { titulo: '🎯 Meta financiera', mensaje: 'Establece metas de ahorro específicas. Una meta clara te motiva más que un deseo vago.' },
        { titulo: '🎯 Meta financiera', mensaje: 'Divide tus metas grandes en metas pequeñas. Paso a paso se llega lejos.' },
        { titulo: '🎯 Meta financiera', mensaje: 'Visualiza tu meta cada día. La motivación viene de ver el progreso.' },
        { titulo: '🎯 Meta financiera', mensaje: 'Celebra cada pequeño logro financiero. ¡Te lo mereces!' },
        { titulo: '🎯 Meta financiera', mensaje: 'Escribe tus metas financieras. Lo escrito tiene más poder.' },
        
        // === COMPRAS INTELIGENTES ===
        { titulo: '🛒 Compras inteligentes', mensaje: 'Antes de comprar algo, espera 24 horas. Si aún lo quieres después, probablemente lo necesitas.' },
        { titulo: '🛒 Compras inteligentes', mensaje: 'Pregúntate: ¿Lo necesito o lo quiero? La diferencia es clave.' },
        { titulo: '🛒 Compras inteligentes', mensaje: 'Compara precios antes de comprar. Tu bolsillo te lo agradecerá.' },
        { titulo: '🛒 Compras inteligentes', mensaje: 'Las ofertas solo son buenas si realmente necesitas el producto.' },
        { titulo: '🛒 Compras inteligentes', mensaje: 'Haz una lista antes de ir al super y cúmplela. Evita las compras impulsivas.' },
        { titulo: '🛒 Compras inteligentes', mensaje: 'El precio más bajo no siempre es el mejor. Considera la calidad y durabilidad.' },
        
        // === DEUDAS ===
        { titulo: '💳 Evita deudas', mensaje: 'Las deudas de tarjeta de crédito pueden crecer rápidamente. Paga el total cada mes si es posible.' },
        { titulo: '💳 Evita deudas', mensaje: 'Si tienes deudas, prioriza pagar las de mayor interés primero.' },
        { titulo: '💳 Evita deudas', mensaje: 'La mejor deuda es la que no tienes. Evita endeudarte por cosas innecesarias.' },
        { titulo: '💳 Evita deudas', mensaje: 'Usa la tarjeta de crédito como herramienta, no como extensión de tu sueldo.' },
        { titulo: '💳 Evita deudas', mensaje: 'Cada deuda pagada es un peso menos de estrés. ¡Sigue adelante!' },
        
        // === FONDO DE EMERGENCIA ===
        { titulo: '🏦 Fondo de emergencia', mensaje: 'Intenta tener ahorrado al menos 3 meses de gastos para emergencias. ¡La tranquilidad no tiene precio!' },
        { titulo: '🏦 Fondo de emergencia', mensaje: 'Un fondo de emergencia te protege de lo inesperado. Constrúyelo poco a poco.' },
        { titulo: '🏦 Fondo de emergencia', mensaje: 'Las emergencias no avisan. ¿Ya tienes tu fondo listo?' },
        { titulo: '🏦 Fondo de emergencia', mensaje: 'Tu fondo de emergencia es tu red de seguridad financiera. No lo toques para antojos.' },
        
        // === INVERSIÓN ===
        { titulo: '📈 Inversión', mensaje: 'El mejor momento para empezar a invertir fue ayer. El segundo mejor momento es hoy.' },
        { titulo: '📈 Inversión', mensaje: 'No pongas todos los huevos en la misma canasta. Diversifica tus inversiones.' },
        { titulo: '📈 Inversión', mensaje: 'Invertir no es solo para ricos. Empieza con lo que puedas.' },
        { titulo: '📈 Inversión', mensaje: 'El interés compuesto es la octava maravilla del mundo. Aprovéchalo.' },
        { titulo: '📈 Inversión', mensaje: 'Invierte en tu educación financiera. Es la mejor inversión.' },
        
        // === PRESUPUESTO ===
        { titulo: '📝 Presupuesto', mensaje: 'Un presupuesto no te limita, te da libertad. Saber cuánto puedes gastar reduce el estrés.' },
        { titulo: '📝 Presupuesto', mensaje: 'Revisa tu presupuesto cada mes y ajústalo según tus necesidades.' },
        { titulo: '📝 Presupuesto', mensaje: 'El 50-30-20: 50% necesidades, 30% deseos, 20% ahorro. ¿Lo aplicas?' },
        { titulo: '📝 Presupuesto', mensaje: 'Tu presupuesto es tu plan financiero. Sin plan, no hay éxito.' },
        
        // === MOTIVACIÓN ===
        { titulo: '🌟 Motivación', mensaje: '¡Cada peso que ahorras te acerca a tus sueños! Sigue registrando tus gastos en FinzApp.' },
        { titulo: '🌟 Motivación', mensaje: 'La libertad financiera se construye un día a la vez. ¡Tú puedes!' },
        { titulo: '🌟 Motivación', mensaje: 'No importa cuánto ganes, importa cuánto conserves. ¡Sigue así!' },
        { titulo: '🌟 Motivación', mensaje: 'El éxito financiero es un maratón, no una carrera. Sé constante.' },
        { titulo: '🌟 Motivación', mensaje: 'Hoy es un buen día para mejorar tus finanzas. ¡Empieza ahora!' },
        { titulo: '🌟 Motivación', mensaje: 'Tus decisiones de hoy determinan tu futuro financiero. Decide bien.' },
        { titulo: '🌟 Motivación', mensaje: 'La riqueza no es tener mucho, es necesitar poco. Simplifica tu vida.' },
        { titulo: '🌟 Motivación', mensaje: 'Cada día es una nueva oportunidad para ser mejor con tu dinero.' },
        { titulo: '🌟 Motivación', mensaje: '¡Felicidades por usar FinzApp! Estás en el camino correcto.' },
        { titulo: '🌟 Motivación', mensaje: 'El dinero es una herramienta. Aprende a usarla sabiamente.' },
    ];

    const notifIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Función para obtener un consejo aleatorio
    const obtenerConsejoAleatorio = () => {
        const indice = Math.floor(Math.random() * CONSEJOS_FINANCIEROS.length);
        return CONSEJOS_FINANCIEROS[indice];
    };

    // Solicitar permisos de notificaciones
    useEffect(() => {
        async function setupNotifications() {
            await Notifications.requestPermissionsAsync();
        }
        setupNotifications();
    }, []);

    // Manejar intervalo de notificaciones push
    useEffect(() => {
        if (notificaciones) {
            // Iniciar intervalo de notificaciones con consejos aleatorios
            notifIntervalRef.current = setInterval(() => {
                const consejo = obtenerConsejoAleatorio();
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: consejo.titulo,
                        body: consejo.mensaje,
                        sound: true,
                    },
                    trigger: null,
                });
            }, NOTIF_INTERVAL);
        } else {
            // Detener intervalo si se desactiva
            if (notifIntervalRef.current) {
                clearInterval(notifIntervalRef.current);
                notifIntervalRef.current = null;
            }
        }
        // Limpiar al desmontar
        return () => {
            if (notifIntervalRef.current) {
                clearInterval(notifIntervalRef.current);
                notifIntervalRef.current = null;
            }
        };
    }, [notificaciones]);

    // ====== CONFIGURACIÓN DE RECORDATORIOS ======
    // Intervalo para verificar inactividad (cada 1 hora = 3600000 ms)
    // Para pruebas: 60000 ms = 1 minuto
    //const RECORDATORIO_CHECK_INTERVAL = 3600000; // <-- Cambia aquí (1 hora por defecto)
    const RECORDATORIO_CHECK_INTERVAL = 60000;
    // Horas del día para recordatorios fijos (formato 24h)
    const HORA_RECORDATORIO_NOCHE = 20; // 8:00 PM
    
    // Mensajes de recordatorio
    const RECORDATORIOS_MENSAJES = [
        { titulo: '🌙 Recordatorio nocturno', mensaje: '¡Hora de registrar tus gastos del día! No olvides anotar lo que gastaste hoy en FinzApp.' },
        { titulo: '📝 ¿Registraste tus gastos?', mensaje: 'Antes de dormir, asegúrate de registrar todos tus gastos. ¡Tu futuro yo te lo agradecerá!' },
        { titulo: '💼 Cierre del día', mensaje: '¿Cómo te fue hoy con tus finanzas? Registra tus gastos antes de que se te olviden.' },
    ];
    
    const INACTIVIDAD_MENSAJES = [
        { titulo: '👋 ¡Te extrañamos!', mensaje: 'Llevas más de 24 horas sin registrar gastos. ¿Todo bien? Abre FinzApp y mantén tus finanzas al día.' },
        { titulo: '📊 No pierdas el hábito', mensaje: 'Ha pasado un día sin actividad. Registrar tus gastos diariamente es clave para el éxito financiero.' },
        { titulo: '🔔 Recordatorio de actividad', mensaje: '¡Hey! No has registrado gastos recientemente. Mantén el control de tus finanzas con FinzApp.' },
    ];

    const recordatorioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const ultimaHoraRecordatorio = useRef<number | null>(null);

    // Función para obtener un mensaje aleatorio de un array
    const obtenerMensajeAleatorio = (mensajes: typeof RECORDATORIOS_MENSAJES) => {
        const indice = Math.floor(Math.random() * mensajes.length);
        return mensajes[indice];
    };

    // Función para verificar si el usuario ha tenido actividad en las últimas 24 horas
    const verificarInactividad = () => {
        if (!usuario) return;

        obtenerTransacciones(usuario.id, (transacciones: any[]) => {
            if (transacciones.length === 0) {
                // No hay transacciones, enviar recordatorio
                const mensaje = obtenerMensajeAleatorio(INACTIVIDAD_MENSAJES);
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: mensaje.titulo,
                        body: mensaje.mensaje,
                        sound: true,
                    },
                    trigger: null,
                });
                return;
            }

            // Obtener la fecha de la última transacción
            const ultimaTransaccion = transacciones[0]; // Ya vienen ordenadas por fecha DESC
            const fechaUltima = new Date(ultimaTransaccion.fecha);
            const ahora = new Date();
            const diferenciaHoras = (ahora.getTime() - fechaUltima.getTime()) / (1000 * 60 * 60);

            // Si han pasado más de 24 horas, enviar recordatorio
            if (diferenciaHoras >= 24) {
                const mensaje = obtenerMensajeAleatorio(INACTIVIDAD_MENSAJES);
                Notifications.scheduleNotificationAsync({
                    content: {
                        title: mensaje.titulo,
                        body: mensaje.mensaje,
                        sound: true,
                    },
                    trigger: null,
                });
            }
        });
    };

    // Función para verificar si es hora del recordatorio nocturno
    const verificarRecordatorioNocturno = () => {
        const ahora = new Date();
        const horaActual = ahora.getHours();

        // Si es la hora del recordatorio nocturno y no se ha enviado en esta hora
        if (horaActual === HORA_RECORDATORIO_NOCHE && ultimaHoraRecordatorio.current !== horaActual) {
            ultimaHoraRecordatorio.current = horaActual;
            const mensaje = obtenerMensajeAleatorio(RECORDATORIOS_MENSAJES);
            Notifications.scheduleNotificationAsync({
                content: {
                    title: mensaje.titulo,
                    body: mensaje.mensaje,
                    sound: true,
                },
                trigger: null,
            });
        }

        // Resetear cuando cambie la hora
        if (horaActual !== HORA_RECORDATORIO_NOCHE) {
            ultimaHoraRecordatorio.current = null;
        }
    };

    // Manejar recordatorios
    useEffect(() => {
        if (recordatorios && usuario) {
            // Verificar inmediatamente al activar
            verificarInactividad();
            verificarRecordatorioNocturno();

            // Iniciar intervalo para verificar recordatorios
            recordatorioIntervalRef.current = setInterval(() => {
                verificarInactividad();
                verificarRecordatorioNocturno();
            }, RECORDATORIO_CHECK_INTERVAL);
        } else {
            // Detener intervalo si se desactiva
            if (recordatorioIntervalRef.current) {
                clearInterval(recordatorioIntervalRef.current);
                recordatorioIntervalRef.current = null;
            }
        }
        // Limpiar al desmontar
        return () => {
            if (recordatorioIntervalRef.current) {
                clearInterval(recordatorioIntervalRef.current);
                recordatorioIntervalRef.current = null;
            }
        };
    }, [recordatorios, usuario]);

    // ====== FUNCIONES DE EXPORTACIÓN ======
    
    // Función para convertir datos a formato CSV
    const convertirACSV = (datos: any): string => {
        let csv = '';
        
        // Información del usuario
        csv += 'INFORMACIÓN DEL USUARIO\n';
        csv += 'Nombre,Apellido,Correo,Fecha de Registro\n';
        csv += `"${datos.usuario.nombre}","${datos.usuario.apellido}","${datos.usuario.correo}","${datos.usuario.fecha_registro}"\n\n`;
        
        // Billeteras
        csv += 'BILLETERAS\n';
        csv += 'ID,Nombre,Saldo,Tipo,Fecha de Creación\n';
        datos.billeteras.forEach((b: any) => {
            csv += `${b.id},"${b.nombre}",${b.saldo},"${b.tipo || 'General'}","${b.fecha_creacion}"\n`;
        });
        csv += '\n';
        
        // Transacciones
        csv += 'TRANSACCIONES\n';
        csv += 'ID,Billetera,Tipo,Monto,Categoría,Descripción,Fecha\n';
        datos.transacciones.forEach((t: any) => {
            csv += `${t.id},"${t.billetera_nombre}","${t.tipo}",${t.monto},"${t.categoria}","${t.descripcion || ''}","${t.fecha}"\n`;
        });
        
        return csv;
    };

    // Función para generar HTML para PDF
    const generarHTMLParaPDF = (datos: any): string => {
        const fechaExport = new Date(datos.fechaExportacion).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Calcular totales
        const totalIngresos = datos.transacciones
            .filter((t: any) => t.tipo === 'ingreso')
            .reduce((sum: number, t: any) => sum + t.monto, 0);
        const totalGastos = datos.transacciones
            .filter((t: any) => t.tipo === 'gasto')
            .reduce((sum: number, t: any) => sum + t.monto, 0);
        const saldoTotal = datos.billeteras.reduce((sum: number, b: any) => sum + b.saldo, 0);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    h1 { color: #9C27B0; text-align: center; }
                    h2 { color: #7B1FA2; border-bottom: 2px solid #9C27B0; padding-bottom: 5px; margin-top: 30px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .fecha { color: #666; font-size: 14px; }
                    .resumen { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
                    .resumen-item { display: inline-block; margin: 10px 20px; text-align: center; }
                    .resumen-valor { font-size: 24px; font-weight: bold; }
                    .ingreso { color: #4CAF50; }
                    .gasto { color: #F44336; }
                    .saldo { color: #9C27B0; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { background: #9C27B0; color: white; padding: 12px; text-align: left; }
                    td { padding: 10px; border-bottom: 1px solid #ddd; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 Reporte Financiero - FinzApp</h1>
                    <p><strong>${datos.usuario.nombre} ${datos.usuario.apellido}</strong></p>
                    <p class="fecha">Exportado el: ${fechaExport}</p>
                </div>

                <div class="resumen">
                    <div class="resumen-item">
                        <div class="resumen-valor ingreso">$${totalIngresos.toLocaleString()}</div>
                        <div>Total Ingresos</div>
                    </div>
                    <div class="resumen-item">
                        <div class="resumen-valor gasto">$${totalGastos.toLocaleString()}</div>
                        <div>Total Gastos</div>
                    </div>
                    <div class="resumen-item">
                        <div class="resumen-valor saldo">$${saldoTotal.toLocaleString()}</div>
                        <div>Saldo Total</div>
                    </div>
                </div>

                <h2>💼 Billeteras (${datos.billeteras.length})</h2>
                <table>
                    <tr><th>Nombre</th><th>Tipo</th><th>Saldo</th></tr>
                    ${datos.billeteras.map((b: any) => `
                        <tr>
                            <td>${b.nombre}</td>
                            <td>${b.tipo || 'General'}</td>
                            <td>$${b.saldo.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </table>

                <h2>📝 Transacciones (${datos.transacciones.length})</h2>
                <table>
                    <tr><th>Fecha</th><th>Billetera</th><th>Tipo</th><th>Categoría</th><th>Monto</th><th>Descripción</th></tr>
                    ${datos.transacciones.map((t: any) => `
                        <tr>
                            <td>${new Date(t.fecha).toLocaleDateString('es-ES')}</td>
                            <td>${t.billetera_nombre}</td>
                            <td class="${t.tipo}">${t.tipo === 'ingreso' ? '↑ Ingreso' : '↓ Gasto'}</td>
                            <td>${t.categoria}</td>
                            <td class="${t.tipo}">$${t.monto.toLocaleString()}</td>
                            <td>${t.descripcion || '-'}</td>
                        </tr>
                    `).join('')}
                </table>

                <div class="footer">
                    <p>Generado con FinzApp - Tu asistente de finanzas personales</p>
                    <p>Versión ${datos.version}</p>
                </div>
            </body>
            </html>
        `;
    };

    // Función para exportar en formato JSON
    const exportarComoJSON = async (datos: any) => {
        try {
            const jsonData = JSON.stringify(datos, null, 2);
            const fileName = `FinzApp_Backup_${new Date().toISOString().split('T')[0]}.json`;
            
            // Usar la nueva API de expo-file-system
            const file = new File(Paths.cache, fileName);
            await file.write(jsonData);
            
            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/json',
                dialogTitle: 'Exportar datos en JSON'
            });
            
            Alert.alert('Éxito', 'Datos exportados en formato JSON');
        } catch (error) {
            console.error('Error exportando JSON:', error);
            Alert.alert('Error', 'No se pudo exportar en formato JSON');
        }
    };

    // Función para exportar en formato CSV
    const exportarComoCSV = async (datos: any) => {
        try {
            const csvData = convertirACSV(datos);
            const fileName = `FinzApp_Datos_${new Date().toISOString().split('T')[0]}.csv`;
            
            // Usar la nueva API de expo-file-system
            const file = new File(Paths.cache, fileName);
            await file.write(csvData);
            
            await Sharing.shareAsync(file.uri, {
                mimeType: 'text/csv',
                dialogTitle: 'Exportar datos en CSV'
            });
            
            Alert.alert('Éxito', 'Datos exportados en formato CSV');
        } catch (error) {
            console.error('Error exportando CSV:', error);
            Alert.alert('Error', 'No se pudo exportar en formato CSV');
        }
    };

    // Función para exportar en formato PDF
    const exportarComoPDF = async (datos: any) => {
        try {
            const html = generarHTMLParaPDF(datos);
            const { uri } = await Print.printToFileAsync({ html });
            
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Exportar reporte en PDF'
            });
            
            Alert.alert('Éxito', 'Reporte exportado en formato PDF');
        } catch (error) {
            console.error('Error exportando PDF:', error);
            Alert.alert('Error', 'No se pudo exportar en formato PDF');
        }
    };

    // Función principal de exportar datos
    const exportarDatos = () => {
        if (!usuario) {
            Alert.alert('Error', 'No hay usuario autenticado');
            return;
        }

        // Primero obtener los datos
        exportarDatosDB(usuario.id, (exito: boolean, mensaje: string, datos?: any) => {
            if (!exito || !datos) {
                Alert.alert('Error', mensaje);
                return;
            }

            // Mostrar opciones de formato
            Alert.alert(
                'Exportar datos',
                'Selecciona el formato de exportación:\n\n• JSON: Para respaldo e importación\n• CSV: Para Excel/hojas de cálculo\n• PDF: Reporte visual imprimible',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: '📄 JSON', 
                        onPress: () => exportarComoJSON(datos)
                    },
                    { 
                        text: '📊 CSV', 
                        onPress: () => exportarComoCSV(datos)
                    },
                    { 
                        text: '📑 PDF', 
                        onPress: () => exportarComoPDF(datos)
                    },
                ]
            );
        });
    };

    // Función auxiliar para validar la estructura del archivo de importación
    const validarEstructuraArchivo = (datos: any): { valido: boolean; errores: string[] } => {
        const errores: string[] = [];

        // Validar campos obligatorios
        if (!datos.version) {
            errores.push('Falta el campo "version"');
        } else if (datos.version !== '1.0.0') {
            errores.push(`Versión no compatible: ${datos.version} (se requiere 1.0.0)`);
        }

        if (!datos.fechaExportacion) {
            errores.push('Falta la fecha de exportación');
        }

        if (!datos.usuario) {
            errores.push('Falta información del usuario');
        }

        if (!datos.billeteras || !Array.isArray(datos.billeteras)) {
            errores.push('Falta el listado de billeteras o no es un array');
        } else {
            // Validar estructura de cada billetera
            datos.billeteras.forEach((b: any, index: number) => {
                if (!b.nombre) errores.push(`Billetera ${index + 1}: falta el nombre`);
                if (b.saldo === undefined) errores.push(`Billetera ${index + 1}: falta el saldo`);
            });
        }

        if (!datos.transacciones || !Array.isArray(datos.transacciones)) {
            errores.push('Falta el listado de transacciones o no es un array');
        } else {
            // Validar estructura de transacciones (solo primeras 5 si hay muchas)
            const muestra = datos.transacciones.slice(0, 5);
            muestra.forEach((t: any, index: number) => {
                if (!t.tipo || !['ingreso', 'gasto'].includes(t.tipo)) {
                    errores.push(`Transacción ${index + 1}: tipo inválido`);
                }
                if (t.monto === undefined || isNaN(t.monto)) {
                    errores.push(`Transacción ${index + 1}: monto inválido`);
                }
            });
        }

        return { valido: errores.length === 0, errores };
    };

    // Función auxiliar para generar resumen de preview
    const generarResumenImportacion = (datos: any): string => {
        const billeteras = datos.billeteras || [];
        const transacciones = datos.transacciones || [];
        
        // Calcular totales
        let totalIngresos = 0;
        let totalGastos = 0;
        transacciones.forEach((t: any) => {
            if (t.tipo === 'ingreso') totalIngresos += t.monto;
            else totalGastos += t.monto;
        });

        // Nombres de billeteras (máximo 3)
        const nombresBilleteras = billeteras
            .slice(0, 3)
            .map((b: any) => `• ${b.nombre}`)
            .join('\n');
        const masBilleteras = billeteras.length > 3 ? `\n• ... y ${billeteras.length - 3} más` : '';

        // Fecha de exportación
        const fechaExport = datos.fechaExportacion 
            ? new Date(datos.fechaExportacion).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Desconocida';

        return `📅 Exportado: ${fechaExport}\n\n` +
               `📁 BILLETERAS (${billeteras.length}):\n${nombresBilleteras}${masBilleteras}\n\n` +
               `💰 TRANSACCIONES (${transacciones.length}):\n` +
               `• Ingresos: $${totalIngresos.toLocaleString()}\n` +
               `• Gastos: $${totalGastos.toLocaleString()}\n` +
               `• Balance neto: $${(totalIngresos - totalGastos).toLocaleString()}`;
    };

    // Función para ejecutar la importación según el modo
    const ejecutarImportacion = (datosImportados: any, modoReemplazo: boolean) => {
        if (!usuario) return;

        const realizarImportacion = () => {
            importarDatosDB(usuario.id, datosImportados, (exito: boolean, mensaje: string) => {
                if (exito) {
                    Alert.alert(
                        '✅ Importación exitosa',
                        mensaje + '\n\nSerás redirigido al inicio para ver tus datos.',
                        [
                            { 
                                text: 'Ver mis datos', 
                                onPress: () => router.replace('/(tabs)/inicio')
                            }
                        ]
                    );
                } else {
                    Alert.alert('❌ Error al importar', mensaje);
                }
            });
        };

        if (modoReemplazo) {
            // Primero eliminar datos existentes, luego importar
            resetearDatosDB(usuario.id, (exito: boolean, mensaje: string) => {
                if (exito) {
                    realizarImportacion();
                } else {
                    Alert.alert('Error', 'No se pudieron eliminar los datos existentes: ' + mensaje);
                }
            });
        } else {
            // Agregar a datos existentes
            realizarImportacion();
        }
    };

    const importarDatos = async () => {
        if (!usuario) {
            Alert.alert('Error', 'No hay usuario autenticado');
            return;
        }

        try {
            // Seleccionar archivo
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'text/plain'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const file = result.assets[0];
            if (!file) {
                Alert.alert('Error', 'No se pudo leer el archivo seleccionado');
                return;
            }

            // Verificar extensión del archivo
            const nombreArchivo = file.name || '';
            if (!nombreArchivo.toLowerCase().endsWith('.json') && !nombreArchivo.toLowerCase().endsWith('.txt')) {
                Alert.alert(
                    '⚠️ Archivo no compatible',
                    'Por favor selecciona un archivo JSON exportado desde FinzApp.\n\nFormatos aceptados: .json, .txt'
                );
                return;
            }

            // Leer el contenido del archivo
            const response = await fetch(file.uri);
            const contenido = await response.text();

            // Verificar que el archivo no esté vacío
            if (!contenido || contenido.trim().length === 0) {
                Alert.alert('⚠️ Archivo vacío', 'El archivo seleccionado está vacío.');
                return;
            }

            try {
                const datosImportados = JSON.parse(contenido);

                // Validar estructura del archivo
                const validacion = validarEstructuraArchivo(datosImportados);
                if (!validacion.valido) {
                    Alert.alert(
                        '❌ Archivo inválido',
                        'El archivo no tiene el formato correcto:\n\n' + 
                        validacion.errores.slice(0, 3).map(e => `• ${e}`).join('\n') +
                        (validacion.errores.length > 3 ? `\n\n... y ${validacion.errores.length - 3} errores más` : '') +
                        '\n\n¿Es este un archivo exportado desde FinzApp?'
                    );
                    return;
                }

                // Generar resumen para preview
                const resumen = generarResumenImportacion(datosImportados);

                // Mostrar preview y opciones de importación
                Alert.alert(
                    '📥 Vista previa de importación',
                    resumen,
                    [
                        { 
                            text: 'Cancelar', 
                            style: 'cancel' 
                        },
                        { 
                            text: '➕ Agregar',
                            onPress: () => {
                                Alert.alert(
                                    'Confirmar importación',
                                    'Los datos se AGREGARÁN a tu información actual.\n\n' +
                                    'Se crearán nuevas billeteras y transacciones sin afectar las existentes.',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        { 
                                            text: 'Confirmar', 
                                            onPress: () => ejecutarImportacion(datosImportados, false)
                                        }
                                    ]
                                );
                            }
                        },
                        { 
                            text: '🔄 Reemplazar',
                            style: 'destructive',
                            onPress: () => {
                                Alert.alert(
                                    '⚠️ Confirmar reemplazo',
                                    'ADVERTENCIA: Esta acción eliminará TODOS tus datos actuales y los reemplazará con los datos del archivo.\n\n' +
                                    'Esta acción NO se puede deshacer.',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        { 
                                            text: 'REEMPLAZAR TODO', 
                                            style: 'destructive',
                                            onPress: () => ejecutarImportacion(datosImportados, true)
                                        }
                                    ]
                                );
                            }
                        }
                    ]
                );
            } catch (parseError) {
                Alert.alert(
                    '❌ Error de formato',
                    'El archivo seleccionado no contiene datos JSON válidos.\n\n' +
                    'Asegúrate de seleccionar un archivo exportado desde FinzApp (formato .json).'
                );
            }
        } catch (error) {
            console.error('Error al importar datos:', error);
            Alert.alert(
                '❌ Error de lectura',
                'No se pudo leer el archivo seleccionado.\n\n' +
                'Posibles causas:\n' +
                '• El archivo está dañado\n' +
                '• No tienes permisos de lectura\n' +
                '• El archivo es demasiado grande'
            );
        }
    };

    const resetearDatos = () => {
        if (!usuario) {
            Alert.alert('Error', 'No hay usuario autenticado');
            return;
        }

        // Primero obtener estadísticas para mostrar al usuario
        obtenerEstadisticas(usuario.id, (stats: any) => {
            Alert.alert(
                'Confirmar eliminación total',
                `¿Estás seguro de que deseas eliminar TODOS los datos?\n\nSe eliminarán:\n• ${stats.totalBilleteras} billeteras\n• ${stats.totalTransacciones} transacciones\n• Saldo total: $${stats.saldoTotal.toLocaleString()}\n\nEsta acción NO se puede deshacer.`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'ELIMINAR TODO', 
                        style: 'destructive',
                        onPress: () => {
                            resetearDatosDB(usuario.id, (exito: boolean, mensaje: string) => {
                                if (exito) {
                                    Alert.alert(
                                        'Datos eliminados', 
                                        'Todos los datos han sido eliminados exitosamente. La aplicación se reiniciará.',
                                        [
                                            { 
                                                text: 'OK', 
                                                onPress: () => {
                                                    // Redirigir al inicio para actualizar la vista
                                                    router.replace('/(tabs)/inicio');
                                                }
                                            }
                                        ]
                                    );
                                } else {
                                    Alert.alert('Error', mensaje);
                                }
                            });
                        }
                    }
                ]
            );
        });
    };

    return (
        <ScrollView style={estilos.contenedor}>
            <StatusBar style="light" />
            
            <TouchableOpacity onPress={() => safeBack('perfil')} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Configuración</Text>

            {/* Sección Notificaciones */}
            <View style={estilos.seccion}>
                <Text style={estilos.tituloSeccion}>Notificaciones</Text>
                
                <View style={estilos.opcion}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#4CAF50' }]}> 
                            <Ionicons name="notifications" size={18} color="#fff" />
                        </View>
                        <View>
                            <Text style={estilos.textoOpcion}>Notificaciones push</Text>
                            <Text style={estilos.subtextoOpcion}>Recibir alertas importantes</Text>
                        </View>
                    </View>
                    <Switch
                        value={notificaciones}
                        onValueChange={setNotificaciones}
                        trackColor={{ false: '#333', true: '#9C27B0' }}
                        thumbColor={notificaciones ? '#fff' : '#ccc'}
                        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                </View>

                <View style={estilos.opcion}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#FF9800' }]}>
                            <MaterialCommunityIcons name="clock-alert" size={18} color="#fff" />
                        </View>
                        <View>
                            <Text style={estilos.textoOpcion}>Recordatorios</Text>
                            <Text style={estilos.subtextoOpcion}>Recordar registrar gastos</Text>
                        </View>
                    </View>
                    <Switch
                        value={recordatorios}
                        onValueChange={setRecordatorios}
                        trackColor={{ false: '#333', true: '#9C27B0' }}
                        thumbColor={recordatorios ? '#fff' : '#ccc'}
                        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                </View>
            </View>

            {/* Sección Datos */}
            <View style={estilos.seccion}>
                <Text style={estilos.tituloSeccion}>Gestión de datos</Text>
                
                <TouchableOpacity 
                    style={estilos.opcionBoton} 
                    onPress={() => router.push('estadisticas-usuario' as any)}
                >
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#9C27B0' }]}>
                            <MaterialCommunityIcons name="chart-box" size={18} color="#fff" />
                        </View>
                        <Text style={estilos.textoOpcion}>Ver estadísticas completas</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={estilos.opcionBoton} onPress={exportarDatos}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#4CAF50' }]}>
                            <MaterialCommunityIcons name="export" size={18} color="#fff" />
                        </View>
                        <Text style={estilos.textoOpcion}>Exportar datos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={estilos.opcionBoton} onPress={importarDatos}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#2196F3' }]}>
                            <MaterialCommunityIcons name="import" size={18} color="#fff" />
                        </View>
                        <Text style={estilos.textoOpcion}>Importar datos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={estilos.opcionBoton} onPress={resetearDatos}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#F44336' }]}>
                            <MaterialCommunityIcons name="delete-forever" size={18} color="#fff" />
                        </View>
                        <Text style={[estilos.textoOpcion, { color: '#F44336' }]}>Eliminar todos los datos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#F44336" />
                </TouchableOpacity>
            </View>

            {/* Información de la app */}
            <View style={estilos.info}>
                <Text style={estilos.textoInfo}>Control de Gastos v1.0.0</Text>
                <Text style={estilos.subtextoInfo}>Desarrollado con React Native y Expo</Text>
            </View>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 140,
    },
    retroceso: {
        marginBottom: 20,
        paddingVertical: 5,
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
        textAlign: 'center',
    },
    texto: {
        color: '#ccc',
        fontSize: 16,
    },
    seccion: {
        marginBottom: 32,
    },
    tituloSeccion: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9C27B0',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    opcion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    opcionBoton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    opcionIzquierda: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icono: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textoOpcion: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    subtextoOpcion: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    info: {
        backgroundColor: '#1a1a1a',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    textoInfo: {
        fontSize: 15,
        fontWeight: '600',
        color: '#9C27B0',
        marginBottom: 6,
    },
    subtextoInfo: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
    },
});
