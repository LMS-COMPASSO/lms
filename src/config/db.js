const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Monta a configuração de SSL para provedores gerenciados (ex.: Aiven, PlanetScale).
 *
 * Suporta duas formas de fornecer o certificado CA:
 * - DB_SSL_CA_PATH: caminho para um arquivo .pem no disco (uso local/dev)
 * - DB_SSL_CA_CONTENT: conteúdo do certificado direto na variável de ambiente
 *   (útil em produção, quando não é prático versionar/copiar um arquivo .pem)
 *
 * Se nenhuma das duas for definida, a conexão segue sem SSL (ex.: MySQL local).
 */
function montarConfigSSL() {
  if (process.env.DB_SSL_CA_CONTENT) {
    return {
      ca: process.env.DB_SSL_CA_CONTENT,
      rejectUnauthorized: true,
    };
  }

  if (process.env.DB_SSL_CA_PATH) {
    const caminhoCA = path.resolve(process.env.DB_SSL_CA_PATH);
    if (!fs.existsSync(caminhoCA)) {
      console.warn(`⚠️  Certificado CA não encontrado em: ${caminhoCA}`);
      return undefined;
    }
    return {
      ca: fs.readFileSync(caminhoCA),
      rejectUnauthorized: true,
    };
  }

  return undefined;
}

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
  ssl: montarConfigSSL(),
});

// Testa a conexão ao iniciar
pool.getConnection()
  .then((conn) => {
    const modoSSL = process.env.DB_SSL_CA_PATH || process.env.DB_SSL_CA_CONTENT ? ' (SSL/TLS)' : '';
    console.log(`✅ Conectado ao MySQL com sucesso${modoSSL}.`);
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
  });

module.exports = pool;
