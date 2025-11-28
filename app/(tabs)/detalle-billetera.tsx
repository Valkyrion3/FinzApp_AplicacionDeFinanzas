import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Billetera, crearTransaccion, eliminarBilletera, obtenerBilleteras } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function DetalleBilletera() {
    const router = useRouter();
    const { usuario } = useAuth();
    const params = useLocalSearchParams();
    
    const [billetera, setBilletera] = useState<Billetera | null>(null);
    const [cargando, setCargando] = useState(true);
    
    // Estado para modales
    const [mostrarAgregar, setMostrarAgregar] = useState(false);
    const [mostrarRetirar, setMostrarRetirar] = useState(false);
    const [montoInput, setMontoInput] = useState('');
    const [descripcionInput, setDescripcionInput] = useState('');
    const [procesando, setProcesando] = useState(false);

    // Cargar datos de la billetera
    useEffect(() => {
        if (usuario && params.id) {
            cargarBilletera();
        }
    }, [usuario, params.id]);

    const cargarBilletera = () => {
        if (!usuario || !params.id) return;
        
        obtenerBilleteras(usuario.id, (billeteras: Billetera[]) => {
            const billeteraEncontrada = billeteras.find((b: Billetera) => b.id.toString() === params.id);
            setBilletera(billeteraEncontrada || null);
            setCargando(false);
        });
    };

    const cerrarModal = () => {
        setMontoInput('');
        setDescripcionInput('');
        setMostrarAgregar(false);
        setMostrarRetirar(false);
    };

    const confirmarAgregar = () => {
        if (!billetera) return;
        
        const monto = parseFloat(montoInput);
        if (isNaN(monto) || monto <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido.');
            return;
        }

        if (!descripcionInput.trim()) {
            Alert.alert('Error', 'Por favor ingresa una descripción.');
            return;
        }

        setProcesando(true);
        
        crearTransaccion(
            billetera.id,
            'ingreso',
            'Depósito',
            monto,
            descripcionInput.trim(),
            (exito: boolean, mensaje: string) => {
                setProcesando(false);
                
                if (exito) {
                    Alert.alert('Éxito', 'Depósito realizado exitosamente.', [
                        { text: 'OK', onPress: () => {
                            cerrarModal();
                            cargarBilletera(); // Recargar datos actualizados
                        }}
                    ]);
                } else {
                    Alert.alert('Error', mensaje);
                }
            }
        );
    };

    const confirmarRetiro = () => {
        if (!billetera) return;
        
        const monto = parseFloat(montoInput);
        if (isNaN(monto) || monto <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido.');
            return;
        }

        if (monto > billetera.saldo) {
            Alert.alert('Error', 'El monto excede el saldo disponible.');
            return;
        }

        if (!descripcionInput.trim()) {
            Alert.alert('Error', 'Por favor ingresa una descripción.');
            return;
        }

        setProcesando(true);
        
        crearTransaccion(
            billetera.id,
            'gasto',
            'Retiro',
            monto,
            descripcionInput.trim(),
            (exito: boolean, mensaje: string) => {
                setProcesando(false);
                
                if (exito) {
                    Alert.alert('Éxito', 'Retiro realizado exitosamente.', [
                        { text: 'OK', onPress: () => {
                            cerrarModal();
                            cargarBilletera(); // Recargar datos actualizados
                        }}
                    ]);
                } else {
                    Alert.alert('Error', mensaje);
                }
            }
        );
    };

    const eliminar = () => {
        if (!billetera) return;
        
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de que deseas eliminar la billetera "${billetera.nombre}"? Esta acción también eliminará todas las transacciones asociadas.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: () => {
                        setProcesando(true);
                        eliminarBilletera(billetera.id, (exito: boolean, mensaje: string) => {
                            setProcesando(false);
                            
                            if (exito) {
                                Alert.alert('Éxito', 'Billetera eliminada exitosamente.', [
                                    { text: 'OK', onPress: () => router.back() }
                                ]);
                            } else {
                                Alert.alert('Error', mensaje);
                            }
                        });
                    }
                }
            ]
        );
    };

    const editar = () => {
        if (billetera) {
            console.log('Navegando a editar billetera, id:', billetera.id);
            // Evitamos problemas de navegación cambiando la forma de navegar
            router.push(`/(tabs)/editar-billetera?id=${billetera.id}`);
        }
    };

    if (cargando) {
        return (
            <View style={[estilos.contenedor, estilos.contenedorCargando]}>
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#9C27B0" />
                <Text style={estilos.textoCargando}>Cargando billetera...</Text>
            </View>
        );
    }

    if (!billetera) {
        return (
            <View style={[estilos.contenedor, estilos.contenedorCargando]}>
                <StatusBar style="light" />
                <Text style={estilos.textoError}>Billetera no encontrada</Text>
                <TouchableOpacity 
                    style={estilos.botonVolver}
                    onPress={() => router.back()}
                >
                    <Text style={estilos.textoBoton}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={estilos.contenedor}>
            <StatusBar style="light" />
            <View style={estilos.encabezado}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="white" />
                </TouchableOpacity>

                <View style={estilos.botonesTop}>
                    <TouchableOpacity onPress={editar} style={estilos.iconoAccion}>
                        <Ionicons name="create" size={20} color="#121212" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={eliminar} style={[estilos.iconoAccion, { backgroundColor: '#f44336' }]}>
                        <FontAwesome name="trash" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={estilos.nombre}>{billetera.nombre}</Text>
            <Text style={estilos.monto}>${billetera.saldo.toLocaleString()}</Text>
            <Text style={estilos.subtitulo}>Saldo actual</Text>

            <View style={estilos.filaBotones}>
                <TouchableOpacity style={estilos.boton} onPress={() => setMostrarAgregar(true)}>
                    <Text style={estilos.textoBoton}>Agregar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[estilos.boton, estilos.botonRetirar]} onPress={() => setMostrarRetirar(true)}>
                    <Text style={estilos.textoBoton}>Retirar</Text>
                </TouchableOpacity>
            </View>

            {/* Modal agregar */}
            <Modal visible={mostrarAgregar} transparent animationType="slide">
                <View style={estilos.modalFondo}>
                    <View style={estilos.modal}>
                        <Text style={estilos.modalTitulo}>Agregar dinero</Text>
                        <TextInput
                            placeholder="Monto"
                            placeholderTextColor="#aaa"
                            style={estilos.input}
                            keyboardType="numeric"
                            value={montoInput}
                            onChangeText={setMontoInput}
                        />
                        <TextInput
                            placeholder="Descripción"
                            placeholderTextColor="#aaa"
                            style={estilos.input}
                            value={descripcionInput}
                            onChangeText={setDescripcionInput}
                        />
                        <View style={estilos.modalBotones}>
                            <TouchableOpacity 
                                onPress={cerrarModal} 
                                style={estilos.btnCancelar}
                                disabled={procesando}
                            >
                                <Text style={estilos.textoBoton}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={confirmarAgregar} 
                                style={[estilos.btnAceptar, procesando && { opacity: 0.6 }]}
                                disabled={procesando}
                            >
                                {procesando ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={estilos.textoBoton}>Aceptar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal retirar */}
            <Modal visible={mostrarRetirar} transparent animationType="slide">
                <View style={estilos.modalFondo}>
                    <View style={estilos.modal}>
                        <Text style={estilos.modalTitulo}>Retirar dinero</Text>
                        <TextInput
                            placeholder="Monto"
                            placeholderTextColor="#aaa"
                            style={estilos.input}
                            keyboardType="numeric"
                            value={montoInput}
                            onChangeText={setMontoInput}
                        />
                        <TextInput
                            placeholder="Descripción"
                            placeholderTextColor="#aaa"
                            style={estilos.input}
                            value={descripcionInput}
                            onChangeText={setDescripcionInput}
                        />
                        <View style={estilos.modalBotones}>
                            <TouchableOpacity 
                                onPress={cerrarModal} 
                                style={estilos.btnCancelar}
                                disabled={procesando}
                            >
                                <Text style={estilos.textoBoton}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={confirmarRetiro} 
                                style={[estilos.btnAceptar, procesando && { opacity: 0.6 }]}
                                disabled={procesando}
                            >
                                {procesando ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={estilos.textoBoton}>Aceptar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
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
    textoError: {
        color: '#f44336',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    botonVolver: {
        backgroundColor: '#9C27B0',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    encabezado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    botonesTop: {
        flexDirection: 'row',
        gap: 10,
    },
    iconoAccion: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
    },
    nombre: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    monto: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitulo: {
        color: '#aaa',
        marginBottom: 30,
    },
    filaBotones: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
    },
    boton: {
        backgroundColor: '#9C27B0',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    botonRetirar: {
        backgroundColor: '#607D8B',
    },
    textoBoton: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalFondo: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#1e1e1e',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitulo: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    modalBotones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btnAceptar: {
        backgroundColor: '#9C27B0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    btnCancelar: {
        backgroundColor: '#607D8B',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
});
