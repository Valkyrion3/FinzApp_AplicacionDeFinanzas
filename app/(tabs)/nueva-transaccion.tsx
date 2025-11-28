import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Billetera, crearTransaccion, obtenerBilleteras } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function NuevaTransaccion() {
    const router = useRouter();
    const { usuario } = useAuth();
    console.log('Render NuevaTransaccion');

    const [tipo, setTipo] = useState('');
    const [billeteraId, setBilleteraId] = useState('');
    const [categoria, setCategoria] = useState('');
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    // refs para debounce y valores locales (evita re-renders por cada tecla)
    const montoRef = useRef(monto);
    const descripcionRef = useRef(descripcion);
    const debounceMonto = useRef<number | null>(null);
    const debounceDescripcion = useRef<number | null>(null);
    const [billeteras, setBilleteras] = useState<Billetera[]>([]);
    const [cargando, setCargando] = useState(false);

    // Cargar billeteras del usuario
    useEffect(() => {
        if (usuario) {
            cargarBilleteras();
        }
    }, [usuario]);

    // Recargar billeteras cuando la pantalla recibe foco (en caso de que se hayan creado/eliminado)
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
            // Si la billetera seleccionada ya no existe, resetear la selección
            if (billeteraId && !billeterasObtenidas.find(b => b.id.toString() === billeteraId)) {
                setBilleteraId('');
            }
        });
    };

    const guardarTransaccion = () => {
        if (!usuario) {
            Alert.alert('Error', 'Usuario no autenticado.');
            return;
        }

        if (!tipo || !billeteraId || !categoria || !monto) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
            return;
        }

        const montoNumerico = parseFloat(monto);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido.');
            return;
        }

        // Verificar que la billetera seleccionada aún existe
        const billeteraSeleccionada = billeteras.find(b => b.id.toString() === billeteraId);
        if (!billeteraSeleccionada) {
            Alert.alert('Error', 'La billetera seleccionada ya no es válida. Por favor selecciona otra.');
            setBilleteraId('');
            return;
        }

        setCargando(true);

        crearTransaccion(
            parseInt(billeteraId),
            tipo as 'ingreso' | 'gasto',
            categoria,
            montoNumerico,
            descripcion.trim() || 'Sin descripción',
            (exito: boolean, mensaje: string) => {
                setCargando(false);
                
                if (exito) {
                    Alert.alert('Éxito', 'Transacción creada exitosamente.', [
                        { 
                            text: 'OK', 
                            onPress: () => {
                                // Limpiar formulario
                                setTipo('');
                                setBilleteraId('');
                                setCategoria('');
                                setMonto('');
                                setDescripcion('');
                                router.back();
                            }
                        }
                    ]);
                } else {
                    Alert.alert('Error', mensaje);
                }
            }
        );
    };

    return (
        <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="always">
            <StatusBar style="light" />

            {/* Botón retroceso */}
            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Añadir Transacción</Text>

            <Text style={estilos.etiqueta}>Tipo</Text>
            <View style={estilos.selector}>
                <Picker
                    selectedValue={tipo}
                    onValueChange={setTipo}
                    dropdownIconColor="#ffffff"
                    style={estilos.picker}
                >
                    <Picker.Item label="Seleccionar..." value="" />
                    <Picker.Item label="Ingreso" value="ingreso" />
                    <Picker.Item label="Gasto" value="gasto" />
                </Picker>
            </View>

            <Text style={estilos.etiqueta}>Billetera</Text>
            <View style={estilos.selector}>
                <Picker
                    selectedValue={billeteraId}
                    onValueChange={setBilleteraId}
                    dropdownIconColor="#ffffff"
                    style={estilos.picker}
                >
                    <Picker.Item label="Seleccionar billetera..." value="" />
                    {billeteras.map((billetera) => (
                        <Picker.Item 
                            key={billetera.id} 
                            label={billetera.nombre} 
                            value={billetera.id.toString()} 
                        />
                    ))}
                </Picker>
            </View>

            <Text style={estilos.etiqueta}>Categoría</Text>
            <View style={estilos.selector}>
                <Picker
                    selectedValue={categoria}
                    onValueChange={setCategoria}
                    dropdownIconColor="#ffffff"
                    style={estilos.picker}
                >
                    <Picker.Item label="Seleccionar categoría..." value="" />
                    <Picker.Item label="Alimentos" value="alimentos" />
                    <Picker.Item label="Transporte" value="transporte" />
                    <Picker.Item label="Salud" value="salud" />
                    <Picker.Item label="Educación" value="educacion" />
                    <Picker.Item label="Entretenimiento" value="entretenimiento" />
                    <Picker.Item label="Servicios" value="servicios" />
                    <Picker.Item label="Compras" value="compras" />
                    <Picker.Item label="Otros" value="otros" />
                </Picker>
            </View>

            <Text style={estilos.etiqueta}>Monto</Text>
            <TextInput
                placeholder="0.00"
                placeholderTextColor="#aaa"
                style={estilos.input}
                keyboardType="numeric"
                value={monto}
                onChangeText={(text) => {
                    // actualizar ref inmediatamente y hacer debounce del setState
                    montoRef.current = text;
                    if (debounceMonto.current) clearTimeout(debounceMonto.current as any);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    debounceMonto.current = setTimeout(() => {
                        setMonto(montoRef.current);
                        debounceMonto.current = null;
                    }, 150) as any;
                }}
                onFocus={() => console.log('Monto onFocus')}
                onBlur={() => console.log('Monto onBlur')}
            />

            <Text style={estilos.etiqueta}>Descripción (Opcional)</Text>
            <TextInput
                placeholder=""
                placeholderTextColor="#aaa"
                style={[estilos.input, { height: 80, textAlignVertical: 'top' }]}
                multiline
                numberOfLines={4}
                value={descripcion}
                onChangeText={(text) => {
                    descripcionRef.current = text;
                    if (debounceDescripcion.current) clearTimeout(debounceDescripcion.current as any);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    debounceDescripcion.current = setTimeout(() => {
                        setDescripcion(descripcionRef.current);
                        debounceDescripcion.current = null;
                    }, 200) as any;
                }}
                onFocus={() => console.log('Descripcion onFocus')}
                onBlur={() => console.log('Descripcion onBlur')}
            />

            <TouchableOpacity 
                style={[estilos.boton, cargando && estilos.botonDeshabilitado]} 
                onPress={guardarTransaccion}
                disabled={cargando}
            >
                <Text style={estilos.textoBoton}>
                    {cargando ? 'Guardando...' : 'Guardar Transacción'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flexGrow: 1,
        backgroundColor: '#121212',
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingBottom: 120, // Margen para la barra de navegación y teclado
    },
    retroceso: {
        marginBottom: 10,
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
    },
    etiqueta: {
        color: '#ccc',
        marginBottom: 5,
        fontSize: 14,
        marginTop: 10,
    },
    selector: {
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        marginBottom: 10,
    },
    picker: {
        color: '#fff',
        width: '100%',
    },
    input: {
        backgroundColor: '#1e1e1e',
        color: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    boton: {
        backgroundColor: '#9C27B0',
        borderRadius: 10,
        paddingVertical: 14,
        marginTop: 20,
    },
    botonDeshabilitado: {
        backgroundColor: '#666666',
    },
    textoBoton: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
