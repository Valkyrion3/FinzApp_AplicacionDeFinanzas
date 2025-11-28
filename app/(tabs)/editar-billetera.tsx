import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { actualizarBilletera, Billetera, obtenerBilleteras } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function EditarBilletera() {
    const router = useRouter();
    const { usuario } = useAuth();
    const params = useLocalSearchParams();
    
    const [nombre, setNombre] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [billetera, setBilletera] = useState<Billetera | null>(null);

    useEffect(() => {
        if (usuario) {
            // Aseguramos que params.id exista como string
            const billeteraId = params.id ? String(params.id) : '';
            console.log('Buscando billetera con id:', billeteraId);
            
            if (billeteraId) {
                cargarBilletera(billeteraId);
            } else {
                console.error('No se proporcionó ID de billetera');
                setCargando(false);
            }
        }
    }, [usuario, params.id]);

    const cargarBilletera = (billeteraId: string) => {
        if (!usuario) return;
        
        obtenerBilleteras(usuario.id, (billeteras: Billetera[]) => {
            const billeteraEncontrada = billeteras.find((b: Billetera) => String(b.id) === billeteraId);
            if (billeteraEncontrada) {
                console.log('Billetera encontrada:', billeteraEncontrada.nombre);
                setBilletera(billeteraEncontrada);
                setNombre(billeteraEncontrada.nombre);
            } else {
                console.error('Billetera no encontrada con id:', billeteraId);
                Alert.alert('Error', 'No se encontró la billetera especificada.');
            }
            setCargando(false);
        });
    };


    const actualizar = () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para la billetera.');
            return;
        }

        if (!billetera) {
            Alert.alert('Error', 'No se pudo cargar la información de la billetera.');
            return;
        }

        if (nombre.trim() === billetera.nombre) {
            Alert.alert('Info', 'No hay cambios para guardar.');
            return;
        }

        setGuardando(true);

        actualizarBilletera(billetera.id, nombre.trim(), (exito: boolean, mensaje: string) => {
            setGuardando(false);
            
                if (exito) {
                Alert.alert('Éxito', 'Billetera actualizada exitosamente.', [
                        { text: 'OK', onPress: () => {
                            // Force explicit navigation to detalle-billetera to guarantee return
                            router.push({ pathname: '/(tabs)/detalle-billetera' as any, params: { id: billetera.id.toString() } } as any);
                        } }
                ]);
            } else {
                Alert.alert('Error', mensaje);
            }
        });
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
                    onPress={() => router.push({ pathname: '/(tabs)/detalle-billetera' as any, params: { id: params.id ? String(params.id) : '' } } as any)}
                >
                    <Text style={estilos.textoBoton}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={estilos.contenedor}>
            <StatusBar style="light" />

                <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/detalle-billetera' as any, params: { id: params.id ? String(params.id) : '' } } as any)} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Editar Billetera</Text>


            <View style={estilos.logoWrapper}>
                <Image source={require('../../assets/images/icon.png')} style={estilos.logoBilletera} />
            </View>

            <Text style={estilos.etiqueta}>Nombre de la billetera</Text>
            <TextInput
                placeholder="Nombre de la billetera"
                placeholderTextColor="#aaa"
                style={estilos.input}
                value={nombre}
                onChangeText={setNombre}
                editable={!guardando}
            />

            <View style={estilos.infoContainer}>
                <Text style={estilos.infoTexto}>Saldo actual: ${billetera.saldo.toLocaleString()}</Text>
                <Text style={estilos.infoTexto}>
                    Creada: {new Date(billetera.fecha_creacion).toLocaleDateString('es-ES')}
                </Text>
            </View>

            <View style={estilos.botones}>
                <TouchableOpacity 
                    style={[estilos.boton, estilos.botonCancelar]} 
                    onPress={() => router.push({ pathname: '/(tabs)/detalle-billetera' as any, params: { id: params.id ? String(params.id) : '' } } as any)}
                    disabled={guardando}
                >
                    <Text style={estilos.textoBoton}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[estilos.boton, estilos.botonGuardar, guardando && { opacity: 0.6 }]} 
                    onPress={actualizar}
                    disabled={guardando}
                >
                    {guardando ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={estilos.textoBoton}>Guardar</Text>
                    )}
                </TouchableOpacity>
            </View>
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
    retroceso: {
        marginBottom: 10,
    },
    titulo: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    etiqueta: {
        color: '#ccc',
        marginBottom: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#1e1e1e',
        color: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
        fontSize: 16,
    },
    infoContainer: {
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#333',
    },
    infoTexto: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 4,
    },
    textoCargando: {
        color: '#fff',
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
    textoError: {
        color: '#f44336',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    botonVolver: {
        backgroundColor: '#9C27B0',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'center',
    },
    botones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 'auto',
        marginBottom: Platform.OS === 'android' ? 20 : 40,
    },
    boton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botonCancelar: {
        backgroundColor: '#333',
    },
    botonGuardar: {
        backgroundColor: '#9C27B0',
    },
    textoBoton: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoWrapper: {
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoBilletera: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
});
