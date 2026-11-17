import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CHAVE_STORAGE_IDIOMA,
  IDIOMAS_SUPORTADOS,
  DICIONARIO,
  obterIdiomaAtual,
  definirIdioma,
  t,
  obterInfoIdioma,
  obterLocaleIntl,
  formatarData,
  formatarNumero,
  definirRotuloComIcone,
  traduzirDocumento,
  montarSeletorIdioma,
} from '../public/js/i18n.js';

test('i18n: Suporte aos 9 idiomas do modelo visual de referência', () => {
  const codigosEsperados = ['en', 'uk', 'es', 'tr', 'it', 'de', 'fr', 'ru', 'pt'];
  assert.equal(IDIOMAS_SUPORTADOS.length, 9, 'Deve suportar exatamente os 9 idiomas');

  codigosEsperados.forEach((cod) => {
    const idioma = IDIOMAS_SUPORTADOS.find((i) => i.codigo === cod);
    assert.ok(idioma, `Idioma ${cod} deve estar configurado`);
    assert.ok(idioma.nativo, `Idioma ${cod} deve ter nome nativo`);
  });

  // Validação dos nomes nativos da referência visual anexada pelo usuário
  assert.equal(obterInfoIdioma('en').nativo, 'English');
  assert.equal(obterInfoIdioma('uk').nativo, 'Українська');
  assert.equal(obterInfoIdioma('es').nativo, 'Español');
  assert.equal(obterInfoIdioma('tr').nativo, 'Türkçe');
  assert.equal(obterInfoIdioma('it').nativo, 'Italiano');
  assert.equal(obterInfoIdioma('de').nativo, 'Deutsch');
  assert.equal(obterInfoIdioma('fr').nativo, 'Français');
  assert.equal(obterInfoIdioma('ru').nativo, 'Русский');
  assert.equal(obterInfoIdioma('pt').nativo, 'Português (Brasil)');
});

test('i18n: Tradução de chaves e interpolação de parâmetros', () => {
  // Mock localStorage
  const storage = {};
  global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
  };

  // 1. Português padrão
  storage[CHAVE_STORAGE_IDIOMA] = 'pt';
  assert.equal(t('nav.inicio'), 'Início');
  assert.equal(t('nav.atividades'), 'Atividades');
  assert.equal(t('spotlight.explorarGrade', { total: 15 }), 'Explorar Grade (15)');
  assert.equal(t('md.cpu.nome'), 'Processador Central (CPU)');
  assert.equal(t('md.pcEtapa1'), '1. Encaixar o Processador no Socket');
  assert.equal(t('cd.sec1Titulo'), 'ZapCompasso: Simulador de Diálogo e Cidadania');
  assert.equal(t('cd.chat.phishing.nome'), 'Leo (Colega de Jogo)');

  // 2. Inglês
  storage[CHAVE_STORAGE_IDIOMA] = 'en';
  assert.equal(t('nav.inicio'), 'Home');
  assert.equal(t('nav.atividades'), 'Activities');
  assert.equal(t('nav.entrar'), 'Sign in');
  assert.equal(t('nav.criarConta'), 'Create account');
  assert.equal(t('spotlight.comecarDesafio'), 'Start Challenge');
  assert.equal(t('spotlight.explorarGrade', { total: 20 }), 'Explore Grid (20)');
  assert.equal(t('md.cpu.nome'), 'Central Processing Unit (CPU)');
  assert.equal(t('md.pcEtapa1'), '1. Insert Processor into Socket');
  assert.equal(t('cd.sec1Titulo'), 'ZapCompasso: Dialogue & Citizenship Simulator');
  assert.equal(t('cd.chat.phishing.nome'), 'Leo (Gaming Pal)');

  // 3. Ucraniano
  storage[CHAVE_STORAGE_IDIOMA] = 'uk';
  assert.equal(t('nav.inicio'), 'Головна');
  assert.equal(t('md.cpu.nome'), 'Центральний процесор (CPU)');
  assert.equal(t('md.pcEtapa1'), '1. Встановити процесор у сокет');
  assert.equal(t('cd.sec1Titulo'), 'ZapCompasso: Симулятор діалогу та цифрового громадянства');
  assert.equal(t('cd.chat.phishing.nome'), 'Лео (Друг з гри)');

  // 4. Russo
  storage[CHAVE_STORAGE_IDIOMA] = 'ru';
  assert.equal(t('nav.inicio'), 'Главная');
  assert.equal(t('nav.atividades'), 'Задания');
  assert.equal(t('nav.entrar'), 'Войти');
  assert.equal(t('nav.criarConta'), 'Регистрация');
  assert.equal(t('spotlight.comecarDesafio'), 'Начать задание');
  assert.equal(t('spotlight.explorarGrade', { total: 20 }), 'Обзор сетки (20)');
  assert.equal(t('md.cpu.nome'), 'Центральный процессор (CPU)');
  assert.equal(t('md.pcEtapa1'), '1. Установить процессор в сокет');
  assert.equal(t('cd.sec1Titulo'), 'ZapCompasso: Симулятор диалога и цифрового гражданства');
  assert.equal(t('cd.chat.phishing.nome'), 'Лео (Друг по игре)');

  // 5. Demais idiomas (es, de, fr, it, tr) devem possuir suas traduções de Cultura Digital isoladas
  assert.deepEqual(
    Object.keys(DICIONARIO).sort(),
    ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'tr', 'uk'],
    'DICIONARIO não deve vazar chaves soltas fora dos 9 idiomas',
  );
  const esperadosCd = {
    es: 'ZapCompasso: Simulador de Diálogo y Ciudadanía',
    de: 'ZapCompasso: Dialog- & Bürgersinn-Simulator',
    fr: 'ZapCompasso: Simulateur de Dialogue et Citoyenneté',
    it: 'ZapCompasso: Simulatore di Dialogo e Cittadinanza',
    tr: 'ZapCompasso: Diyalog ve Dijital Vatandaşlık Simülatörü',
  };
  for (const [cod, tituloEsperado] of Object.entries(esperadosCd)) {
    storage[CHAVE_STORAGE_IDIOMA] = cod;
    assert.equal(t('cd.sec1Titulo'), tituloEsperado, `Idioma ${cod} deve traduzir cd.sec1Titulo`);
  }

  // 6. Fallback para chaves ausentes
  storage[CHAVE_STORAGE_IDIOMA] = 'pt';
  assert.equal(t('chave.inexistente', {}, 'Padrão'), 'Padrão');
});

test('i18n: definirIdioma atualiza lang no documentElement e dispara evento', () => {
  const eventosDisparados = [];
  const fakeDoc = {
    documentElement: { lang: 'pt-BR', dir: 'ltr' },
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null,
    createElement: () => ({ setAttribute: () => { }, appendChild: () => { } }),
    body: { appendChild: () => { } },
  };
  global.document = fakeDoc;
  global.window = {
    dispatchEvent: (evt) => eventosDisparados.push(evt),
  };
  if (typeof global.CustomEvent === 'undefined') {
    global.CustomEvent = class CustomEvent {
      constructor(name, opts = {}) {
        this.type = name;
        this.detail = opts.detail;
      }
    };
  }

  definirIdioma('en');
  assert.equal(fakeDoc.documentElement.lang, 'en', 'WCAG 3.1.1: lang deve ser atualizado para "en"');
  assert.equal(localStorage.getItem(CHAVE_STORAGE_IDIOMA), 'en');
  const evtOficial = eventosDisparados.find((e) => e.type === 'lms:idioma-alterado');
  const evtLegado = eventosDisparados.find((e) => e.type === 'idiomaAlterado');
  assert.ok(evtOficial, 'Deve disparar evento lms:idioma-alterado');
  assert.ok(evtLegado, 'Deve manter compatibilidade com evento idiomaAlterado');
  assert.equal(evtOficial.detail.idioma, 'en');

  // Volta para português (deve usar pt-BR)
  definirIdioma('pt');
  assert.equal(fakeDoc.documentElement.lang, 'pt-BR', 'Português deve declarar "pt-BR"');
});

test('i18n: Estrutura semântica e acessibilidade WAI-ARIA do seletor', () => {
  // Simula ambiente DOM mínimo
  const elementosCriados = [];
  function criarElementoMock(tag) {
    const attrs = {};
    const classes = new Set();
    const listeners = {};
    const filhos = [];

    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      type: '',
      hidden: false,
      tabIndex: 0,
      innerHTML: '',
      textContent: '',
      attributes: attrs,
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        toggle: (c, v) => (v ? classes.add(c) : classes.delete(c)),
        contains: (c) => classes.has(c),
      },
      className: '',
      setAttribute: (k, v) => {
        attrs[k] = String(v);
        if (k === 'id') el.id = String(v);
      },
      getAttribute: (k) => attrs[k] ?? (k === 'id' ? el.id : null),
      removeAttribute: (k) => { delete attrs[k]; },
      appendChild: (f) => { filhos.push(f); return f; },
      insertBefore: (f) => { filhos.unshift(f); return f; },
      querySelector: (sel) => {
        if (sel === '.seletor-idioma-wrapper') return null;
        if (sel === '#acao-entrar') return null;
        return null;
      },
      querySelectorAll: (sel) => {
        if (sel === '.opcao-idioma') return filhos.filter((f) => f.attributes.role === 'option');
        return [];
      },
      addEventListener: (evt, fn) => { listeners[evt] = fn; },
      contains: () => true,
      focus: () => { },
      children: filhos,
    };
    elementosCriados.push(el);
    return el;
  }

  global.document = {
    createElement: criarElementoMock,
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null,
    addEventListener: () => { },
  };

  const containerMock = criarElementoMock('div');
  containerMock.classList.add('pub-acoes');

  montarSeletorIdioma(containerMock);

  // Verifica existência do wrapper, botão gatilho e popover
  const wrapper = elementosCriados.find((e) => e.className === 'seletor-idioma-wrapper');
  assert.ok(wrapper, 'Wrapper do seletor deve ser criado');

  const botao = elementosCriados.find((e) => e.id === 'btn-seletor-idioma' || e.attributes.id === 'btn-seletor-idioma');
  assert.ok(botao, 'Botão de gatilho do seletor deve existir');
  assert.equal(botao.attributes['aria-haspopup'], 'listbox', 'Botão deve ter aria-haspopup="listbox"');
  assert.equal(botao.attributes['aria-expanded'], 'false', 'Botão deve iniciar com aria-expanded="false"');

  const popover = elementosCriados.find((e) => e.className === 'dropdown-idiomas-popover');
  assert.ok(popover, 'Popover deve ser criado');

  const notch = elementosCriados.find((e) => e.className === 'dropdown-idiomas-seta');
  assert.ok(notch, 'Notch triangular superior deve ser criado conforme modelo visual');

  const lista = elementosCriados.find((e) => e.attributes.role === 'listbox');
  assert.ok(lista, 'Lista de idiomas deve ter role="listbox"');

  const opcoes = elementosCriados.filter((e) => e.attributes.role === 'option');
  assert.equal(opcoes.length, 9, 'Deve haver 9 opções de idioma no listbox');

  // Cada opção deve ter lang correspondente para leitores de tela (WCAG 3.1.2)
  opcoes.forEach((opt) => {
    assert.ok(opt.attributes.lang, 'Cada opção de idioma deve declarar atributo lang');
  });
});

test('i18n: data-i18n-html renderiza apenas <span>/<em> sem innerHTML e ignora chaves ausentes/XSS', () => {
  localStorage.setItem(CHAVE_STORAGE_IDIOMA, 'pt');

  function criarNoMock(tag) {
    const filhos = [];
    const attrs = {};
    let texto = '';
    let atribuiuInnerHtml = false;
    return {
      tagName: tag.toUpperCase(),
      attributes: attrs,
      children: filhos,
      set innerHTML(_v) {
        atribuiuInnerHtml = true;
      },
      get _usouInnerHtml() {
        return atribuiuInnerHtml;
      },
      get textContent() {
        return texto || filhos.map((f) => (f.nodeType === 3 ? f.textContent : f.textContent)).join('');
      },
      set textContent(v) {
        texto = String(v);
        filhos.length = 0;
      },
      setAttribute: (k, v) => { attrs[k] = String(v); },
      getAttribute: (k) => attrs[k] ?? null,
      appendChild: (f) => { filhos.push(f); return f; },
    };
  }

  const elHero = criarNoMock('h1');
  elHero.setAttribute('data-i18n-html', 'md.heroTitulo');

  const elDica = criarNoMock('p');
  elDica.setAttribute('data-i18n-html', 'cd.dica2Desc');

  const elMalicioso = criarNoMock('p');
  elMalicioso.setAttribute('data-i18n-html', '<img src=x onerror=alert(1)>');
  elMalicioso.textContent = 'Conteúdo preservado';

  global.document = {
    documentElement: { lang: 'pt-BR', dir: 'ltr' },
    createElement: criarNoMock,
    createTextNode: (tVal) => ({ nodeType: 3, textContent: String(tVal) }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: (sel) => {
      if (sel === '[data-i18n-html]') return [elHero, elDica, elMalicioso];
      return [];
    },
  };

  traduzirDocumento();

  assert.equal(elHero._usouInnerHtml, false, 'Não deve atribuir innerHTML');
  assert.equal(elHero.children.length, 2);
  assert.equal(elHero.children[0].textContent, 'Mundo Digital: ');
  assert.equal(elHero.children[1].tagName, 'SPAN');
  assert.equal(elHero.children[1].textContent, 'Hardware & Redes');

  assert.equal(elDica._usouInnerHtml, false, 'Não deve atribuir innerHTML em em');
  assert.ok(elDica.children.some((c) => c.tagName === 'EM'), 'Deve criar nó <em> seguro');

  assert.equal(elMalicioso._usouInnerHtml, false);
  assert.equal(elMalicioso.textContent, 'Conteúdo preservado', 'Chave inexistente no DOM não deve ser ecoada');
});

test('i18n: Paridade estrita 1:1 entre os 9 dicionários, sem vazios e sem placeholders quebrados', () => {
  const idiomas = Object.keys(DICIONARIO).sort();
  assert.deepEqual(idiomas, ['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'tr', 'uk']);

  const basePt = DICIONARIO.pt;
  const chavesPt = Object.keys(basePt).sort();
  assert.ok(chavesPt.length >= 2500, `Catálogo i18n completo esperado (>=2500), encontrado ${chavesPt.length}`);

  const extrairParams = (s) => [...String(s).matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]).sort();
  const extrairTags = (s) => [...String(s).matchAll(/<\/?([a-z0-9-]+)\b[^>]*>/gi)].map((m) => m[0].toLowerCase().replace(/\s+/g, '')).sort();

  const chavesIdenticasPermitidas = new Set([
    'indexPage.altLogoGoogle',
    'md.gpu.spec2',
    'priv.r2c2',
    'robo.logDebugPasso',
    'ws.editor.checklistContagem',
  ]);
  const cognatosEspanholPermitidos = new Set([
    'cdetPage.marcoTitle',
    'certPage.tabelaAria',
    'comp.resumoEtapa',
    'indexPage.aba2',
    'indexPage.parceiroIfma',
    'indexPage.parceiroPython',
    'matPage.certificadoAria',
    'md.pcBuilderProgresso',
    'perfPage.a11yFonte',
    'planosPage.pfCursos',
    'rodape.culturaDigital',
    'spotlight.certificado3d',
    'spotlight.certificado3dEmitir',
    'spotlight.certificado3dTitulo',
    'trilha.marcoTitle',
    'ws.tpl.canvas.desc',
  ]);

  for (const lang of idiomas) {
    const dict = DICIONARIO[lang];
    const chavesLang = Object.keys(dict).sort();
    assert.deepEqual(chavesLang, chavesPt, `Dicionário "${lang}" deve possuir 100% das chaves de "pt"`);

    for (const chave of chavesPt) {
      const val = dict[chave];
      assert.equal(typeof val, 'string', `${lang}.${chave} deve ser string`);
      assert.ok(val.trim().length > 0, `${lang}.${chave} não pode ser vazio`);

      if (lang !== 'pt') {
        assert.deepEqual(
          extrairParams(val),
          extrairParams(basePt[chave]),
          `Placeholders divergentes em ${lang}.${chave}`,
        );
        assert.deepEqual(
          extrairTags(val),
          extrairTags(basePt[chave]),
          `Tags HTML inline divergentes em ${lang}.${chave}`,
        );

        const igualFraseLonga =
          val.trim() === basePt[chave].trim() &&
          basePt[chave].trim().length >= 30 &&
          !chavesIdenticasPermitidas.has(chave) &&
          !(lang === 'es' && cognatosEspanholPermitidos.has(chave)) &&
          !/^(?:LMS COMPASSO|EF\d|EM\d|HTTP|TCP)/.test(basePt[chave].trim());
        assert.equal(igualFraseLonga, false, `Possível string longa não traduzida em ${lang}.${chave}: "${val}"`);
      }
    }
  }
});

test('i18n: Todas as chaves data-i18n* e meta[i18n-title] das 22 páginas HTML existem em todos os idiomas', () => {
  const pastaPublic = path.resolve(process.cwd(), 'public');
  const htmlFiles = fs.readdirSync(pastaPublic).filter((f) => f.endsWith('.html')).sort();
  assert.equal(htmlFiles.length, 22, 'Deve validar exatamente 22 páginas HTML');

  const idiomas = Object.keys(DICIONARIO);
  for (const arquivo of htmlFiles) {
    const conteudo = fs.readFileSync(path.join(pastaPublic, arquivo), 'utf8');
    const chavesEncontradas = new Set();

    const mTitle = conteudo.match(/<meta\s+name="i18n-title"\s+content="([^"]+)"/i);
    assert.ok(mTitle, `${arquivo} deve declarar <meta name="i18n-title">`);
    chavesEncontradas.add(mTitle[1]);

    for (const m of conteudo.matchAll(/data-i18n(?:-[a-z-]+)?=(["'])([a-zA-Z0-9_.-]+)\1/g)) {
      if (!m[0].startsWith('data-i18n-attr=')) {
        chavesEncontradas.add(m[2]);
      }
    }
    for (const m of conteudo.matchAll(/data-i18n-attr=(["'])([^"']+)\1/g)) {
      for (const par of m[2].split(',')) {
        const k = par.split(':')[1]?.trim();
        if (k) chavesEncontradas.add(k);
      }
    }

    for (const chave of chavesEncontradas) {
      for (const lang of idiomas) {
        assert.ok(
          chave in DICIONARIO[lang] && DICIONARIO[lang][chave].trim().length > 0,
          `${arquivo}: chave "${chave}" ausente ou vazia em "${lang}"`,
        );
      }
    }
  }
});

test('i18n: Intl formatarNumero/formatarData, meta[i18n-title] e definirRotuloComIcone preservando SVG', () => {
  const storage = {};
  global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
  };

  storage[CHAVE_STORAGE_IDIOMA] = 'pt';
  assert.equal(obterLocaleIntl(), 'pt-BR');
  assert.equal(formatarNumero(1234.5, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), '1.234,5');
  assert.ok(formatarData('2026-05-10T12:00:00Z').includes('2026'));

  storage[CHAVE_STORAGE_IDIOMA] = 'en';
  assert.equal(obterLocaleIntl(), 'en-US');
  assert.equal(formatarNumero(1234.5, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), '1,234.5');

  // Testa atualização de document.title a partir de <meta name="i18n-title"> e preservação de <svg>
  const metaTitulo = { getAttribute: (k) => (k === 'content' ? 'nav.inicio' : null) };
  global.document = {
    documentElement: { lang: 'pt-BR', dir: 'ltr' },
    title: 'Inicial',
    createTextNode: (tVal) => ({ nodeType: 3, textContent: String(tVal) }),
    querySelector: (sel) => (sel === 'meta[name="i18n-title"]' ? metaTitulo : null),
    querySelectorAll: () => [],
    getElementById: () => null,
  };

  // 1) Botão com <svg> + <span> de texto
  const svgIcone = {
    nodeType: 1,
    tagName: 'SVG',
    nodeName: 'svg',
    classList: { contains: () => false },
    getAttribute: () => null,
  };
  const spanTexto = {
    nodeType: 1,
    tagName: 'SPAN',
    nodeName: 'SPAN',
    textContent: 'Original',
    classList: { contains: () => false },
    getAttribute: () => null,
    querySelector: () => null,
  };
  const espacoTxt = { nodeType: 3, textContent: ' ' };
  const btnComSpan = {
    childNodes: [svgIcone, espacoTxt, spanTexto],
    querySelector: (sel) => (sel.includes('svg') ? svgIcone : null),
    appendChild: (n) => { btnComSpan.childNodes.push(n); return n; },
    insertBefore: (n, ref) => {
      const idx = ref ? btnComSpan.childNodes.indexOf(ref) : -1;
      if (idx >= 0) btnComSpan.childNodes.splice(idx, 0, n);
      else btnComSpan.childNodes.push(n);
      return n;
    },
    removeChild: (n) => {
      const idx = btnComSpan.childNodes.indexOf(n);
      if (idx >= 0) btnComSpan.childNodes.splice(idx, 1);
      return n;
    },
    setAttribute: () => { },
    getAttribute: () => null,
  };
  definirRotuloComIcone(btnComSpan, 'Save Changes');
  assert.equal(btnComSpan.childNodes[0], svgIcone, 'Ícone <svg> filho deve permanecer intacto (com span)');
  assert.equal(spanTexto.textContent, 'Save Changes', 'Span de texto deve receber o novo rótulo');

  // 2) Botão com <svg> + nó texto direto
  const btnTextoDireto = {
    childNodes: [svgIcone, { nodeType: 3, textContent: ' Salvar' }],
    querySelector: (sel) => (sel.includes('svg') ? svgIcone : null),
    appendChild: (n) => { btnTextoDireto.childNodes.push(n); return n; },
    insertBefore: (n, ref) => {
      const idx = ref ? btnTextoDireto.childNodes.indexOf(ref) : -1;
      if (idx >= 0) btnTextoDireto.childNodes.splice(idx, 0, n);
      else btnTextoDireto.childNodes.push(n);
      return n;
    },
    removeChild: (n) => {
      const idx = btnTextoDireto.childNodes.indexOf(n);
      if (idx >= 0) btnTextoDireto.childNodes.splice(idx, 1);
      return n;
    },
  };
  definirRotuloComIcone(btnTextoDireto, 'Save Direct');
  assert.equal(btnTextoDireto.childNodes[0], svgIcone, 'Ícone <svg> filho deve permanecer intacto (nó direto)');
  assert.equal(btnTextoDireto.childNodes[1].textContent.trim(), 'Save Direct');

  traduzirDocumento();
  assert.equal(global.document.title, 'Home');
});
