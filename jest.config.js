module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['dotenv/config'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/config/',
    '/tests/fixtures/'
  ],
  verbose: true
};