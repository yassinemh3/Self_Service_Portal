module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
  '**/test/unit/**/*.test.ts',      // backend unit tests
  '**/test/Frontend/**/*.test.ts'   // frontend unit tests
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json'
    }
  },
  moduleNameMapper: {
    '^@lib/(.*)$': '<rootDir>/app/_lib/$1',
    '^@components/(.*)$': '<rootDir>/app/_components/$1',
    '^@styles/(.*)$': '<rootDir>/app/_styles/$1',
    '^@public/(.*)$': '<rootDir>/public/$1',
    '^@assets/(.*)$': '<rootDir>/app/_assets/$1',
    '^@actions/(.*)$': '<rootDir>/app/_actions/$1',
    '^@types/(.*)$': '<rootDir>/app/_types/$1',
    '^@contexts/(.*)$': '<rootDir>/app/_contexts/$1',
    '^@hooks/(.*)$': '<rootDir>/app/_hooks/$1',
    '^@schemas/(.*)$': '<rootDir>/app/_schemas/$1'
  }
};
