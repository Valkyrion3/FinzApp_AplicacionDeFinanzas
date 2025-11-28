import { Entypo, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
    const [imagen, setImagen] = useState<string | null>(null);
    const [imagenCambiada, setImagenCambiada] = useState(false);

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
                // Cargar imagen si existe
                if ((billeteraEncontrada as any).imagen) {
                    setImagen((billeteraEncontrada as any).imagen);
                }
            } else {
                console.error('Billetera no encontrada con id:', billeteraId);
                Alert.alert('Error', 'No se encontró la billetera especificada.');
            }
            setCargando(false);
        });
    };

    const seleccionarImagen = async () => {
        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!resultado.canceled && resultado.assets.length > 0) {
            setImagen(resultado.assets[0].uri);
            setImagenCambiada(true);
        }
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
                    { text: 'OK', onPress: () => router.back() }
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

            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Editar Billetera</Text>

            <Text style={estilos.etiqueta}>Imagen de la billetera</Text>
            <TouchableOpacity style={estilos.subirImagen} onPress={seleccionarImagen}>
                {imagen ? (
                    <Image source={{ uri: imagen }} style={estilos.imagenPrevia} />
                ) : (
                    <>
                        <Entypo name="upload" size={28} color="#aaa" />
                        <Text style={estilos.textoSubir}>Cambiar imagen</Text>
                    </>
                )}
            </TouchableOpacity>

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
                    onPress={() => router.back()}
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
    subirImagen: {
        height: 140,
        borderWidth: 2,
        borderColor: '#555',
        borderStyle: 'dashed',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#1a1a1a',
    },
    textoSubir: {
        color: '#aaa',
        marginTop: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    imagenPrevia: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        resizeMode: 'cover',
    },
});
