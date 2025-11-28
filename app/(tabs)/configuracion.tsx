import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { exportarDatos as exportarDatosDB, importarDatos as importarDatosDB, obtenerEstadisticas, resetearDatos as resetearDatosDB } from '../../database';
import { useAuth } from '../../hooks/useAuth';

export default function Configuracion() {
    const router = useRouter();
    const { usuario } = useAuth();

    const [notificaciones, setNotificaciones] = useState(true);
    const [recordatorios, setRecordatorios] = useState(false);

    const exportarDatos = () => {
        if (!usuario) {
            Alert.alert('Error', 'No hay usuario autenticado');
            return;
        }

        Alert.alert(
            'Exportar datos',
            '¿Deseas exportar todos tus datos? Se creará un archivo con toda tu información financiera.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Exportar', 
                    onPress: () => {
                        exportarDatosDB(usuario.id, (exito: boolean, mensaje: string, datos?: any) => {
                            if (exito && datos) {
                                // Convertir datos a JSON
                                const jsonData = JSON.stringify(datos, null, 2);
                                
                                // Compartir el archivo
                                Share.share({
                                    message: `Datos de Control de Gastos - ${usuario.nombre} ${usuario.apellido}\n\nExportado el: ${new Date(datos.fechaExportacion).toLocaleDateString('es-ES')}\n\nDatos:\n${jsonData}`,
                                    title: 'Exportar datos de Control de Gastos'
                                }).then(() => {
                                    Alert.alert('Éxito', 'Datos exportados exitosamente');
                                }).catch(() => {
                                    Alert.alert('Error', 'No se pudo compartir los datos');
                                });
                            } else {
                                Alert.alert('Error', mensaje);
                            }
                        });
                    }
                }
            ]
        );
    };

    const importarDatos = async () => {
        if (!usuario) {
            Alert.alert('Error', 'No hay usuario autenticado');
            return;
        }

        try {
            // Seleccionar archivo
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'text/plain'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const file = result.assets[0];
            if (!file) {
                Alert.alert('Error', 'No se pudo leer el archivo seleccionado');
                return;
            }

            // Leer el contenido del archivo
            const response = await fetch(file.uri);
            const contenido = await response.text();

            try {
                const datosImportados = JSON.parse(contenido);

                // Validar que sea un archivo de exportación válido
                if (!datosImportados.usuario || !datosImportados.billeteras || !datosImportados.transacciones) {
                    Alert.alert(
                        'Archivo inválido',
                        'El archivo seleccionado no tiene el formato correcto para importar datos.'
                    );
                    return;
                }

                // Confirmar importación
                Alert.alert(
                    'Confirmar importación',
                    `¿Deseas importar los siguientes datos?\n\n• ${datosImportados.billeteras.length} billeteras\n• ${datosImportados.transacciones.length} transacciones\n• Exportado el: ${new Date(datosImportados.fechaExportacion).toLocaleDateString('es-ES')}\n\nEstos datos se agregarán a tu información actual.`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { 
                            text: 'Importar', 
                            onPress: () => {
                                importarDatosDB(usuario.id, datosImportados, (exito: boolean, mensaje: string) => {
                                    if (exito) {
                                        Alert.alert(
                                            'Importación exitosa',
                                            mensaje,
                                            [
                                                { 
                                                    text: 'OK', 
                                                    onPress: () => {
                                                        // Redirigir al inicio para ver los nuevos datos
                                                        router.replace('/(tabs)/inicio');
                                                    }
                                                }
                                            ]
                                        );
                                    } else {
                                        Alert.alert('Error al importar', mensaje);
                                    }
                                });
                            }
                        }
                    ]
                );
            } catch (parseError) {
                Alert.alert(
                    'Error de formato',
                    'El archivo seleccionado no contiene datos en formato JSON válido.'
                );
            }
        } catch (error) {
            console.error('Error al importar datos:', error);
            Alert.alert(
                'Error',
                'No se pudo leer el archivo seleccionado. Asegúrate de que sea un archivo de texto válido.'
            );
        }
    };

    const resetearDatos = () => {
        if (!usuario) {
            Alert.alert('Error', 'No hay usuario autenticado');
            return;
        }

        // Primero obtener estadísticas para mostrar al usuario
        obtenerEstadisticas(usuario.id, (stats: any) => {
            Alert.alert(
                'Confirmar eliminación total',
                `¿Estás seguro de que deseas eliminar TODOS los datos?\n\nSe eliminarán:\n• ${stats.totalBilleteras} billeteras\n• ${stats.totalTransacciones} transacciones\n• Saldo total: $${stats.saldoTotal.toLocaleString()}\n\nEsta acción NO se puede deshacer.`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'ELIMINAR TODO', 
                        style: 'destructive',
                        onPress: () => {
                            resetearDatosDB(usuario.id, (exito: boolean, mensaje: string) => {
                                if (exito) {
                                    Alert.alert(
                                        'Datos eliminados', 
                                        'Todos los datos han sido eliminados exitosamente. La aplicación se reiniciará.',
                                        [
                                            { 
                                                text: 'OK', 
                                                onPress: () => {
                                                    // Redirigir al inicio para actualizar la vista
                                                    router.replace('/(tabs)/inicio');
                                                }
                                            }
                                        ]
                                    );
                                } else {
                                    Alert.alert('Error', mensaje);
                                }
                            });
                        }
                    }
                ]
            );
        });
    };

    return (
        <ScrollView style={estilos.contenedor}>
            <StatusBar style="light" />
            
            <TouchableOpacity onPress={() => router.back()} style={estilos.retroceso}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <Text style={estilos.titulo}>Configuración</Text>

            {/* Sección Notificaciones */}
            <View style={estilos.seccion}>
                <Text style={estilos.tituloSeccion}>Notificaciones</Text>
                
                <View style={estilos.opcion}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#4CAF50' }]}>
                            <Ionicons name="notifications" size={18} color="#fff" />
                        </View>
                        <View>
                            <Text style={estilos.textoOpcion}>Notificaciones push</Text>
                            <Text style={estilos.subtextoOpcion}>Recibir alertas importantes</Text>
                        </View>
                    </View>
                    <Switch
                        value={notificaciones}
                        onValueChange={setNotificaciones}
                        trackColor={{ false: '#333', true: '#9C27B0' }}
                        thumbColor={notificaciones ? '#fff' : '#ccc'}
                        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                </View>

                <View style={estilos.opcion}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#FF9800' }]}>
                            <MaterialCommunityIcons name="clock-alert" size={18} color="#fff" />
                        </View>
                        <View>
                            <Text style={estilos.textoOpcion}>Recordatorios</Text>
                            <Text style={estilos.subtextoOpcion}>Recordar registrar gastos</Text>
                        </View>
                    </View>
                    <Switch
                        value={recordatorios}
                        onValueChange={setRecordatorios}
                        trackColor={{ false: '#333', true: '#9C27B0' }}
                        thumbColor={recordatorios ? '#fff' : '#ccc'}
                        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                </View>
            </View>

            {/* Sección Datos */}
            <View style={estilos.seccion}>
                <Text style={estilos.tituloSeccion}>Gestión de datos</Text>
                
                <TouchableOpacity 
                    style={estilos.opcionBoton} 
                    onPress={() => router.push('/(tabs)/estadisticas-usuario')}
                >
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#9C27B0' }]}>
                            <MaterialCommunityIcons name="chart-box" size={18} color="#fff" />
                        </View>
                        <Text style={estilos.textoOpcion}>Ver estadísticas completas</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={estilos.opcionBoton} onPress={exportarDatos}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#4CAF50' }]}>
                            <MaterialCommunityIcons name="export" size={18} color="#fff" />
                        </View>
                        <Text style={estilos.textoOpcion}>Exportar datos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={estilos.opcionBoton} onPress={importarDatos}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#2196F3' }]}>
                            <MaterialCommunityIcons name="import" size={18} color="#fff" />
                        </View>
                        <Text style={estilos.textoOpcion}>Importar datos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity style={estilos.opcionBoton} onPress={resetearDatos}>
                    <View style={estilos.opcionIzquierda}>
                        <View style={[estilos.icono, { backgroundColor: '#F44336' }]}>
                            <MaterialCommunityIcons name="delete-forever" size={18} color="#fff" />
                        </View>
                        <Text style={[estilos.textoOpcion, { color: '#F44336' }]}>Eliminar todos los datos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#F44336" />
                </TouchableOpacity>
            </View>

            {/* Información de la app */}
            <View style={estilos.info}>
                <Text style={estilos.textoInfo}>Control de Gastos v1.0.0</Text>
                <Text style={estilos.subtextoInfo}>Desarrollado con React Native y Expo</Text>
            </View>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: '#121212',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 140,
    },
    retroceso: {
        marginBottom: 20,
        paddingVertical: 5,
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
        textAlign: 'center',
    },
    texto: {
        color: '#ccc',
        fontSize: 16,
    },
    seccion: {
        marginBottom: 32,
    },
    tituloSeccion: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9C27B0',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    opcion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    opcionBoton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        justifyContent: 'space-between',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    opcionIzquierda: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icono: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textoOpcion: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    subtextoOpcion: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    info: {
        backgroundColor: '#1a1a1a',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    textoInfo: {
        fontSize: 15,
        fontWeight: '600',
        color: '#9C27B0',
        marginBottom: 6,
    },
    subtextoInfo: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
    },
});
