import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeBack } from '../../hooks/useSafeBack';

export default function Privacidad() {
    const router = useRouter();
    const safeBack = useSafeBack();

    return (
        <View style={estilos.contenedor}>
            <StatusBar style="light" />
            <TouchableOpacity onPress={() => safeBack('perfil')} style={estilos.retroceso}>
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
