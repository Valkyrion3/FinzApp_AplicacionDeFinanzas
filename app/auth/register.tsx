import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const handleRegister = () => {
    if (!nombre || !apellido || !email || !password || !confirmar) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }
    if (password !== confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    // Validar email: formato y dominio permitido
    const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'aol.com'];
    const emailTrimmed = email.trim();
    const emailMatch = /^([\w.+-]+)@([A-Za-z0-9.-]+)\.([A-Za-z]{2,})$/.exec(emailTrimmed);
    if (!emailMatch) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido.');
      return;
    }
    const domain = (emailTrimmed.split('@')[1] || '').toLowerCase();
    if (!allowedDomains.some(d => domain.endsWith(d))) {
      Alert.alert('Error', 'El correo debe ser de gmail, hotmail, outlook, yahoo, live o aol.');
      return;
    }

    // Validar contraseña: mínimo 6, al menos una letra, una mayúscula y un caracter especial
    const pw = password;
    if (pw.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/[A-Za-z]/.test(pw)) {
      Alert.alert('Error', 'La contraseña debe contener al menos una letra.');
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

    Alert.alert('Éxito', 'Usuario registrado (simulado)');
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrarse</Text>

      <TextInput style={styles.input} placeholder="Ingrese su nombre" placeholderTextColor="#aaa" onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Ingrese su apellido" placeholderTextColor="#aaa" onChangeText={setApellido} />
      <TextInput style={styles.input} placeholder="Ingrese su correo" placeholderTextColor="#aaa" onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Ingrese su contraseña" placeholderTextColor="#aaa" secureTextEntry onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Verifique su contraseña" placeholderTextColor="#aaa" secureTextEntry onChangeText={setConfirmar} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? ¡Inicia sesión!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
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
