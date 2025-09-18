// ESLint Configuration for C4R Monorepo
const noHardcodedFontSizes = require('./eslint-rules/no-hardcoded-font-sizes');

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'c4r': {
        rules: {
          'no-hardcoded-font-sizes': noHardcodedFontSizes
        }
      }
    },
    rules: {
      // C4R Custom Rules
      'c4r/no-hardcoded-font-sizes': 'error',
      
      // Standard rules
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error'
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
  {
    files: ['**/*.css'],
    rules: {
      // CSS-specific rules would go here if we had a CSS parser
    }
  }
];