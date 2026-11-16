import assert from 'node:assert/strict';
import test from 'node:test';
import { signJwt } from '../src/worker/crypto_seguranca.js';
import {
  obterIndicadores,
  obterLinhaDoTempo,
  obterRelatorioPedagogico,
  listarSubmissoesPython,
} from '../src/worker/routes/dashboard_rotas.js';
import { matricularAluno, cancelarMatricula } from '../src/worker/routes/matriculas_rotas.js';
import { emitirCertificado, gerarHtmlCertificado } from '../src/worker/routes/certificados_rotas.js';
import { criarCurso } from '../src/worker/routes/cursos_rotas.js';
import { atualizarProgressoAula } from '../src/worker/routes/aulas_rotas.js';
import { responderAvaliacao } from '../src/worker/routes/avaliacoes_rotas.js';
import { submeterAvaliacaoSus, obterRelatorioUsabilidadeSus } from '../src/worker/routes/usabilidade_rotas.js';
import { criarUsuario, atualizarUsuario } from '../src/worker/routes/usuarios_rotas.js';

const SEGREDO = 'segredo-de-teste-com-mais-de-32-caracteres!!';

function criarBancoRotas() {
  const usuarios = [
    { id: 1, nome: 'Admin', email: 'admin@lms.edu.br', perfil: 'administrador', ativo: 1 },
    { id: 10, nome: 'Prof. Alice', email: 'alice@lms.edu.br', perfil: 'instrutor', ativo: 1 },
    { id: 20, nome: 'Prof. Bob', email: 'bob@lms.edu.br', perfil: 'instrutor', ativo: 1 },
    { id: 30, nome: '=CMD|"/C calc"!A0', email: 'aluno30@lms.edu.br', perfil: 'aluno', ativo: 1 },
    { id: 31, nome: 'Aluno do Bob', email: 'aluno31@lms.edu.br', perfil: 'aluno', ativo: 1 },
  ];
  const cursos = [
    { id: 1, titulo: 'Curso Alice', eixo_bncc: 'Pensamento Computacional', ano_escolar: '5º Ano', carga_horaria: 20, status: 'publicado', instrutor_id: 10 },
    { id: 2, titulo: 'Curso Bob', eixo_bncc: 'Mundo Digital', ano_escolar: '6º Ano', carga_horaria: 15, status: 'publicado', instrutor_id: 20 },
  ];
  const modulos = [
    { id: 101, curso_id: 1, titulo: 'Módulo 1 Alice' },
  ];
  const aulas = [
    { id: 1001, modulo_id: 101, titulo: 'Aula 1', tipo: 'texto', duracao_min: 15 },
  ];
  const avaliacoes = [
    { id: 501, modulo_id: 101, titulo: 'Prova 1', nota_minima: 6, tentativas_permitidas: 3 },
  ];
  const questoes = [
    { id: 601, avaliacao_id: 501, enunciado: 'Quanto é 1+1?', pontos: 1 },
  ];
  const alternativas = [
    { id: 701, questao_id: 601, texto: '2', correta: 1 },
  ];
  const matriculas = [
    { id: 100, usuario_id: 30, curso_id: 1, status: 'concluida', progresso_percentual: 100, data_conclusao: '2026-10-01' },
    { id: 101, usuario_id: 31, curso_id: 2, status: 'ativa', progresso_percentual: 0, data_conclusao: null },
  ];
  const progressoAulas = [];
  const tentativasAvaliacao = [];
  const desempenhoHabilidades = [
    { id: 1, usuario_id: 30, curso_id: null, habilidade_codigo: 'EF01CO02', origem_tipo: 'atividade', pontuacao: 9, nivel_atingido: 'avancado', registrado_em: '2026-10-10T10:00:00Z' },
    { id: 2, usuario_id: 31, curso_id: null, habilidade_codigo: 'EF01CO02', origem_tipo: 'atividade', pontuacao: 8, nivel_atingido: 'adequado', registrado_em: '2026-10-10T10:00:00Z' },
  ];
  const submissoesPython = [
    { id: 1, usuario_id: 30, atividade_id: 'python3d-sequencia-labirinto', codigo_python: 'robo.mover()', sucesso: 1, tentativas: 1, estrelas: 3, criado_em: '2026-10-11' },
    { id: 2, usuario_id: 31, atividade_id: 'python3d-sequencia-labirinto', codigo_python: 'robo.mover()', sucesso: 1, tentativas: 1, estrelas: 3, criado_em: '2026-10-11' },
  ];
  const avaliacoesSus = [];

  return {
    matriculas,
    avaliacoesSus,
    prepare(sql) {
      function criarOps(params = []) {
        return {
          async first() {
            if (sql.includes('FROM usuarios WHERE id = ?')) {
              return usuarios.find((u) => u.id === params[0]) || null;
            }
            if (sql.includes('SELECT id, status, instrutor_id FROM cursos WHERE id = ?')) {
              return cursos.find((c) => c.id === params[0]) || null;
            }
            if (sql.includes('FROM matriculas m JOIN cursos c ON c.id = m.curso_id WHERE m.id = ?')) {
              const m = matriculas.find((mt) => mt.id === params[0]);
              if (!m) return null;
              const c = cursos.find((crs) => crs.id === m.curso_id);
              return { ...m, instrutor_id: c?.instrutor_id };
            }
            if (sql.includes('FROM aulas a JOIN modulos m ON m.id = a.modulo_id WHERE a.id = ?')) {
              const a = aulas.find((au) => au.id === params[0]);
              if (!a) return null;
              const m = modulos.find((md) => md.id === a.modulo_id);
              return { id: a.id, curso_id: m?.curso_id };
            }
            if (sql.includes('FROM avaliacoes av JOIN modulos m ON m.id = av.modulo_id WHERE av.id = ?')) {
              const av = avaliacoes.find((x) => x.id === params[0]);
              if (!av) return null;
              const m = modulos.find((md) => md.id === av.modulo_id);
              return { ...av, curso_id: m?.curso_id };
            }
            if (sql.includes('FROM matriculas WHERE usuario_id = ? AND curso_id = ?')) {
              return matriculas.find((mt) => mt.usuario_id === params[0] && mt.curso_id === params[1] && mt.status !== 'cancelada') || null;
            }
            if (sql.includes('SELECT COUNT(*) AS total FROM aulas')) {
              return { total: aulas.filter((a) => modulos.some((m) => m.id === a.modulo_id && m.curso_id === params[0])).length };
            }
            if (sql.includes('SELECT COUNT(*) AS total FROM progresso_aulas')) {
              return { total: progressoAulas.filter((p) => p.matricula_id === params[0] && p.concluida === 1).length };
            }
            if (sql.includes('SELECT COUNT(*) AS total FROM avaliacoes av')) {
              return { total: avaliacoes.filter((av) => modulos.some((m) => m.id === av.modulo_id && m.curso_id === params[0])).length };
            }
            if (sql.includes('SELECT COUNT(DISTINCT avaliacao_id) AS total FROM tentativas_avaliacao')) {
              const aprovadas = new Set(tentativasAvaliacao.filter((t) => t.matricula_id === params[0] && t.aprovado === 1).map((t) => t.avaliacao_id));
              return { total: aprovadas.size };
            }
            if (sql.includes('SELECT COUNT(*) AS total FROM tentativas_avaliacao WHERE matricula_id = ?')) {
              return { total: tentativasAvaliacao.filter((t) => t.matricula_id === params[0] && t.avaliacao_id === params[1]).length };
            }
            if (sql.includes('SELECT id FROM alternativas WHERE questao_id = ? AND correta = 1')) {
              return alternativas.find((alt) => alt.questao_id === params[0] && alt.correta === 1) || null;
            }
            if (sql.includes("sqlite_master")) {
              return { name: 'ok' };
            }
            throw new Error(`first() não previsto: ${sql}`);
          },
          async all() {
            if (sql.includes('FROM questoes WHERE avaliacao_id = ?')) {
              return { results: questoes.filter((q) => q.avaliacao_id === params[0]) };
            }
            if (sql.includes('FROM desempenho_habilidades dh')) {
              const instrutorId = sql.includes('cm.instrutor_id = ?') ? params[1] : null;
              const filtrado = desempenhoHabilidades
                .filter((dh) => {
                  if (!instrutorId) return true;
                  return matriculas.some((mt) => {
                    const crs = cursos.find((c) => c.id === mt.curso_id);
                    return mt.usuario_id === dh.usuario_id && crs?.instrutor_id === instrutorId;
                  });
                })
                .map((dh) => {
                  const u = usuarios.find((x) => x.id === dh.usuario_id);
                  return {
                    ...dh,
                    aluno_nome: u?.nome || 'Aluno',
                    aluno_email: u?.email || 'a@b.br',
                    curso_titulo: 'Atividades Gerais',
                    curso_eixo: 'Pensamento Computacional',
                    ano_escolar: 'Fundamental',
                  };
                });
              return { results: filtrado };
            }
            if (sql.includes('FROM submissoes_python sp')) {
              const instrutorId = params[params.length - 1];
              const filtrado = submissoesPython
                .filter((sp) => matriculas.some((mt) => {
                  const crs = cursos.find((c) => c.id === mt.curso_id);
                  return mt.usuario_id === sp.usuario_id && crs?.instrutor_id === instrutorId;
                }))
                .map((sp) => {
                  const u = usuarios.find((x) => x.id === sp.usuario_id);
                  return { ...sp, aluno_nome: u?.nome, aluno_email: u?.email };
                });
              return { results: filtrado };
            }
            if (sql.includes('FROM avaliacoes_usabilidade_sus')) {
              return { results: avaliacoesSus };
            }
            throw new Error(`all() não previsto: ${sql}`);
          },
          async run() {
            if (sql.includes('INSERT INTO progresso_aulas')) {
              const [matriculaId, aulaId, concluida] = params;
              const existente = progressoAulas.find((p) => p.matricula_id === matriculaId && p.aula_id === aulaId);
              if (existente) existente.concluida = concluida;
              else progressoAulas.push({ matricula_id: matriculaId, aula_id: aulaId, concluida });
              return { meta: { changes: 1 } };
            }
            if (sql.includes('UPDATE matriculas')) {
              const [progresso, status, dataConclusao, id] = params;
              const m = matriculas.find((mt) => mt.id === id);
              if (m) {
                m.progresso_percentual = progresso;
                m.status = status;
                m.data_conclusao = dataConclusao;
              }
              return { meta: { changes: 1 } };
            }
            if (sql.includes('INSERT INTO tentativas_avaliacao')) {
              tentativasAvaliacao.push({
                matricula_id: params[0],
                avaliacao_id: params[1],
                nota: params[2],
                aprovado: params[3],
              });
              return { meta: { last_row_id: tentativasAvaliacao.length } };
            }
            if (sql.includes('INSERT INTO avaliacoes_usabilidade_sus')) {
              const item = {
                id: avaliacoesSus.length + 1,
                usuario_id: params[0],
                nome_participante: params[1],
                participante_tipo: params[2],
                escola_turma: params[3],
                sus_score: params[14],
                tempo_segundos: params[15],
                tarefas_concluidas: params[16],
                comentarios: params[17],
                criado_em: '2026-10-12',
              };
              avaliacoesSus.push(item);
              return { meta: { last_row_id: item.id } };
            }
            throw new Error(`run() não previsto: ${sql}`);
          },
        };
      }
      return { ...criarOps([]), bind: (...p) => criarOps(p) };
    },
  };
}

function criarReq(url, metodo, corpo, token) {
  return new Request(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
}

test('Dashboard bloqueia acesso de aluno em indicadores e linha do tempo (403)', async () => {
  const db = criarBancoRotas();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAluno = await signJwt({ id: 30, perfil: 'aluno' }, SEGREDO);

  await assert.rejects(
    obterIndicadores(criarReq('https://lms.test/api/dashboard/indicadores', 'GET', null, tokenAluno), env, db),
    (err) => err.status === 403,
  );
  await assert.rejects(
    obterLinhaDoTempo(criarReq('https://lms.test/api/dashboard/linha-do-tempo', 'GET', null, tokenAluno), env, db, new URL('https://lms.test/api/dashboard/linha-do-tempo')),
    (err) => err.status === 403,
  );
});

test('Dashboard isola submissões Python/relatório por instrutor e neutraliza CSV Formula Injection', async () => {
  const db = criarBancoRotas();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAlice = await signJwt({ id: 10, perfil: 'instrutor' }, SEGREDO);

  const resSub = await listarSubmissoesPython(
    criarReq('https://lms.test/api/dashboard/submissoes-python', 'GET', null, tokenAlice),
    env,
    db,
    new URL('https://lms.test/api/dashboard/submissoes-python'),
  );
  const subs = await resSub.json();
  assert.equal(subs.total, 1);
  assert.equal(subs.submissoes[0].usuario_id, 30);

  const resCsv = await obterRelatorioPedagogico(
    criarReq('https://lms.test/api/dashboard/relatorio-pedagogico?formato=csv', 'GET', null, tokenAlice),
    env,
    db,
    new URL('https://lms.test/api/dashboard/relatorio-pedagogico?formato=csv'),
  );
  const csv = await resCsv.text();
  assert.ok(csv.includes('aluno30@lms.edu.br'));
  assert.equal(csv.includes('aluno31@lms.edu.br'), false);
  assert.ok(csv.includes('"\'=CMD|""/C calc""!A0"'));
});

test('Matrículas e Certificados bloqueiam IDOR entre instrutores e retornam 404 para matrícula inexistente', async () => {
  const db = criarBancoRotas();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAlice = await signJwt({ id: 10, perfil: 'instrutor' }, SEGREDO);
  const tokenBob = await signJwt({ id: 20, perfil: 'instrutor' }, SEGREDO);

  // Alice não pode matricular aluno no curso de Bob (id: 2)
  const resMat = await matricularAluno(
    criarReq('https://lms.test/api/matriculas', 'POST', { curso_id: 2, usuario_id: 30 }, tokenAlice),
    env,
    db,
  );
  assert.equal(resMat.status, 403);

  // Cancelar matrícula inexistente retorna 404
  const res404 = await cancelarMatricula(
    criarReq('https://lms.test/api/matriculas/9999/cancelar', 'PUT', null, tokenAlice),
    env,
    db,
    '9999',
  );
  assert.equal(res404.status, 404);

  // Alice não pode cancelar matrícula do curso de Bob (id: 101)
  const resCancelIdor = await cancelarMatricula(
    criarReq('https://lms.test/api/matriculas/101/cancelar', 'PUT', null, tokenAlice),
    env,
    db,
    '101',
  );
  assert.equal(resCancelIdor.status, 403);

  // Bob não pode emitir certificado para matrícula concluída no curso de Alice (id: 100)
  const resCertIdor = await emitirCertificado(
    criarReq('https://lms.test/api/certificados/emitir', 'POST', { matricula_id: 100 }, tokenBob),
    env,
    db,
    new URL('https://lms.test/api/certificados/emitir'),
  );
  assert.equal(resCertIdor.status, 403);

  // gerarHtmlCertificado escapa XSS armazenado
  const htmlCert = gerarHtmlCertificado({
    aluno_nome: '<img src=x onerror=alert(1)>',
    curso_titulo: 'Computação <script>evil()</script>',
    eixo_bncc: 'Mundo Digital',
    carga_horaria: 20,
    codigo_validacao: 'CERT-1',
    data_emissao: '2026-10-01',
  });
  assert.equal(htmlCert.includes('<img src=x'), false);
  assert.ok(htmlCert.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('Cursos valida eixo_bncc e IDs inválidos retornando 400 em vez de 500', async () => {
  const db = criarBancoRotas();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAlice = await signJwt({ id: 10, perfil: 'instrutor' }, SEGREDO);

  const resEixo = await criarCurso(
    criarReq('https://lms.test/api/cursos', 'POST', { titulo: 'Teste', eixo_bncc: 'Inexistente', ano_escolar: '5º Ano' }, tokenAlice),
    env,
    db,
  );
  assert.equal(resEixo.status, 400);

  await assert.rejects(
    cancelarMatricula(criarReq('https://lms.test/api/matriculas/abc/cancelar', 'PUT', null, tokenAlice), env, db, 'abc'),
    (err) => err.status === 400,
  );
});

test('Conclusão de curso exige 100% das aulas E aprovação em avaliações vinculadas', async () => {
  const db = criarBancoRotas();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAluno31 = await signJwt({ id: 31, perfil: 'aluno' }, SEGREDO);
  // Altera matrícula 101 para o curso 1 (que tem aula 1001 e avaliação 501)
  db.matriculas[1].curso_id = 1;

  const resAula = await atualizarProgressoAula(
    criarReq('https://lms.test/api/aulas/1001/progresso', 'POST', { concluida: true }, tokenAluno31),
    env,
    db,
    '1001',
  );
  const dadosAula = await resAula.json();
  assert.equal(resAula.status, 200);
  assert.equal(dadosAula.progresso_percentual, 100);
  assert.equal(dadosAula.status, 'ativa');
  assert.equal(dadosAula.avaliacoes_pendentes, 1);

  const resAval = await responderAvaliacao(
    criarReq('https://lms.test/api/avaliacoes/501/responder', 'POST', { respostas: [{ questaoId: 601, alternativaId: 701 }] }, tokenAluno31),
    env,
    db,
    '501',
  );
  const dadosAval = await resAval.json();
  assert.equal(resAval.status, 200);
  assert.equal(dadosAval.aprovado, true);
  assert.equal(dadosAval.status_matricula, 'concluida');
});

test('Usabilidade SUS preserva tarefasConcluidas = 0 e anonimiza PII para acessos públicos', async () => {
  const db = criarBancoRotas();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAdmin = await signJwt({ id: 1, perfil: 'administrador' }, SEGREDO);

  const resPost = await submeterAvaliacaoSus(
    criarReq('https://lms.test/api/usabilidade/sus', 'POST', {
      nome: 'Maria Clara',
      tipo: 'aluno',
      tarefasConcluidas: 0,
      q1: 5, q2: 1, q3: 5, q4: 1, q5: 5,
      q6: 1, q7: 5, q8: 1, q9: 5, q10: 1,
      comentarios: 'Comentário privado',
    }),
    env,
    db,
  );
  assert.equal(resPost.status, 201);
  assert.equal(db.avaliacoesSus[0].tarefas_concluidas, 0);

  // Público sem autenticação não recebe nome real nem comentário privado
  const resPublico = await obterRelatorioUsabilidadeSus(
    criarReq('https://lms.test/api/usabilidade/sus', 'GET'),
    env,
    db,
  );
  const dadosPub = await resPublico.json();
  assert.equal(dadosPub.mediaSusGeral, 100);
  assert.equal(dadosPub.avaliacoes[0].nome_participante, 'Participante #1');
  assert.equal(dadosPub.avaliacoes[0].comentarios, null);

  // Administrador autenticado recebe visão completa
  const resAdmin = await obterRelatorioUsabilidadeSus(
    criarReq('https://lms.test/api/usabilidade/sus', 'GET', null, tokenAdmin),
    env,
    db,
  );
  const dadosAdmin = await resAdmin.json();
  assert.equal(dadosAdmin.avaliacoes[0].nome_participante, 'Maria Clara');
  assert.equal(dadosAdmin.avaliacoes[0].comentarios, 'Comentário privado');
});

test('Usuários valida formato de email ao criar e atualizar (400)', async () => {
  const db = criarBancoRotas();
  const env = { JWT_SECRET: SEGREDO };
  const tokenAdmin = await signJwt({ id: 1, perfil: 'administrador' }, SEGREDO);

  const resCriar = await criarUsuario(
    criarReq('https://lms.test/api/usuarios', 'POST', {
      nome: 'Usuário Inválido',
      email: 'sem-dominio@',
      senha: 'Senha@123',
      perfil: 'aluno',
    }, tokenAdmin),
    env,
    db,
  );
  assert.equal(resCriar.status, 400);

  const resAtualizar = await atualizarUsuario(
    criarReq('https://lms.test/api/usuarios/30', 'PUT', {
      email: 'email_invalido_sem_arroba',
    }, tokenAdmin),
    env,
    db,
    '30',
  );
  assert.equal(resAtualizar.status, 400);
});
