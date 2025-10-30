export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["./src/tests"],
    transform: {
    '^.+\\.ts?$': ['ts-jest', { useESM: true }],
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}