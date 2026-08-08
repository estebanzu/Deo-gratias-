const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3015',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node server.js',
    port: 3015,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
