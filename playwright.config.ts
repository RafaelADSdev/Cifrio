import { defineConfig } from '@playwright/test';
const port = process.env.PLAYWRIGHT_PORT ?? '8081';
export default defineConfig({
  testDir: './tests/browser', timeout: 45000, workers: 1,
  use: { baseURL: `http://localhost:${port}`, browserName: 'chromium', viewport: { width: 390, height: 844 }, trace: 'retain-on-failure' },
  webServer: { command: `npm run web -- --port ${port}`, url: `http://localhost:${port}`, reuseExistingServer: !process.env.CI, timeout: 90000 },
});
