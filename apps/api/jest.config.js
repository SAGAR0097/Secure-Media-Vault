/**
 * Jest config for API: run JS tests by default.
 * The TypeScript test (asset.test.ts) is provided but excluded from runs
 * until ts-jest + schema test harness are fully wired.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test|spec).js'],
};


