// @ts-nocheck
// Platform-agnostic database implementation
// FORCES native SQLite for mobile platforms

import { Platform } from 'react-native';

// Re-export all types from native implementation
export type {
  ActualizarBilleteraCallback, ActualizarTransaccionCallback, ActualizarUsuarioCallback, Billetera, BilleterasCallback,
  CrearBilleteraCallback, CrearTransaccionCallback, EliminarTransaccionCallback,
  ExportarDatosCallback,
  ImportarDatosCallback, LoginCallback, RegistroCallback, ResetearDatosCallback, Transaccion, TransaccionesCallback, Usuario
} from './db';

// DEFINITIVE platform detection - prioritize mobile platforms
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

console.log('FINAL Platform detection:', {
  'Platform.OS': Platform.OS,
  'isMobile (iOS/Android)': isMobile,
  'Decision': isMobile ? '📱 FORCE NATIVE SQLite' : '🌐 Use Web localStorage'
});

// Choose implementation based on platform
let dbModule;
if (isMobile) {
  console.log('FORCING NATIVE SQLite for mobile platform');
  dbModule = require('./db');
    console.log('Native SQLite module loaded successfully');
  console.log('Available functions:', Object.keys(dbModule));
    // Verificar usando el identificador único
  const isNative = dbModule.DATABASE_TYPE === 'NATIVE_SQLITE';
  console.log('Verification - Is Native SQLite:', isNative);
  console.log('Database type identifier:', dbModule.DATABASE_TYPE);
  
  if (!isNative) {
    console.error('CRITICAL: Wrong implementation loaded for mobile!');
    console.error('Expected: NATIVE_SQLITE, Got:', dbModule.DATABASE_TYPE);
    throw new Error('Native SQLite implementation not loaded for mobile platform');
  }    console.log('Database implementation verification:', {
    'Platform': Platform.OS,
    'Implementation source': 'NATIVE SQLite (db.ts)',
    'Database type': dbModule.DATABASE_TYPE,
    'Functions exported': Object.keys(dbModule).length
  });
} else {
  console.log('Using Web localStorage implementation');
  dbModule = require('./db.web');
}

// Export ALL functions with explicit declarations for TypeScript
export const initDB = dbModule.initDB;
export const registrarUsuario = dbModule.registrarUsuario;
export const iniciarSesion = dbModule.iniciarSesion;
export const obtenerBilleteras = dbModule.obtenerBilleteras;
export const crearBilletera = dbModule.crearBilletera;
export const actualizarBilletera = dbModule.actualizarBilletera;
export const eliminarBilletera = dbModule.eliminarBilletera;
export const actualizarUsuario = dbModule.actualizarUsuario;
export const obtenerTransacciones = dbModule.obtenerTransacciones;
export const obtenerTransaccionesPorBilletera = dbModule.obtenerTransaccionesPorBilletera;
export const crearTransaccion = dbModule.crearTransaccion;
export const actualizarTransaccion = dbModule.actualizarTransaccion;
export const eliminarTransaccion = dbModule.eliminarTransaccion;
export const exportarDatos = dbModule.exportarDatos;
export const importarDatos = dbModule.importarDatos;
export const resetearDatos = dbModule.resetearDatos;
export const obtenerEstadisticas = dbModule.obtenerEstadisticas;

// Default export for convenience
export default dbModule;
