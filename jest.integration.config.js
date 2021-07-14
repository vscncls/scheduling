module.exports = {
  ...require("./jest.config"),
  testMatch: ["**/__tests__/**/*.integration.test.ts"],
  maxWorkers: 1,
};
