import { defineConfig, devices } from "@playwright/test";

const webappUrl = "http://localhost:3000";
const backendUrl = "http://localhost:5000";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: webappUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Starts the backend and the webapp when they are not already running.
  webServer: [
    {
      command: "dotnet run --project ../backend/webapi --launch-profile http",
      url: `${backendUrl}/todos`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npm start",
      url: webappUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
