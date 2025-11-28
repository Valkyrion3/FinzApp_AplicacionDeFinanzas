import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { obtenerTransacciones, Transaccion } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function Buscar() {
    const router = useRouter();
    const { usuario } = useAuth();
    const [busqueda, setBusqueda] = useState('');
    const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (usuario) {
            setCargando(true);
            obtenerTransacciones(usuario.id, (trans: Transaccion[]) => {
                setTransacciones(Array.isArray(trans) ? trans : []); // Aseguramos que transacciones sea siempre un array
                setCargando(false);
            });
        }
    }, [usuario]);

    const resultados = transacciones.filter((item) =>
        item.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        (item.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <View style={estilos.contenedor}>
            <StatusBar style="light" />

            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Buscar</Text>

            <TextInput
                style={estilos.input}
                placeholder="Buscar..."
                placeholderTextColor="#aaa"
                value={busqueda}
                onChangeText={setBusqueda}
            />

            {cargando ? (
                <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>Cargando historial...</Text>
            ) : (
                <FlatList
                    data={resultados}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={estilos.item}>
                            <View style={[estilos.icono, { backgroundColor: item.tipo === 'ingreso' ? '#4caf50' : '#f44336' }]}>
                                <Ionicons name={item.tipo === 'ingreso' ? 'arrow-down-circle' : 'arrow-up-circle'} size={20} color="white" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={estilos.categoria}>{item.categoria}</Text>
                                <Text style={estilos.descripcion}>{item.descripcion}</Text>
                            </View>
                            <View style={estilos.infoDerecha}>
                                <Text style={[estilos.monto, { color: item.tipo === 'ingreso' ? '#4caf50' : '#f44336' }]}>
                                    {item.tipo === 'ingreso' ? `+$${item.monto}` : `-$${item.monto}`}
                                </Text>
                                <Text style={estilos.fecha}>{new Date(item.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>No hay transacciones</Text>}
                />
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
        paddingTop: 50,
    },
    retroceso: {
        marginBottom: 10,
    },
    titulo: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#1e1e1e',
        color: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    item: {
        flexDirection: 'row',
        backgroundColor: '#1e1e1e',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    icono: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoria: {
        color: '#fff',
        fontWeight: 'bold',
    },
    descripcion: {
        color: '#aaa',
        fontSize: 12,
    },
    infoDerecha: {
        alignItems: 'flex-end',
    },
    monto: {
        fontWeight: 'bold',
    },
    fecha: {
        color: '#ccc',
        fontSize: 12,
    },
});
