import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function registrarMonitoresPagina(page) {
  const errosRuntime = [];
  const falhasRede = [];

  page.on('pageerror', (err) => errosRuntime.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errosRuntime.push(`console.error: ${msg.text()}`);
    }
  });
  page.on('response', (resp) => {
    const url = resp.url();
    if ((url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) && resp.status() >= 400) {
      falhasRede.push(`HTTP ${resp.status()} em ${url}`);
    }
  });

  return { errosRuntime, falhasRede };
}

async function auditarGeometriaAtivos(page) {
  return page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const innerWidth = window.innerWidth;

    const imagensVisiveisQuebradas = [];
    for (const img of document.querySelectorAll('img')) {
      const style = window.getComputedStyle(img);
      const rect = img.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
        continue;
      }
      if (!img.complete || img.naturalWidth === 0) {
        imagensVisiveisQuebradas.push(img.getAttribute('src') || '(sem src)');
      }
    }

    const svgsZerados = [];
    for (const svg of document.querySelectorAll('svg')) {
      if (svg.closest('.oculto, [hidden]')) continue;
      let ancestorOculto = false;
      let atual = svg;
      while (atual && atual.nodeType === 1) {
        const st = window.getComputedStyle(atual);
        if (st.display === 'none' || st.visibility === 'hidden') {
          ancestorOculto = true;
          break;
        }
        atual = atual.parentElement;
      }
      if (ancestorOculto) continue;
      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        svgsZerados.push(svg.className?.baseVal || svg.outerHTML.slice(0, 80));
      }
    }

    const usesQuebrados = [];
    for (const useEl of document.querySelectorAll('svg use')) {
      const href = useEl.getAttribute('href') || useEl.getAttribute('xlink:href') || '';
      if (!href) {
        usesQuebrados.push('use sem href');
        continue;
      }
      if (href.startsWith('#')) {
        const alvo = document.getElementById(href.slice(1));
        if (!alvo) usesQuebrados.push(`symbol inexistente: ${href}`);
      }
    }

    return {
      semOverflowHorizontal: scrollWidth <= innerWidth + 1,
      scrollWidth,
      innerWidth,
      imagensVisiveisQuebradas,
      svgsZerados,
      usesQuebrados,
    };
  });
}

test.describe('Workspace Notion, GSAP & Acervo Visual E2E', () => {
  test('Saúde de browser, geometria, imagens, SVGs, sprite de 48+ ícones e rotas jurídicas', async ({ page }) => {
    const { errosRuntime, falhasRede } = registrarMonitoresPagina(page);

    const rotasAuditadas = [
      '/',
      '/workspace.html',
      '/atividades.html',
      '/mundo-digital.html',
      '/cultura-digital.html',
      '/privacy.html',
      '/terms.html',
      '/privacy',
      '/privacidade',
      '/terms',
      '/termos',
    ];

    for (const rota of rotasAuditadas) {
      await page.goto(rota);
      await page.waitForLoadState('networkidle');
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
          img.loading = 'eager';
        });
        await Promise.all(
          Array.from(document.images).map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.addEventListener('load', resolve, { once: true });
                  img.addEventListener('error', resolve, { once: true });
                })
          )
        );
      });

      const geo = await auditarGeometriaAtivos(page);
      expect(geo.semOverflowHorizontal, `Overflow em ${rota}: ${geo.scrollWidth} > ${geo.innerWidth}`).toBe(true);
      expect(geo.imagensVisiveisQuebradas, `Imagens quebradas em ${rota}`).toEqual([]);
      expect(geo.svgsZerados, `SVGs com dimensão zerada em ${rota}`).toEqual([]);
      expect(geo.usesQuebrados, `<use> quebrado em ${rota}`).toEqual([]);

      if (rota === '/privacy.html' || rota === '/terms.html' || rota === '/privacidade' || rota === '/termos') {
        const legalAudit = await page.evaluate(() => {
          const h1 = document.querySelector('.legal-hero h1');
          const h2 = document.querySelector('.legal-artigo h2');
          const h3 = document.querySelector('.legal-artigo h3');
          const destaque = document.querySelector('.legal-destaque-box');
          const tabelaWrap = document.querySelector('.legal-tabela-wrap');

          const fsH1 = h1 ? Number.parseFloat(window.getComputedStyle(h1).fontSize) : 0;
          const fsH2 = h2 ? Number.parseFloat(window.getComputedStyle(h2).fontSize) : 0;
          const fsH3 = h3 ? Number.parseFloat(window.getComputedStyle(h3).fontSize) : 0;
          const bordaEsq = destaque ? Number.parseFloat(window.getComputedStyle(destaque).borderLeftWidth) : 1;
          const paddingTab = tabelaWrap ? Number.parseFloat(window.getComputedStyle(tabelaWrap).paddingLeft) : 12;

          return { fsH1, fsH2, fsH3, bordaEsq, paddingTab, temTabela: Boolean(tabelaWrap) };
        });

        expect(legalAudit.fsH1, `H1 ausente em ${rota}`).toBeGreaterThan(legalAudit.fsH2);
        if (legalAudit.fsH3 > 0) {
          expect(legalAudit.fsH2, `H2<=H3 em ${rota}`).toBeGreaterThan(legalAudit.fsH3);
        }
        expect(legalAudit.bordaEsq).toBeLessThanOrEqual(1.5);
        if (legalAudit.temTabela) {
          expect(legalAudit.paddingTab).toBeGreaterThan(0);
        }
      }
    }

    // Valida integridade real do sprite SVG (48+ símbolos e renderização via <use>)
    await page.goto('/workspace.html');
    await page.waitForLoadState('networkidle');

    const resultadoSprite = await page.evaluate(async () => {
      const [respReg, respSprite] = await Promise.all([
        fetch('/data/icon-registry.json'),
        fetch('/img/icons-sprite.svg'),
      ]);
      const reg = await respReg.json();
      const spriteTxt = await respSprite.text();
      const doc = new DOMParser().parseFromString(spriteTxt, 'image/svg+xml');
      const idsNoSprite = new Set(Array.from(doc.querySelectorAll('symbol[id]')).map((s) => s.id));
      const listaIcones = Object.entries(reg)
        .filter(([chave, val]) => chave !== '$schema' && chave !== 'meta' && val && typeof val === 'object')
        .flatMap(([, grupo]) => Object.values(grupo))
        .filter((ic) => ic && typeof ic.id === 'string');
      const faltandoNoSprite = listaIcones.map((ic) => ic.id).filter((id) => !idsNoSprite.has(id));

      // Testa montagem e renderização de <use> em um SVG visível temporário no DOM
      const testeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      testeSvg.setAttribute('width', '24');
      testeSvg.setAttribute('height', '24');
      testeSvg.setAttribute('viewBox', '0 0 24 24');
      const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      useEl.setAttribute('href', '/img/icons-sprite.svg#icon-algorithm');
      testeSvg.appendChild(useEl);
      document.body.appendChild(testeSvg);
      const rect = testeSvg.getBoundingClientRect();
      testeSvg.remove();

      return {
        totalRegistrados: listaIcones.length,
        totalSymbols: idsNoSprite.size,
        faltandoNoSprite,
        renderWidth: rect.width,
        renderHeight: rect.height,
      };
    });

    expect(resultadoSprite.totalRegistrados).toBeGreaterThanOrEqual(48);
    expect(resultadoSprite.totalSymbols).toBeGreaterThanOrEqual(48);
    expect(resultadoSprite.faltandoNoSprite).toEqual([]);
    expect(resultadoSprite.renderWidth).toBeGreaterThan(0);
    expect(resultadoSprite.renderHeight).toBeGreaterThan(0);

    expect(falhasRede).toEqual([]);
    expect(errosRuntime).toEqual([]);
  });

  test('Workspace Notion completo: visões, 3 templates, Slash teclado, 7 blocos, Pickers e temas Claro/Escuro/Alto Contraste', async ({ page }) => {
    const { errosRuntime, falhasRede } = registrarMonitoresPagina(page);

    await page.goto('/workspace.html');
    await page.waitForLoadState('networkidle');

    // GSAP, ScrollTrigger e Flip carregados localmente
    const libs = await page.evaluate(() => ({
      gsap: typeof window.gsap !== 'undefined',
      scrollTrigger: typeof window.ScrollTrigger !== 'undefined',
      flip: typeof window.Flip !== 'undefined',
    }));
    expect(libs.gsap).toBe(true);
    expect(libs.scrollTrigger).toBe(true);
    expect(libs.flip).toBe(true);

    const overflowInicial = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(overflowInicial).toBe(true);

    // Visão Kanban padrão com 4 colunas -> Galeria -> Tabela -> Kanban
    await expect(page.locator('.ws-kanban-coluna')).toHaveCount(4);
    await page.getByRole('button', { name: 'Galeria de Ideias' }).click();
    await expect(page.locator('.ws-galeria-grade .ws-card')).toHaveCount(3);
    await page.getByRole('button', { name: 'Tabela Estruturada' }).click();
    await expect(page.locator('.tabela-scroll tbody tr')).toHaveCount(3);
    await page.getByRole('button', { name: 'Quadro Kanban' }).click();
    await expect(page.locator('.ws-kanban-coluna')).toHaveCount(4);

    // Testa criação dos 3 templates pedagógicos 1-Click
    const templates = [
      { id: 'canvas-ideia-projeto', marcador: 'Problema & Público-Alvo' },
      { id: 'diario-laboratorio-python', marcador: 'Objetivo da Missão 3D' },
      { id: 'planejador-semanal-trilhas', marcador: 'Plano Semanal' },
    ];

    const editor = page.locator('#ws-editor-backdrop');
    for (const tpl of templates) {
      await page.locator(`.ws-template-btn[data-template-id="${tpl.id}"]`).click();
      await expect(editor).toBeVisible();
      const tituloAtual = await page.locator('#ws-editor-titulo-input').inputValue();
      expect(tituloAtual.trim().length).toBeGreaterThan(3);
      if (tpl.id !== 'planejador-semanal-trilhas') {
        await page.locator('[data-editor-acao="fechar-editor"]').click();
        await expect(editor).toBeHidden();
      }
    }

    // Icon Picker no editor aberto (selecionar fecha o painel automaticamente; reabre para confirmar ativo)
    await page.locator('[data-editor-acao="toggle-picker-icone"]').click();
    await page.locator('.ws-icone-opcao[data-icone-id="icon-algorithm"]').click();
    await page.locator('[data-editor-acao="toggle-picker-icone"]').click();
    await expect(page.locator('.ws-icone-opcao[data-icone-id="icon-algorithm"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-editor-acao="fechar-picker"]').click();

    // Insere todos os 7 tipos de blocos pela toolbar e valida checklist % + toggle
    const tiposBlocos = ['paragrafo', 'titulo', 'checklist', 'toggle', 'callout', 'codigo', 'bncc'];
    for (const tipo of tiposBlocos) {
      await page.locator(`.ws-blocos-toolbar button[data-tipo-bloco="${tipo}"]`).click();
    }

    // Marca checklist recém-criado e confirma atualização da barra de progresso (%)
    const ultimoCheck = page.locator('#ws-blocos-lista input[type="checkbox"][data-bloco-campo="concluido"]').last();
    await ultimoCheck.check();
    const progressoTexto = await page.locator('#ws-editor-progresso-checklist').textContent();
    expect(progressoTexto).toMatch(/\d+%/);

    // Alterna Toggle recém-criado
    const btnToggle = page.locator('[data-editor-acao="alternar-toggle"]').last();
    const antesExp = await btnToggle.getAttribute('aria-expanded');
    await btnToggle.click();
    const depoisExp = await btnToggle.getAttribute('aria-expanded');
    expect(depoisExp).not.toBe(antesExp);

    // Testa Slash Command / completo por teclado (ArrowDown, Escape, ArrowDown + Enter)
    const ultimoParagrafo = page.locator('#ws-blocos-lista textarea[data-bloco-campo="texto"]').last();
    await ultimoParagrafo.click();
    await ultimoParagrafo.fill('/');
    await expect(page.locator('.ws-slash-menu')).toBeVisible();

    await ultimoParagrafo.press('ArrowDown');
    await expect(page.locator('.ws-slash-opcao').nth(1)).toHaveClass(/ativo/);

    await page.keyboard.press('Escape');
    await expect(page.locator('.ws-slash-menu')).toHaveCount(0);
    await expect(editor).toBeVisible();

    await ultimoParagrafo.fill('/');
    await expect(page.locator('.ws-slash-menu')).toBeVisible();
    await ultimoParagrafo.press('ArrowDown');
    await ultimoParagrafo.press('Enter');
    await expect(page.locator('.ws-slash-menu')).toHaveCount(0);

    // Cover Picker: 1) Capas Notion 1500x600 com object-fit: cover
    await page.getByRole('button', { name: /Alterar capa/i }).click();
    await page.getByRole('tab', { name: /Capas BNCC & Notion/i }).click();
    await page.locator('.ws-picker-opcao[data-cover-id="cover-algoritmos"]').click();
    const capaImgStats = await page.locator('.ws-editor-capa img.ws-capa-midia').evaluate(async (img) => {
      if (!img.complete) {
        await new Promise((r) => img.addEventListener('load', r, { once: true }));
      }
      return {
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        objectFit: window.getComputedStyle(img).objectFit,
      };
    });
    expect(capaImgStats.complete).toBe(true);
    expect(capaImgStats.naturalWidth).toBe(1500);
    expect(capaImgStats.naturalHeight).toBe(600);
    expect(capaImgStats.objectFit).toBe('cover');

    // Cover Picker: 2) Ilustrações Educacionais (selecionar capa fecha o painel; reabre)
    await page.getByRole('button', { name: /Alterar capa/i }).click();
    await page.getByRole('tab', { name: /Ilustrações Educacionais/i }).click();
    await page.locator('.ws-picker-opcao[data-cover-id="ilus-brainstorming"]').click();
    const ilusStats = await page.locator('.ws-editor-capa img.ws-capa-midia').evaluate(async (img) => {
      if (!img.complete) {
        await new Promise((r) => img.addEventListener('load', r, { once: true }));
      }
      return { complete: img.complete, naturalWidth: img.naturalWidth };
    });
    expect(ilusStats.complete).toBe(true);
    expect(ilusStats.naturalWidth).toBeGreaterThan(0);

    // Cover Picker: 3) Padrões & Gradientes com SVG adaptável em Claro / Escuro / Alto Contraste
    await page.getByRole('button', { name: /Alterar capa/i }).click();
    await page.getByRole('tab', { name: /Padrões & Gradientes/i }).click();
    await page.locator('.ws-picker-opcao[data-cover-id="padrao-malha-isometrica"]').click();
    await expect(page.locator('.ws-editor-capa svg.ws-padrao-svg')).toBeVisible();

    for (const modo of ['claro', 'escuro', 'alto-contraste']) {
      await page.evaluate((m) => {
        document.documentElement.classList.remove('a11y-alto-contraste');
        if (m === 'escuro') {
          document.documentElement.setAttribute('data-tema', 'escuro');
          document.body.classList.add('suporta-tema-sistema');
        } else if (m === 'alto-contraste') {
          document.documentElement.setAttribute('data-tema', 'claro');
          document.documentElement.classList.add('a11y-alto-contraste');
        } else {
          document.documentElement.setAttribute('data-tema', 'claro');
        }
      }, modo);

      const estadoModo = await page.evaluate(() => {
        const svg = document.querySelector('.ws-editor-capa svg.ws-padrao-svg');
        const rect = svg ? svg.getBoundingClientRect() : { width: 0, height: 0 };
        return {
          width: rect.width,
          height: rect.height,
          overflowOk: document.documentElement.scrollWidth <= window.innerWidth + 1,
        };
      });
      expect(estadoModo.width).toBeGreaterThan(0);
      expect(estadoModo.height).toBeGreaterThan(0);
      expect(estadoModo.overflowOk, `Overflow no Workspace em modo ${modo}`).toBe(true);
    }

    // Restaura modo claro e fecha editor
    await page.evaluate(() => {
      document.documentElement.classList.remove('a11y-alto-contraste');
      document.documentElement.setAttribute('data-tema', 'claro');
    });
    await page.getByRole('button', { name: /Salvar e Concluir/i }).click();
    await expect(editor).toBeHidden();

    // Auditoria axe-core após toda a interação
    const resultadosAxe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const graves = resultadosAxe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(graves).toEqual([]);

    expect(falhasRede).toEqual([]);
    expect(errosRuntime).toEqual([]);
  });

  test('GSAP ScrollTrigger revela elementos ao rolar e respeita prefers-reduced-motion e lms_a11y_reduzir-movimento', async ({ page }) => {
    const { errosRuntime } = registrarMonitoresPagina(page);

    // 1. Modo normal com rolagem progressiva em Home, Atividades, Mundo Digital e Cultura Digital
    const paginasScroll = [
      { url: '/', seletor: '.sp-cta-banner' },
      { url: '/atividades.html', seletor: '.atv-card' },
      { url: '/mundo-digital.html', seletor: '.md-secao' },
      { url: '/cultura-digital.html', seletor: '.cd-secao' },
    ];

    for (const item of paginasScroll) {
      await page.goto(item.url);
      await page.waitForLoadState('networkidle');
      await page.evaluate(async () => {
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
          window.ScrollTrigger.refresh();
        }
        const altura = document.documentElement.scrollHeight;
        for (let y = 0; y <= altura; y += Math.max(250, Math.floor(altura / 5))) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 90));
        }
        window.scrollTo({ top: altura, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 650));
      });

      const visibilidade = await page.locator(item.seletor).evaluateAll((els) =>
        els.slice(0, 6).map((el) => {
          const st = window.getComputedStyle(el);
          return {
            opacity: Number.parseFloat(st.opacity),
            visibility: st.visibility,
          };
        })
      );
      expect(visibilidade.length).toBeGreaterThan(0);
      for (const v of visibilidade) {
        expect(v.opacity, `Opacity pós-scroll em ${item.url} (${item.seletor})`).toBe(1);
        expect(v.visibility).not.toBe('hidden');
      }
    }

    // 2. Reduced Motion do Sistema Operacional
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const ctaSysReduced = await page.locator('.sp-cta-banner').evaluate((el) => Number.parseFloat(window.getComputedStyle(el).opacity));
    expect(ctaSysReduced).toBe(1);

    // 3. Flag de Acessibilidade do LMS no localStorage (lms_a11y_reduzir-movimento = '1')
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      localStorage.setItem('lms_a11y_reduzir-movimento', '1');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const ctaLmsReduced = await page.locator('.sp-cta-banner').evaluate((el) => Number.parseFloat(window.getComputedStyle(el).opacity));
    expect(ctaLmsReduced).toBe(1);

    expect(errosRuntime).toEqual([]);
  });

  test('Páginas autenticadas (/perfil.html e /dashboard.html): LGPD exportação/exclusão, GSAP e zero overflow', async ({ page }) => {
    const { errosRuntime, falhasRede } = registrarMonitoresPagina(page);
    const requisicoesChamadas = [];

    await page.addInitScript(() => {
      if (!localStorage.getItem('lms_token')) {
        localStorage.setItem('lms_token', 'token-e2e-valido');
      }
      if (!localStorage.getItem('lms_usuario')) {
        localStorage.setItem('lms_usuario', JSON.stringify({
          id: 77,
          nome: 'Estudante Piloto E2E',
          email: 'estudante.e2e@escola.edu.br',
          perfil: 'aluno',
        }));
      }
    });

    await page.route('**/api/**', async (route) => {
      const req = route.request();
      const url = req.url();
      const method = req.method();
      requisicoesChamadas.push(`${method} ${new URL(url).pathname}`);

      if (url.includes('/api/preferencias')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tema: 'claro', preferencia_contraste: 0, lingua_simples: 0 }) });
      }
      if (url.includes('/api/gamificacao/avaliar')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ avaliadas: 0 }) });
      }
      if (url.includes('/api/gamificacao/medalhas')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ medalhas: [], resumo: { total: 8, conquistadas: 2, percentualConclusao: 25 } }) });
      }
      if (url.includes('/api/auth/exportar-dados')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ usuario: { id: 77, nome: 'Estudante Piloto E2E' }, workspace_itens: [] }),
        });
      }
      if (url.endsWith('/api/workspace') && method === 'DELETE') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ mensagem: 'Todos os itens do Workspace foram removidos permanentemente.' }),
        });
      }
      if (url.includes('/api/dashboard/indicadores')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            cursos: { publicados: 3, rascunhos: 0 },
            matriculas: { ativas: 2, concluidas: 1 },
            taxaConclusao: 50,
            certificadosEmitidos: 1,
            cursosPorEixoBNCC: [],
          }),
        });
      }
      if (url.includes('/api/dashboard/linha-do-tempo')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      }
      if (url.includes('/api/dashboard/relatorio-pedagogico')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ habilidades: [] }) });
      }
      if (url.includes('/api/dashboard/submissoes-python')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ submissoes: [] }) });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    // 1. Perfil + ações LGPD
    await page.goto('/perfil.html');
    await page.waitForLoadState('networkidle');
    const geoPerfil = await auditarGeometriaAtivos(page);
    expect(geoPerfil.semOverflowHorizontal).toBe(true);
    expect(geoPerfil.svgsZerados).toEqual([]);

    await expect(page.locator('#btn-exportar-dados-lgpd')).toBeVisible();
    await page.locator('#btn-exportar-dados-lgpd').click();
    await expect(page.locator('#status-exportacao-lgpd')).toContainText(/sucesso/i);
    expect(requisicoesChamadas).toContain('GET /api/auth/exportar-dados');

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#btn-apagar-workspace-lgpd').click();
    await expect(page.locator('#status-exportacao-lgpd')).toContainText(/removidos/i);
    expect(requisicoesChamadas).toContain('DELETE /api/workspace');

    // 2. Dashboard (perfil docente/admin exigido pela tela)
    await page.evaluate(() => {
      localStorage.setItem('lms_usuario', JSON.stringify({
        id: 77,
        nome: 'Docente Piloto E2E',
        email: 'docente.e2e@escola.edu.br',
        perfil: 'instrutor',
      }));
    });
    await page.goto('/dashboard.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(450);
    const geoDash = await auditarGeometriaAtivos(page);
    expect(geoDash.semOverflowHorizontal).toBe(true);
    expect(geoDash.svgsZerados).toEqual([]);

    const heroDashVisivel = await page.locator('.dashboard-hero').evaluate((el) => Number.parseFloat(window.getComputedStyle(el).opacity) === 1);
    expect(heroDashVisivel).toBe(true);

    expect(falhasRede).toEqual([]);
    expect(errosRuntime).toEqual([]);
  });
});
