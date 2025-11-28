import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { crearBilletera } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function NuevaBilletera() {
    const router = useRouter();
    const { usuario } = useAuth();
    const [nombre, setNombre] = useState('');
    const [cargando, setCargando] = useState(false);

    const aceptar = () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para la billetera.');
            return;
        }

        if (!usuario) {
            Alert.alert('Error', 'No se pudo obtener la información del usuario.');
            return;
        }

        setCargando(true);

        crearBilletera(usuario.id, nombre.trim(), (exito: boolean, mensaje: string) => {
            setCargando(false);
            
            if (exito) {
                console.log('Billetera creada exitosamente');
                Alert.alert('Éxito', 'Billetera creada exitosamente.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                console.log('Error al crear billetera:', mensaje);
                Alert.alert('Error', mensaje);
            }
        });
    };


    return (
        <View style={estilos.contenedor}>
            <StatusBar style="light" />
            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Nueva billetera</Text>

            <Text style={estilos.etiqueta}>Nombre de la billetera</Text>
            <TextInput
                placeholder="Descripción ..."
                placeholderTextColor="#aaa"
                style={estilos.input}
                value={nombre}
                onChangeText={setNombre}
            />


            <View style={estilos.logoWrapper}>
                <Image source={require('../../assets/images/icon.png')} style={estilos.logoBilletera} />
            </View>

            <TouchableOpacity 
                style={[estilos.boton, cargando && estilos.botonDeshabilitado]} 
                onPress={aceptar}
                disabled={cargando}
            >
                <Text style={estilos.textoBoton}>
                    {cargando ? 'Creando...' : 'Aceptar'}
                </Text>
            </TouchableOpacity>
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
    retroceso: {
        marginBottom: 10,
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 30,
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
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#888',
    },
    logoWrapper: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    logoBilletera: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    boton: {
        backgroundColor: '#9C27B0',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    botonDeshabilitado: {
        backgroundColor: '#666666',
    },
    textoBoton: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
