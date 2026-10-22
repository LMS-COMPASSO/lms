import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  Breadcrumb,
  NavMenu,
  Icon,
  ProgressTrail,
  SectionHeader,
  BackNextBar,
  EmptyState,
  ErrorState,
} from '../public/js/componentes-ui.js';

const PUBLIC_DIR = new URL('../public/', import.meta.url).pathname;

test('Pilar 3 - Consistência Visual: Títulos de páginas e branding padronizado (LMS COMPASSO)', () => {
  const paginasHtml = fs.readdirSync(PUBLIC_DIR).filter((f) => f.endsWith('.html'));
  assert.ok(paginasHtml.length >= 10, 'Deve haver ao menos 10 páginas HTML auditadas');

  for (const pagina of paginasHtml) {
    const conteudo = fs.readFileSync(path.join(PUBLIC_DIR, pagina), 'utf8');

    // Idioma pt-BR
    assert.match(conteudo, /<html\s+lang="pt-BR"/i, `${pagina}: deve declarar lang="pt-BR"`);

    // Viewport responsivo
    assert.match(conteudo, /name="viewport"/i, `${pagina}: deve conter meta viewport`);

    // Branding consistente no título
    if (pagina === 'index.html') {
      assert.match(conteudo, /<title>LMS COMPASSO\s*—.*<\/title>/i, `${pagina}: título deve conter "LMS COMPASSO"`);
    } else if (pagina !== 'compartilhar.html') {
      assert.match(conteudo, /<title>.*—\s*LMS COMPASSO<\/title>/i, `${pagina}: título deve terminar com "— LMS COMPASSO"`);
    }

    // Acessibilidade: link de pular conteúdo nas páginas com header/conteúdo
    if (['index.html', 'boas-vindas.html', 'mundo-digital.html', 'cultura-digital.html', '404.html'].includes(pagina)) {
      assert.match(conteudo, /class="pular-conteudo"/, `${pagina}: deve conter link de pular para o conteúdo principal`);
    }
  }
});

test('Pilar 3 - Consistência de Vocabulário: Termo padrão "Atividade" e "Criar conta"', () => {
  const loginHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'login.html'), 'utf8');
  const registrarHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'registrar.html'), 'utf8');

  // Não deve usar termos legados dispersos
  assert.ok(!loginHtml.includes('Cadastre-se como aluno'), 'login.html deve usar "Criar conta" em vez de "Cadastre-se como aluno"');
  assert.ok(loginHtml.includes('Criar conta'), 'login.html deve referenciar "Criar conta"');

  assert.ok(!registrarHtml.includes('Fazer login'), 'registrar.html deve usar "Entrar na plataforma"');
  assert.ok(registrarHtml.includes('Entrar na plataforma'), 'registrar.html deve referenciar "Entrar na plataforma"');

  // Botões principais devem usar btn-primario
  assert.ok(registrarHtml.includes('class="btn btn-primario btn-bloco"'), 'registrar.html deve usar .btn-primario para ação principal');
  assert.ok(loginHtml.includes('class="btn btn-primario btn-bloco"'), 'login.html deve usar .btn-primario para ação principal');
});

test('Pilar 3 - Componentes Reutilizáveis: Breadcrumb, NavMenu, Icon, ProgressTrail, SectionHeader, BackNextBar, EmptyState/ErrorState', () => {
  // 1. Breadcrumb
  const breadcrumbHtml = Breadcrumb({
    itens: [
      { rotulo: 'Início', href: '/' },
      { rotulo: 'Pensamento Computacional', href: '/atividades.html' },
      { rotulo: 'EF05CO01', href: '/atividades.html?hab=EF05CO01' },
      { rotulo: 'Atividade 3: Labirinto 3D' },
    ],
    mobileVoltar: { href: '/atividades.html', rotulo: 'Trilhas' },
  });
  assert.ok(breadcrumbHtml.includes('aria-label="Você está aqui"'), 'Breadcrumb deve ter aria-label="Você está aqui"');
  assert.ok(breadcrumbHtml.includes('wf-breadcrumb-mobile-voltar'), 'Breadcrumb deve ter link compacto mobile');
  assert.ok(breadcrumbHtml.includes('aria-current="page"'), 'Breadcrumb deve ter aria-current="page" no último item');
  assert.ok(breadcrumbHtml.includes('Atividade 3: Labirinto 3D'), 'Breadcrumb deve exibir título da atividade');

  // 2. NavMenu
  const navMenuHtml = NavMenu({
    itens: [
      { chave: 'cursos', href: '/cursos.html', label: 'Cursos', icone: 'menu_book', secao: 'aluno' },
      { chave: 'atividades', href: '/atividades.html', label: 'Atividades', icone: 'format_list_numbered', secao: 'pensamento' },
    ],
    ativo: 'atividades',
  });
  assert.ok(navMenuHtml.includes('aria-label="Menu principal"'), 'NavMenu deve ter aria-label');
  assert.ok(navMenuHtml.includes('aria-current="page"'), 'NavMenu deve marcar item ativo com aria-current="page"');
  assert.ok(navMenuHtml.includes('nav-item-indicador'), 'NavMenu deve ter indicador visual');

  // 3. Icon
  const iconDecorativo = Icon({ nome: 'settings', tamanho: 20 });
  assert.ok(iconDecorativo.includes('aria-hidden="true"'), 'Ícone decorativo deve ter aria-hidden="true"');
  assert.ok(iconDecorativo.includes('width="20" height="20"'), 'Ícone deve respeitar tamanho 20px');

  const iconFuncional = Icon({ nome: 'search', tamanho: 24, rotulo: 'Buscar no catálogo', decorativo: false });
  assert.ok(iconFuncional.includes('aria-label="Buscar no catálogo"'), 'Ícone funcional deve ter aria-label');

  // 4. ProgressTrail
  const progressHtml = ProgressTrail({
    etapaAtual: 3,
    totalEtapas: 6,
    titulo: 'Mundo Digital',
    marcos: [
      { etapa: 1, titulo: 'Placa-Mãe 3D', estado: 'concluido' },
      { etapa: 2, titulo: 'Ciclo CPU', estado: 'concluido' },
      { etapa: 3, titulo: 'Roteamento de Pacotes', estado: 'em-andamento' },
      { etapa: 4, titulo: 'Cultura Digital', estado: 'nao-iniciado' },
    ],
  });
  assert.ok(progressHtml.includes('role="progressbar"'), 'ProgressTrail deve ter role="progressbar"');
  assert.ok(progressHtml.includes('aria-valuenow="3"'), 'ProgressTrail deve ter aria-valuenow="3"');
  assert.ok(progressHtml.includes('estado-concluido'), 'ProgressTrail deve conter estado concluído');
  assert.ok(progressHtml.includes('estado-em-andamento'), 'ProgressTrail deve conter estado em andamento');

  // 5. SectionHeader
  const headerHtml = SectionHeader({
    secao: 'pensamento',
    titulo: 'Pensamento Computacional',
    subtitulo: 'Algoritmos e lógica com o Laboratório 3D Python',
    badgeTexto: 'Eixo 1 BNCC',
    badgeIcone: 'format_list_numbered',
  });
  assert.ok(headerHtml.includes('data-secao="pensamento"'), 'SectionHeader deve carregar data-secao');
  assert.ok(headerHtml.includes('secao-pista-badge'), 'SectionHeader deve carregar secao-pista-badge');
  assert.ok(headerHtml.includes('Pensamento Computacional'), 'SectionHeader deve exibir o título');

  // 6. BackNextBar
  const barHtml = BackNextBar({
    voltar: { href: '/cursos.html', rotulo: 'Cursos' },
    avancar: { href: '/mundo-digital.html', rotulo: 'Mundo Digital' },
    mapaEtapaTexto: 'Etapa 2 de 6',
  });
  assert.ok(barHtml.includes('seta-voltar'), 'BackNextBar deve ter classe seta-voltar');
  assert.ok(barHtml.includes('seta-proximo'), 'BackNextBar deve ter classe seta-proximo');
  assert.ok(barHtml.includes('Voltar: Cursos'), 'BackNextBar deve ter texto descritivo');
  assert.ok(barHtml.includes('Mundo Digital'), 'BackNextBar deve ter texto de avanço');

  // 7. EmptyState e ErrorState
  const emptyHtml = EmptyState({
    titulo: 'Nenhuma atividade encontrada',
    descricao: 'Tente outro termo ou limpe os filtros.',
    acaoPrimaria: { href: '/', rotulo: 'Ir para o início' },
    acaoSecundaria: { href: '/atividades.html', rotulo: 'Ver todas as atividades' },
  });
  assert.ok(emptyHtml.includes('estado-saida-404'), 'EmptyState deve conter classe de saída');
  assert.ok(emptyHtml.includes('Ir para o início'), 'EmptyState deve ter ação de início');
  assert.ok(emptyHtml.includes('type="search"'), 'EmptyState deve ter busca integrada');

  const errorHtml = ErrorState({
    codigo: 404,
    titulo: 'Página não encontrada',
    descricao: 'O endereço digitado não existe.',
  });
  assert.ok(errorHtml.includes('Página não encontrada'), 'ErrorState deve ter título');
});

test('Pilar 3 - Tokens de Espaçamento e Tipografia Fluida no CSS', () => {
  const css = fs.readFileSync(path.join(PUBLIC_DIR, 'css/style.css'), 'utf8');

  // Escala de espaçamento 4/8px
  const espacos = ['--espaco-1', '--espaco-2', '--espaco-3', '--espaco-4', '--espaco-6', '--espaco-8'];
  for (const esp of espacos) {
    assert.ok(css.includes(esp), `style.css deve conter token de espaçamento ${esp}`);
  }

  // Tipografia fluida clamp()
  const fontes = ['--fonte-h1', '--fonte-h2', '--fonte-h3', '--fonte-corpo'];
  for (const fnt of fontes) {
    assert.ok(css.includes(fnt), `style.css deve conter token tipográfico ${fnt}`);
  }

  // Classes de proporção de imagem e ilustrações
  assert.ok(css.includes('.img-proporcao-16-9'), 'style.css deve conter .img-proporcao-16-9');
  assert.ok(css.includes('.img-proporcao-1-1'), 'style.css deve conter .img-proporcao-1-1');
  assert.ok(css.includes('.img-proporcao-4-3'), 'style.css deve conter .img-proporcao-4-3');
  assert.ok(css.includes('.miniatura-atividade'), 'style.css deve conter .miniatura-atividade');
});

test('Persistência D1 e Cálculo Psicométrico SUS (Brooke, 1996) com Turma Piloto', async () => {
  const { calcularEscoreSus } = await import('../src/worker/routes/usabilidade_rotas.js');

  // Teste de cálculo perfeito: respostas 5 nas ímpares e 1 nas pares = 100.0
  const perfeito = calcularEscoreSus({
    q1: 5, q2: 1, q3: 5, q4: 1, q5: 5,
    q6: 1, q7: 5, q8: 1, q9: 5, q10: 1,
  });
  assert.equal(perfeito, 100.0);

  // Teste de cálculo pior caso: respostas 1 nas ímpares e 5 nas pares = 0.0
  const pior = calcularEscoreSus({
    q1: 1, q2: 5, q3: 1, q4: 5, q5: 1,
    q6: 5, q7: 1, q8: 5, q9: 1, q10: 5,
  });
  assert.equal(pior, 0.0);

  // Teste de cálculo neutro: todas respostas 3 = 50.0
  const neutro = calcularEscoreSus({
    q1: 3, q2: 3, q3: 3, q4: 3, q5: 3,
    q6: 3, q7: 3, q8: 3, q9: 3, q10: 3,
  });
  assert.equal(neutro, 50.0);

  // Teste de resposta típica de aluno piloto do IFMA (Pedro Santos)
  const alunoPedro = calcularEscoreSus({
    q1: 5, q2: 1, q3: 5, q4: 1, q5: 5,
    q6: 1, q7: 5, q8: 1, q9: 5, q10: 1,
  });
  assert.equal(alunoPedro, 100.0);

  // Validação da tabela d1/schema.sql e seed.sql
  const schemaSql = fs.readFileSync(path.join(PUBLIC_DIR, '../d1/schema.sql'), 'utf8');
  assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS preferencias_usuario'), 'schema.sql deve conter preferencias_usuario');
  assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS avaliacoes_usabilidade_sus'), 'schema.sql deve conter avaliacoes_usabilidade_sus');

  const seedSql = fs.readFileSync(path.join(PUBLIC_DIR, '../d1/seed.sql'), 'utf8');
  assert.ok(seedSql.includes('IFMA Campus Grajaú - 5º Ano A'), 'seed.sql deve conter registros da turma piloto do IFMA');
  assert.ok(seedSql.includes('Profa. Marina Silva'), 'seed.sql deve conter avaliação de usabilidade de docente');
});

