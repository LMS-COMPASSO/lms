import assert from 'node:assert/strict';
import test from 'node:test';
import { signJwt } from '../src/worker/crypto_seguranca.js';
import { listarMedalhas, registrarAtividadeConcluida } from '../src/worker/routes/gamificacao_rotas.js';
import { obterRelatorioPedagogico, listarSubmissoesPython } from '../src/worker/routes/dashboard_rotas.js';
import { visualizarCertificadoPython3dHtml } from '../src/worker/routes/certificados_rotas.js';

const SEGREDO = 'segredo-de-teste-com-mais-de-32-caracteres!!';

function criarBancoCompleto() {
  const medalhas = [
    { id: 1, codigo: 'mestre_algoritmos', titulo: 'Mestre dos Algoritmos', descricao: '...', eixo_bncc: 'Pensamento Computacional', icone: 'format_list_numbered', cor: '#2563eb', criterio_tipo: 'concluir_atividade', criterio_meta: 1 },
    { id: 2, codigo: 'detetive_hardware_software', titulo: 'Mundo Digital', descricao: '...', eixo_bncc: 'Mundo Digital', icone: 'memory', cor: '#059669', criterio_tipo: 'concluir_aula', criterio_meta: 1 },
    { id: 3, codigo: 'guardiao_privacidade', titulo: 'Cultura Digital', descricao: '...', eixo_bncc: 'Cultura Digital', icone: 'verified_user', cor: '#d97706', criterio_tipo: 'concluir_aula', criterio_meta: 1 },
    { id: 4, codigo: 'programador_blocos', titulo: 'Programador de Blocos', descricao: '...', eixo_bncc: 'Pensamento Computacional', icone: 'code_blocks', cor: '#7c3aed', criterio_tipo: 'concluir_blocos', criterio_meta: 1 },
    { id: 10, codigo: 'explorador_python_3d', titulo: 'Explorador Python 3D', descricao: '...', eixo_bncc: 'Pensamento Computacional', icone: 'deployed_code', cor: '#0284c7', criterio_tipo: 'concluir_python3d', criterio_meta: 6 },
  ];

  const submissoesPython = [];

  const usuarioMedalhas = [
    { id: 1, usuario_id: 10, medalha_id: 1, conquistada_em: '2026-10-12T10:00:00Z' },
  ];

  const desempenhoHabilidades = [
    { id: 1, usuario_id: 10, curso_id: 1, habilidade_codigo: 'EF01CO02', origem_tipo: 'atividade', origem_id: 'ordenar-escovar-dentes', pontuacao: 9.0, nivel_atingido: 'avancado', registrado_em: '2026-10-12T10:00:00Z' },
    { id: 2, usuario_id: 11, curso_id: 1, habilidade_codigo: 'EF01CO02', origem_tipo: 'atividade', origem_id: 'ordenar-escovar-dentes', pontuacao: 7.0, nivel_atingido: 'adequado', registrado_em: '2026-10-12T10:00:00Z' },
    { id: 3, usuario_id: 12, curso_id: 1, habilidade_codigo: 'EF01CO02', origem_tipo: 'atividade', origem_id: 'ordenar-escovar-dentes', pontuacao: 5.0, nivel_atingido: 'em_desenvolvimento', registrado_em: '2026-10-12T10:00:00Z' },
    { id: 4, usuario_id: 10, curso_id: 1, habilidade_codigo: 'EF69CO04', origem_tipo: 'atividade', origem_id: 'blocos-geometria-quadrado', pontuacao: 10.0, nivel_atingido: 'avancado', registrado_em: '2026-10-12T10:30:00Z' },
  ];

  const usuarios = [
    { id: 1, perfil: 'instrutor', nome: 'Profa. Marina', email: 'prof.marina@escola.gov.br' },
    { id: 10, perfil: 'aluno', nome: 'Pedro Santos', email: 'pedro@escola.gov.br' },
    { id: 11, perfil: 'aluno', nome: 'Sofia Oliveira', email: 'sofia@escola.gov.br' },
    { id: 12, perfil: 'aluno', nome: 'Lucas Ferreira', email: 'lucas@escola.gov.br' },
  ];

  const cursos = [
    { id: 1, titulo: 'Pensamento Computacional', eixo_bncc: 'Pensamento Computacional', ano_escolar: '1º ao 3º Ano', instrutor_id: 1 },
  ];

  const matriculas = [
    { id: 1, usuario_id: 10, curso_id: 1, status: 'ativa' },
    { id: 2, usuario_id: 11, curso_id: 1, status: 'ativa' },
    { id: 3, usuario_id: 12, curso_id: 1, status: 'ativa' },
  ];

  return {
    medalhas,
    usuarioMedalhas,
    desempenhoHabilidades,
    submissoesPython,
    matriculas,
    prepare(sql) {
      function criarOperacoes(params = []) {
        return {
          async first() {
            if (sql.includes('SELECT id FROM medalhas WHERE codigo = ?')) {
              const med = medalhas.find((m) => m.codigo === params[0]);
              return med ? { id: med.id } : null;
            }
            if (sql.includes('SELECT COUNT(DISTINCT atividade_id) AS total FROM submissoes_python')) {
              const usuarioId = params[0];
              const distintas = new Set(
                submissoesPython
                  .filter((s) => s.usuario_id === usuarioId && s.sucesso === 1 && String(s.atividade_id).startsWith('python3d-'))
                  .map((s) => s.atividade_id),
              );
              return { total: distintas.size };
            }
            if (sql.includes('sqlite_master') && sql.includes("name='medalhas'")) {
              return { name: 'medalhas' };
            }
            if (sql.includes('FROM usuarios WHERE id = ?')) {
              const usr = usuarios.find((u) => u.id === params[0]);
              return usr ? { ativo: 1, avatar_url: null, ...usr } : null;
            }
            throw new Error(`Consulta first() não prevista: ${sql}`);
          },
          async all() {
            if (sql.includes('FROM medalhas m')) {
              const usuarioId = params[0];
              const res = medalhas.map((m) => {
                const um = usuarioMedalhas.find((u) => u.medalha_id === m.id && u.usuario_id === usuarioId);
                return {
                  ...m,
                  conquistada: um ? 1 : 0,
                  conquistada_em: um ? um.conquistada_em : null,
                };
              });
              return { results: res };
            }
            if (sql.includes('FROM submissoes_python sp')) {
              let idxParam = 0;
              const filtroAtv = sql.includes('sp.atividade_id = ?') ? params[idxParam++] : null;
              const filtroInstrutor = sql.includes('cm.instrutor_id = ?') ? params[idxParam++] : null;
              const res = submissoesPython
                .filter((sp) => !filtroAtv || sp.atividade_id === filtroAtv)
                .filter((sp) => {
                  if (!filtroInstrutor) return true;
                  return matriculas.some((mt) => {
                    const crs = cursos.find((c) => c.id === mt.curso_id);
                    return mt.usuario_id === sp.usuario_id && crs?.instrutor_id === filtroInstrutor;
                  });
                })
                .map((sp) => {
                  const u = usuarios.find((usr) => usr.id === sp.usuario_id) || { nome: 'Estudante', email: 'a@e.br' };
                  return {
                    ...sp,
                    aluno_nome: u.nome,
                    aluno_email: u.email,
                  };
                });
              return { results: res };
            }
            if (sql.includes('FROM desempenho_habilidades dh')) {
              const res = desempenhoHabilidades.map((dh) => {
                const u = usuarios.find((usr) => usr.id === dh.usuario_id) || { nome: 'Aluno', email: 'a@e.br' };
                const c = cursos.find((crs) => crs.id === dh.curso_id) || { titulo: 'Curso', eixo_bncc: 'Geral', ano_escolar: '1º Ano' };
                return {
                  ...dh,
                  aluno_nome: u.nome,
                  aluno_email: u.email,
                  curso_titulo: c.titulo,
                  curso_eixo: c.eixo_bncc,
                  ano_escolar: c.ano_escolar,
                };
              });
              return { results: res };
            }
            throw new Error(`Consulta all() não prevista: ${sql}`);
          },
          async run() {
            if (sql.includes('CREATE TABLE IF NOT EXISTS')) {
              return { meta: {} };
            }
            if (sql.includes('INSERT INTO submissoes_python')) {
              const [usuarioId, atividadeId, codigoPython, tentativas, estrelas, parceiroDupla, papelDupla] = params;
              submissoesPython.push({
                id: submissoesPython.length + 1,
                usuario_id: usuarioId,
                atividade_id: atividadeId,
                codigo_python: codigoPython,
                sucesso: 1,
                tentativas: tentativas || 1,
                estrelas: estrelas || 3,
                parceiro_dupla: parceiroDupla || null,
                papel_dupla: papelDupla || null,
                criado_em: new Date().toISOString(),
              });
              return { meta: {} };
            }
            if (sql.includes('INSERT INTO desempenho_habilidades')) {
              const [usuarioId, cursoId, cod, origemId, pontuacao, nivelAtingido] = params;
              desempenhoHabilidades.push({
                id: desempenhoHabilidades.length + 1,
                usuario_id: usuarioId,
                curso_id: cursoId,
                habilidade_codigo: cod,
                origem_tipo: 'atividade',
                origem_id: origemId,
                pontuacao,
                nivel_atingido: nivelAtingido,
                registrado_em: new Date().toISOString(),
              });
              return { meta: {} };
            }
            if (sql.includes('INSERT OR IGNORE INTO usuario_medalhas')) {
              const [usuarioId, medalhaId] = params;
              if (!usuarioMedalhas.some((um) => um.usuario_id === usuarioId && um.medalha_id === medalhaId)) {
                usuarioMedalhas.push({
                  id: usuarioMedalhas.length + 1,
                  usuario_id: usuarioId,
                  medalha_id: medalhaId,
                  conquistada_em: new Date().toISOString(),
                });
              }
              return { meta: {} };
            }
            throw new Error(`Consulta run() não prevista: ${sql}`);
          },
        };
      }

      return {
        ...criarOperacoes([]),
        bind(...params) {
          return criarOperacoes(params);
        },
      };
    },
  };
}

test('listarMedalhas devolve o progresso do aluno por eixo da BNCC', async () => {
  const db = criarBancoCompleto();
  const token = await signJwt({ id: 10, perfil: 'aluno', email: 'pedro@escola.gov.br' }, SEGREDO);

  const req = new Request('https://lms.test/api/gamificacao/medalhas', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const resp = await listarMedalhas(req, { JWT_SECRET: SEGREDO }, db, new URL(req.url));
  assert.equal(resp.status, 200);

  const dados = await resp.json();
  assert.equal(dados.resumo.total, 5);
  assert.equal(dados.resumo.conquistadas, 1);
  assert.ok(dados.resumo.porEixo['Pensamento Computacional']);
  assert.equal(dados.resumo.porEixo['Pensamento Computacional'].conquistadas, 1);
  assert.equal(dados.medalhas.length, 5);
});

test('registrarAtividadeConcluida computa desempenho de habilidade BNCC e concede medalha', async () => {
  const db = criarBancoCompleto();
  const token = await signJwt({ id: 10, perfil: 'aluno', email: 'pedro@escola.gov.br' }, SEGREDO);

  const req = new Request('https://lms.test/api/gamificacao/concluir-atividade', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      atividadeId: 'blocos-geometria-quadrado',
      habilidades: ['EF69CO03', 'EF69CO04'],
      pontuacao: 10.0,
      cursoId: 1,
    }),
  });

  const resp = await registrarAtividadeConcluida(req, { JWT_SECRET: SEGREDO }, db);
  assert.equal(resp.status, 200);

  const dados = await resp.json();
  assert.equal(dados.sucesso, true);
  assert.equal(dados.habilidadesRegistradas, 2);
  assert.equal(dados.nivelAtingido, 'avancado');

  // Verifica que a medalha de programador_blocos foi inserida
  assert.ok(db.usuarioMedalhas.some((um) => um.usuario_id === 10 && um.medalha_id === 4));
});

test('obterRelatorioPedagogico agrega consolidação por habilidade BNCC', async () => {
  const db = criarBancoCompleto();
  const token = await signJwt({ id: 1, perfil: 'instrutor', email: 'prof.marina@escola.gov.br' }, SEGREDO);

  const req = new Request('https://lms.test/api/dashboard/relatorio-pedagogico', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const resp = await obterRelatorioPedagogico(req, { JWT_SECRET: SEGREDO }, db, new URL(req.url));
  assert.equal(resp.status, 200);

  const dados = await resp.json();
  assert.equal(dados.totalRegistros, 4);
  assert.equal(dados.totalHabilidadesAvaliadas, 2);

  const habEf01 = dados.habilidades.find((h) => h.codigo === 'EF01CO02');
  assert.ok(habEf01);
  assert.equal(habEf01.totalAlunos, 3);
  assert.equal(habEf01.totalAvaliacoes, 3);
  // (9 + 7 + 5) / 3 = 7.0
  assert.equal(habEf01.mediaPontuacao, 7.0);
  // 2 em 3 atingiram adequado ou avancado -> 67%
  assert.equal(habEf01.taxaConsolidacao, 67);
  assert.equal(habEf01.statusTurma, 'Adequada');
});

test('obterRelatorioPedagogico com formato CSV gera cabeçalho e dados de diário escolar', async () => {
  const db = criarBancoCompleto();
  const token = await signJwt({ id: 1, perfil: 'instrutor', email: 'prof.marina@escola.gov.br' }, SEGREDO);

  const req = new Request('https://lms.test/api/dashboard/relatorio-pedagogico?formato=csv', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const resp = await obterRelatorioPedagogico(req, { JWT_SECRET: SEGREDO }, db, new URL(req.url));
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('Content-Type'), 'text/csv; charset=utf-8');
  assert.ok(resp.headers.get('Content-Disposition').includes('relatorio-pedagogico-bncc.csv'));

  const textoCsv = await resp.text();
  assert.ok(textoCsv.includes('Aluno;Email;Curso;Eixo BNCC;Ano Escolar;Código Habilidade;Origem;Nota;Nível Atingido;Data'));
  assert.ok(textoCsv.includes('"Pedro Santos";"pedro@escola.gov.br"'));
  assert.ok(textoCsv.includes('"EF01CO02"'));
});

test('registrarAtividadeConcluida persiste código Python em submissoes_python e exige 6 missões reais no banco para conceder Explorador Python 3D', async () => {
  const db = criarBancoCompleto();
  const tokenAluno = await signJwt({ id: 10, perfil: 'aluno', email: 'pedro@escola.gov.br' }, SEGREDO);

  // Tentar forjar concluiuTodasPython3d com apenas 1 missão concluída NÃO concede a medalha
  const missoes = [
    'python3d-sequencia-labirinto',
    'python3d-condicionais-portas',
    'python3d-lacos-repeticao',
    'python3d-funcoes-decomposicao',
    'python3d-listas-ordenacao',
  ];

  const reqSpoof = new Request('https://lms.test/api/gamificacao/concluir-atividade', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenAluno}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      atividadeId: missoes[0],
      codigoPython: 'robo.mover()',
      tentativas: 1,
      estrelas: 3,
      concluiuTodasPython3d: true,
    }),
  });
  const respSpoof = await registrarAtividadeConcluida(reqSpoof, { JWT_SECRET: SEGREDO }, db);
  assert.equal(respSpoof.status, 200);
  const dadosSpoof = await respSpoof.json();
  assert.equal(dadosSpoof.medalhaExploradorPython3d, false);

  for (const idAtv of missoes.slice(1)) {
    const r = await registrarAtividadeConcluida(
      new Request('https://lms.test/api/gamificacao/concluir-atividade', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenAluno}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ atividadeId: idAtv, codigoPython: 'robo.mover()' }),
      }),
      { JWT_SECRET: SEGREDO },
      db,
    );
    assert.equal(r.status, 200);
  }

  // Na 6ª missão distinta, a medalha Explorador Python 3D é concedida
  const reqSexta = new Request('https://lms.test/api/gamificacao/concluir-atividade', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenAluno}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      atividadeId: 'python3d-recursao-hanoi',
      codigoPython: 'def hanoi(n, o, d, a):\n    hanoi.mover_disco(o, d)',
      tentativas: 1,
      estrelas: 3,
      parceiroDupla: 'Sofia Oliveira',
      papelDupla: 'piloto',
    }),
  });

  const resp = await registrarAtividadeConcluida(reqSexta, { JWT_SECRET: SEGREDO }, db);
  assert.equal(resp.status, 200);
  const dados = await resp.json();
  assert.equal(dados.sucesso, true);
  assert.equal(dados.medalhaExploradorPython3d, true);
  assert.equal(db.submissoesPython.length, 6);
  const ultima = db.submissoesPython[5];
  assert.equal(ultima.parceiro_dupla, 'Sofia Oliveira');
  assert.equal(ultima.papel_dupla, 'piloto');
  assert.ok(db.usuarioMedalhas.some((um) => um.usuario_id === 10 && um.medalha_id === 10));

  // Professor lista as submissões Python no dashboard
  const tokenProf = await signJwt({ id: 1, perfil: 'instrutor', email: 'prof.marina@escola.gov.br' }, SEGREDO);
  const reqLista = new Request('https://lms.test/api/dashboard/submissoes-python?atividade_id=python3d-recursao-hanoi', {
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenProf}` },
  });
  const respLista = await listarSubmissoesPython(reqLista, { JWT_SECRET: SEGREDO }, db, new URL(reqLista.url));
  assert.equal(respLista.status, 200);
  const dadosLista = await respLista.json();
  assert.equal(dadosLista.total, 1);
  assert.equal(dadosLista.submissoes[0].aluno_nome, 'Pedro Santos');
  assert.ok(dadosLista.submissoes[0].codigo_python.includes('mover_disco'));
});

test('visualizarCertificadoPython3dHtml escapa HTML contra XSS e indica pré-visualização quando não verificado', async () => {
  const db = criarBancoCompleto();
  const req = new Request('https://lms.test/api/certificados/python3d?aluno=Pedro%20%3Cscript%3Ealert(1)%3C/script%3E&dupla=Sofia%20Oliveira');
  const resp = await visualizarCertificadoPython3dHtml(req, {}, db, new URL(req.url));
  assert.equal(resp.status, 200);
  assert.ok(resp.headers.get('Content-Type').includes('text/html'));
  const html = await resp.text();
  assert.ok(html.includes('Explorador Python 3D'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.equal(html.includes('<script>alert(1)</script>'), false);
  assert.ok(html.includes('Sofia Oliveira'));
  assert.ok(html.includes('PRÉ-VISUALIZAÇÃO DEMONSTRATIVA'));
});
