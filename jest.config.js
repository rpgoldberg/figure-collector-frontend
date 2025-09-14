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
    '!**/node_modules/**', // Exclude node_modules
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/setupTests.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/test-utils.tsx'
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
    '^axios$': '<rootDir>/node_modules/axios/lib/axios.js',
    '^@chakra-ui/react$': '<rootDir>/node_modules/@chakra-ui/react',
    '^@chakra-ui/(.*)$': '<rootDir>/node_modules/@chakra-ui/$1',
    '@chakra-ui/utils/context': '<rootDir>/node_modules/@chakra-ui/utils/dist/context',
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
    '/node_modules/(?!axios|@chakra-ui|@testing-library|framer-motion|@emotion)/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/@emotion/css/dist/emotion-css.esm.js'
  ],
  modulePaths: ['<rootDir>/src'],
  resolver: '<rootDir>/node_modules/jest-pnp-resolver',
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: false
  },
  timers: 'fake',
  maxWorkers: '50%',
  testTimeout: 15000, // Extended timeout for complex routing tests
  verbose: true, // More detailed test output
  resetModules: true, // Reset module registry before each test
  snapshotSerializers: ['@emotion/jest/serializer']
};