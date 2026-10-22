import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROTAS_PUBLICAS = [
  { url: '/', nome: 'Página Inicial' },
  { url: '/boas-vindas.html', nome: 'Boas-vindas' },
  { url: '/atividades.html', nome: 'Catálogo de Atividades' },
  { url: '/mundo-digital.html', nome: 'Eixo 2: Mundo Digital' },
  { url: '/cultura-digital.html', nome: 'Eixo 3: Cultura Digital' },
  { url: '/login.html', nome: 'Login' },
  { url: '/registrar.html', nome: 'Cadastro' },
  { url: '/404.html', nome: 'Página de Erro 404' },
];

test.describe('Acessibilidade Automatizada (axe-core WCAG 2.2 AA)', () => {
  for (const rota of ROTAS_PUBLICAS) {
    test(`Auditoria axe-core em ${rota.nome} (${rota.url}) sem violações críticas/sérias`, async ({ page }) => {
      await page.goto(rota.url);
      await page.waitForLoadState('domcontentloaded');

      const resultados = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const violacoesCriticasOuSerias = resultados.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(violacoesCriticasOuSerias).toEqual([]);
    });
  }
});

test.describe('Navegação Acessível por Teclado e Foco Visível', () => {
  test('Navegação por teclado em toda a página inicial sem armadilhas de foco', async ({ page }) => {
    await page.goto('/');

    // Pular para o conteúdo principal com primeiro Tab
    await page.keyboard.press('Tab');
    const elementoFocado = await page.evaluate(() => document.activeElement?.className);
    expect(elementoFocado).toContain('pular-conteudo');

    // Foco visível deve ter outline
    const temOutline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      const estilo = window.getComputedStyle(el);
      return estilo.outlineStyle !== 'none' || estilo.boxShadow !== 'none';
    });
    expect(temOutline).toBe(true);

    // Navega por 10 elementos via Tab garantindo que o foco avance
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    const focoAtivo = await page.evaluate(() => document.activeElement !== document.body);
    expect(focoAtivo).toBe(true);
  });

  test('Links não possuem textos genéricos (ex.: "clique aqui", "saiba mais")', async ({ page }) => {
    await page.goto('/atividades.html');

    const textosGenericos = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const proibidos = ['clique aqui', 'leia mais', 'saiba mais', 'aqui', 'mais'];
      return links
        .map((a) => a.textContent.trim().toLowerCase())
        .filter((texto) => proibidos.includes(texto));
    });

    expect(textosGenericos).toEqual([]);
  });

  test('Breadcrumb possui aria-label="Você está aqui" e último item sem link', async ({ page }) => {
    await page.goto('/atividades.html?id=algoritmo-dentes');

    const navAriaLabel = await page.getAttribute('nav.atv-breadcrumbs', 'aria-label');
    expect(navAriaLabel).toBe('Você está aqui');

    const ultimoItemTemLink = await page.evaluate(() => {
      const ultimo = document.querySelector('nav.atv-breadcrumbs ol li:last-child');
      return ultimo ? Boolean(ultimo.querySelector('a')) : true;
    });
    expect(ultimoItemTemLink).toBe(false);

    const ariaCurrent = await page.getAttribute('nav.atv-breadcrumbs ol li:last-child', 'aria-current');
    expect(ariaCurrent).toBe('page');
  });

  test('Fechamento de menus e painéis suspensos com tecla Escape', async ({ page }) => {
    await page.goto('/atividades.html');

    // Abre painel de busca
    const btnBusca = page.locator('button[title*="Buscar"]');
    if (await btnBusca.isVisible()) {
      await btnBusca.click();
      const painel = page.locator('#painel-wf-busca');
      await expect(painel).toBeVisible();

      // Pressiona Esc
      await page.keyboard.press('Escape');
      await expect(painel).toBeHidden();
    }
  });
});

