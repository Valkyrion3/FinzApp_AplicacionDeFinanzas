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

// Identificador único para verificación
export const DATABASE_TYPE = 'NATIVE_SQLITE';

const initializeDatabase = (): SQLite.SQLiteDatabase => {
  console.log('Initializing native SQLite database...');
  console.log('SQLite module info:', {
    'typeof SQLite': typeof SQLite,
    'SQLite.openDatabaseSync': typeof SQLite.openDatabaseSync,
    'Available methods': Object.keys(SQLite)
  });
  
  try {
    if (!db) {
      console.log('Opening database connection...');
      db = SQLite.openDatabaseSync('gastos.db');
      console.log('Native SQLite database initialized successfully');
      console.log('Database object:', {
        'typeof db': typeof db,
        'db methods': db ? Object.getOwnPropertyNames(Object.getPrototypeOf(db)) : 'null'
      });
    }
    return db;
  } catch (error) {
    console.error('CRITICAL ERROR initializing native SQLite database:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.substring(0, 200) + '...'
    });
    throw error;
  }
};

export const initDB = () => {
  console.log('NATIVE SQLITE: Starting database initialization...');
  console.log('NATIVE SQLITE: This is the NATIVE implementation being called');
  
  try {
    const database = initializeDatabase();
    console.log('Database instance obtained, creating tables...');
    
    // Create usuarios table
    console.log('Creating usuarios table...');
    database.execSync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        correo TEXT UNIQUE NOT NULL,
        contraseña TEXT NOT NULL,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla usuarios creada o ya existe');    // Create billeteras table
    console.log('Creating billeteras table...');
    database.execSync(`
      CREATE TABLE IF NOT EXISTS billeteras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        saldo REAL DEFAULT 0,
        color TEXT DEFAULT '#9C27B0',
        fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      );    `);
    console.log('Tabla billeteras creada o ya existe');
    
    // Add nombre column if it doesn't exist (for existing databases)
    try {
      database.execSync(`ALTER TABLE billeteras ADD COLUMN nombre TEXT DEFAULT 'Mi Billetera';`);
      console.log('Columna nombre agregada a billeteras');
    } catch (alterError) {
      // Column might already exist, this is fine
      console.log('Columna nombre ya existe en billeteras');
    }

    // Create transacciones table
    console.log('Creating transacciones table...');
    database.execSync(`
      CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billetera_id INTEGER NOT NULL,
        tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
        categoria TEXT NOT NULL,
        monto REAL NOT NULL,
        descripcion TEXT,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (billetera_id) REFERENCES billeteras (id)
      );
    `);
    console.log('Tabla transacciones creada o ya existe');
    console.log('Native SQLite database initialization completed successfully!');
    
  } catch (error) {
    console.error('CRITICAL ERROR during native SQLite database initialization:', error);
    throw error;
  }
};

// Función para registrar usuario
export const registrarUsuario = (nombre: string, apellido: string, correo: string, contraseña: string, callback: RegistroCallback) => {
  console.log('Iniciando registro de usuario:', { nombre, apellido, correo });
  
  try {
    const database = initializeDatabase();
    const result = database.runSync(
      'INSERT INTO usuarios (nombre, apellido, correo, contraseña) VALUES (?, ?, ?, ?)',
      [nombre, apellido, correo, contraseña]
    );
    
    console.log('Usuario registrado exitosamente con ID:', result.lastInsertRowId);
    callback(true, 'Usuario registrado exitosamente');
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      callback(false, 'Este correo ya está registrado');
    } else {
      callback(false, 'Error al registrar usuario');
    }
  }
};

// Función para iniciar sesión
export const iniciarSesion = (correo: string, contraseña: string, callback: LoginCallback) => {
  console.log('Iniciando sesión para:', correo);
  
  try {
    const database = initializeDatabase();
    const result = database.getFirstSync(
      'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?',
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

// Remaining functions follow the same pattern...
export const crearBilletera = (usuarioId: number, nombre: string, callback: CrearBilleteraCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.runSync(
      'INSERT INTO billeteras (usuario_id, nombre) VALUES (?, ?)',
      [usuarioId, nombre]
    );
    
    console.log('Billetera creada exitosamente');
    callback(true, 'Billetera creada exitosamente');
  } catch (error: any) {
    console.error('Error al crear billetera:', error);
    callback(false, 'Error al crear billetera');
  }
};

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

export const eliminarBilletera = (billeteraId: number, callback: CrearBilleteraCallback) => {
  try {
    const database = initializeDatabase();
    
    database.runSync('DELETE FROM transacciones WHERE billetera_id = ?', [billeteraId]);
    database.runSync('DELETE FROM billeteras WHERE id = ?', [billeteraId]);
    
    console.log('Billetera eliminada exitosamente');
    callback(true, 'Billetera eliminada exitosamente');
  } catch (error: any) {
    console.error('Error al eliminar billetera:', error);
    callback(false, 'Error al eliminar billetera');
  }
};

export const actualizarUsuario = (usuarioId: number, nombre: string, apellido: string, callback: ActualizarUsuarioCallback) => {
  try {
    const database = initializeDatabase();
    const result = database.runSync(
      'UPDATE usuarios SET nombre = ?, apellido = ? WHERE id = ?',
      [nombre, apellido, usuarioId]
    );
    
    if (result.changes > 0) {
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
    
    database.runSync(
      'INSERT INTO transacciones (billetera_id, tipo, categoria, monto, descripcion) VALUES (?, ?, ?, ?, ?)',
      [billeteraId, tipo, categoria, monto, descripcion]
    );
    
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
    
    const transaccionActual = database.getFirstSync(
      'SELECT * FROM transacciones WHERE id = ?',
      [transaccionId]
    );
    
    if (transaccionActual) {
      const montoAnterior = transaccionActual.monto;
      const tipoAnterior = transaccionActual.tipo;
      const billeteraId = transaccionActual.billetera_id;

      const result = database.runSync(
        'UPDATE transacciones SET tipo = ?, categoria = ?, monto = ?, descripcion = ? WHERE id = ?',
        [tipo, categoria, monto, descripcion, transaccionId]
      );
      
      if (result.changes > 0) {
        const cambioAnterior = tipoAnterior === 'ingreso' ? -montoAnterior : montoAnterior;
        const cambioNuevo = tipo === 'ingreso' ? monto : -monto;
        const cambioTotal = cambioAnterior + cambioNuevo;

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

export const eliminarTransaccion = (transaccionId: number, callback: EliminarTransaccionCallback) => {
  try {
    const database = initializeDatabase();
    
    const transaccion = database.getFirstSync(
      'SELECT * FROM transacciones WHERE id = ?',
      [transaccionId]
    );
    
    if (transaccion) {
      const monto = transaccion.monto;
      const tipo = transaccion.tipo;
      const billeteraId = transaccion.billetera_id;

      const result = database.runSync(
        'DELETE FROM transacciones WHERE id = ?',
        [transaccionId]
      );
      
      if (result.changes > 0) {
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

export const exportarDatos = (usuarioId: number, callback: ExportarDatosCallback) => {
  try {
    const database = initializeDatabase();
    
    const usuario = database.getFirstSync(
      'SELECT id, nombre, apellido, correo, fecha_registro FROM usuarios WHERE id = ?',
      [usuarioId]
    );
    
    if (!usuario) {
      callback(false, 'Usuario no encontrado');
      return;
    }
    
    const billeteras = database.getAllSync(
      'SELECT * FROM billeteras WHERE usuario_id = ?',
      [usuarioId]
    );
    
    const transacciones = database.getAllSync(
      `SELECT t.*, b.nombre as billetera_nombre 
       FROM transacciones t 
       INNER JOIN billeteras b ON t.billetera_id = b.id 
       WHERE b.usuario_id = ?`,
      [usuarioId]
    );
    
    const datosExportados = {
      usuario,
      billeteras,
      transacciones,
      fechaExportacion: new Date().toISOString(),
      version: '1.0.0'
    };
    
    console.log('Datos exportados exitosamente');
    callback(true, 'Datos exportados exitosamente', datosExportados);
  } catch (error: any) {
    console.error('Error al exportar datos:', error);
    callback(false, 'Error al exportar datos');
  }
};

export const resetearDatos = (usuarioId: number, callback: ResetearDatosCallback) => {
  try {
    const database = initializeDatabase();
    
    database.runSync(
      `DELETE FROM transacciones 
       WHERE billetera_id IN (
         SELECT id FROM billeteras WHERE usuario_id = ?
       )`,
      [usuarioId]
    );
    
    database.runSync(
      'DELETE FROM billeteras WHERE usuario_id = ?',
      [usuarioId]
    );
    
    console.log('Datos reseteados exitosamente');
    callback(true, 'Todos los datos han sido eliminados exitosamente');
  } catch (error: any) {
    console.error('Error al resetear datos:', error);
    callback(false, 'Error al eliminar datos');
  }
};

export const importarDatos = (usuarioId: number, datosImportados: any, callback: ImportarDatosCallback) => {
  if (!datosImportados || !datosImportados.billeteras || !datosImportados.transacciones) {
    callback(false, 'Formato de datos inválido');
    return;
  }
  
  if (datosImportados.version !== '1.0.0') {
    callback(false, 'Versión de datos no compatible');
    return;
  }

  try {
    const database = initializeDatabase();
    let billeterasImportadas = 0;
    let transaccionesImportadas = 0;
    const mapeoIdsBilleteras: { [key: number]: number } = {};

    for (const billetera of datosImportados.billeteras) {
      const result = database.runSync(
        'INSERT INTO billeteras (usuario_id, nombre, saldo, color) VALUES (?, ?, ?, ?)',
        [usuarioId, billetera.nombre, 0, billetera.color || '#9C27B0']
      );
      
      mapeoIdsBilleteras[billetera.id] = result.lastInsertRowId;
      billeterasImportadas++;
    }

    for (const transaccion of datosImportados.transacciones) {
      const nuevaBilleteraId = mapeoIdsBilleteras[transaccion.billetera_id];
      
      if (nuevaBilleteraId) {
        database.runSync(
          'INSERT INTO transacciones (billetera_id, tipo, categoria, monto, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?)',
          [nuevaBilleteraId, transaccion.tipo, transaccion.categoria, transaccion.monto, transaccion.descripcion, transaccion.fecha]
        );
        
        const cambioSaldo = transaccion.tipo === 'ingreso' ? transaccion.monto : -transaccion.monto;
        database.runSync(
          'UPDATE billeteras SET saldo = saldo + ? WHERE id = ?',
          [cambioSaldo, nuevaBilleteraId]
        );
        
        transaccionesImportadas++;
      }
    }

    console.log(`Importación completada: ${billeterasImportadas} billeteras, ${transaccionesImportadas} transacciones`);
    callback(true, `Datos importados exitosamente: ${billeterasImportadas} billeteras y ${transaccionesImportadas} transacciones`);
  } catch (error: any) {
    console.error('Error al importar datos:', error);
    callback(false, 'Error al importar datos');
  }
};

export const obtenerEstadisticas = (usuarioId: number, callback: (stats: any) => void) => {
  try {
    const database = initializeDatabase();
    const result = database.getFirstSync(
      `SELECT 
        COUNT(DISTINCT b.id) as totalBilleteras,
        COUNT(t.id) as totalTransacciones,
        SUM(CASE WHEN t.tipo = 'ingreso' THEN t.monto ELSE 0 END) as totalIngresos,
        SUM(CASE WHEN t.tipo = 'gasto' THEN t.monto ELSE 0 END) as totalGastos,
        SUM(b.saldo) as saldoTotal
       FROM billeteras b 
       LEFT JOIN transacciones t ON b.id = t.billetera_id
       WHERE b.usuario_id = ?`,
      [usuarioId]
    );
    
    const stats = result || {};
    callback({
      totalBilleteras: stats.totalBilleteras || 0,
      totalTransacciones: stats.totalTransacciones || 0,
      totalIngresos: stats.totalIngresos || 0,
      totalGastos: stats.totalGastos || 0,
      saldoTotal: stats.saldoTotal || 0
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    callback({
      totalBilleteras: 0,
      totalTransacciones: 0,
      totalIngresos: 0,
      totalGastos: 0,
      saldoTotal: 0
    });
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
    
    if (valor > 999999999) {
        return { valido: false, valor: 0, mensaje: 'El monto es demasiado grande' };
    }
    
    return { valido: true, valor };
};

export const validarTexto = (texto: string, minLength: number = 1, maxLength: number = 100): { valido: boolean; mensaje?: string } => {
    const textoLimpio = texto.trim();
    
    if (textoLimpio.length < minLength) {
        return { valido: false, mensaje: `El texto debe tener al menos ${minLength} caracteres` };
    }
    
    if (textoLimpio.length > maxLength) {
        return { valido: false, mensaje: `El texto no puede tener más de ${maxLength} caracteres` };
    }
    
    return { valido: true };
};

export const limpiarBaseDatos = (callback: (exito: boolean, mensaje: string) => void) => {
  try {
    const database = initializeDatabase();
    
    database.runSync('DELETE FROM transacciones');
    database.runSync('DELETE FROM billeteras');
    database.runSync('DELETE FROM usuarios');
    
    console.log('Base de datos limpiada');
    callback(true, 'Base de datos limpiada exitosamente');
  } catch (error: any) {
    console.error('Error al limpiar base de datos:', error);
    callback(false, 'Error al limpiar base de datos');
  }
};

export const getDB = () => initializeDatabase();
