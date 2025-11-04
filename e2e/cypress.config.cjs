const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
  },
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress/results/results-[hash].xml',
    toConsole: false,
  },
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  video: true,
});


