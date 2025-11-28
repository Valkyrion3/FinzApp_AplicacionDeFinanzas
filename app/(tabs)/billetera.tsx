import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassCard } from '../../components/ui/GlassCard';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Colors } from '../../constants/Colors';
import { Billetera, obtenerBilleteras } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function BilleteraScreen() {
    const router = useRouter();
    const { usuario } = useAuth();
    const [billeteras, setBilleteras] = useState<Billetera[]>([]);
    const [cargando, setCargando] = useState(true);
    const [balanceTotal, setBalanceTotal] = useState(0);

    useEffect(() => {
        if (usuario) {
            cargarBilleteras();
        }
    }, [usuario]);

    // Refrescar datos cuando la pantalla recibe foco
    useFocusEffect(
        useCallback(() => {
            if (usuario) {
                cargarBilleteras();
            }
        }, [usuario])
    );

    const cargarBilleteras = () => {
        if (!usuario) return;
        
        obtenerBilleteras(usuario.id, (billeterasObtenidas: Billetera[]) => {
            setBilleteras(billeterasObtenidas);
            
            // Calcular balance total
            const total = billeterasObtenidas.reduce((sum: number, billetera: Billetera) => sum + billetera.saldo, 0);
            setBalanceTotal(total);
            
            setCargando(false);
        });
    };

    if (cargando) {
        return (
            <GradientBackground>
                <StatusBar style="light" />
                <View style={[estilos.contenido, estilos.contenedorCargando]}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                    <Text style={estilos.textoCargando}>Cargando billeteras...</Text>
                </View>
            </GradientBackground>
        );
    }

    return (
        <GradientBackground>
            <StatusBar style="light" />
            <View style={estilos.contenido}>
                <GlassCard style={estilos.balanceCard} highlight>
                    <Text style={estilos.balanceLabel}>Balance total</Text>
                    <Text style={estilos.balance}>${balanceTotal.toLocaleString()}</Text>
                    <Text style={estilos.balanceMeta}>
                        {billeteras.length > 0 ? `${billeteras.length} billetera${billeteras.length !== 1 ? 's' : ''} activas` : 'Sin billeteras registradas'}
                    </Text>
                    <PrimaryButton
                        label="Nueva billetera"
                        onPress={() => router.push('/(tabs)/nueva-billetera')}
                        small
                        icon={<Ionicons name="add" size={18} color={Colors.white} />}
                    />
                </GlassCard>

                <GlassCard style={estilos.listaCard}>
                    <View style={estilos.headerCarteras}>
                        <Text style={estilos.titulo}>Mis billeteras</Text>
                        <TouchableOpacity onPress={() => cargarBilleteras()}>
                            <Text style={estilos.refresh}>Actualizar</Text>
                        </TouchableOpacity>
                    </View>

                    {billeteras.length > 0 ? (
                        billeteras.map((billetera) => (
                            <TouchableOpacity
                                key={billetera.id}
                                style={estilos.item}
                                onPress={() =>
                                    router.push({
                                        pathname: '/(tabs)/detalle-billetera',
                                        params: {
                                            id: billetera.id.toString(),
                                            nombre: billetera.nombre,
                                            monto: billetera.saldo.toString(),
                                        },
                                    })
                                }
                            >
                                <View style={estilos.iconoWrapper}>
                                    <Image
                                        source={require('../../assets/images/icon.png')}
                                        style={estilos.icono}
                                    />
                                </View>
                                <View style={estilos.info}>
                                    <Text style={estilos.nombre}>{billetera.nombre}</Text>
                                    <Text style={estilos.monto}>${billetera.saldo.toLocaleString()}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={estilos.sinBilleteras}>
                            <Ionicons name="wallet-outline" size={48} color={Colors.textMuted} />
                            <Text style={estilos.textoSinBilleteras}>No tienes billeteras creadas</Text>
                            <Text style={estilos.subtextoSinBilleteras}>Crea tu primera billetera para comenzar</Text>
                        </View>
                    )}
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
        paddingBottom: 120,
        rowGap: 20,
    },
    contenedorCargando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 12,
    },
    textoCargando: {
        color: Colors.textSecondary,
        marginTop: 10,
        fontSize: 16,
    },
    balanceCard: {
        rowGap: 14,
    },
    balanceLabel: {
        color: Colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
    },
    balance: {
        fontSize: 34,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    balanceMeta: {
        color: Colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
    },
    listaCard: {
        flex: 1,
        rowGap: 16,
    },
    headerCarteras: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titulo: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    refresh: {
        color: Colors.secondary,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceElevated,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginBottom: 8,
        columnGap: 16,
        shadowColor: Colors.cardShadow,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 6,
    },
    iconoWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icono: {
        width: 28,
        height: 28,
        tintColor: Colors.secondary,
    },
    info: {
        flex: 1,
    },
    nombre: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    monto: {
        color: Colors.textSecondary,
        marginTop: 4,
        fontSize: 14,
    },
    sinBilleteras: {
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 12,
        paddingVertical: 40,
    },
    textoSinBilleteras: {
        color: Colors.textSecondary,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    subtextoSinBilleteras: {
        color: Colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
});
