module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  testEnvironment: "jsdom",
  roots: ["<rootDir>", "./src"],
  modulePaths: ["<rootDir>", "./src"],
  moduleDirectories: ["node_modules", "./src"],
};
