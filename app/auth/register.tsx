import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      alert('Completa todos los campos.');
      return;
    }
    if (password !== confirmar) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    alert('Usuario registrado (simulado)');
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
