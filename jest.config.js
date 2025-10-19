module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./src/tests'], // or your test folder
  transform: {
    '^.+\\.ts?$': ['ts-jest', { useESM: true }],
  },
  verbose: true,
  // testRegex: "(/__tests__/.*|(\\.|/)(test|spect)\\.ts?$",
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};