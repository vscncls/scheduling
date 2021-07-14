module.exports = {
  ...require("./jest.config"),
  testMatch: ["**/__tests__/**/*.e2e.test.ts"],
  maxWorkers: 1
};
