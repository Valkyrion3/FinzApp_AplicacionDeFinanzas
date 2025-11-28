// @ts-nocheck
import * as SQLite from 'expo-sqlite';

// TypeScript interfaces
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  contraseña: string;
  fecha_registro: string;
}

export interface Billetera {
  id: number;
  usuario_id: number;
  nombre: string;
  saldo: number;
  color: string;
  fecha_creacion: string;
}

export interface Transaccion {
  id: number;
  billetera_id: number;
  tipo: 'ingreso' | 'gasto';
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string;
}

// Callback types
export type RegistroCallback = (exito: boolean, mensaje: string) => void;
export type LoginCallback = (exito: boolean, mensaje: string, usuario: Usuario | null) => void;
export type BilleterasCallback = (billeteras: Billetera[]) => void;
export type CrearBilleteraCallback = (exito: boolean, mensaje: string) => void;
export type ActualizarBilleteraCallback = (exito: boolean, mensaje: string) => void;
export type ActualizarUsuarioCallback = (exito: boolean, mensaje: string, usuario?: Usuario) => void;
export type TransaccionesCallback = (transacciones: Transaccion[]) => void;
export type CrearTransaccionCallback = (exito: boolean, mensaje: string) => void;
export type ActualizarTransaccionCallback = (exito: boolean, mensaje: string) => void;
export type EliminarTransaccionCallback = (exito: boolean, mensaje: string) => void;
export type ExportarDatosCallback = (exito: boolean, mensaje: string, datos?: any) => void;
export type ImportarDatosCallback = (exito: boolean, mensaje: string) => void;
export type ResetearDatosCallback = (exito: boolean, mensaje: string) => void;

// Initialize database with proper error handling
let db: SQLite.SQLiteDatabase | null = null;

const initializeDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('gastos.db');
    console.log('📱 Inicializando base de datos SQLite...');
    
    // Crear tablas
    db.execSync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        correo TEXT UNIQUE NOT NULL,
        contraseña TEXT NOT NULL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    db.execSync(`
      CREATE TABLE IF NOT EXISTS billeteras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        saldo REAL DEFAULT 0,
        color TEXT DEFAULT '#9C27B0',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      );
    `);
    
    db.execSync(`
      CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billetera_id INTEGER NOT NULL,
        tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
        categoria TEXT NOT NULL,
        monto REAL NOT NULL,
        descripcion TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (billetera_id) REFERENCES billeteras (id)
      );
    `);
    
    console.log('Base de datos inicializada correctamente');
  }
  return db;
};

// Función para registrar usuario
export const registrarUsuario = (nombre: string, apellido: string, correo: string, contraseña: string, callback: RegistroCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.runSync(
      'INSERT INTO usuarios (nombre, apellido, correo, contraseña) VALUES (?, ?, ?, ?)',
      [nombre, apellido, correo, contraseña]
    );
    
    console.log('Usuario registrado exitosamente');
    callback(true, 'Usuario registrado exitosamente');
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('El correo ya está registrado');
      callback(false, 'El correo ya está registrado');
    } else {
      console.error('Error al registrar usuario:', error);
      callback(false, 'Error al registrar usuario');
    }
  }
};

// Función para iniciar sesión
export const iniciarSesion = (correo: string, contraseña: string, callback: LoginCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.getFirstSync(
      'SELECT id, nombre, apellido, correo, fecha_registro FROM usuarios WHERE correo = ? AND contraseña = ?',
      [correo, contraseña]
    );
    
    if (result) {
      const usuario = result as Usuario;
      console.log('Inicio de sesión exitoso para usuario:', usuario.nombre);
      callback(true, 'Inicio de sesión exitoso', usuario);
    } else {
      console.log('Credenciales inválidas para:', correo);
      callback(false, 'Correo o contraseña incorrectos', null);
    }
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    callback(false, 'Error al iniciar sesión', null);
  }
};

// Función para obtener billeteras del usuario
export const obtenerBilleteras = (usuarioId: number, callback: BilleterasCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.getAllSync(
      'SELECT * FROM billeteras WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [usuarioId]
    );
    
    const billeteras = result as Billetera[];
    callback(billeteras);
  } catch (error: any) {
    console.error('Error al obtener billeteras:', error);
    callback([]);
  }
};

// Función para crear billetera
export const crearBilletera = (usuarioId: number, nombre: string, callback: CrearBilleteraCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.runSync(
      'INSERT INTO billeteras (usuario_id, nombre) VALUES (?, ?)',
      [usuarioId, nombre]
    );
    
    console.log('✅ Billetera creada exitosamente');
    callback(true, 'Billetera creada exitosamente');
  } catch (error: any) {
    console.error('Error al crear billetera:', error);
    callback(false, 'Error al crear billetera');
  }
};

// Función para actualizar billetera
export const actualizarBilletera = (billeteraId: number, nombre: string, callback: ActualizarBilleteraCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.runSync(
      'UPDATE billeteras SET nombre = ? WHERE id = ?',
      [nombre, billeteraId]
    );
    
    if (result.changes > 0) {
      console.log('Billetera actualizada exitosamente');
      callback(true, 'Billetera actualizada exitosamente');
    } else {
      console.log('No se encontró la billetera para actualizar');
      callback(false, 'No se encontró la billetera');
    }
  } catch (error: any) {
    console.error('Error al actualizar billetera:', error);
    callback(false, 'Error al actualizar billetera');
  }
};

// Función para actualizar usuario
export const actualizarUsuario = (usuarioId: number, nombre: string, apellido: string, callback: ActualizarUsuarioCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.runSync(
      'UPDATE usuarios SET nombre = ?, apellido = ? WHERE id = ?',
      [nombre, apellido, usuarioId]
    );
    
    if (result.changes > 0) {
      // Obtener el usuario actualizado
      const usuarioActualizado = database.getFirstSync(
        'SELECT id, nombre, apellido, correo FROM usuarios WHERE id = ?',
        [usuarioId]
      );
      
      if (usuarioActualizado) {
        console.log('Usuario actualizado exitosamente');
        callback(true, 'Perfil actualizado exitosamente', usuarioActualizado as Usuario);
      } else {
        callback(false, 'Error al obtener datos actualizados');
      }
    } else {
      console.log('No se encontró el usuario para actualizar');
      callback(false, 'No se encontró el usuario');
    }
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    callback(false, 'Error al actualizar perfil');
  }
};

// Función para obtener transacciones del usuario
export const obtenerTransacciones = (usuarioId: number, callback: TransaccionesCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.getAllSync(
      `SELECT t.*, b.nombre as billetera_nombre 
       FROM transacciones t 
       INNER JOIN billeteras b ON t.billetera_id = b.id 
       WHERE b.usuario_id = ? 
       ORDER BY t.fecha DESC 
       LIMIT 20`,
      [usuarioId]
    );
    
    const transacciones = result as Transaccion[];
    callback(transacciones);
  } catch (error: any) {
    console.error('Error al obtener transacciones:', error);
    callback([]);
  }
};

// Función para obtener transacciones de una billetera específica
export const obtenerTransaccionesPorBilletera = (billeteraId: number, callback: TransaccionesCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.getAllSync(
      `SELECT t.*, b.nombre as billetera_nombre 
       FROM transacciones t 
       INNER JOIN billeteras b ON t.billetera_id = b.id 
       WHERE t.billetera_id = ? 
       ORDER BY t.fecha DESC`,
      [billeteraId]
    );
    
    const transacciones = result as Transaccion[];
    callback(transacciones);
  } catch (error: any) {
    console.error('Error al obtener transacciones por billetera:', error);
    callback([]);
  }
};

// Función para crear transacción
export const crearTransaccion = (
  billeteraId: number, 
  tipo: 'ingreso' | 'gasto', 
  categoria: string, 
  monto: number, 
  descripcion: string, 
  callback: CrearTransaccionCallback
) => {
  try {
    const database = initializeDatabase();
    
    // Primero insertamos la transacción
    const result = database.runSync(
      'INSERT INTO transacciones (billetera_id, tipo, categoria, monto, descripcion) VALUES (?, ?, ?, ?, ?)',
      [billeteraId, tipo, categoria, monto, descripcion]
    );
    
    // Luego actualizamos el saldo de la billetera
    const cambioSaldo = tipo === 'ingreso' ? monto : -monto;
    database.runSync(
      'UPDATE billeteras SET saldo = saldo + ? WHERE id = ?',
      [cambioSaldo, billeteraId]
    );
    
    console.log('Transacción creada y saldo actualizado');
    callback(true, 'Transacción creada exitosamente');
  } catch (error: any) {
    console.error('Error al crear transacción:', error);
    callback(false, 'Error al crear transacción');
  }
};

// Función para eliminar billetera
export const eliminarBilletera = (billeteraId: number, callback: CrearBilleteraCallback) => {
  try {
    const database = initializeDatabase();
    
    // Primero eliminar todas las transacciones asociadas
    database.runSync(
      'DELETE FROM transacciones WHERE billetera_id = ?',
      [billeteraId]
    );
    
    // Luego eliminar la billetera
    database.runSync(
      'DELETE FROM billeteras WHERE id = ?',
      [billeteraId]
    );
    
    console.log('Billetera eliminada exitosamente');
    callback(true, 'Billetera eliminada exitosamente');
  } catch (error: any) {
    console.error('Error al eliminar billetera:', error);
    callback(false, 'Error al eliminar billetera');
  }
};

// Función para actualizar transacción
export const actualizarTransaccion = (
  transaccionId: number,
  tipo: 'ingreso' | 'gasto',
  categoria: string,
  monto: number,
  descripcion: string,
  callback: ActualizarTransaccionCallback
) => {
  try {
    const database = initializeDatabase();
    
    // Primero obtener los datos actuales de la transacción
    const transaccionActual = database.getFirstSync(
      'SELECT * FROM transacciones WHERE id = ?',
      [transaccionId]
    );
    
    if (transaccionActual) {
      const montoAnterior = transaccionActual.monto;
      const tipoAnterior = transaccionActual.tipo;
      const billeteraId = transaccionActual.billetera_id;

      // Actualizar la transacción
      const result = database.runSync(
        'UPDATE transacciones SET tipo = ?, categoria = ?, monto = ?, descripcion = ? WHERE id = ?',
        [tipo, categoria, monto, descripcion, transaccionId]
      );
      
      if (result.changes > 0) {
        // Calcular el cambio en el saldo
        const cambioAnterior = tipoAnterior === 'ingreso' ? -montoAnterior : montoAnterior;
        const cambioNuevo = tipo === 'ingreso' ? monto : -monto;
        const cambioTotal = cambioAnterior + cambioNuevo;

        // Actualizar el saldo de la billetera
        database.runSync(
          'UPDATE billeteras SET saldo = saldo + ? WHERE id = ?',
          [cambioTotal, billeteraId]
        );
        
        console.log('Transacción actualizada exitosamente');
        callback(true, 'Transacción actualizada exitosamente');
      } else {
        callback(false, 'No se encontró la transacción');
      }
    } else {
      callback(false, 'No se encontró la transacción');
    }
  } catch (error: any) {
    console.error('Error al actualizar transacción:', error);
    callback(false, 'Error al actualizar la transacción');
  }
};

// Función para eliminar transacción
export const eliminarTransaccion = (transaccionId: number, callback: EliminarTransaccionCallback) => {
  try {
    const database = initializeDatabase();
    
    // Primero obtener los datos de la transacción
    const transaccion = database.getFirstSync(
      'SELECT * FROM transacciones WHERE id = ?',
      [transaccionId]
    );
    
    if (transaccion) {
      const monto = transaccion.monto;
      const tipo = transaccion.tipo;
      const billeteraId = transaccion.billetera_id;

      // Eliminar la transacción
      const result = database.runSync(
        'DELETE FROM transacciones WHERE id = ?',
        [transaccionId]
      );
      
      if (result.changes > 0) {
        // Revertir el cambio en el saldo
        const cambioSaldo = tipo === 'ingreso' ? -monto : monto;
        database.runSync(
          'UPDATE billeteras SET saldo = saldo + ? WHERE id = ?',
          [cambioSaldo, billeteraId]
        );
        
        console.log('Transacción eliminada exitosamente');
        callback(true, 'Transacción eliminada exitosamente');
      } else {
        callback(false, 'No se encontró la transacción');
      }
    } else {
      callback(false, 'No se encontró la transacción');
    }
  } catch (error: any) {
    console.error('Error al eliminar transacción:', error);
    callback(false, 'Error al eliminar la transacción');
  }
};

// Validation functions
export const validarEmail = (email: string): boolean => {
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
  return emailRegex.test(email);
};

export const validarContrasenia = (contrasenia: string): boolean => {
  return contrasenia.length >= 6;
};

export const validarMonto = (monto: string): { valido: boolean; valor: number; mensaje?: string } => {
  const valor = parseFloat(monto);
  
  if (isNaN(valor)) {
    return { valido: false, valor: 0, mensaje: 'El monto debe ser un número válido' };
  }
  
  if (valor <= 0) {
    return { valido: false, valor: 0, mensaje: 'El monto debe ser mayor a cero' };
  }
  
  return { valido: true, valor };
};

export const getDB = () => initializeDatabase();
