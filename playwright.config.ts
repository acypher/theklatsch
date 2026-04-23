import { defineConfig, devices } from "@playwright/test";

const devServerPort = 8080;
const baseURL = `http://127.0.0.1:${devServerPort}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
