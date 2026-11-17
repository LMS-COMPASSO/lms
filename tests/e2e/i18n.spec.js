import { test, expect } from '@playwright/test';

test.describe('Suporte a Idiomas e Seletor Acessível (i18n)', () => {
  test('Abre o dropdown de idiomas, seleciona English e valida tradução em tempo real', async ({ page }) => {
    // 1. Acessa catálogo de atividades
    await page.goto('/atividades.html');

    // Estado inicial em português
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    const botaoIdioma = page.locator('#btn-seletor-idioma');
    await expect(botaoIdioma).toBeVisible();
    await expect(botaoIdioma).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(botaoIdioma).toHaveAttribute('aria-expanded', 'false');

    // 2. Abre o seletor clicando no botão (ícone de globo + chevron)
    await botaoIdioma.click();
    await expect(botaoIdioma).toHaveAttribute('aria-expanded', 'true');

    const popover = page.locator('#popover-idiomas');
    await expect(popover).toBeVisible();

    // Valida existência da seta triangular superior (notch do modelo de referência)
    const notch = page.locator('.dropdown-idiomas-seta');
    await expect(notch).toBeVisible();

    // Valida opções de idiomas presentes
    const opcaoEnglish = page.locator('#opt-idioma-en');
    await expect(opcaoEnglish).toBeVisible();
    await expect(page.locator('#opt-idioma-uk')).toBeVisible();
    await expect(page.locator('#opt-idioma-es')).toBeVisible();
    await expect(page.locator('#opt-idioma-tr')).toBeVisible();
    await expect(page.locator('#opt-idioma-it')).toBeVisible();
    await expect(page.locator('#opt-idioma-de')).toBeVisible();
    await expect(page.locator('#opt-idioma-fr')).toBeVisible();
    await expect(page.locator('#opt-idioma-ru')).toBeVisible();
    await expect(page.locator('#opt-idioma-pt')).toBeVisible();

    // 3. Seleciona English
    await opcaoEnglish.click();
    await expect(popover).toBeHidden();

    // 4. Valida atualização imediata do atributo lang (WCAG 3.1.1)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // 5. Valida tradução dos botões de ação e links de navegação
    await expect(page.locator('#acao-entrar')).toContainText('Sign in');
    await expect(page.locator('#acao-cadastrar')).toContainText('Create account');

    // 6. Valida tradução da seção de atividades e filtros
    const inputBusca = page.locator('.atv-input-busca');
    await expect(inputBusca).toHaveAttribute('placeholder', /Search/i);
    await expect(page.locator('.atv-pill-tab').first()).toContainText('All');

    // 7. Persistência ao recarregar a página
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#acao-entrar')).toContainText('Sign in');

    // 8. Restaura para português
    await page.locator('#btn-seletor-idioma').click();
    await page.locator('#opt-idioma-pt').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('#acao-entrar')).toContainText('Entrar');
  });

  test('Navegação por teclado no seletor de idiomas (WAI-ARIA Listbox Pattern)', async ({ page }) => {
    await page.goto('/atividades.html');
    const botaoIdioma = page.locator('#btn-seletor-idioma');

    await botaoIdioma.focus();
    // Pressiona ArrowDown para abrir
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#popover-idiomas')).toBeVisible();

    // Pressiona Escape para fechar e retornar foco
    await page.keyboard.press('Escape');
    await expect(page.locator('#popover-idiomas')).toBeHidden();
    await expect(botaoIdioma).toBeFocused();
  });

  test('Troca integral de idioma (en e es) nas páginas críticas, preservação de SVGs e zero overflow', async ({ page }) => {
    // Helper de seleção robusta em páginas públicas e autenticadas
    const trocarIdioma = async (cod) => {
      await page.locator('.btn-seletor-idioma').first().click();
      await page.locator(`.dropdown-idiomas-popover:not([hidden]) .opcao-idioma[data-lang="${cod}"]`).first().click();
      await expect(page.locator('html')).toHaveAttribute('lang', cod);
    };

    // 1. index.html -> EN e ES + verificação de textos visíveis, <title> e zero overflow
    for (const alvo of [
      {
        cod: 'en',
        tituloRe: /Computer Science at school/i,
        btnEntrar: 'Sign in',
        btnCriar: 'Create account',
        proibidoPt: /\b(Você está|Atividades|Pensamento Computacional|Criar conta|Plataforma aberta)\b/,
      },
      {
        cod: 'es',
        tituloRe: /Computación en la escuela/i,
        btnEntrar: 'Iniciar sesión',
        btnCriar: 'Crear cuenta',
        proibidoPt: /\b(Você está|Atividades|Pensamento Computacional|Criar conta|Plataforma aberta)\b/,
      },
    ]) {
      await page.goto('/');
      await trocarIdioma(alvo.cod);
      await expect(page).toHaveTitle(alvo.tituloRe);
      await expect(page.locator('#acao-entrar')).toContainText(alvo.btnEntrar);
      await expect(page.locator('#acao-cadastrar')).toContainText(alvo.btnCriar);

      const auditoria = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
        const textosVisiveis = Array.from(document.querySelectorAll('h1, h2, h3, button, a.btn, [data-i18n]'))
          .filter((el) => el.offsetParent !== null)
          .map((el) => (el.innerText || '').trim())
          .join(' | ');
        return { overflow, textosVisiveis };
      });

      expect(auditoria.overflow).toBe(false);
      expect(auditoria.textosVisiveis).not.toMatch(alvo.proibidoPt);
    }

    // 2. planos.html -> Calculadora, moeda, modal e FAQ
    await page.goto('/planos.html');
    await trocarIdioma('en');
    await expect(page).toHaveTitle(/Plans & Subscriptions/i);
    await expect(page.locator('.plano-preco-moeda')).toContainText('BRL / month');
    await expect(page.locator('#btn-comprar-plano')).toContainText('Purchase');
    await page.locator('#btn-comprar-plano').click();
    await expect(page.locator('#modal-contrato-proposta')).toBeVisible();
    await expect(page.locator('#modal-resumo-valor')).toContainText('BRL / month');
    await page.locator('#modal-contrato-proposta .modal-fechar-btn').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);

    // 3. privacy.html -> Documentação legal + tabelas
    await page.goto('/privacy.html');
    await trocarIdioma('es');
    await expect(page).toHaveTitle(/Política de Privacidad/i);
    await expect(page.locator('#titulo-privacidade')).toContainText('Privacidad');
    const txtPriv = await page.locator('main').innerText();
    expect(txtPriv).not.toMatch(/\b(Você tem direito|Armazenamento Local|Última atualização em)\b/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);

    // 4. atividades.html -> Spotlight, filtros, zero overflow em EN e ES
    await page.goto('/atividades.html');
    await trocarIdioma('en');
    await expect(page).toHaveTitle(/Activities & 3D Lab/i);
    await expect(page.locator('#btn-spotlight-play')).toContainText(/Start Challenge|Resume Activity/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);

    // 5. workspace.html -> Colunas Kanban, Visão Tabela e preservação integral de ícones <svg>
    await page.goto('/workspace.html');
    await page.locator('#workspace-raiz .ws-btn-visao').first().waitFor({ state: 'visible' });
    const svgsAntes = await page.locator('#workspace-raiz button svg').count();
    expect(svgsAntes).toBeGreaterThan(0);

    await trocarIdioma('en');
    await expect(page).toHaveTitle(/Workspace & Idea Hub/i);
    await expect(page.locator('#ws-col-ideia')).toContainText('Idea / Backlog');
    await expect(page.locator('#ws-col-planejando')).toContainText('Planning');
    await expect(page.locator('#ws-col-execucao')).toContainText('In Progress');
    await expect(page.locator('#ws-col-concluido')).toContainText('Completed / Published');
    await expect(page.locator('.ws-btn-visao[data-visao="galeria"]')).toContainText('Idea Gallery');
    await expect(page.locator('.ws-btn-visao[data-visao="tabela"]')).toContainText('Structured Table');
    expect(await page.locator('#workspace-raiz button svg').count()).toBeGreaterThanOrEqual(svgsAntes);

    await trocarIdioma('es');
    await expect(page.locator('#ws-col-planejando')).toContainText('Planificando');
    await expect(page.locator('#ws-col-execucao')).toContainText('En Ejecución');
    await expect(page.locator('#ws-col-concluido')).toContainText('Completado / Publicado');
    await expect(page.locator('.ws-btn-visao[data-visao="galeria"]')).toContainText('Galería de Ideas');
    expect(await page.locator('#workspace-raiz button svg').count()).toBeGreaterThanOrEqual(svgsAntes);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });

  test('Troca de idioma e LGPD Art. 18 na página autenticada /perfil.html', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('lms_token', 'token-e2e-valido');
      localStorage.setItem('lms_usuario', JSON.stringify({
        id: 77,
        nome: 'Estudante Piloto E2E',
        email: 'estudante.e2e@escola.edu.br',
        perfil: 'aluno',
      }));
    });

    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/api/preferencias')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tema: 'claro', preferencia_contraste: 0, lingua_simples: 0 }) });
      }
      if (url.includes('/api/gamificacao/avaliar')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ avaliadas: 0 }) });
      }
      if (url.includes('/api/gamificacao/medalhas')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            medalhas: [{
              codigo: 'primeiro_passo',
              titulo: 'Primeiro Passo na Computação',
              descricao: 'Concluiu a primeira atividade interativa ou aula no LMS.',
              eixo_bncc: 'Geral',
              icone: 'rocket_launch',
              cor: '#3b82f6',
              conquistada: 1,
              conquistada_em: '2026-05-01T10:00:00Z',
            }],
            resumo: { total: 8, conquistadas: 1, percentualConclusao: 13 },
          }),
        });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.goto('/perfil.html');
    await expect(page.locator('#btn-exportar-dados-lgpd')).toBeVisible();

    await page.locator('.btn-seletor-idioma').first().click();
    await page.locator('.dropdown-idiomas-popover:not([hidden]) .opcao-idioma[data-lang="en"]').first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/My Profile/i);
    await expect(page.locator('#btn-exportar-dados-lgpd')).toContainText('Export my data (JSON)');
    await expect(page.locator('#btn-apagar-workspace-lgpd')).toContainText('Delete all my items (Workspace)');
    await expect(page.locator('#grade-medalhas')).toContainText('First Step in Computing');

    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
});
