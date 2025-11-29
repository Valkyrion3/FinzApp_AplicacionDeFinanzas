const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar límite para sincronización

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ============================================================================
// INICIALIZACIÓN DE TABLAS
// ============================================================================
const initTables = async () => {
  try {
    // Tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        correo VARCHAR(255) UNIQUE NOT NULL,
        contraseña VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de billeteras
    await pool.query(`
      CREATE TABLE IF NOT EXISTS billeteras (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        saldo DECIMAL(12,2) DEFAULT 0,
        color VARCHAR(20) DEFAULT '#9C27B0',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de transacciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transacciones (
        id SERIAL PRIMARY KEY,
        billetera_id INTEGER REFERENCES billeteras(id) ON DELETE CASCADE,
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
        categoria VARCHAR(100),
        monto DECIMAL(12,2) NOT NULL,
        descripcion TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tablas inicializadas correctamente');
  } catch (err) {
    console.error('❌ Error inicializando tablas:', err);
  }
};

// Inicializar tablas al arrancar
initTables();

// ============================================================================
// ENDPOINTS BÁSICOS
// ============================================================================
app.get('/', (req, res) => res.json({ 
  status: 'ok', 
  now: new Date(),
  version: '2.0.0',
  endpoints: [
    'GET /debug/all - Ver todos los datos',
    'GET /usuarios',
    'POST /usuarios/registro',
    'POST /usuarios/login',
    'GET /billeteras/:usuarioId',
    'POST /billeteras',
    'PUT /billeteras/:id',
    'DELETE /billeteras/:id',
    'GET /transacciones/:billeteraId',
    'POST /transacciones',
    'PUT /transacciones/:id',
    'DELETE /transacciones/:id',
    'POST /sync/upload',
    'GET /sync/download/:usuarioId'
  ]
}));

// ============================================================================
// DEBUG - Ver todos los datos (solo para desarrollo)
// ============================================================================
app.get('/debug/all', async (req, res) => {
  try {
    const usuarios = await pool.query('SELECT id, nombre, apellido, correo, fecha_registro FROM usuarios');
    const billeteras = await pool.query('SELECT * FROM billeteras');
    const transacciones = await pool.query('SELECT * FROM transacciones ORDER BY fecha DESC LIMIT 50');
    
    res.json({
      resumen: {
        totalUsuarios: usuarios.rows.length,
        totalBilleteras: billeteras.rows.length,
        totalTransacciones: transacciones.rows.length
      },
      usuarios: usuarios.rows,
      billeteras: billeteras.rows,
      transacciones: transacciones.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// ============================================================================
// USUARIOS
// ============================================================================
app.post('/usuarios/registro', async (req, res) => {
  try {
    const { nombre, apellido, correo, contraseña } = req.body;
    
    // Verificar si el correo ya existe
    const existe = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, correo, contraseña) VALUES ($1,$2,$3,$4) RETURNING id, nombre, apellido, correo, fecha_registro',
      [nombre, apellido, correo, contraseña]
    );
    res.status(201).json({ success: true, usuario: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

app.post('/usuarios/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    const { rows } = await pool.query(
      'SELECT id, nombre, apellido, correo, fecha_registro FROM usuarios WHERE correo = $1 AND contraseña = $2',
      [correo, contraseña]
    );
    
    if (!rows.length) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    res.json({ success: true, usuario: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, correo } = req.body;
    const { rows } = await pool.query(
      'UPDATE usuarios SET nombre=$1, apellido=$2, correo=$3 WHERE id=$4 RETURNING id, nombre, apellido, correo',
      [nombre, apellido, correo, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true, usuario: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// ============================================================================
// BILLETERAS
// ============================================================================
app.get('/billeteras/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM billeteras WHERE usuario_id = $1 ORDER BY fecha_creacion DESC',
      [usuarioId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener billeteras' });
  }
});

app.post('/billeteras', async (req, res) => {
  try {
    const { usuario_id, nombre, saldo, color } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO billeteras (usuario_id, nombre, saldo, color) VALUES ($1,$2,$3,$4) RETURNING *',
      [usuario_id, nombre, saldo || 0, color || '#9C27B0']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear billetera' });
  }
});

app.put('/billeteras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, saldo, color } = req.body;
    const { rows } = await pool.query(
      'UPDATE billeteras SET nombre=$1, saldo=$2, color=$3 WHERE id=$4 RETURNING *',
      [nombre, saldo, color, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Billetera no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar billetera' });
  }
});

app.delete('/billeteras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM billeteras WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar billetera' });
  }
});

// ============================================================================
// TRANSACCIONES
// ============================================================================
app.get('/transacciones/:billeteraId', async (req, res) => {
  try {
    const { billeteraId } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM transacciones WHERE billetera_id = $1 ORDER BY fecha DESC',
      [billeteraId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

app.get('/transacciones/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { rows } = await pool.query(`
      SELECT t.* FROM transacciones t
      JOIN billeteras b ON t.billetera_id = b.id
      WHERE b.usuario_id = $1
      ORDER BY t.fecha DESC
    `, [usuarioId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
});

app.post('/transacciones', async (req, res) => {
  try {
    const { billetera_id, tipo, categoria, monto, descripcion, fecha } = req.body;
    
    // Insertar transacción
    const { rows } = await pool.query(
      'INSERT INTO transacciones (billetera_id, tipo, categoria, monto, descripcion, fecha) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [billetera_id, tipo, categoria, monto, descripcion, fecha || new Date()]
    );
    
    // Actualizar saldo de billetera
    const cambioSaldo = tipo === 'ingreso' ? monto : -monto;
    await pool.query('UPDATE billeteras SET saldo = saldo + $1 WHERE id = $2', [cambioSaldo, billetera_id]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

app.put('/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, categoria, monto, descripcion, fecha } = req.body;
    
    // Obtener transacción anterior para ajustar saldo
    const anterior = await pool.query('SELECT * FROM transacciones WHERE id = $1', [id]);
    if (!anterior.rows.length) return res.status(404).json({ error: 'Transacción no encontrada' });
    
    const txAnterior = anterior.rows[0];
    
    // Revertir saldo anterior
    const reversion = txAnterior.tipo === 'ingreso' ? -txAnterior.monto : txAnterior.monto;
    await pool.query('UPDATE billeteras SET saldo = saldo + $1 WHERE id = $2', [reversion, txAnterior.billetera_id]);
    
    // Aplicar nuevo saldo
    const cambioSaldo = tipo === 'ingreso' ? monto : -monto;
    await pool.query('UPDATE billeteras SET saldo = saldo + $1 WHERE id = $2', [cambioSaldo, txAnterior.billetera_id]);
    
    // Actualizar transacción
    const { rows } = await pool.query(
      'UPDATE transacciones SET tipo=$1, categoria=$2, monto=$3, descripcion=$4, fecha=$5 WHERE id=$6 RETURNING *',
      [tipo, categoria, monto, descripcion, fecha, id]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar transacción' });
  }
});

app.delete('/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener transacción para ajustar saldo
    const tx = await pool.query('SELECT * FROM transacciones WHERE id = $1', [id]);
    if (tx.rows.length) {
      const transaccion = tx.rows[0];
      const reversion = transaccion.tipo === 'ingreso' ? -transaccion.monto : transaccion.monto;
      await pool.query('UPDATE billeteras SET saldo = saldo + $1 WHERE id = $2', [reversion, transaccion.billetera_id]);
    }
    
    await pool.query('DELETE FROM transacciones WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
});

// ============================================================================
// SINCRONIZACIÓN - Subir datos locales a la nube
// ============================================================================
app.post('/sync/upload', async (req, res) => {
  try {
    const { usuario, billeteras, transacciones } = req.body;
    
    if (!usuario || !usuario.correo) {
      return res.status(400).json({ error: 'Datos de usuario requeridos' });
    }

    // Buscar o crear usuario
    let usuarioCloud = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [usuario.correo]);
    let usuarioId;
    
    if (usuarioCloud.rows.length === 0) {
      // Crear usuario nuevo
      const nuevoUsuario = await pool.query(
        'INSERT INTO usuarios (nombre, apellido, correo, contraseña) VALUES ($1,$2,$3,$4) RETURNING *',
        [usuario.nombre, usuario.apellido, usuario.correo, usuario.contraseña || 'sync_user']
      );
      usuarioId = nuevoUsuario.rows[0].id;
    } else {
      usuarioId = usuarioCloud.rows[0].id;
      // Eliminar datos existentes para reemplazar
      await pool.query('DELETE FROM billeteras WHERE usuario_id = $1', [usuarioId]);
    }

    // Mapeo de IDs locales a IDs de la nube
    const mapBilleteras = {};
    
    // Insertar billeteras
    for (const billetera of billeteras) {
      const result = await pool.query(
        'INSERT INTO billeteras (usuario_id, nombre, saldo, color) VALUES ($1,$2,$3,$4) RETURNING id',
        [usuarioId, billetera.nombre, billetera.saldo, billetera.color]
      );
      mapBilleteras[billetera.id] = result.rows[0].id;
    }

    // Insertar transacciones
    let txCount = 0;
    for (const tx of transacciones) {
      const billeteraCloudId = mapBilleteras[tx.billetera_id];
      if (billeteraCloudId) {
        await pool.query(
          'INSERT INTO transacciones (billetera_id, tipo, categoria, monto, descripcion, fecha) VALUES ($1,$2,$3,$4,$5,$6)',
          [billeteraCloudId, tx.tipo, tx.categoria, tx.monto, tx.descripcion, tx.fecha]
        );
        txCount++;
      }
    }

    res.json({ 
      success: true, 
      message: `Sincronización completada: ${billeteras.length} billeteras, ${txCount} transacciones`,
      usuarioCloudId: usuarioId
    });
  } catch (err) {
    console.error('Error en sync/upload:', err);
    res.status(500).json({ error: 'Error al sincronizar datos' });
  }
});

// ============================================================================
// SINCRONIZACIÓN - Descargar datos de la nube
// ============================================================================
app.get('/sync/download/:correo', async (req, res) => {
  try {
    const { correo } = req.params;
    
    // Buscar usuario
    const usuario = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (!usuario.rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado en la nube' });
    }
    
    const usuarioData = usuario.rows[0];
    
    // Obtener billeteras
    const billeteras = await pool.query(
      'SELECT * FROM billeteras WHERE usuario_id = $1',
      [usuarioData.id]
    );
    
    // Obtener transacciones
    const transacciones = await pool.query(`
      SELECT t.* FROM transacciones t
      JOIN billeteras b ON t.billetera_id = b.id
      WHERE b.usuario_id = $1
    `, [usuarioData.id]);

    res.json({
      success: true,
      usuario: {
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        correo: usuarioData.correo
      },
      billeteras: billeteras.rows,
      transacciones: transacciones.rows,
      fechaSync: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error en sync/download:', err);
    res.status(500).json({ error: 'Error al descargar datos' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));
