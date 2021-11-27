module.exports = {
  extends: ['prettier', 'react-app'],
  plugins: ['prettier', 'babel', 'react-hooks'],
  parser: 'babel-eslint',
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
        arrowParens: 'avoid',
      },
    ],
    'no-console': [1, { allow: ['warn', 'error'] }],
    'no-unused-expressions': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'no-unused-vars': [
      'warn',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
    ],
    'prefer-const': [1],
  },
}
