/* eslint-disable */
export default {
  displayName: 'trading-waves',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  setupFiles: ['./test-setup.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/trading-waves',
};
