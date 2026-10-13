import assert from 'node:assert/strict';
import test from 'node:test';
import { signJwt } from '../src/worker/crypto_seguranca.js';
import { listarMedalhas, registrarAtividadeConcluida } from '../src/worker/routes/gamificacao_rotas.js';
import { obterRelatorioPedagogico } from '../src/worker/routes/dashboard_rotas.js';

const SEGREDO = 'segredo-de-teste-com-mais-de-32-caracteres!!';

function criarBancoCompleto() {
  const medalhas = [
    { id: 1, codigo: 'mestre_algoritmos', titulo: 'Mestre dos Algoritmos', descricao: '...', eixo_bncc: 'Pensamento Computacional', icone: 'format_list_numbered', cor: '#2563eb', criterio_tipo: 'concluir_atividade', criterio_meta: 1 },
    { id: 2, codigo: 'detetive_hardware_software', titulo: 'Mundo Digital', descricao: '...', eixo_bncc: 'Mundo Digital', icone: 'memory', cor: '#059669', criterio_tipo: 'concluir_aula', criterio_meta: 1 },
    { id: 3, codigo: 'guardiao_privacidade', titulo: 'Cultura Digital', descricao: '...', eixo_bncc: 'Cultura Digital', icone: 'verified_user', cor: '#d97706', criterio_tipo: 'concluir_aula', criterio_meta: 1 },
    { id: 4, codigo: 'programador_blocos', titulo: 'Programador de Blocos', descricao: '...', eixo_bncc: 'Pensamento Computacional', icone: 'code_blocks', cor: '#7c3aed', criterio_tipo: 'concluir_blocos', criterio_meta: 1 },
  ];

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

  return {
    medalhas,
    usuarioMedalhas,
    desempenhoHabilidades,
    prepare(sql) {
      function criarOperacoes(params = []) {
        return {
          async first() {
            if (sql.includes('SELECT id FROM medalhas WHERE codigo = ?')) {
              const med = medalhas.find((m) => m.codigo === params[0]);
              return med ? { id: med.id } : null;
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
  assert.equal(dados.resumo.total, 4);
  assert.equal(dados.resumo.conquistadas, 1);
  assert.ok(dados.resumo.porEixo['Pensamento Computacional']);
  assert.equal(dados.resumo.porEixo['Pensamento Computacional'].conquistadas, 1);
  assert.equal(dados.medalhas.length, 4);
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
