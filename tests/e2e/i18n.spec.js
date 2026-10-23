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
});
