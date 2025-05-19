import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    // baseUrl: 'http://ip24ssa1.sit.kmutt.ac.th',
    // baseAPI: 'http://ip24ssa1.sit.kmutt.ac.th/itb-mshop',
    baseUrl: 'http://localhost:5173',
    baseAPI: 'http://localhost:8080',
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
