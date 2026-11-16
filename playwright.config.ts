import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:3015', headless: true, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 2 } },
  ],
  webServer: { command: 'npm run start -- --hostname 127.0.0.1 --port 3015', url: 'http://127.0.0.1:3015/?demo=1', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
