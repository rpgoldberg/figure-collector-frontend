module.exports = {
  preset: 'react-app',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost',
    customExportConditions: [''],
  },
  globals: {
    __DEV__: true,
  },
  setupFiles: [
    '<rootDir>/node_modules/jest-canvas-mock/dist/index.js',
    'regenerator-runtime/runtime'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/setupTests.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/test-utils.tsx',
    '!src/test-utils/**/*', // Exclude all test utilities and mocks
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/utils/logger.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 60,
      statements: 60
    }
  },
  coverageReporters: ['text', 'lcov', 'json-summary'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^axios$': '<rootDir>/src/test-utils/mocks/axios.js',
    // Standard module mappings
    '^@emotion/(.*)$': '<rootDir>/node_modules/@emotion/$1',
    '^(api|components|pages|stores|utils)/(.*)$': '<rootDir>/src/$1/$2'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest', 
      { 
        presets: ['react-app'],
        plugins: ['@emotion/babel-plugin', '@babel/plugin-transform-modules-commonjs']
      }
    ],
    '^.+\\.css$': 'jest-transform-css',
    '^.+\\.emotion$': 'jest-transform-css',
    '\\.emotion': 'jest-transform-css'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios|@chakra-ui|@testing-library|framer-motion|@emotion|react-icons)/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/@emotion/css/dist/emotion-css.esm.js'
  ],
  modulePaths: ['<rootDir>/src'],
  resolver: '<rootDir>/node_modules/jest-pnp-resolver',
  maxWorkers: '50%',
  testTimeout: 20000,
  verbose: true,
  resetModules: true,
  snapshotSerializers: ['@emotion/jest/serializer']
};