import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { actualizarTransaccion, Billetera, eliminarTransaccion, obtenerBilleteras } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function EditarTransaccion() {
    const router = useRouter();
    const { usuario } = useAuth();
    const params = useLocalSearchParams();

    console.log('Render EditarTransaccion');

    const [tipo, setTipo] = useState(params.tipo as string || '');
    const [billeteraId, setBilleteraId] = useState(params.billetera_id as string || '');
    const [categoria, setCategoria] = useState(params.categoria as string || '');
    const [monto, setMonto] = useState(params.monto as string || '');
    const [descripcion, setDescripcion] = useState(params.descripcion as string || '');
    const montoRef = useRef(monto);
    const descripcionRef = useRef(descripcion);
    const debounceMonto = useRef<number | null>(null);
    const debounceDescripcion = useRef<number | null>(null);
    const [billeteras, setBilleteras] = useState<Billetera[]>([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (usuario) {
            obtenerBilleteras(usuario.id, (billeterasObtenidas: Billetera[]) => {
                setBilleteras(billeterasObtenidas);
            });
        }
    }, [usuario]);

    const actualizar = () => {
        if (!tipo || !billeteraId || !categoria || !monto) {
            Alert.alert('Error', 'Por favor completa todos los campos requeridos.');
            return;
        }

        const montoNumerico = parseFloat(monto);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            Alert.alert('Error', 'Por favor ingresa un monto válido.');
            return;
        }

        setCargando(true);

        actualizarTransaccion(
            parseInt(params.id as string),
            tipo as 'ingreso' | 'gasto',
            categoria,
            montoNumerico,
            descripcion,
            (exito: boolean, mensaje: string) => {
                setCargando(false);
                
                if (exito) {
                    Alert.alert('Éxito', mensaje, [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                } else {
                    Alert.alert('Error', mensaje);
                }
            }
        );
    };

    const eliminar = () => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar esta transacción?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Eliminar', 
                    style: 'destructive',
                    onPress: () => {
                        setCargando(true);
                        eliminarTransaccion(parseInt(params.id as string), (exito: boolean, mensaje: string) => {
                            setCargando(false);
                            
                            if (exito) {
                                Alert.alert('Éxito', mensaje, [
                                    { text: 'OK', onPress: () => router.back() }
                                ]);
                            } else {
                                Alert.alert('Error', mensaje);
                            }
                        });
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenedor} keyboardShouldPersistTaps="always">
            <StatusBar style="light" />

            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Actualizar Transacción</Text>

            <Text style={estilos.etiqueta}>Tipo</Text>
            <View style={estilos.selector}>
                <Picker 
                    selectedValue={tipo} 
                    onValueChange={setTipo} 
                    style={estilos.picker} 
                    dropdownIconColor="#fff"
                    enabled={!cargando}
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
                    style={estilos.picker} 
                    dropdownIconColor="#fff"
                    enabled={!cargando}
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
                    style={estilos.picker} 
                    dropdownIconColor="#fff"
                    enabled={!cargando}
                >
                    <Picker.Item label="Seleccionar..." value="" />
                    <Picker.Item label="Alimentos" value="Alimentos" />
                    <Picker.Item label="Transporte" value="Transporte" />
                    <Picker.Item label="Entretenimiento" value="Entretenimiento" />
                    <Picker.Item label="Salud" value="Salud" />
                    <Picker.Item label="Educación" value="Educación" />
                    <Picker.Item label="Compras" value="Compras" />
                    <Picker.Item label="Servicios" value="Servicios" />
                    <Picker.Item label="Otros" value="Otros" />
                    <Picker.Item label="Trabajo" value="Trabajo" />
                    <Picker.Item label="Inversiones" value="Inversiones" />
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
                    montoRef.current = text;
                    if (debounceMonto.current) clearTimeout(debounceMonto.current as any);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    debounceMonto.current = setTimeout(() => {
                        setMonto(montoRef.current);
                        debounceMonto.current = null;
                    }, 150) as any;
                }}
                editable={!cargando}
                onFocus={() => console.log('Editar Monto onFocus')}
                onBlur={() => console.log('Editar Monto onBlur')}
            />

            <Text style={estilos.etiqueta}>Descripción (Opcional)</Text>
            <TextInput
                placeholder="Descripción de la transacción"
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
                editable={!cargando}
                onFocus={() => console.log('Editar Descripcion onFocus')}
                onBlur={() => console.log('Editar Descripcion onBlur')}
            />

            <View style={estilos.filaBotones}>
                <TouchableOpacity 
                    style={[estilos.eliminar, cargando && { opacity: 0.6 }]} 
                    onPress={eliminar}
                    disabled={cargando}
                >
                    <FontAwesome name="trash" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[estilos.actualizar, cargando && { opacity: 0.6 }]} 
                    onPress={actualizar}
                    disabled={cargando}
                >
                    {cargando ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={estilos.textoBoton}>Actualizar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flexGrow: 1,
        backgroundColor: '#121212',
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 50 : 60,
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
    filaBotones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 20,
    },
    eliminar: {
        backgroundColor: '#f44336',
        padding: 14,
        borderRadius: 10,
        width: 60,
        alignItems: 'center',
    },
    actualizar: {
        backgroundColor: '#9C27B0',
        paddingVertical: 14,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
    },
    textoBoton: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
