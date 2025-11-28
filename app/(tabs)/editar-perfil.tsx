import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { actualizarUsuario, Usuario } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function EditarPerfil() {
    const router = useRouter();
    const { usuario, guardarSesion } = useAuth();

    console.log('Render EditarPerfil');

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const nombreRef = useRef(nombre);
    const apellidoRef = useRef(apellido);
    const debounceNombre = useRef<number | null>(null);
    const debounceApellido = useRef<number | null>(null);
    const [cargando, setCargando] = useState(false);

    // Cargar datos del usuario al inicio
    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre || '');
            setApellido(usuario.apellido || '');
        }
    }, [usuario]);

    const actualizarPerfil = () => {
        if (!nombre.trim() || !apellido.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos.');
            return;
        }

        if (!usuario) {
            Alert.alert('Error', 'No se pudo cargar la información del usuario.');
            return;
        }

        // Verificar si hay cambios
        if (nombre.trim() === usuario.nombre && apellido.trim() === usuario.apellido) {
            Alert.alert('Info', 'No hay cambios para guardar.');
            return;
        }

        setCargando(true);

        actualizarUsuario(usuario.id, nombre.trim(), apellido.trim(), async (exito: boolean, mensaje: string, usuarioActualizado?: Usuario) => {
            setCargando(false);
            
            if (exito && usuarioActualizado) {
                // Actualizar la sesión con los nuevos datos
                await guardarSesion(usuarioActualizado);
                Alert.alert('Éxito', mensaje, [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', mensaje);
            }
        });
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={estilos.contenedor}>
            <StatusBar style="light" />
            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Actualizar Perfil</Text>

            <View style={estilos.iconoPerfilContainer}>
                <FontAwesome name="user-circle" size={100} color="white" />
                <TouchableOpacity style={estilos.editarIcono}>
                    <Ionicons name="create" size={20} color="#121212" />
                </TouchableOpacity>
            </View>

            <Text style={estilos.etiqueta}>Nombre</Text>
            <TextInput
                placeholder="Nombre..."
                placeholderTextColor="#aaa"
                style={estilos.input}
                value={nombre}
                onChangeText={(text) => {
                    nombreRef.current = text;
                    if (debounceNombre.current) clearTimeout(debounceNombre.current as any);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    debounceNombre.current = setTimeout(() => {
                        setNombre(nombreRef.current);
                        debounceNombre.current = null;
                    }, 150) as any;
                }}
                editable={!cargando}
                onFocus={() => console.log('Perfil Nombre onFocus')}
                onBlur={() => console.log('Perfil Nombre onBlur')}
            />

            <Text style={estilos.etiqueta}>Apellido</Text>
            <TextInput
                placeholder="Apellido..."
                placeholderTextColor="#aaa"
                style={estilos.input}
                value={apellido}
                onChangeText={(text) => {
                    apellidoRef.current = text;
                    if (debounceApellido.current) clearTimeout(debounceApellido.current as any);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    debounceApellido.current = setTimeout(() => {
                        setApellido(apellidoRef.current);
                        debounceApellido.current = null;
                    }, 150) as any;
                }}
                editable={!cargando}
                onFocus={() => console.log('Perfil Apellido onFocus')}
                onBlur={() => console.log('Perfil Apellido onBlur')}
            />

            <TouchableOpacity 
                style={[estilos.boton, cargando && { opacity: 0.6 }]} 
                onPress={actualizarPerfil}
                disabled={cargando}
            >
                {cargando ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={estilos.textoBoton}>Actualizar Perfil</Text>
                )}
            </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
    },
    retroceso: {
        marginBottom: 10,
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
    },
    iconoPerfilContainer: {
        alignSelf: 'center',
        position: 'relative',
        marginBottom: 30,
    },
    editarIcono: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 4,
    },
    etiqueta: {
        color: '#ccc',
        marginBottom: 5,
        fontSize: 14,
        marginTop: 10,
    },
    input: {
        backgroundColor: '#1e1e1e',
        color: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    boton: {
        backgroundColor: '#9C27B0',
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 20,
    },
    textoBoton: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
