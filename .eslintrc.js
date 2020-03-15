module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:compat/recommended'
  ],
  // add your custom rules here
  rules: {
    'no-irregular-whitespace': 'off'
  }
}
