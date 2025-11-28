import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
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

import { GradientBackground } from '../../components/ui/GradientBackground';
import { GlassCard } from '../../components/ui/GlassCard';
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

        if (contrasenia.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        // Validar formato de correo básico
        // Esta expresión regular valida si un string tiene formato de correo electrónico.
        // Detalle del patrón:
        // ^         => Inicio del texto
        // [^\s@]+   => Uno o más caracteres que NO sean espacios ni arrobas (parte del nombre del correo)
        // @         => Debe haber una arroba
        // [^\s@]+   => Uno o más caracteres que NO sean espacios ni arrobas (parte del dominio)
        // \.        => Un punto literal (ej. el punto de ".com")
        // [^\s@]+   => Uno o más caracteres que NO sean espacios ni arrobas (ej. "com", "org")
        // $         => Fin del texto
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            Alert.alert('Error', 'Por favor ingresa un correo válido.');
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
                            <Text style={estilos.subtitulo}>Diseñado para ayudarte a mantener el control sin esfuerzo.</Text>
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
