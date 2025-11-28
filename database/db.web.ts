// @ts-nocheck
// Web-compatible database implementation using localStorage and IndexedDB fallback

// TypeScript interfaces (same as native)
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

// Callback types (same as native)
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

// Identificador único para verificación
export const DATABASE_TYPE = 'WEB_LOCALSTORAGE';

// LocalStorage keys
const STORAGE_KEYS = {
  usuarios: 'gastos_usuarios',
  billeteras: 'gastos_billeteras',
  transacciones: 'gastos_transacciones',
  contadores: 'gastos_contadores'
};

// Helper functions for web storage
const getStorageData = <T>(key: string, defaultValue: T[] = []): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setStorageData = <T>(key: string, data: T[]): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

const getNextId = (entity: string): number => {
  const contadores = getStorageData<any>(STORAGE_KEYS.contadores, [{ usuarios: 0, billeteras: 0, transacciones: 0 }]);
  const contador = contadores[0] || { usuarios: 0, billeteras: 0, transacciones: 0 };
  contador[entity] = (contador[entity] || 0) + 1;
  setStorageData(STORAGE_KEYS.contadores, [contador]);
  return contador[entity];
};

// Initialize web database (localStorage)
export const initDB = () => {
  console.log('WEB IMPLEMENTATION: Initializing localStorage database...');
  console.log('WEB IMPLEMENTATION: This is the WEB implementation being called');
  
  try {
    // Initialize storage if it doesn't exist
    if (!localStorage.getItem(STORAGE_KEYS.usuarios)) {
      setStorageData(STORAGE_KEYS.usuarios, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.billeteras)) {
      setStorageData(STORAGE_KEYS.billeteras, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.transacciones)) {
      setStorageData(STORAGE_KEYS.transacciones, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.contadores)) {
      setStorageData(STORAGE_KEYS.contadores, [{ usuarios: 0, billeteras: 0, transacciones: 0 }]);
    }
    console.log('Web database initialized with localStorage');
  } catch (error) {
    console.error('Error initializing web database:', error);
  }
};

// User registration
export const registrarUsuario = (nombre: string, apellido: string, correo: string, contraseña: string, callback: RegistroCallback) => {
  try {
    const usuarios = getStorageData<Usuario>(STORAGE_KEYS.usuarios);
    
    // Check if email already exists
    if (usuarios.find(u => u.correo === correo)) {
      callback(false, 'Este correo ya está registrado');
      return;
    }

    const nuevoUsuario: Usuario = {
      id: getNextId('usuarios'),
      nombre,
      apellido,
      correo,
      contraseña,
      fecha_registro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    
    if (setStorageData(STORAGE_KEYS.usuarios, usuarios)) {
      console.log('Usuario registrado exitosamente');
      callback(true, 'Usuario registrado exitosamente');
    } else {
      callback(false, 'Error al guardar usuario');
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    callback(false, 'Error al registrar usuario');
  }
};

// User login
export const iniciarSesion = (correo: string, contraseña: string, callback: LoginCallback) => {
  try {
    const usuarios = getStorageData<Usuario>(STORAGE_KEYS.usuarios);
    const usuario = usuarios.find(u => u.correo === correo && u.contraseña === contraseña);
    
    if (usuario) {
      console.log('Inicio de sesión exitoso');
      callback(true, 'Inicio de sesión exitoso', usuario);
    } else {
      console.log('Credenciales inválidas');
      callback(false, 'Correo o contraseña incorrectos', null);
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    callback(false, 'Error al iniciar sesión', null);
  }
};

// Get user wallets
export const obtenerBilleteras = (usuarioId: number, callback: BilleterasCallback) => {
  try {
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    const billeterasUsuario = billeteras
      .filter(b => b.usuario_id === usuarioId)
      .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
    
    callback(billeterasUsuario);
  } catch (error) {
    console.error('Error al obtener billeteras:', error);
    callback([]);
  }
};

// Create wallet
export const crearBilletera = (usuarioId: number, nombre: string, callback: CrearBilleteraCallback) => {
  try {
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    
    const nuevaBilletera: Billetera = {
      id: getNextId('billeteras'),
      usuario_id: usuarioId,
      nombre,
      saldo: 0,
      color: '#9C27B0',
      fecha_creacion: new Date().toISOString()
    };

    billeteras.push(nuevaBilletera);
    
    if (setStorageData(STORAGE_KEYS.billeteras, billeteras)) {
      console.log('Billetera creada exitosamente');
      callback(true, 'Billetera creada exitosamente');
    } else {
      callback(false, 'Error al crear billetera');
    }
  } catch (error) {
    console.error('Error al crear billetera:', error);
    callback(false, 'Error al crear billetera');
  }
};

// Update wallet
export const actualizarBilletera = (billeteraId: number, nombre: string, callback: ActualizarBilleteraCallback) => {
  try {
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    const indice = billeteras.findIndex(b => b.id === billeteraId);
    
    if (indice === -1) {
      callback(false, 'No se encontró la billetera');
      return;
    }

    billeteras[indice].nombre = nombre;
    
    if (setStorageData(STORAGE_KEYS.billeteras, billeteras)) {
      console.log('Billetera actualizada exitosamente');
      callback(true, 'Billetera actualizada exitosamente');
    } else {
      callback(false, 'Error al actualizar billetera');
    }
  } catch (error) {
    console.error('Error al actualizar billetera:', error);
    callback(false, 'Error al actualizar billetera');
  }
};

// Update user
export const actualizarUsuario = (usuarioId: number, nombre: string, apellido: string, callback: ActualizarUsuarioCallback) => {
  try {
    const usuarios = getStorageData<Usuario>(STORAGE_KEYS.usuarios);
    const indice = usuarios.findIndex(u => u.id === usuarioId);
    
    if (indice === -1) {
      callback(false, 'Usuario no encontrado');
      return;
    }

    usuarios[indice].nombre = nombre;
    usuarios[indice].apellido = apellido;
    
    if (setStorageData(STORAGE_KEYS.usuarios, usuarios)) {
      console.log('Usuario actualizado exitosamente');
      callback(true, 'Perfil actualizado exitosamente', usuarios[indice]);
    } else {
      callback(false, 'Error al actualizar usuario');
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    callback(false, 'Error al actualizar usuario');
  }
};

// Get transactions
export const obtenerTransacciones = (billeteraId: number, callback: TransaccionesCallback) => {
  try {
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    const transaccionesBilletera = transacciones
      .filter(t => t.billetera_id === billeteraId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    callback(transaccionesBilletera);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    callback([]);
  }
};

// Get transactions by wallet (alias for consistency with native implementations)
export const obtenerTransaccionesPorBilletera = obtenerTransacciones;

// Get all transactions for a user
export const obtenerTransaccionesUsuario = (usuarioId: number, callback: TransaccionesCallback) => {
  try {
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    
    const billeterasUsuario = billeteras.filter(b => b.usuario_id === usuarioId);
    const idsWallets = billeterasUsuario.map(b => b.id);
    const transaccionesUsuario = transacciones
      .filter(t => idsWallets.includes(t.billetera_id))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 20); // Limit to last 20 transactions like native implementations
    
    callback(transaccionesUsuario);
  } catch (error) {
    console.error('Error al obtener transacciones del usuario:', error);
    callback([]);
  }
};

// Create transaction
export const crearTransaccion = (
  billeteraId: number, 
  tipo: 'ingreso' | 'gasto', 
  categoria: string, 
  monto: number, 
  descripcion: string, 
  callback: CrearTransaccionCallback
) => {
  try {
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    
    const billeteraIndice = billeteras.findIndex(b => b.id === billeteraId);
    if (billeteraIndice === -1) {
      callback(false, 'Billetera no encontrada');
      return;
    }

    const nuevaTransaccion: Transaccion = {
      id: getNextId('transacciones'),
      billetera_id: billeteraId,
      tipo,
      categoria,
      monto,
      descripcion,
      fecha: new Date().toISOString()
    };

    // Update wallet balance
    const cambioSaldo = tipo === 'ingreso' ? monto : -monto;
    billeteras[billeteraIndice].saldo += cambioSaldo;

    transacciones.push(nuevaTransaccion);
    
    if (setStorageData(STORAGE_KEYS.transacciones, transacciones) && 
        setStorageData(STORAGE_KEYS.billeteras, billeteras)) {
      console.log('Transacción creada y saldo actualizado');
      callback(true, 'Transacción creada exitosamente');
    } else {
      callback(false, 'Error al crear transacción');
    }
  } catch (error) {
    console.error('Error al crear transacción:', error);
    callback(false, 'Error al crear la transacción');
  }
};

// Update transaction
export const actualizarTransaccion = (
  transaccionId: number,
  tipo: 'ingreso' | 'gasto',
  categoria: string,
  monto: number,
  descripcion: string,
  callback: ActualizarTransaccionCallback
) => {
  try {
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    
    const transaccionIndice = transacciones.findIndex(t => t.id === transaccionId);
    if (transaccionIndice === -1) {
      callback(false, 'Transacción no encontrada');
      return;
    }

    const transaccionAnterior = transacciones[transaccionIndice];
    const billeteraIndice = billeteras.findIndex(b => b.id === transaccionAnterior.billetera_id);
    
    if (billeteraIndice === -1) {
      callback(false, 'Billetera no encontrada');
      return;
    }

    // Calculate balance change
    const cambioAnterior = transaccionAnterior.tipo === 'ingreso' ? -transaccionAnterior.monto : transaccionAnterior.monto;
    const cambioNuevo = tipo === 'ingreso' ? monto : -monto;
    const cambioTotal = cambioAnterior + cambioNuevo;

    // Update transaction
    transacciones[transaccionIndice] = {
      ...transaccionAnterior,
      tipo,
      categoria,
      monto,
      descripcion
    };

    // Update wallet balance
    billeteras[billeteraIndice].saldo += cambioTotal;

    if (setStorageData(STORAGE_KEYS.transacciones, transacciones) && 
        setStorageData(STORAGE_KEYS.billeteras, billeteras)) {
      console.log('Transacción actualizada exitosamente');
      callback(true, 'Transacción actualizada exitosamente');
    } else {
      callback(false, 'Error al actualizar transacción');
    }
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    callback(false, 'Error al actualizar transacción');
  }
};

// Delete transaction
export const eliminarTransaccion = (transaccionId: number, callback: EliminarTransaccionCallback) => {
  try {
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    
    const transaccionIndice = transacciones.findIndex(t => t.id === transaccionId);
    if (transaccionIndice === -1) {
      callback(false, 'Transacción no encontrada');
      return;
    }

    const transaccion = transacciones[transaccionIndice];
    const billeteraIndice = billeteras.findIndex(b => b.id === transaccion.billetera_id);
    
    if (billeteraIndice === -1) {
      callback(false, 'Billetera no encontrada');
      return;
    }

    // Revert balance change
    const cambioSaldo = transaccion.tipo === 'ingreso' ? -transaccion.monto : transaccion.monto;
    billeteras[billeteraIndice].saldo += cambioSaldo;

    // Remove transaction
    transacciones.splice(transaccionIndice, 1);

    if (setStorageData(STORAGE_KEYS.transacciones, transacciones) && 
        setStorageData(STORAGE_KEYS.billeteras, billeteras)) {
      console.log('Transacción eliminada exitosamente');
      callback(true, 'Transacción eliminada exitosamente');
    } else {
      callback(false, 'Error al eliminar transacción');
    }
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    callback(false, 'Error al eliminar transacción');
  }
};

// Delete wallet
export const eliminarBilletera = (billeteraId: number, callback: CrearBilleteraCallback) => {
  try {
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    
    const billeteraIndice = billeteras.findIndex(b => b.id === billeteraId);
    if (billeteraIndice === -1) {
      callback(false, 'Billetera no encontrada');
      return;
    }

    // Remove all related transactions
    const transaccionesActualizadas = transacciones.filter(t => t.billetera_id !== billeteraId);
    
    // Remove wallet
    billeteras.splice(billeteraIndice, 1);

    if (setStorageData(STORAGE_KEYS.billeteras, billeteras) && 
        setStorageData(STORAGE_KEYS.transacciones, transaccionesActualizadas)) {
      console.log('Billetera eliminada exitosamente');
      callback(true, 'Billetera eliminada exitosamente');
    } else {
      callback(false, 'Error al eliminar billetera');
    }
  } catch (error) {
    console.error('Error al eliminar billetera:', error);
    callback(false, 'Error al eliminar billetera');
  }
};

// Export data
export const exportarDatos = (usuarioId: number, callback: ExportarDatosCallback) => {
  try {
    const usuarios = getStorageData<Usuario>(STORAGE_KEYS.usuarios);
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (!usuario) {
      callback(false, 'Usuario no encontrado');
      return;
    }

    const billeterasUsuario = billeteras.filter(b => b.usuario_id === usuarioId);
    const idsWallets = billeterasUsuario.map(b => b.id);
    const transaccionesUsuario = transacciones.filter(t => idsWallets.includes(t.billetera_id));

    const datosExportados = {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        fecha_registro: usuario.fecha_registro
      },
      billeteras: billeterasUsuario,
      transacciones: transaccionesUsuario,
      fechaExportacion: new Date().toISOString(),
      version: '1.0.0'
    };
    
    console.log('Datos exportados exitosamente');
    callback(true, 'Datos exportados exitosamente', datosExportados);
  } catch (error) {
    console.error('Error al exportar datos:', error);
    callback(false, 'Error al exportar datos');
  }
};

// Import data
export const importarDatos = (usuarioId: number, datosImportados: any, callback: ImportarDatosCallback) => {
  try {
    if (!datosImportados || !datosImportados.billeteras || !datosImportados.transacciones) {
      callback(false, 'Formato de datos inválido');
      return;
    }

    if (datosImportados.version !== '1.0.0') {
      callback(false, 'Versión de datos no compatible');
      return;
    }

    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    
    let billeterasImportadas = 0;
    let transaccionesImportadas = 0;
    const mapeoIdsBilleteras: { [key: number]: number } = {};

    // Import wallets
    datosImportados.billeteras.forEach((billetera: any) => {
      const nuevaId = getNextId('billeteras');
      const nuevaBilletera: Billetera = {
        id: nuevaId,
        usuario_id: usuarioId,
        nombre: billetera.nombre,
        saldo: 0, // Start with 0, will be updated by transactions
        color: billetera.color || '#9C27B0',
        fecha_creacion: new Date().toISOString()
      };
      
      billeteras.push(nuevaBilletera);
      mapeoIdsBilleteras[billetera.id] = nuevaId;
      billeterasImportadas++;
    });

    // Import transactions
    datosImportados.transacciones.forEach((transaccion: any) => {
      const nuevaBilleteraId = mapeoIdsBilleteras[transaccion.billetera_id];
      if (nuevaBilleteraId) {
        const nuevaTransaccion: Transaccion = {
          id: getNextId('transacciones'),
          billetera_id: nuevaBilleteraId,
          tipo: transaccion.tipo,
          categoria: transaccion.categoria,
          monto: transaccion.monto,
          descripcion: transaccion.descripcion,
          fecha: transaccion.fecha || new Date().toISOString()
        };
        
        // Update wallet balance
        const billeteraIndice = billeteras.findIndex(b => b.id === nuevaBilleteraId);
        if (billeteraIndice !== -1) {
          const cambioSaldo = transaccion.tipo === 'ingreso' ? transaccion.monto : -transaccion.monto;
          billeteras[billeteraIndice].saldo += cambioSaldo;
        }
        
        transacciones.push(nuevaTransaccion);
        transaccionesImportadas++;
      }
    });

    if (setStorageData(STORAGE_KEYS.billeteras, billeteras) && 
        setStorageData(STORAGE_KEYS.transacciones, transacciones)) {
      console.log(`Importación completada: ${billeterasImportadas} billeteras, ${transaccionesImportadas} transacciones`);
      callback(true, `Datos importados exitosamente: ${billeterasImportadas} billeteras y ${transaccionesImportadas} transacciones`);
    } else {
      callback(false, 'Error al guardar datos importados');
    }
  } catch (error) {
    console.error('Error al importar datos:', error);
    callback(false, 'Error al importar datos');
  }
};

// Reset data
export const resetearDatos = (usuarioId: number, callback: ResetearDatosCallback) => {
  try {
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    
    const billeterasUsuario = billeteras.filter(b => b.usuario_id === usuarioId);
    const idsWallets = billeterasUsuario.map(b => b.id);
    
    // Remove user's transactions
    const transaccionesActualizadas = transacciones.filter(t => !idsWallets.includes(t.billetera_id));
    
    // Remove user's wallets
    const billeterasActualizadas = billeteras.filter(b => b.usuario_id !== usuarioId);

    if (setStorageData(STORAGE_KEYS.billeteras, billeterasActualizadas) && 
        setStorageData(STORAGE_KEYS.transacciones, transaccionesActualizadas)) {
      console.log('Datos reseteados exitosamente');
      callback(true, 'Todos los datos han sido eliminados exitosamente');
    } else {
      callback(false, 'Error al resetear datos');
    }
  } catch (error) {
    console.error('Error al resetear datos:', error);
    callback(false, 'Error al resetear datos');
  }
};

// Get statistics
export const obtenerEstadisticas = (usuarioId: number, callback: (stats: any) => void) => {
  try {
    const billeteras = getStorageData<Billetera>(STORAGE_KEYS.billeteras);
    const transacciones = getStorageData<Transaccion>(STORAGE_KEYS.transacciones);
    
    const billeterasUsuario = billeteras.filter(b => b.usuario_id === usuarioId);
    const idsWallets = billeterasUsuario.map(b => b.id);
    const transaccionesUsuario = transacciones.filter(t => idsWallets.includes(t.billetera_id));
    
    const totalIngresos = transaccionesUsuario
      .filter(t => t.tipo === 'ingreso')
      .reduce((total, t) => total + t.monto, 0);
    
    const totalGastos = transaccionesUsuario
      .filter(t => t.tipo === 'gasto')
      .reduce((total, t) => total + t.monto, 0);
    
    const saldoTotal = billeterasUsuario.reduce((total, b) => total + b.saldo, 0);

    const stats = {
      totalBilleteras: billeterasUsuario.length,
      totalTransacciones: transaccionesUsuario.length,
      totalIngresos,
      totalGastos,
      saldoTotal
    };
    
    callback(stats);
  } catch (error) {
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

// Clean database (for development)
export const limpiarBaseDatos = (callback: (exito: boolean, mensaje: string) => void) => {
  try {
    localStorage.removeItem(STORAGE_KEYS.usuarios);
    localStorage.removeItem(STORAGE_KEYS.billeteras);
    localStorage.removeItem(STORAGE_KEYS.transacciones);
    localStorage.removeItem(STORAGE_KEYS.contadores);
    
    // Reinitialize
    initDB();
    
    console.log('Base de datos limpiada (web)');
    callback(true, 'Base de datos limpiada exitosamente');
  } catch (error) {
    console.error('Error al limpiar base de datos (web):', error);
    callback(false, 'Error al limpiar base de datos');
  }
};

export const getDB = () => null; // Not applicable for web
