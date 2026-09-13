const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql-f45033b-dellsalsicha-fd08.e.aivencloud.com',
  port: process.env.DB_PORT || 18343,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_15ryqoyvUyta7Yj3GcL',
  database: process.env.DB_NAME || 'defaultdb',
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
