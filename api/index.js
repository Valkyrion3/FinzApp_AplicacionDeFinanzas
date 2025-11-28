const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.get('/', (req, res) => res.send({ status: 'ok', now: new Date() }));

// CRUD example for transacciones
app.get('/transacciones', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM transacciones ORDER BY fecha DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db_error' });
  }
});

app.get('/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM transacciones WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db_error' });
  }
});

app.post('/transacciones', async (req, res) => {
  try {
    const { descripcion, monto, tipo, fecha } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO transacciones (descripcion, monto, tipo, fecha) VALUES ($1,$2,$3,$4) RETURNING *',
      [descripcion, monto, tipo, fecha]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db_error' });
  }
});

app.put('/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, monto, tipo, fecha } = req.body;
    const { rows } = await pool.query(
      'UPDATE transacciones SET descripcion=$1, monto=$2, tipo=$3, fecha=$4 WHERE id=$5 RETURNING *',
      [descripcion, monto, tipo, fecha, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db_error' });
  }
});

app.delete('/transacciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM transacciones WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db_error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));
