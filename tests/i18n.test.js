import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CHAVE_STORAGE_IDIOMA,
  IDIOMAS_SUPORTADOS,
  DICIONARIO,
  obterIdiomaAtual,
  definirIdioma,
  t,
  obterInfoIdioma,
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

  // 5. Fallback para chaves ausentes
  assert.equal(t('chave.inexistente', {}, 'Padrão'), 'Padrão');
});

test('i18n: definirIdioma atualiza lang no documentElement e dispara evento', () => {
  const eventosDisparados = [];
  const fakeDoc = {
    documentElement: { lang: 'pt-BR', dir: 'ltr' },
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null,
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }),
    body: { appendChild: () => {} },
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
  assert.equal(eventosDisparados.length, 1);
  assert.equal(eventosDisparados[0].detail.idioma, 'en');

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
      focus: () => {},
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
    addEventListener: () => {},
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
