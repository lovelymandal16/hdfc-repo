module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['**/*.test.js', '**/*.spec.js', 'playwright.config.js'],
    }],
    'xwalk/max-cells': ['error', {
      '*': 5, // default limit for all models (increased by 1)
      'plain-text': 5,
      'countdown-timer': 12,
      form: 18,
      wizard: 13,
      'form-button': 8,
      'checkbox-group': 22,
      checkbox: 22,
      'date-input': 22,
      'drop-down': 20,
      email: 23,
      'file-input': 21,
      'form-fragment': 17,
      'form-image': 8,
      'multiline-input': 24,
      'number-input': 23,
      panel: 22,
      'radio-group': 21,
      'form-reset-button': 8,
      'form-submit-button': 8,
      'telephone-input': 21,
      'text-input': 24,
      'dob-input': 21,
      accordion: 16,
      modal: 12,
      rating: 19,
      password: 22,
      tnc: 13,
      'dynamic-dropdown': 20,
      'hdfc-mobile-input': 12,
      'state-button': 8,
      review: 14,
      'kyc-consent': 15,
      'consent-popup': 14,
      'card-choice': 18,
    }],
    'xwalk/no-orphan-collapsible-fields': 'off', // Disable until enhancement is done for Forms properties
  },
};
