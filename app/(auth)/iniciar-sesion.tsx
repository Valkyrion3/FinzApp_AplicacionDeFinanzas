import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { GlassCard } from '../../components/ui/GlassCard';
import { GradientBackground } from '../../components/ui/GradientBackground';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { TextField } from '../../components/ui/TextField';
import { Colors } from '../../constants/Colors';
import { iniciarSesion, Usuario } from '../../database';
import { useAuth } from '../../hooks/useAuth';
import { log } from '../../lib/logger';
import { validarCredencialesLogin } from '../../lib/validators';

export default function IniciarSesion() {
    const router = useRouter();
    const { guardarSesion } = useAuth();

    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const manejarInicioSesion = () => {
        setError(null);

        // Validación estricta de correo y contraseña
        const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'aol.com'];
        const correoTrimmed = correo.trim();
        const emailMatch = /^([\w.+-]+)@([A-Za-z0-9.-]+)\.([A-Za-z]{2,})$/.exec(correoTrimmed);
        if (!emailMatch) {
            setError('Por favor ingresa un correo válido.');
            log.warn('Login validation failed', { error: 'Correo inválido' });
            return;
        }
        const domain = (correoTrimmed.split('@')[1] || '').toLowerCase();
        if (!allowedDomains.some(d => domain.endsWith(d))) {
            setError('El correo debe ser de gmail, hotmail, outlook, yahoo, live o aol.');
            log.warn('Login validation failed', { error: 'Dominio no permitido' });
            return;
        }
        if (contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            log.warn('Login validation failed', { error: 'Contraseña corta' });
            return;
        }
        if (!/[A-Za-z]/.test(contrasena)) {
            setError('La contraseña debe contener al menos una letra.');
            log.warn('Login validation failed', { error: 'Sin letra' });
            return;
        }
        if (!/[A-Z]/.test(contrasena)) {
            setError('La contraseña debe contener al menos una letra mayúscula.');
            log.warn('Login validation failed', { error: 'Sin mayúscula' });
            return;
        }
        if (!/[^A-Za-z0-9]/.test(contrasena)) {
            setError('La contraseña debe contener al menos un carácter especial.');
            log.warn('Login validation failed', { error: 'Sin caracter especial' });
            return;
        }

        setCargando(true);
        log.info('Attempting login', { correo });

        // Iniciar sesión con SQLite
        iniciarSesion(correo, contrasena, async (exito: boolean, mensaje: string, usuario: Usuario | null) => {
            setCargando(false);
            
            if (exito && usuario) {
                log.info('Login successful', { usuario: usuario.correo });
                
                // Guardar sesión del usuario
                const sesionGuardada = await guardarSesion({
                    id: usuario.id,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    correo: usuario.correo
                });

                if (sesionGuardada) {
                    // Redirigir a la app principal
                    router.replace('/(tabs)/inicio' as any);
                } else {
                    setError('Error al guardar la sesión. Intenta de nuevo.');
                    log.error('Failed to save session', { usuario: usuario.correo });
                }
            } else {
                log.warn('Login failed', { mensaje });
                setError(mensaje || 'Error desconocido. Intenta de nuevo.');
            }
        });
    };

    return (
        <GradientBackground>
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={estilos.keyboardAvoider}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <ScrollView
                    contentContainerStyle={estilos.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={estilos.contenedor}>
                        <GlassCard style={estilos.card}>
                            <View style={estilos.header}>
                                <View>
                                    <Text style={estilos.etiqueta}>Bienvenido de Vuelta</Text>
                            <Text style={estilos.titulo}>Inicia sesión</Text>
                        </View>
                        <View style={estilos.iconWrapper}>
                            <Ionicons name="lock-closed" size={28} color={Colors.white} />
                        </View>
                    </View>

                    {/* Error message display */}
                    {error && (
                        <View style={estilos.errorContainer}>
                            <Ionicons name="alert-circle" size={18} color="#FF5722" />
                            <Text style={estilos.errorText}>{error}</Text>
                        </View>
                    )}

                    <TextField
                        label="Correo electrónico"
                        placeholder="ejemplo@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={correo}
                        onChangeText={(text) => {
                            setCorreo(text);
                            setError(null);
                        }}
                    />
                    <TextField
                        label="Contraseña"
                        placeholder="Ingresa tu contraseña"
                        secureTextEntry
                        value={contrasena}
                        onChangeText={(text) => {
                            setContrasena(text);
                            setError(null);
                        }}
                    />

                    <TouchableOpacity onPress={() => setError('La recuperación de contraseña estará disponible pronto.')}>
                        <Text style={estilos.olvido}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <PrimaryButton
                        label={cargando ? 'Iniciando...' : 'Iniciar sesión'}
                        onPress={manejarInicioSesion}
                        disabled={cargando || !correo || !contrasena}
                    />

                    <View style={estilos.footer}>
                        <Text style={estilos.footerText}>¿No tienes una cuenta?</Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/registro')}>
                            <Text style={estilos.link}>Crear cuenta</Text>
                        </TouchableOpacity>
                    </View>
                        </GlassCard>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </GradientBackground>
    );
}

const estilos = StyleSheet.create({
    keyboardAvoider: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contenedor: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
        paddingBottom: 48,
    },
    card: {
        rowGap: 20,
    },
    titulo: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    subtitulo: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 6,
        marginBottom: 18,
    },
    olvido: {
        color: Colors.textSecondary,
        textAlign: 'right',
        fontSize: 13,
        textDecorationLine: 'underline',
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        columnGap: 8,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    link: {
        color: Colors.secondary,
        fontWeight: '600',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 16,
    },
    etiqueta: {
        color: Colors.secondary,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    iconWrapper: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: 14,
        shadowColor: Colors.primary,
        shadowOpacity: 0.45,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 20,
        elevation: 10,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 87, 34, 0.15)',
        borderLeftWidth: 3,
        borderLeftColor: '#FF5722',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        gap: 10,
    },
    errorText: {
        color: '#FF5722',
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
        lineHeight: 18,
    },
});
