const pool = require('../config/db');

async function listarPorModulo(req, res, next) {
  try {
    const [linhas] = await pool.query('SELECT * FROM avaliacoes WHERE modulo_id = ?', [req.params.moduloId]);
    res.json(linhas);
  } catch (err) {
    next(err);
  }
}

async function obter(req, res, next) {
  try {
    const [avaliacoes] = await pool.query('SELECT * FROM avaliacoes WHERE id = ?', [req.params.id]);
    if (avaliacoes.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada.' });

    const avaliacao = avaliacoes[0];
    const [questoes] = await pool.query(
      'SELECT id, enunciado, tipo, pontos, ordem FROM questoes WHERE avaliacao_id = ? ORDER BY ordem ASC, id ASC',
      [avaliacao.id]
    );

    const somenteAlunoOculto = req.usuario.perfil === 'aluno';

    for (const questao of questoes) {
      const colunas = somenteAlunoOculto ? 'id, texto' : 'id, texto, correta';
      const [alternativas] = await pool.query(
        `SELECT ${colunas} FROM alternativas WHERE questao_id = ?`,
        [questao.id]
      );
      questao.alternativas = alternativas;
    }

    avaliacao.questoes = questoes;
    res.json(avaliacao);
  } catch (err) {
    next(err);
  }
}

async function criar(req, res, next) {
  try {
    const { moduloId } = req.params;
    const { titulo, descricao, nota_minima, tentativas_permitidas, questoes } = req.body;

    if (!titulo) return res.status(400).json({ erro: 'Título da avaliação é obrigatório.' });

    const conexao = await pool.getConnection();
    try {
      await conexao.beginTransaction();

      const [resultadoAval] = await conexao.query(
        `INSERT INTO avaliacoes (modulo_id, titulo, descricao, nota_minima, tentativas_permitidas)
         VALUES (?, ?, ?, ?, ?)`,
        [moduloId, titulo, descricao || null, nota_minima || 6.0, tentativas_permitidas || 3]
      );
      const avaliacaoId = resultadoAval.insertId;

      if (Array.isArray(questoes)) {
        for (let i = 0; i < questoes.length; i++) {
          const q = questoes[i];
          const [resultadoQuestao] = await conexao.query(
            `INSERT INTO questoes (avaliacao_id, enunciado, tipo, pontos, ordem) VALUES (?, ?, ?, ?, ?)`,
            [avaliacaoId, q.enunciado, q.tipo || 'multipla_escolha', q.pontos || 1, i]
          );
          const questaoId = resultadoQuestao.insertId;

          if (Array.isArray(q.alternativas)) {
            for (const alt of q.alternativas) {
              await conexao.query(
                `INSERT INTO alternativas (questao_id, texto, correta) VALUES (?, ?, ?)`,
                [questaoId, alt.texto, alt.correta ? 1 : 0]
              );
            }
          }
        }
      }

      await conexao.commit();
      res.status(201).json({ id: avaliacaoId, titulo });
    } catch (errTx) {
      await conexao.rollback();
      throw errTx;
    } finally {
      conexao.release();
    }
  } catch (err) {
    next(err);
  }
}

async function excluir(req, res, next) {
  try {
    await pool.query('DELETE FROM avaliacoes WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Avaliação excluída com sucesso.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Aluno envia respostas de uma avaliação. Corrige automaticamente
 * questões objetivas (múltipla escolha / verdadeiro-falso).
 */
async function responder(req, res, next) {
  try {
    const { id: avaliacaoId } = req.params;
    const { respostas } = req.body; // [{ questaoId, alternativaId }]
    const usuarioId = req.usuario.id;

    const [avaliacoes] = await pool.query(
      `SELECT av.*, m.curso_id FROM avaliacoes av
       JOIN modulos m ON m.id = av.modulo_id WHERE av.id = ?`,
      [avaliacaoId]
    );
    if (avaliacoes.length === 0) return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    const avaliacao = avaliacoes[0];

    const [matriculas] = await pool.query(
      'SELECT id FROM matriculas WHERE usuario_id = ? AND curso_id = ? AND status != "cancelada"',
      [usuarioId, avaliacao.curso_id]
    );
    if (matriculas.length === 0) return res.status(403).json({ erro: 'Você não está matriculado neste curso.' });
    const matriculaId = matriculas[0].id;

    const [tentativasAnteriores] = await pool.query(
      'SELECT COUNT(*) AS total FROM tentativas_avaliacao WHERE matricula_id = ? AND avaliacao_id = ?',
      [matriculaId, avaliacaoId]
    );
    if (tentativasAnteriores[0].total >= avaliacao.tentativas_permitidas) {
      return res.status(403).json({ erro: 'Número máximo de tentativas atingido.' });
    }

    const [questoes] = await pool.query('SELECT id, pontos FROM questoes WHERE avaliacao_id = ?', [avaliacaoId]);
    const totalPontos = questoes.reduce((soma, q) => soma + Number(q.pontos), 0) || 1;
    let pontosObtidos = 0;

    for (const resposta of respostas || []) {
      const questao = questoes.find((q) => q.id === resposta.questaoId);
      if (!questao) continue;
      const [alternativaCorreta] = await pool.query(
        'SELECT id FROM alternativas WHERE questao_id = ? AND correta = 1',
        [resposta.questaoId]
      );
      if (alternativaCorreta.length > 0 && alternativaCorreta[0].id === resposta.alternativaId) {
        pontosObtidos += Number(questao.pontos);
      }
    }

    const notaFinal = Math.round(((pontosObtidos / totalPontos) * 10) * 100) / 100;
    const aprovado = notaFinal >= avaliacao.nota_minima;

    await pool.query(
      `INSERT INTO tentativas_avaliacao (matricula_id, avaliacao_id, nota, aprovado, respostas)
       VALUES (?, ?, ?, ?, ?)`,
      [matriculaId, avaliacaoId, notaFinal, aprovado ? 1 : 0, JSON.stringify(respostas || [])]
    );

    res.json({ nota: notaFinal, aprovado, mensagem: aprovado ? 'Aprovado!' : 'Reprovado. Tente novamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarPorModulo, obter, criar, excluir, responder };
