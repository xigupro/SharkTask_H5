const autoprefixer = require("autoprefixer");
// const pxtoviewport = require('postcss-px-to-viewport');
const styles = require("./theme.config");
const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  lintOnSave: false,
  devServer: {
    overlay: {
      warnings: true,
      errors: true
    }
  },
  productionSourceMap: false,
  chainWebpack: config => {
    config.resolve.alias.set("@", resolve("src")).set("tim", resolve("src/tim.js"));
    // 删除预加载
    config.plugins.delete("preload");
    config.plugins.delete("prefetch");
    // 压缩代码
    config.optimization.minimize(true);
    // 分割代码
    config.optimization.splitChunks({
      chunks: "all"
    });
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          ...styles
        }
      },
      postcss: {
        plugins: [
          autoprefixer()
          // pxtoviewport({
          //   viewportWidth: 375,
          //   // 该项仅在使用 Circle 组件时需要
          //   // 原因参见 https://github.com/youzan/vant/issues/1948
          //   selectorBlackList: ['van-circle__layer']
          // }),
        ]
      }
    }
  }
};
