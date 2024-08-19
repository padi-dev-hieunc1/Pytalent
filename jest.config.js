/** @type {import('jest').Config} */
function makeModuleNameMapper(srcPath, tsconfigPath) {
  const { paths } = require(tsconfigPath).compilerOptions;

  const aliases = {};

  // Xóa bỏ alias không cần thiết (nếu có)
  delete paths['@*'];

  // Tạo ánh xạ module cho Jest từ `tsconfig.json`
  Object.keys(paths).forEach((item) => {
    const key = item.replace('/*', '/(.*)');
    const path = paths[item][0].replace('/*', '/$1');
    aliases[key] = `${srcPath}/${path}`;
  });

  console.log(aliases); // In ra console để kiểm tra kết quả

  return aliases;
}

const TS_CONFIG_PATH = './tsconfig.json'; // Đường dẫn tới file tsconfig
const SRC_PATH = '<rootDir>/src'; // Thư mục gốc chứa mã nguồn

const config = {
  moduleNameMapper: makeModuleNameMapper(SRC_PATH, TS_CONFIG_PATH),
  moduleDirectories: ['node_modules'],
  testMatch: ['**/*.test.+(ts|tsx|js)'], // Định nghĩa pattern cho các file test
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Sử dụng ts-jest để biên dịch TypeScript
  },
  testPathIgnorePatterns: ['dist', '<rootDir>/node_modules/'], // Bỏ qua các thư mục không cần thiết
};

module.exports = config;
