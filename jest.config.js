// jest.config.js
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Chuyển đổi TypeScript
    "^.+\\.jsx?$": "babel-jest", // Nếu bạn sử dụng Babel cho .js
  },
  moduleFileExtensions: ["js", "ts", "json", "node"], // Đảm bảo rằng các định dạng tệp này được Jest hỗ trợ
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  detectOpenHandles: true,
};
