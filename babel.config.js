module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  env: {
    test: {
      plugins: [
        'babel-plugin-transform-import-meta'
      ]
    }
  }
};