import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CerrarSesion() {
    const router = useRouter();

    const confirmarCierre = () => {
        Alert.alert(
            '¿Cerrar sesión?',
            '¿Estás seguro de que deseas salir?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, salir',
                    onPress: () => {
                        console.log('Sesión cerrada');
                        router.replace('/(auth)/iniciar-sesion'); // vuelve al login
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <View style={estilos.contenedor}>
            <StatusBar style="light" />
            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Cerrar Sesión</Text>
            <Text style={estilos.texto}>
                Presiona el botón para cerrar sesión de tu cuenta.
            </Text>

            <TouchableOpacity style={estilos.boton} onPress={confirmarCierre}>
                <Text style={estilos.textoBoton}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
        paddingTop: 60,
    },
    retroceso: {
        marginBottom: 10,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    texto: {
        color: '#ccc',
        fontSize: 16,
        marginBottom: 40,
    },
    boton: {
        backgroundColor: '#f44336',
        paddingVertical: 14,
        borderRadius: 10,
    },
    textoBoton: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
