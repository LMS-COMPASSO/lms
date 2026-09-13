const pool = require('../config/db');
const { gerarCertificadoPDF, gerarCodigoValidacao } = require('../utils/certificateGenerator');

async function listar(req, res, next) {
  try {
    let sql = `
      SELECT cert.*, u.nome AS aluno_nome, c.titulo AS curso_titulo
      FROM certificados cert
      JOIN matriculas mt ON mt.id = cert.matricula_id
      JOIN usuarios u ON u.id = mt.usuario_id
      JOIN cursos c ON c.id = mt.curso_id
      WHERE 1=1
    `;
    const params = [];
    if (req.usuario.perfil === 'aluno') {
      sql += ' AND mt.usuario_id = ?';
      params.push(req.usuario.id);
    }
    sql += ' ORDER BY cert.data_emissao DESC';
    const [linhas] = await pool.query(sql, params);
    res.json(linhas);
  } catch (err) {
    next(err);
  }
}

/**
 * Gera (ou retorna, se já existente) o certificado de uma matrícula concluída.
 */
async function emitir(req, res, next) {
  try {
    const { matricula_id } = req.body;

    const [matriculas] = await pool.query(
      `SELECT mt.*, u.nome AS aluno_nome, c.titulo AS curso_titulo, c.carga_horaria
       FROM matriculas mt
       JOIN usuarios u ON u.id = mt.usuario_id
       JOIN cursos c ON c.id = mt.curso_id
       WHERE mt.id = ?`,
      [matricula_id]
    );
    if (matriculas.length === 0) return res.status(404).json({ erro: 'Matrícula não encontrada.' });

    const matricula = matriculas[0];

    if (req.usuario.perfil === 'aluno' && matricula.usuario_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode emitir seu próprio certificado.' });
    }
    if (matricula.status !== 'concluida') {
      return res.status(400).json({ erro: 'O curso ainda não foi concluído.' });
    }

    const [existentes] = await pool.query('SELECT * FROM certificados WHERE matricula_id = ?', [matricula_id]);
    if (existentes.length > 0) {
      return res.json(existentes[0]);
    }

    const codigoValidacao = gerarCodigoValidacao();
    const dataEmissao = new Date().toLocaleDateString('pt-BR');

    const urlArquivo = await gerarCertificadoPDF({
      nomeAluno: matricula.aluno_nome,
      tituloCurso: matricula.curso_titulo,
      cargaHoraria: matricula.carga_horaria,
      codigoValidacao,
      dataEmissao,
    });

    const [resultado] = await pool.query(
      'INSERT INTO certificados (matricula_id, codigo_validacao, url_arquivo) VALUES (?, ?, ?)',
      [matricula_id, codigoValidacao, urlArquivo]
    );

    res.status(201).json({
      id: resultado.insertId,
      codigo_validacao: codigoValidacao,
      url_arquivo: urlArquivo,
    });
  } catch (err) {
    next(err);
  }
}

async function validar(req, res, next) {
  try {
    const { codigo } = req.params;
    const [linhas] = await pool.query(
      `SELECT cert.codigo_validacao, cert.data_emissao, u.nome AS aluno_nome, c.titulo AS curso_titulo, c.carga_horaria
       FROM certificados cert
       JOIN matriculas mt ON mt.id = cert.matricula_id
       JOIN usuarios u ON u.id = mt.usuario_id
       JOIN cursos c ON c.id = mt.curso_id
       WHERE cert.codigo_validacao = ?`,
      [codigo]
    );
    if (linhas.length === 0) return res.status(404).json({ erro: 'Certificado não encontrado ou inválido.' });
    res.json({ valido: true, certificado: linhas[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, emitir, validar };
