import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassCard } from '../../components/ui/GlassCard';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Colors } from '../../constants/Colors';

export default function Bienvenida() {
    const router = useRouter();

    const comenzar = () => {
        router.push('/(auth)/iniciar-sesion');
    };

    return (
        <GradientBackground>
            <StatusBar style="light" />
            <View style={estilos.contenedor}>
                <GlassCard style={estilos.heroCard}>
                    <View style={estilos.heroHeader}>
                        <View style={estilos.heroCopy}>
                            <Text style={estilos.badge}>Bienvenido a Mora</Text>
                            <Text style={estilos.titulo}>Toma el control de tus finanzas</Text>
                            <Text style={estilos.subtitulo}>
                                Sigue tus billeteras, automatiza hábitos saludables y celebra cada logro con una interfaz premium.
                            </Text>
                        </View>
                        <Image
                            source={require('../../assets/images/icon.png')}
                            style={estilos.imagen}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={estilos.featureList}>
                        <View style={estilos.featureItem}>
                            <Ionicons name="sparkles" color={Colors.secondary} size={18} />
                            <Text style={estilos.featureText}>Diseño envolvente con resúmenes precisos de tus cuentas.</Text>
                        </View>
                        <View style={estilos.featureItem}>
                            <Ionicons name="calendar" color={Colors.secondary} size={18} />
                            <Text style={estilos.featureText}>Planifica cada paso con recordatorios y estadísticas oportunas.</Text>
                        </View>
                        <View style={estilos.featureItem}>
                            <Ionicons name="shield-checkmark" color={Colors.secondary} size={18} />
                            <Text style={estilos.featureText}>Tus datos permanecen seguros y siempre disponibles.</Text>
                        </View>
                    </View>

                    <PrimaryButton label="Comenzar" onPress={comenzar} />
                    <TouchableOpacity onPress={() => router.push('/(auth)/iniciar-sesion')} style={estilos.secondaryAction}>
                        <Text style={estilos.secondaryText}>Ya tengo una cuenta, iniciar sesión</Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>
        </GradientBackground>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
    },
    heroCard: {
        rowGap: 24,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 20,
    },
    heroCopy: {
        flex: 1,
    },
    imagen: {
        width: 140,
        height: 140,
        flexShrink: 0,
    },
    badge: {
        color: Colors.secondary,
        fontWeight: '600',
        letterSpacing: 1.4,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    titulo: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 10,
    },
    subtitulo: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: 6,
    },
    featureList: {
        rowGap: 14,
    },
    featureItem: {
        flexDirection: 'row',
        columnGap: 12,
        alignItems: 'center',
    },
    featureText: {
        color: Colors.textSecondary,
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    secondaryAction: {
        alignItems: 'center',
    },
    secondaryText: {
        color: Colors.textSecondary,
        textDecorationLine: 'underline',
    },
});
