const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'sql10.freesqldatabase.com',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'sql10837023',
  password: process.env.DB_PASSWORD || 'pl3vDSlnts',
  database: process.env.DB_NAME || 'sql10837023',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
  dateStrings: true,
});

// Testa a conexão ao iniciar
pool.getConnection()
  .then((conn) => {
    console.log('✅ Conectado ao MySQL com sucesso.');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
  });

module.exports = pool;
