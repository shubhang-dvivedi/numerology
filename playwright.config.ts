import { defineConfig, devices } from '@playwright/test';

// Runs against the production build (`vite preview`), so the PWA/offline setup is tested too.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'laptop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 820 } } },
    { name: 'android-phone', use: { ...devices['Pixel 7'] } },
    { name: 'iphone-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
  },
});
