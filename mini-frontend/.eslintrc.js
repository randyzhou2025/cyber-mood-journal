module.exports = {
  extends: ['taro/react'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};
