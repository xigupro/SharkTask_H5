module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': 0,
    'no-multi-assign': 0,
    // don't require .vue extension when importing
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        vue: 'never'
      }
    ],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': [
      'error',
      {
        optionalDependencies: ['test/unit/index.js']
      }
    ],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // 可以使用console
    'no-console': 0,
    'linebreak-style': 'off',
    'no-plusplus': [
      2,
      {
        allowForLoopAfterthoughts: true
      }
    ],
    // 禁止使用特定语法
    'no-restricted-syntax': 0,
    // 禁止if语句有return语句后不能写else
    'no-else-return': 0,
    // 要求 for-in 循环中有一个 if 语句
    'guard-for-in': 0,
    // // 禁止强调方法必须返回值
    // 'consistent-return': 0,
    // 禁止直接使用 Object.prototypes 的内置属性
    'no-prototype-builtins': 0,
    // 禁止使用.访问对象属性
    'dot-notation': 0,
    // 可以使用系统弹窗
    'no-alert': 0,
    // 禁止对象字面量形式
    'object-shorthand': 0,
    // 禁止else语句内只有if语句
    'no-lonely-if': 0,
    // 数组不能放空数据
    'no-sparse-arrays' :0,
    'no-cond-assign': 0,
    // 关闭分号校验
    "semi": 0,
    "no-tabs": 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
