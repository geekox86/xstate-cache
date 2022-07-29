module.exports = {
  // preset: undefined,
  testEnvironment: "jest-environment-node",
  collectCoverage: true,
  // collectCoverageFrom: undefined,
  coverageDirectory: "coverage",
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],
  coverageProvider: "v8",
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],

  // rootDir: "./src",
  roots: ["./src"],
  moduleFileExtensions: ["js", "ts"],
  testMatch: ["**/*.test.ts"],
  // resolver: undefined,
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  verbose: true,
  watchman: true,
};
