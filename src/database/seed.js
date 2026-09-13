/**
 * Script de seed: cria o usuário Administrador inicial do sistema.
 * Uso: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seed() {
  const nome = process.env.ADMIN_NAME || 'Administrador do Sistema';
  const email = process.env.ADMIN_EMAIL || 'admin@lms-bncc.edu.br';
  const senha = process.env.ADMIN_PASSWORD || 'Admin@12345';

  try {
    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);

    if (existentes.length > 0) {
      console.log(`Usuário admin já existe (${email}). Nenhuma ação necessária.`);
      process.exit(0);
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, 'administrador', 1)`,
      [nome, email, senha_hash]
    );

    console.log('=================================================');
    console.log(' Usuário administrador criado com sucesso!');
    console.log(` Email: ${email}`);
    console.log(` Senha: ${senha}`);
    console.log(' (Altere a senha após o primeiro acesso)');
    console.log('=================================================');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao executar seed:', err.message);
    process.exit(1);
  }
}

seed();
