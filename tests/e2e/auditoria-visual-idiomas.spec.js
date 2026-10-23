import { test, expect } from '@playwright/test';

const IDIOMAS_TESTE = [
  { codigo: 'de', nome: 'Alemão (Deutsch)', ctaSpotlight: /Herausforderung starten|Aktivität fortsetzen/i },
  { codigo: 'uk', nome: 'Ucraniano (Українська)', ctaSpotlight: /Почати виклик|Розпочати|Продовжити/i },
  { codigo: 'ru', nome: 'Russo (Русский)', ctaSpotlight: /Начать задание|Возобновить задание|Пройти снова/i },
  { codigo: 'en', nome: 'Inglês (English)', ctaSpotlight: /Start Challenge|Resume Activity/i },
];

test.describe('Auditoria Visual e Alinhamento Multilíngue (Alemão, Ucraniano, Russo e Inglês)', () => {
  for (const idioma of IDIOMAS_TESTE) {
    test(`Valida layout, ausência de overflow e tradução no catálogo para ${idioma.nome}`, async ({ page }) => {
      await page.goto('/atividades.html');

      // Troca para o idioma alvo
      const botaoIdioma = page.locator('#btn-seletor-idioma');
      await botaoIdioma.click();
      const opcao = page.locator(`#opt-idioma-${idioma.codigo}`);
      await opcao.click();

      // Valida atributo lang no HTML
      await expect(page.locator('html')).toHaveAttribute('lang', idioma.codigo);

      // 1. Ausência de overflow horizontal
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // 2. Validação da Top Navigation: Sem colisão entre logo, links e botões de ação
      const logoBox = await page.locator('.pub-logo').boundingBox();
      const acoesBox = await page.locator('.pub-acoes').boundingBox();
      expect(logoBox).not.toBeNull();
      expect(acoesBox).not.toBeNull();
      if ((page.viewportSize()?.width || 0) > 1320) {
        expect(acoesBox.x).toBeGreaterThan(logoBox.x + logoBox.width);
        // Valida que NENHUM link da navegação colide ou fica atrás de .pub-acoes (ex: botão de busca)
        const navLinks = page.locator('.pub-nav a');
        const linkCount = await navLinks.count();
        for (let i = 0; i < linkCount; i++) {
          const linkBox = await navLinks.nth(i).boundingBox();
          if (linkBox) {
            expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(acoesBox.x + 2);
          }
        }
      }

      // 3. Spotlight Hero: Valida presença e visibilidade dos botões
      const btnPlay = page.locator('#btn-spotlight-play');
      await expect(btnPlay).toBeVisible();
      await expect(btnPlay).toHaveText(idioma.ctaSpotlight);

      const btnExplorar = page.locator('#btn-spotlight-explorar');
      await expect(btnExplorar).toBeVisible();

      // Valida que o botão de play não vaza para fora do container do hero
      const heroBox = await page.locator('.atv-spotlight').boundingBox();
      const playBox = await btnPlay.boundingBox();
      expect(playBox.x + playBox.width).toBeLessThanOrEqual(heroBox.x + heroBox.width + 10);

      // 4. Cards do catálogo: Valida dimensões, ícones não esmagados e sem overflow
      const cards = page.locator('.atv-card');
      const totalCards = await cards.count();
      expect(totalCards).toBeGreaterThan(0);

      for (let i = 0; i < Math.min(totalCards, 6); i++) {
        const card = cards.nth(i);
        const cardBox = await card.boundingBox();
        const icone = card.locator('.pub-icone');
        const iconeBox = await icone.boundingBox();

        // O ícone deve manter seu tamanho mínimo de 44px
        expect(iconeBox.width).toBeGreaterThanOrEqual(40);
        expect(iconeBox.height).toBeGreaterThanOrEqual(40);

        // O botão de ação deve estar perfeitamente contido dentro da largura do card
        const btnAcao = card.locator('.atv-card-acao a.btn');
        const btnBox = await btnAcao.boundingBox();
        expect(btnBox.x).toBeGreaterThanOrEqual(cardBox.x);
        expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 2);
      }
    });

    test(`Valida tradução dinâmica e alinhamento no Player de Atividade para ${idioma.nome}`, async ({ page }) => {
      await page.goto('/atividades.html?id=ordenar-escovar-dentes');

      // Troca para o idioma alvo
      const botaoIdioma = page.locator('#btn-seletor-idioma');
      await botaoIdioma.click();
      await page.locator(`#opt-idioma-${idioma.codigo}`).click();

      // Valida lang
      await expect(page.locator('html')).toHaveAttribute('lang', idioma.codigo);

      // Breadcrumbs e navegação sequencial
      const breadcrumbs = page.locator('.atv-breadcrumbs');
      await expect(breadcrumbs).toBeVisible();

      // Título da atividade no cabeçalho
      const titulo = page.locator('.atv-titulo-pagina');
      await expect(titulo).toBeVisible();
      const tituloTexto = await titulo.textContent();
      expect(tituloTexto.length).toBeGreaterThan(3);

      // Sem scroll horizontal
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test(`Valida tradução completa, 3D, PC Builder e simuladores em Mundo Digital para ${idioma.nome}`, async ({ page }) => {
      await page.goto('/mundo-digital.html');

      // Troca para o idioma alvo
      const botaoIdioma = page.locator('#btn-seletor-idioma');
      await botaoIdioma.click();
      await page.locator(`#opt-idioma-${idioma.codigo}`).click();

      // Valida atributo lang no HTML
      await expect(page.locator('html')).toHaveAttribute('lang', idioma.codigo);

      // 1. Ausência de overflow horizontal
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // 2. Valida tradução do Hero e CTAs
      const heroTitulo = page.locator('#titulo-mundo-digital');
      await expect(heroTitulo).toBeVisible();
      const heroDesc = page.locator('.md-descricao');
      await expect(heroDesc).toBeVisible();

      // 3. Valida painel holográfico de inspeção de hardware
      const tituloComp = page.locator('#painel-titulo-comp');
      await expect(tituloComp).toBeVisible();
      const descComp = page.locator('#painel-desc-comp');
      await expect(descComp).toBeVisible();

      // Clicar em outro componente (RAM) e verificar atualização
      const slotRam = page.locator('.md-slots-ram');
      await slotRam.click();
      await expect(page.locator('#painel-titulo-comp')).not.toHaveText('');

      // 4. Valida Desafio PC Builder
      const btnInstalar = page.locator('#btn-instalar-etapa');
      await expect(btnInstalar).toBeVisible();
      const progressoMontagem = page.locator('#texto-progresso-montagem');
      await expect(progressoMontagem).toBeVisible();

      // 5. Valida Ciclo da CPU
      const btnCpuPasso = page.locator('#btn-cpu-passo');
      await expect(btnCpuPasso).toBeVisible();
      await btnCpuPasso.click();

      // 6. Valida Simulador de Redes
      const btnEnviarPacote = page.locator('#btn-enviar-pacote');
      await expect(btnEnviarPacote).toBeVisible();
      const statusRede = page.locator('#pacote-status-txt');
      await expect(statusRede).toBeVisible();
    });

    test(`Valida tradução completa, ZapCompasso, Cofre de Senhas e Pegada Digital em Cultura Digital para ${idioma.nome}`, async ({ page }) => {
      await page.goto('/cultura-digital.html');

      // Troca para o idioma alvo
      const botaoIdioma = page.locator('#btn-seletor-idioma');
      await botaoIdioma.click();
      await page.locator(`#opt-idioma-${idioma.codigo}`).click();

      // Valida atributo lang no HTML
      await expect(page.locator('html')).toHaveAttribute('lang', idioma.codigo);

      // 1. Ausência de overflow horizontal
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

      // 2. Valida Hero e Título
      const heroTitulo = page.locator('#titulo-cultura-digital');
      await expect(heroTitulo).toBeVisible();
      const heroDesc = page.locator('.cd-descricao');
      await expect(heroDesc).toBeVisible();

      // 3. Valida ZapCompasso (Chat Interativo)
      const listaContatos = page.locator('.cd-item-conversa');
      expect(await listaContatos.count()).toBe(4);

      const contatoNome = page.locator('#chat-contato-nome');
      await expect(contatoNome).toBeVisible();
      expect((await contatoNome.textContent())?.trim().length).toBeGreaterThan(0);

      // Clica na 3ª opção de decisão (resposta exemplar)
      const opcoesDecisao = page.locator('.btn-opcao-decisao');
      await expect(opcoesDecisao.first()).toBeVisible();
      const ultimaOpcao = opcoesDecisao.nth(2);
      await ultimaOpcao.click();

      // Valida envio de balão e feedback pedagógico
      await page.waitForTimeout(1200);
      const balaoFeedback = page.locator('.cd-balao-alerta');
      await expect(balaoFeedback).toBeVisible();

      // 4. Valida Cofre Digital (Testador de Senhas)
      const inputSenha = page.locator('#input-teste-senha');
      await expect(inputSenha).toBeVisible();
      await inputSenha.fill('MinhaEscola#2026!');

      const statusSenha = page.locator('#status-senha-txt');
      await expect(statusSenha).toBeVisible();
      expect((await statusSenha.textContent())?.trim().length).toBeGreaterThan(0);

      // 5. Valida Medidor de Pegada Digital
      const chkPegada = page.locator('.cd-chk-pegada');
      expect(await chkPegada.count()).toBe(4);
      await chkPegada.first().check();

      const statusPegada = page.locator('#pegada-titulo-status');
      await expect(statusPegada).toBeVisible();
      expect((await statusPegada.textContent())?.trim().length).toBeGreaterThan(0);
    });
  }
});

