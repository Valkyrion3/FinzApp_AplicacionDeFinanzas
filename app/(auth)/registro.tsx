import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Alert,
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
import { registrarUsuario } from '../../database';

export default function Registro() {
    const router = useRouter();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasenia, setContrasenia] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarRegistro = () => {
        console.log('Registrando:', nombre, apellido, correo, contrasenia, confirmar);

        if (!nombre || !apellido || !correo || !contrasenia || !confirmar) {
            Alert.alert('Error', 'Por favor completa todos los campos.');
            return;
        }

        if (contrasenia !== confirmar) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        // Validar correo: formato y dominio permitido
        const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'aol.com'];
        const correoTrimmed = correo.trim();
        const emailMatch = /^([\w.+-]+)@([A-Za-z0-9.-]+)\.([A-Za-z]{2,})$/.exec(correoTrimmed);
        if (!emailMatch) {
            Alert.alert('Error', 'Por favor ingresa un correo válido.');
            return;
        }
        const domain = (correoTrimmed.split('@')[1] || '').toLowerCase();
        if (!allowedDomains.some(d => domain.endsWith(d))) {
            Alert.alert('Error', 'El correo no es válido, intente con otro.');
            return;
        }

        // Validar contraseña: mostrar todos los errores juntos
        const erroresContrasenia = [];
        if (contrasenia.length < 6) {
            erroresContrasenia.push('• Al menos 6 caracteres');
        }
        if (!/[A-Za-z]/.test(contrasenia)) {
            erroresContrasenia.push('• Al menos una letra');
        }
        if (!/[A-Z]/.test(contrasenia)) {
            erroresContrasenia.push('• Al menos una letra mayúscula');
        }
        if (!/[^A-Za-z0-9]/.test(contrasenia)) {
            erroresContrasenia.push('• Al menos un carácter especial');
        }
        if (erroresContrasenia.length > 0) {
            Alert.alert('La contraseña debe cumplir:', erroresContrasenia.join('\n'));
            return;
        }

        setCargando(true);

        // Registrar usuario en SQLite
        registrarUsuario(nombre, apellido, correo, contrasenia, (exito: boolean, mensaje: string) => {
            setCargando(false);
            
            if (exito) {
                console.log('Registro exitoso');
                // Mostrar mensaje de éxito más visible
                Alert.alert(
                    '🎉 ¡Registro Exitoso!', 
                    'Tu cuenta ha sido creada correctamente.\n\nYa puedes iniciar sesión con tus credenciales.', 
                    [
                        { 
                            text: 'Continuar', 
                            onPress: () => router.replace('/(auth)/iniciar-sesion' as any),
                            style: 'default'
                        }
                    ]
                );
            } else {
                console.log('Error en registro:', mensaje);
                Alert.alert('Error en Registro', mensaje);
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
                                    <Text style={estilos.etiqueta}>Crea tu perfil</Text>
                            <Text style={estilos.titulo}>Registro</Text>
                        </View>
                        <View style={estilos.iconWrapper}>
                            <Ionicons name="person-add" size={28} color={Colors.white} />
                        </View>
                    </View>

                    <TextField label="Nombre" placeholder="Tu nombre" value={nombre} onChangeText={setNombre} />
                    <TextField label="Apellido" placeholder="Tu apellido" value={apellido} onChangeText={setApellido} />
                    <TextField
                        label="Correo electrónico"
                        placeholder="ejemplo@email.com"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextField
                        label="Contraseña"
                        placeholder="Crea una contraseña segura"
                        value={contrasenia}
                        onChangeText={setContrasenia}
                        secureTextEntry
                    />
                    <TextField
                        label="Confirmar contraseña"
                        placeholder="Repite la contraseña"
                        value={confirmar}
                        onChangeText={setConfirmar}
                        secureTextEntry
                    />

                    <PrimaryButton
                        label={cargando ? 'Registrando...' : 'Registrarme'}
                        onPress={manejarRegistro}
                        disabled={cargando}
                    />

                    <View style={estilos.footer}>
                        <Text style={estilos.footerText}>¿Ya tienes una cuenta?</Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/iniciar-sesion')}>
                            <Text style={estilos.link}>Iniciar sesión</Text>
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
    contenedor: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
        paddingBottom: 48,
    },
    scrollContent: {
        flexGrow: 1,
    },
    card: {
        rowGap: 18,
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
        marginBottom: 20,
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
});
