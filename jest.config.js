module.exports = {
  preset: 'react-app',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost',
    customExportConditions: [''],
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
    '^axios$': '<rootDir>/node_modules/axios/index.js',
    '^@chakra-ui/react$': '<rootDir>/node_modules/@chakra-ui/react',
    '^@chakra-ui/(.*)$': '<rootDir>/node_modules/@chakra-ui/$1',
    '@chakra-ui/utils/context': '<rootDir>/node_modules/@chakra-ui/utils/dist/context',
    '^(api|components|pages|stores|utils)/(.*)$': '<rootDir>/src/$1/$2'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest', 
      { presets: ['react-app'] }
    ],
    '^.+\\.css$': 'jest-transform-css'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios|@chakra-ui|@testing-library|framer-motion)/'
  ],
  modulePaths: ['<rootDir>/src'],
  resolver: '<rootDir>/node_modules/jest-pnp-resolver',
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: false
  },
  timers: 'modern',
  maxWorkers: '50%',
  testTimeout: 10000,
  snapshotSerializers: ['@emotion/jest/serializer']
};