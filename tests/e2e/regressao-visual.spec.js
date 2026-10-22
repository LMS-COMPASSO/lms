import { test, expect } from '@playwright/test';

const PAGINAS_REGRESSAO = [
  { url: '/', nome: 'home' },
  { url: '/atividades.html', nome: 'catalogo-atividades' },
  { url: '/mundo-digital.html', nome: 'mundo-digital-3d' },
  { url: '/cultura-digital.html', nome: 'cultura-digital-chat' },
  { url: '/404.html', nome: 'erro-404' },
];

const RESOLUCOES = [
  { nome: 'mobile-360', largura: 360, altura: 640 },
  { nome: 'tablet-768', largura: 768, altura: 1024 },
  { nome: 'notebook-1024', largura: 1024, altura: 768 },
  { nome: 'desktop-1366', largura: 1366, altura: 768 },
];

test.describe('Regressão Visual Multi-resolução e Alto Contraste', () => {
  for (const pagina of PAGINAS_REGRESSAO) {
    for (const res of RESOLUCOES) {
      test(`Captura visual em ${pagina.nome} [${res.nome}] no modo padrão`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: res.largura, height: res.altura });
        await page.goto(pagina.url);
        await page.waitForLoadState('networkidle');

        // Garante que não haja scroll horizontal indesejado
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

        // Captura screenshot para anexo do relatório Playwright
        const snapshotNome = `${pagina.nome}-${res.nome}-padrao.png`;
        const screenshot = await page.screenshot({ animations: 'disabled' });
        await testInfo.attach(snapshotNome, {
          body: screenshot,
          contentType: 'image/png',
        });

        // Compara com baseline quando habilitado explicitamente
        if (process.env.COMPARE_SNAPSHOTS === 'true') {
          await expect(page).toHaveScreenshot(snapshotNome, {
            maxDiffPixelRatio: 0.02,
            animations: 'disabled',
          });
        }
      });

      test(`Captura visual em ${pagina.nome} [${res.nome}] com Alto Contraste ativado`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: res.largura, height: res.altura });
        await page.goto(pagina.url);
        await page.evaluate(() => document.documentElement.classList.add('a11y-alto-contraste'));
        await page.waitForTimeout(200);

        // Garante que não haja scroll horizontal no modo alto contraste
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

        const snapshotNome = `${pagina.nome}-${res.nome}-alto-contraste.png`;
        const screenshot = await page.screenshot({ animations: 'disabled' });
        await testInfo.attach(snapshotNome, {
          body: screenshot,
          contentType: 'image/png',
        });

        if (process.env.COMPARE_SNAPSHOTS === 'true') {
          await expect(page).toHaveScreenshot(snapshotNome, {
            maxDiffPixelRatio: 0.02,
            animations: 'disabled',
          });
        }
      });
    }
  }
});

