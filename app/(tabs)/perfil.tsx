import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassCard } from '../../components/ui/GlassCard';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';

export default function Perfil() {
    const router = useRouter();
    const { usuario, cerrarSesion } = useAuth();

    const manejarCerrarSesion = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: async () => {
                        await cerrarSesion();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    return (

        <GradientBackground>
            <StatusBar style="light" />

            <View style={estilos.contenido}>
                <GlassCard style={estilos.headerCard} highlight>
                    <View style={estilos.avatarWrapper}>
                        <FontAwesome name="user-circle" size={80} color={Colors.white} />
                    </View>
                    <Text style={estilos.nombre}>{usuario?.nombre} {usuario?.apellido}</Text>
                    <Text style={estilos.correo}>{usuario?.correo}</Text>
                    <PrimaryButton
                        label="Editar perfil"
                        small
                        onPress={() => router.push('/(tabs)/editar-perfil')}
                        icon={<Ionicons name="person" size={18} color={Colors.white} />}
                    />
                </GlassCard>

                <GlassCard style={estilos.opcionesCard}>
                    <Text style={estilos.sectionTitle}>Preferencias</Text>

                    <TouchableOpacity
                        style={estilos.opcion}
                        onPress={() => router.push('/(tabs)/configuracion')}
                    >
                        <View style={[estilos.icono, { backgroundColor: Colors.secondary }]}>
                            <Ionicons name="settings" size={20} color={Colors.white} />
                        </View>
                        <Text style={estilos.textoOpcion}>Configuración</Text>
                        <Entypo name="chevron-right" size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={estilos.opcion}
                        onPress={() => router.push('/(tabs)/privacidad')}
                    >
                        <View style={[estilos.icono, { backgroundColor: Colors.primary }]}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.white} />
                        </View>
                        <Text style={estilos.textoOpcion}>Privacidad</Text>
                        <Entypo name="chevron-right" size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[estilos.opcion, estilos.opcionPeligro]}
                        onPress={manejarCerrarSesion}
                    >
                        <View style={[estilos.icono, { backgroundColor: Colors.red }]}>
                            <MaterialCommunityIcons name="logout" size={20} color={Colors.white} />
                        </View>
                        <Text style={[estilos.textoOpcion, estilos.textoPeligro]}>Cerrar sesión</Text>
                        <Entypo name="chevron-right" size={22} color={Colors.red} />
                    </TouchableOpacity>
                </GlassCard>
            </View>
        </GradientBackground>
    );
}

const estilos = StyleSheet.create({
    contenido: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 140,
        rowGap: 20,
    },
    headerCard: {
        alignItems: 'center',
        rowGap: 16,
        paddingVertical: 28,
    },
    avatarWrapper: {
        padding: 8,
        borderRadius: 999,
        backgroundColor: Colors.surface,
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    nombre: {
        color: Colors.textPrimary,
        fontSize: 22,
        fontWeight: '700',
    },
    correo: {
        color: Colors.textSecondary,
        marginBottom: 12,
        fontSize: 14,
    },
    opcionesCard: {
        rowGap: 16,
    },
    sectionTitle: {
        color: Colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        fontSize: 13,
    },
    opcion: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceElevated,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        paddingVertical: 18,
        paddingHorizontal: 20,
        columnGap: 16,
        elevation: 3,
        shadowColor: Colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    icono: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoOpcion: {
        color: Colors.textPrimary,
        fontSize: 17,
        flex: 1,
        fontWeight: '600',
    },
    opcionPeligro: {
        borderColor: Colors.red,
    },
    textoPeligro: {
        color: Colors.red,
    },
});
