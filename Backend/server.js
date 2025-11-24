// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const { getPool } = require('./db');
const cfg = require('./config.json').server;

const app = express();

// Permitir CORS
app.use(cors());
app.use(bodyParser.json());

// === SERVIR FRONTEND ===
// Aquí asumimos que este server.js está en Backend/
// y que la carpeta Frontend está al mismo nivel que Backend/
app.use(express.static(path.join(__dirname, '../Frontend')));

// === REGISTER ===
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Missing fields' });

    const pool = await getPool();
    const check = await pool.request()
      .input('username', username)
      .query('SELECT COUNT(*) AS cnt FROM Users WHERE username = @username');

    if (check.recordset[0].cnt > 0)
      return res.status(409).json({ error: 'Usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);

    await pool.request()
      .input('username', username)
      .input('password_hash', hash)
      .query('INSERT INTO Users (username, password_hash, created_at) VALUES (@username, @password_hash, GETDATE())');

    res.json({ ok: true, message: 'Usuario creado' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === LOGIN ===
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Missing fields' });

    const pool = await getPool();
    const result = await pool.request()
      .input('username', username)
      .query('SELECT id, username, password_hash FROM Users WHERE username = @username');

    if (!result.recordset.length)
      return res.status(404).json({ error: 'Usuario no existe' });

    const user = result.recordset[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === TEST SERVER ===
app.get('/api/ping', (req, res) => {
  res.json({ ok: true });
});

// === INICIAR SERVIDOR ===
const PORT = cfg.port || 3000;
app.listen(PORT, () => {
  console.log(`Agendary API running at http://localhost:${PORT}`);
});
