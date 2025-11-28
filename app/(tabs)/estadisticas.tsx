import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChartCard from '../../components/ChartCard';
import { Billetera, obtenerBilleteras, obtenerTransacciones, obtenerTransaccionesPorBilletera, Transaccion } from '../../database';
import { useAuth } from '../../hooks/useAuth';

const screenWidth = Dimensions.get('window').width;

// Función para obtener el ícono según la categoría
const obtenerIconoCategoria = (categoria: string, tipo: 'ingreso' | 'gasto') => {
    if (tipo === 'ingreso') {
        return <FontAwesome5 name="dollar-sign" size={20} color="#fff" />;
    }
    
    switch (categoria.toLowerCase()) {
        case 'comida':
        case 'alimentación':
            return <Ionicons name="restaurant" size={20} color="#fff" />;
        case 'salud':
            return <MaterialIcons name="favorite" size={24} color="#fff" />;
        case 'transporte':
            return <Ionicons name="car-sport" size={20} color="#fff" />;
        case 'entretenimiento':
        case 'ocio':
            return <Ionicons name="game-controller" size={20} color="#fff" />;
        case 'compras':
            return <Ionicons name="bag" size={20} color="#fff" />;
        case 'hogar':
            return <Ionicons name="home" size={20} color="#fff" />;
        case 'educación':
            return <Ionicons name="school" size={20} color="#fff" />;
        default:
            return <Ionicons name="wallet" size={20} color="#fff" />;
    }
};

// Función para obtener el color según la categoría
const obtenerColorCategoria = (categoria: string, tipo: 'ingreso' | 'gasto') => {
    if (tipo === 'ingreso') {
        return '#4caf50';
    }
    
    switch (categoria.toLowerCase()) {
        case 'comida':
        case 'alimentación':
            return '#9c27b0';
        case 'salud':
            return '#f44336';
        case 'transporte':
            return '#2196f3';
        case 'entretenimiento':
        case 'ocio':
            return '#ff9800';
        case 'compras':
            return '#e91e63';
        case 'hogar':
            return '#795548';
        case 'educación':
            return '#673ab7';
        default:
            return '#607d8b';
    }
};

// Función para formatear fecha
const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    const opciones: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'short' 
    };
    return fecha.toLocaleDateString('es-ES', opciones);
};

export default function Estadisticas() {
    const router = useRouter();
    const { usuario } = useAuth();
    
    // Estado para el rango de la gráfica
    const [rangoGrafica, setRangoGrafica] = useState<'dia' | 'semana' | 'mes'>('semana');

    // Procesar datos para el gráfico según rango
    const procesarDatosGrafico = useCallback((transacciones: Transaccion[]) => {
        const hoy = new Date();
        let labels: string[] = [];
        let ingresos: number[] = [];
        let gastos: number[] = [];
        
        if (rangoGrafica === 'dia') {
            // Mostrar solo 8 puntos para evitar amontonamiento (cada 3 horas)
            const horasIntervalo = [0, 3, 6, 9, 12, 15, 18, 21];
            
            // Inicializar datos para todas las horas del día
            const datosHoras: { [hora: number]: { ingresos: number, gastos: number } } = {};
            for (let h = 0; h < 24; h++) {
                datosHoras[h] = { ingresos: 0, gastos: 0 };
            }
            
            // Acumular transacciones por hora
            transacciones.forEach(t => {
                const fechaTrans = new Date(t.fecha);
                if (fechaTrans.getDate() === hoy.getDate() && 
                    fechaTrans.getMonth() === hoy.getMonth() && 
                    fechaTrans.getFullYear() === hoy.getFullYear()) {
                    const hora = fechaTrans.getHours();
                    if (t.tipo === 'ingreso') {
                        datosHoras[hora].ingresos += t.monto;
                    } else {
                        datosHoras[hora].gastos += t.monto;
                    }
                }
            });
            
            // Generar etiquetas y datos para los intervalos seleccionados
            horasIntervalo.forEach(hora => {
                labels.push(`${hora}:00`);
                ingresos.push(datosHoras[hora].ingresos);
                gastos.push(datosHoras[hora].gastos);
            });
        } else if (rangoGrafica === 'semana') {
            // Últimos 7 días (Lunes a Domingo)
            const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            
            // Calcular el lunes de esta semana
            const diaSemana = hoy.getDay();
            const diasDesdeMonday = diaSemana === 0 ? -6 : 1 - diaSemana; // Si es domingo (0), retroceder 6 días
            const primerDiaLunes = new Date(hoy.getTime() + diasDesdeMonday * 24 * 60 * 60 * 1000);
            
            // Generar 7 días comenzando desde el lunes
            for (let i = 0; i < 7; i++) {
                const fecha = new Date(primerDiaLunes.getTime() + i * 24 * 60 * 60 * 1000);
                labels.push(diasSemana[i]); // i es 0-6, corresponde exactamente a Mon-Sun
                const ingresosDia = transacciones.filter(t => t.tipo === 'ingreso' && new Date(t.fecha).toDateString() === fecha.toDateString()).reduce((sum, t) => sum + t.monto, 0);
                const gastosDia = transacciones.filter(t => t.tipo === 'gasto' && new Date(t.fecha).toDateString() === fecha.toDateString()).reduce((sum, t) => sum + t.monto, 0);
                ingresos.push(ingresosDia);
                gastos.push(gastosDia);
            }
        } else {
            // Últimos 12 meses
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            for (let i = 11; i >= 0; i--) {
                const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
                labels.push(meses[fecha.getMonth()]);
                const ingresosMes = transacciones.filter(t => t.tipo === 'ingreso' && new Date(t.fecha).getMonth() === fecha.getMonth() && new Date(t.fecha).getFullYear() === fecha.getFullYear()).reduce((sum, t) => sum + t.monto, 0);
                const gastosMes = transacciones.filter(t => t.tipo === 'gasto' && new Date(t.fecha).getMonth() === fecha.getMonth() && new Date(t.fecha).getFullYear() === fecha.getFullYear()).reduce((sum, t) => sum + t.monto, 0);
                ingresos.push(ingresosMes);
                gastos.push(gastosMes);
            }
        }
        return { labels, ingresos, gastos };
    }, [rangoGrafica]);
    const [filtro, setFiltro] = useState<'ingresos' | 'gastos'>('ingresos');
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [billeteras, setBilleteras] = useState<Billetera[]>([]);
    const [billeteraSeleccionada, setBilleteraSeleccionada] = useState<string>('todas');
    const [cargando, setCargando] = useState(true);
    const [datosGrafico, setDatosGrafico] = useState({
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        ingresos: [0, 0, 0, 0, 0, 0, 0],
        gastos: [0, 0, 0, 0, 0, 0, 0],
    });

    // Estado para manejar errores de carga
    const [errorCarga, setErrorCarga] = useState<string | null>(null);
    const [cargandoBilleteras, setCargandoBilleteras] = useState(false);

    // Función para cargar billeteras del usuario
    const cargarBilleteras = useCallback(() => {
        if (usuario) {
            setCargandoBilleteras(true);
            setErrorCarga(null);
            
            obtenerBilleteras(usuario.id, (billeterasObtenidas: Billetera[]) => {
                setBilleteras(billeterasObtenidas);
                setCargandoBilleteras(false);
                
                // Si la billetera seleccionada ya no existe, resetear a 'todas'
                if (billeteraSeleccionada !== 'todas') {
                    const billeteraExiste = billeterasObtenidas.some(
                        b => b.id.toString() === billeteraSeleccionada
                    );
                    if (!billeteraExiste) {
                        setBilleteraSeleccionada('todas');
                    }
                }
            });
        }
    }, [usuario, billeteraSeleccionada]);

    // Función para manejar el cambio de billetera seleccionada
    const manejarCambioBilletera = useCallback((value: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setBilleteraSeleccionada(value);
        console.log('Billetera seleccionada:', value);
        
        // Recargar transacciones inmediatamente cuando cambie la selección
        if (!usuario) return;
        
        setCargando(true);
        
        if (value === 'todas') {
            // Obtener todas las transacciones del usuario
            obtenerTransacciones(usuario.id, (transaccionesObtenidas: Transaccion[]) => {
                setTransacciones(transaccionesObtenidas);
                const datos = procesarDatosGrafico(transaccionesObtenidas);
                setDatosGrafico(datos);
                setCargando(false);
            });
        } else {
            // Obtener transacciones de la billetera específica
            const billeteraId = parseInt(value);
            if (!isNaN(billeteraId)) {
                obtenerTransaccionesPorBilletera(billeteraId, (transaccionesObtenidas: Transaccion[]) => {
                    setTransacciones(transaccionesObtenidas);
                    const datos = procesarDatosGrafico(transaccionesObtenidas);
                    setDatosGrafico(datos);
                    setCargando(false);
                });
            } else {
                // Si hay error en el ID, volver a todas las billeteras
                setBilleteraSeleccionada('todas');
                setCargando(false);
            }
        }
    }, [usuario, procesarDatosGrafico]);

    // Función para cargar transacciones según la billetera seleccionada
    const cargarTransacciones = useCallback(() => {
        if (!usuario) return;
        
        setCargando(true);
        
        if (billeteraSeleccionada === 'todas') {
            // Obtener todas las transacciones del usuario
            obtenerTransacciones(usuario.id, (transaccionesObtenidas: Transaccion[]) => {
                setTransacciones(transaccionesObtenidas);
                const datos = procesarDatosGrafico(transaccionesObtenidas);
                setDatosGrafico(datos);
                setCargando(false);
            });
        } else {
            // Obtener transacciones de la billetera específica
            const billeteraId = parseInt(billeteraSeleccionada);
            if (!isNaN(billeteraId)) {
                obtenerTransaccionesPorBilletera(billeteraId, (transaccionesObtenidas: Transaccion[]) => {
                    setTransacciones(transaccionesObtenidas);
                    const datos = procesarDatosGrafico(transaccionesObtenidas);
                    setDatosGrafico(datos);
                    setCargando(false);
                });
            } else {
                // Si hay error en el ID, volver a todas las billeteras
                setBilleteraSeleccionada('todas');
            }
        }
    }, [usuario, billeteraSeleccionada, procesarDatosGrafico]);

    useEffect(() => {
        cargarBilleteras();
    }, [cargarBilleteras]);

    useEffect(() => {
        cargarTransacciones();
    }, [cargarTransacciones]);

    // Recalcular datos del gráfico cuando cambie el rango o las transacciones
    useEffect(() => {
        if (transacciones.length > 0) {
            const datos = procesarDatosGrafico(transacciones);
            setDatosGrafico(datos);
        }
    }, [rangoGrafica, transacciones, procesarDatosGrafico]);

    // Refrescar datos cuando la pantalla recibe foco
    useFocusEffect(
        useCallback(() => {
            cargarBilleteras();
            cargarTransacciones();
        }, [cargarBilleteras, cargarTransacciones])
    );

    // Procesar transacciones para mostrar con íconos y colores
    const transaccionesConEstilo = transacciones.map(transaccion => ({
        ...transaccion,
        color: obtenerColorCategoria(transaccion.categoria, transaccion.tipo),
        icono: obtenerIconoCategoria(transaccion.categoria, transaccion.tipo),
        fechaFormateada: formatearFecha(transaccion.fecha)
    }));

    if (cargando) {
        return (
            <View style={[estilos.contenedor, estilos.contenedorCargando]}>
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#9C27B0" />
                <Text style={estilos.textoCargando}>Cargando estadísticas...</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={transaccionesConEstilo}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={estilos.contenedor}
            ListHeaderComponent={() => (
                <>
                    <StatusBar style="light" />
                    <Text style={estilos.titulo}>Estadísticas</Text>

                    {/* Selector de Billetera */}
                    <View style={estilos.selectorBilletera}>
                <Text style={estilos.etiquetaSelector}>Billetera:</Text>
                <View style={estilos.pickerContainer}>
                    {cargandoBilleteras ? (
                        <View style={estilos.pickerCargando}>
                            <ActivityIndicator size="small" color="#9C27B0" />
                            <Text style={estilos.textoCargandoPicker}>Cargando billeteras...</Text>
                        </View>
                    ) : (
                        <Picker
                            selectedValue={billeteraSeleccionada}
                            onValueChange={manejarCambioBilletera}
                            style={estilos.picker}
                            dropdownIconColor="#9C27B0"
                            mode="dropdown"
                            enabled={!cargando && billeteras.length > 0}
                        >
                            <Picker.Item 
                                label="📊 Todas las billeteras" 
                                value="todas" 
                                color="#fff"
                            />
                            {billeteras.map((billetera) => (
                                <Picker.Item 
                                    key={billetera.id} 
                                    label={`💳 ${billetera.nombre}`} 
                                    value={billetera.id.toString()}
                                    color="#fff"
                                />
                            ))}
                        </Picker>
                    )}
                </View>
                {errorCarga && (
                    <Text style={estilos.textoError}>{errorCarga}</Text>
                )}
            </View>

            {/* Filtros */}
            <View style={estilos.filtros}>
                <TouchableOpacity
                    style={[estilos.filtroBoton, filtro === 'ingresos' && estilos.filtroActivo]}
                    onPress={() => setFiltro('ingresos')}
                >
                    <Text style={estilos.filtroTexto}>Ingresos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[estilos.filtroBoton, filtro === 'gastos' && estilos.filtroActivo]}
                    onPress={() => setFiltro('gastos')}
                >
                    <Text style={estilos.filtroTexto}>Gastos</Text>
                </TouchableOpacity>
            </View>

            {/* Rango de la gráfica */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, gap: 10 }}>
                <TouchableOpacity onPress={() => setRangoGrafica('dia')} style={[estilos.filtroBoton, rangoGrafica === 'dia' && estilos.filtroActivo]}>
                    <Text style={estilos.filtroTexto}>Día</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRangoGrafica('semana')} style={[estilos.filtroBoton, rangoGrafica === 'semana' && estilos.filtroActivo]}>
                    <Text style={estilos.filtroTexto}>Semana</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRangoGrafica('mes')} style={[estilos.filtroBoton, rangoGrafica === 'mes' && estilos.filtroActivo]}>
                    <Text style={estilos.filtroTexto}>Mes</Text>
                </TouchableOpacity>
            </View>

                    {/* Gráfica */}
                    <ChartCard
                        labels={datosGrafico.labels}
                        data={datosGrafico[filtro]}
                        color={filtro === 'ingresos' ? '#4caf50' : '#f44336'}
                        height={220}
                    />

                    {/* Lista de transacciones header */}
                    <Text style={estilos.subtitulo}>Transacciones Recientes</Text>
                </>
            )}
            renderItem={({ item }) => (
                <TouchableOpacity 
                    style={estilos.transaccion}
                    activeOpacity={0.6}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        console.log('🔄 Navegando desde estadísticas a editar transacción:', item.id);
                        router.push({
                            pathname: '/(tabs)/editar-transaccion' as any,
                            params: {
                                id: item.id.toString(),
                                categoria: item.categoria,
                                descripcion: item.descripcion,
                                monto: item.monto.toString(),
                                fecha: item.fecha,
                                tipo: item.tipo,
                                billeteraId: item.billetera_id?.toString() || '',
                            },
                        });
                    }}
                >
                    <View style={[estilos.icono, { backgroundColor: item.color }]}> 
                        {item.icono}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={estilos.categoria}>{item.categoria}</Text>
                        <Text style={estilos.descripcion}>{item.descripcion}</Text>
                    </View>
                    <View style={estilos.infoDerecha}>
                        <Text
                            style={[
                                estilos.monto,
                                { color: item.tipo === 'ingreso' ? '#4caf50' : '#f44336' },
                            ]}
                        >
                            {item.tipo === 'ingreso' ? `+$${item.monto}` : `-$${item.monto}`}
                        </Text>
                        <Text style={estilos.fecha}>{item.fechaFormateada}</Text>
                    </View>
                </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
                <View style={estilos.estadoVacio}>
                    <Text style={estilos.textoVacio}>No hay transacciones</Text>
                    <Text style={estilos.subtextoVacio}>Las transacciones aparecerán aquí</Text>
                </View>
            )}
            ListFooterComponent={() => <View style={{ height: 40 }} />}
        />
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 140, // Increased padding to prevent navigation bar overlap
    },
    contenedorCargando: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoCargando: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    titulo: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    filtros: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        gap: 10,
    },
    filtroBoton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    filtroActivo: {
        backgroundColor: '#9C27B0',
    },
    filtroTexto: {
        color: '#fff',
        fontSize: 14,
    },
    subtitulo: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 6,
    },
    estadoVacio: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    textoVacio: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtextoVacio: {
        color: '#aaa',
        fontSize: 14,
        textAlign: 'center',
    },
    transaccion: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        minHeight: 70,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        // Enhanced touch feedback
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    icono: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoria: {
        color: '#fff',
        fontWeight: 'bold',
    },
    descripcion: {
        color: '#aaa',
        fontSize: 13,
    },
    infoDerecha: {
        alignItems: 'flex-end',
    },
    monto: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    fecha: {
        fontSize: 12,
        color: '#ccc',
    },
    selectorBilletera: {
        marginBottom: 20,
        marginTop: 15,
    },
    etiquetaSelector: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pickerContainer: {
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#9C27B0',
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#9C27B0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    picker: {
        color: '#fff',
        backgroundColor: 'transparent',
        height: 55,
    },
    pickerCargando: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        paddingHorizontal: 15,
    },
    textoCargandoPicker: {
        color: '#9C27B0',
        marginLeft: 10,
        fontSize: 14,
    },
    textoError: {
        color: '#f44336',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
});
