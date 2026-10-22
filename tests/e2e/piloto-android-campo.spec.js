import { test, expect } from '@playwright/test';

/**
 * LMS COMPASSO — TESTE DE CAMPO EM DISPOSITIVOS ANDROID DE ENTRADA
 * Simulação de hardware de entrada (Samsung Galaxy A03 / A05)
 * Especificações:
 *  - Resolução: 360 x 800 px (proporção 20:9 HD+)
 *  - DPR: 2.0
 *  - Toque: hasTouch: true, isMobile: true
 *  - Rede simulada: 3G Escolar (Latência: 150ms, Download: 1.6 Mbps, Upload: 750 kbps)
 *  - CPU simulada: Octa-core modesto (Unisoc T606 / Helio G85 com throttling 4x)
 */

const PERFIL_GALAXY_A05 = {
  name: 'Samsung Galaxy A03/A05 (360x800)',
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A055M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
};

test.describe('Piloto de Alunos — Simulação de Campo em Android de Entrada (Galaxy A03/A05)', () => {
  test.use(PERFIL_GALAXY_A05);
  test.slow();

  test.beforeEach(async ({ page, context }) => {
    // Aplica throttling de CPU (4x) e rede escolar 3G via Chrome DevTools Protocol
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150, // 150ms
      downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 kbps
      connectionType: 'cellular3g'
    });
  });

  test('Etapa 1: Acesso Inicial e Catálogo de Atividades com toque e zero overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Valida contenção estrita de rolagem horizontal
    const scrollWidthHome = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidthHome = await page.evaluate(() => window.innerWidth);
    expect(scrollWidthHome).toBeLessThanOrEqual(clientWidthHome);

    // Navega para o catálogo de atividades tocando no link
    await page.goto('/atividades.html');
    await page.waitForLoadState('domcontentloaded');

    const scrollWidthAtv = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidthAtv = await page.evaluate(() => window.innerWidth);
    expect(scrollWidthAtv).toBeLessThanOrEqual(clientWidthAtv);

    // Até 640px a trilha completa é ocultada e o link "Voltar para..." compacto é exibido;
    // acima disso acontece o inverso.
    const voltarMobile = page.locator('.atv-breadcrumbs .wf-breadcrumb-mobile-voltar');
    if (clientWidthAtv <= 640) {
      await expect(page.locator('.atv-breadcrumbs ol')).toBeHidden();
      await expect(voltarMobile).toBeVisible();
      const box = await voltarMobile.boundingBox();
      expect(box).not.toBeNull();
      // Alvo de toque mínimo recomendado para o link de retorno
      expect(box.height).toBeGreaterThanOrEqual(44);
    } else {
      await expect(page.locator('.atv-breadcrumbs ol')).toBeVisible();
      await expect(voltarMobile).toBeHidden();
    }
  });

  test('Etapa 2: Laboratório 3D da Placa-Mãe e Ciclo da CPU no celular 360px', async ({ page }) => {
    await page.goto('/mundo-digital.html');
    await page.waitForLoadState('domcontentloaded');

    // Verifica zero overflow
    const docW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docW).toBeLessThanOrEqual(360);

    // Alterna modos de perspectiva da placa-mãe via toque
    const btnTopo = page.locator('button[data-vista="topo"]');
    await btnTopo.tap();
    await expect(btnTopo).toHaveClass(/ativo/);

    const btnIso = page.locator('button[data-vista="isometrica"]');
    await btnIso.tap();
    await expect(btnIso).toHaveClass(/ativo/);

    // Toca no componente CPU para inspecionar
    const slotCpu = page.locator('.md-slot-cpu');
    await slotCpu.tap();
    const tituloComp = page.locator('#painel-titulo-comp');
    await expect(tituloComp).toContainText('CPU');

    // Simula avanço no Ciclo de Clock da CPU
    const btnPasso = page.locator('#btn-cpu-passo');
    await expect(btnPasso).toBeVisible();
    await btnPasso.tap();

    // Reconfirma ausência de rolagem horizontal após interação dinâmica
    const docWPos = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docWPos).toBeLessThanOrEqual(360);
  });

  test('Etapa 3: Simulador de Diálogo e Cofre de Senhas sem zoom indesejado', async ({ page }) => {
    await page.goto('/cultura-digital.html');
    await page.waitForLoadState('domcontentloaded');

    // Valida ausência de estouro
    const docW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docW).toBeLessThanOrEqual(360);

    // Verifica que o campo de senha tem font-size >= 16px para prevenir zoom no mobile
    const inputSenha = page.locator('#input-teste-senha');
    await expect(inputSenha).toBeVisible();
    const fontSize = await inputSenha.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(16);

    // Digita senha teste via toque e teclado virtual
    await inputSenha.click();
    await inputSenha.fill('Escola@2026!');

    // Verifica que os requisitos de senha e tempo de quebra foram calculados
    const tempoQuebra = page.locator('#tempo-quebra-txt');
    await expect(tempoQuebra).not.toBeEmpty();

    // Reconfirma ausência de rolagem horizontal
    const docWPos = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docWPos).toBeLessThanOrEqual(360);
  });

  test('Etapa 4: Instrumento Psicométrico SUS da Turma Piloto com alvos de toque >= 44px', async ({ page }) => {
    await page.goto('/usabilidade-piloto.html');
    await page.waitForLoadState('domcontentloaded');

    // Valida ausência de estouro
    const docW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docW).toBeLessThanOrEqual(360);

    // Valida alvos de toque na escala Likert da pesquisa SUS
    const labelsOpcao = page.locator('.sus-opcao-label');
    const totalOpcoes = await labelsOpcao.count();
    expect(totalOpcoes).toBe(50); // 10 perguntas * 5 opções

    // Amostra primeiras 5 opções verificando dimensões acessíveis
    for (let i = 0; i < 5; i++) {
      const box = await labelsOpcao.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    // Aluno preenche as 10 perguntas com notas positivas
    for (let q = 1; q <= 10; q++) {
      // Perguntas ímpares: 5 (concordo total); Perguntas pares: 1 (discordo total)
      const val = q % 2 === 1 ? '5' : '1';
      const radio = page.locator(`input[name="q${q}"][value="${val}"]`);
      await radio.check({ force: true });
    }

    // Verifica cálculo psicométrico em tempo real (100.0 pontos para respostas perfeitas)
    const scoreCalculado = page.locator('#previa-sus-score');
    await expect(scoreCalculado).toHaveText('100.0');

    // Preenchimento de dados de identificação do participante
    await page.fill('#nome-participante', 'Estudante Piloto Android');
    await page.fill('#comentarios-sus', 'Excelente legibilidade no Galaxy A05. Sem nenhum travamento ou texto cortado.');

    const btnEnviar = page.locator('button[type="submit"]');
    const boxBtn = await btnEnviar.boundingBox();
    expect(boxBtn.height).toBeGreaterThanOrEqual(44);

    // Confirma zero rolagem horizontal após preenchimento completo
    const docWFinal = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(docWFinal).toBeLessThanOrEqual(360);
  });
});
