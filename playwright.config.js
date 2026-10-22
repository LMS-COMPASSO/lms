import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração Playwright E2E para LMS COMPASSO
 * Testes de Acessibilidade (axe-core), Regressão Visual e Wayfinding
 * Resoluções: 360px (mobile), 768px (tablet), 1024px (notebook) e 1366px (desktop)
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /.*\.spec\.js/,
  timeout: 45000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:8787',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Mobile (360x640)',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 640 },
        browserName: 'chromium',
      },
    },
    {
      name: 'Tablet (768x1024)',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
        browserName: 'chromium',
      },
    },
    {
      name: 'Notebook (1024x768)',
      use: {
        viewport: { width: 1024, height: 768 },
        browserName: 'chromium',
      },
    },
    {
      name: 'Desktop (1366x768)',
      use: {
        viewport: { width: 1366, height: 768 },
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: 'npx wrangler dev --port 8787',
    port: 8787,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
