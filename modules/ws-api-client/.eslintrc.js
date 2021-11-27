module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:import/warnings',
    'plugin:jest-dom/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['react-hooks', 'jest-dom'],
  rules: {
    // https://github.com/evcohen/eslint-plugin-jsx-a11y/issues/397#issuecomment-393921950
    'jsx-a11y/href-no-hash': [0],
    'jsx-a11y/heading-has-content': [0],
    'prettier/prettier': [
      1,
      {
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'no-console': [1, { allow: ['warn', 'error'] }],
    'no-unused-expressions': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': [
      'warn',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
    ],
    curly: 'error',
  },
}
