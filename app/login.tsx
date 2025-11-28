import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos.');
      return;
    }

    // Validate email domain and format
    const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'aol.com'];
    const emailMatch = /^([\w.+-]+)@([\w-]+\.[\w-.]+)$/.exec(email.trim());
    if (!emailMatch) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido.');
      return;
    }
    const domain = emailMatch[2].toLowerCase();
    if (!allowedDomains.includes(domain)) {
      Alert.alert('Error', 'El correo debe pertenecer a un proveedor común (gmail, hotmail, outlook, yahoo, live, aol).');
      return;
    }

    // Validate password: min 6, contains letters, at least one uppercase and one special char
    const pw = password;
    if (pw.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/[A-Za-z]/.test(pw)) {
      Alert.alert('Error', 'La contraseña debe contener letras.');
      return;
    }
    if (!/[A-Z]/.test(pw)) {
      Alert.alert('Error', 'La contraseña debe contener al menos una letra mayúscula.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(pw)) {
      Alert.alert('Error', 'La contraseña debe contener al menos un carácter especial.');
      return;
    }

    Alert.alert('Éxito', 'Simulando inicio de sesión...');
    router.push('/(tabs)/inicio' as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingrese su email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Ingrese su contraseña"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>      <TouchableOpacity onPress={() => router.push('/(auth)/registro' as any)}>
        <Text style={styles.link}>¿No tienes una cuenta? ¡Regístrate!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: Colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
  },
});