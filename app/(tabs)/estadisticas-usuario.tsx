import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { obtenerEstadisticas } from '../../database';
import { useAuth } from '../../hooks/useAuth';

interface EstadisticasUsuario {
    totalBilleteras: number;
    totalTransacciones: number;
    totalIngresos: number;
    totalGastos: number;
    saldoTotal: number;
}

export default function EstadisticasUsuario() {
    const router = useRouter();
    const { usuario } = useAuth();
    const [estadisticas, setEstadisticas] = useState<EstadisticasUsuario>({
        totalBilleteras: 0,
        totalTransacciones: 0,
        totalIngresos: 0,
        totalGastos: 0,
        saldoTotal: 0    });
    const [cargando, setCargando] = useState(true);
    
    useEffect(() => {
        if (usuario) {
            cargarEstadisticas();
        }
    }, [usuario]);

    const cargarEstadisticas = () => {
        if (!usuario) return;
        
        setCargando(true);
        obtenerEstadisticas(usuario.id, (stats: any) => {
            setEstadisticas(stats);
            setCargando(false);
        });
    };

    const calcularBalance = () => {
        return estadisticas.totalIngresos - estadisticas.totalGastos;
    };

    const calcularPorcentajeAhorro = () => {
        if (estadisticas.totalIngresos === 0) return 0;
        return ((estadisticas.totalIngresos - estadisticas.totalGastos) / estadisticas.totalIngresos * 100);
    };

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
        <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <StatusBar style="light" />
            
            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Estadísticas de Usuario</Text>
            <Text style={estilos.subtitulo}>Resumen completo de tu actividad financiera</Text>

            {/* Resumen general */}
            <View style={estilos.tarjeta}>
                <View style={estilos.encabezadoTarjeta}>
                    <MaterialCommunityIcons name="chart-line" size={24} color="#9C27B0" />
                    <Text style={estilos.tituloTarjeta}>Resumen General</Text>
                </View>
                
                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Saldo Total</Text>
                    <Text style={[estilos.valorEstadistica, { color: estadisticas.saldoTotal >= 0 ? '#4CAF50' : '#F44336' }]}>
                        ${estadisticas.saldoTotal.toLocaleString()}
                    </Text>
                </View>

                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Balance de Transacciones</Text>
                    <Text style={[estilos.valorEstadistica, { color: calcularBalance() >= 0 ? '#4CAF50' : '#F44336' }]}>
                        ${calcularBalance().toLocaleString()}
                    </Text>
                </View>

                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Porcentaje de Ahorro</Text>
                    <Text style={[estilos.valorEstadistica, { color: calcularPorcentajeAhorro() >= 0 ? '#4CAF50' : '#F44336' }]}>
                        {calcularPorcentajeAhorro().toFixed(1)}%
                    </Text>
                </View>
            </View>

            {/* Billeteras */}
            <View style={estilos.tarjeta}>
                <View style={estilos.encabezadoTarjeta}>
                    <FontAwesome5 name="wallet" size={20} color="#2196F3" />
                    <Text style={estilos.tituloTarjeta}>Billeteras</Text>
                </View>
                
                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Total de Billeteras</Text>
                    <Text style={estilos.valorEstadistica}>{estadisticas.totalBilleteras}</Text>
                </View>

                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Promedio por Billetera</Text>
                    <Text style={estilos.valorEstadistica}>
                        ${estadisticas.totalBilleteras > 0 
                            ? (estadisticas.saldoTotal / estadisticas.totalBilleteras).toLocaleString() 
                            : '0'}
                    </Text>
                </View>
            </View>

            {/* Transacciones */}
            <View style={estilos.tarjeta}>
                <View style={estilos.encabezadoTarjeta}>
                    <MaterialCommunityIcons name="swap-horizontal" size={24} color="#FF9800" />
                    <Text style={estilos.tituloTarjeta}>Transacciones</Text>
                </View>
                
                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Total de Transacciones</Text>
                    <Text style={estilos.valorEstadistica}>{estadisticas.totalTransacciones}</Text>
                </View>

                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Total de Ingresos</Text>
                    <Text style={[estilos.valorEstadistica, { color: '#4CAF50' }]}>
                        ${estadisticas.totalIngresos.toLocaleString()}
                    </Text>
                </View>

                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Total de Gastos</Text>
                    <Text style={[estilos.valorEstadistica, { color: '#F44336' }]}>
                        ${estadisticas.totalGastos.toLocaleString()}
                    </Text>
                </View>

                <View style={estilos.filaEstadistica}>
                    <Text style={estilos.etiquetaEstadistica}>Promedio por Transacción</Text>
                    <Text style={estilos.valorEstadistica}>
                        ${estadisticas.totalTransacciones > 0 
                            ? ((estadisticas.totalIngresos + estadisticas.totalGastos) / estadisticas.totalTransacciones).toLocaleString() 
                            : '0'}
                    </Text>
                </View>
            </View>

            {/* Consejos */}
            {estadisticas.totalTransacciones > 0 && (
                <View style={estilos.tarjeta}>
                    <View style={estilos.encabezadoTarjeta}>
                        <Ionicons name="bulb" size={22} color="#FFC107" />
                        <Text style={estilos.tituloTarjeta}>Consejos</Text>
                    </View>
                    
                    {calcularPorcentajeAhorro() < 10 && (
                        <View style={estilos.consejo}>
                            <Text style={estilos.textoConsejo}>
                                💡 Tu porcentaje de ahorro es bajo. Considera revisar tus gastos para aumentar tu capacidad de ahorro.
                            </Text>
                        </View>
                    )}

                    {estadisticas.totalBilleteras === 1 && (
                        <View style={estilos.consejo}>
                            <Text style={estilos.textoConsejo}>
                                💡 Considera crear más billeteras para organizar mejor tus finanzas por categorías o propósitos.
                            </Text>
                        </View>
                    )}

                    {calcularPorcentajeAhorro() >= 20 && (
                        <View style={estilos.consejo}>
                            <Text style={estilos.textoConsejo}>
                                🎉 ¡Excelente! Mantienes un buen porcentaje de ahorro. Sigue así.
                            </Text>
                        </View>
                    )}
                </View>
            )}

            <View style={{ height: 20 }} />
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        backgroundColor: '#121212',
        padding: 20,
        paddingTop: 60,
        // minHeight ensures the content container can grow and allows scrolling on smaller screens
        minHeight: '100%'
    },
    contenedorCargando: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoCargando: {
        color: '#ccc',
        marginTop: 10,
        fontSize: 16,
    },
    retroceso: {
        marginBottom: 10,
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitulo: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 25,
    },
    tarjeta: {
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
    },
    encabezadoTarjeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    tituloTarjeta: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
    },
    filaEstadistica: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    etiquetaEstadistica: {
        fontSize: 14,
        color: '#ccc',
        flex: 1,
    },
    valorEstadistica: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    consejo: {
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    textoConsejo: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
    },
});
