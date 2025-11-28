import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
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

    const notifIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    const recordatorioIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const ultimaHoraRecordatorio = useRef<number | null>(null);

    // Función para obtener un mensaje aleatorio de un array
    const obtenerMensajeAleatorio = (mensajes: typeof RECORDATORIOS_MENSAJES) => {
        const indice = Math.floor(Math.random() * mensajes.length);
        return mensajes[indice];
    };

    // Función para verificar si el usuario ha tenido actividad en las últimas 24 horas
    const verificarInactividad = () => {
        if (!usuario) return;

        obtenerTransacciones(usuario.id, (transacciones) => {
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

    const exportarDatos = () => {
        if (!usuario) {
            Alert.alert('Error', 'No hay usuario autenticado');
            return;
        }

        Alert.alert(
            'Exportar datos',
            '¿Deseas exportar todos tus datos? Se creará un archivo con toda tu información financiera.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Exportar', 
                    onPress: () => {
                        exportarDatosDB(usuario.id, (exito: boolean, mensaje: string, datos?: any) => {
                            if (exito && datos) {
                                // Convertir datos a JSON
                                const jsonData = JSON.stringify(datos, null, 2);
                                
                                // Compartir el archivo
                                Share.share({
                                    message: `Datos de Control de Gastos - ${usuario.nombre} ${usuario.apellido}\n\nExportado el: ${new Date(datos.fechaExportacion).toLocaleDateString('es-ES')}\n\nDatos:\n${jsonData}`,
                                    title: 'Exportar datos de Control de Gastos'
                                }).then(() => {
                                    Alert.alert('Éxito', 'Datos exportados exitosamente');
                                }).catch(() => {
                                    Alert.alert('Error', 'No se pudo compartir los datos');
                                });
                            } else {
                                Alert.alert('Error', mensaje);
                            }
                        });
                    }
                }
            ]
        );
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

            // Leer el contenido del archivo
            const response = await fetch(file.uri);
            const contenido = await response.text();

            try {
                const datosImportados = JSON.parse(contenido);

                // Validar que sea un archivo de exportación válido
                if (!datosImportados.usuario || !datosImportados.billeteras || !datosImportados.transacciones) {
                    Alert.alert(
                        'Archivo inválido',
                        'El archivo seleccionado no tiene el formato correcto para importar datos.'
                    );
                    return;
                }

                // Confirmar importación
                Alert.alert(
                    'Confirmar importación',
                    `¿Deseas importar los siguientes datos?\n\n• ${datosImportados.billeteras.length} billeteras\n• ${datosImportados.transacciones.length} transacciones\n• Exportado el: ${new Date(datosImportados.fechaExportacion).toLocaleDateString('es-ES')}\n\nEstos datos se agregarán a tu información actual.`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { 
                            text: 'Importar', 
                            onPress: () => {
                                importarDatosDB(usuario.id, datosImportados, (exito: boolean, mensaje: string) => {
                                    if (exito) {
                                        Alert.alert(
                                            'Importación exitosa',
                                            mensaje,
                                            [
                                                { 
                                                    text: 'OK', 
                                                    onPress: () => {
                                                        // Redirigir al inicio para ver los nuevos datos
                                                        router.replace('/(tabs)/inicio');
                                                    }
                                                }
                                            ]
                                        );
                                    } else {
                                        Alert.alert('Error al importar', mensaje);
                                    }
                                });
                            }
                        }
                    ]
                );
            } catch (parseError) {
                Alert.alert(
                    'Error de formato',
                    'El archivo seleccionado no contiene datos en formato JSON válido.'
                );
            }
        } catch (error) {
            console.error('Error al importar datos:', error);
            Alert.alert(
                'Error',
                'No se pudo leer el archivo seleccionado. Asegúrate de que sea un archivo de texto válido.'
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
