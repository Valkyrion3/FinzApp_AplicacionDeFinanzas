import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function Privacidad() {
    const router = useRouter();

    return (
        <View style={estilos.contenedor}>
            <StatusBar style="light" />
            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Privacidad</Text>
            <Text style={estilos.texto}>Aquí irán tus configuraciones de privacidad.</Text>
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
    },
});
