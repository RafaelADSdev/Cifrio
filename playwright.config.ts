import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 45000, workers: 1,
  use: { baseURL: 'http://localhost:8081', browserName: 'chromium', viewport: { width: 390, height: 844 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm run web -- --port 8081', url: 'http://localhost:8081', reuseExistingServer: !process.env.CI, timeout: 90000 },
});
