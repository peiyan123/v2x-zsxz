const AntDesignThemePlugin = require('antd-theme-webpack-plugin')
const path = require('path')

const options = {
  antDir: path.join(__dirname, './node_modules/ant-design-vue'), //antd包位置
  stylesDir: path.join(__dirname, './src/styles/theme'), //主题文件所在文件夹
  varFile: path.join(__dirname, './src/styles/theme/variables.less'), // 自定义默认的主题色
  mainLessFile: path.join(__dirname, './src/styles/theme/index.less'), // 项目中其他自定义的样式（如果不需要动态修改其他样式，该文件可以为空）
  outputFilePath: path.join(__dirname, './public/color.less'), //提取的less文件输出到什么地方
  themeVariables: ['@primary-color'], //要改变的主题变量
  indexFileName: './public/index.html', // index.html所在位置
  generateOnce: false, // 是否只生成一次（if you don't want to generate color.less on each chnage in code to make build process fast in development mode, assign it true value. But if you have new changes in your styles, you need to re-run your build process npm start.）
}

const vueConfig = {
  publicPath: './',
  css: {
    loaderOptions: {
      less: {
        // modifyVars: {
        //   'primary-color': '#0173F9',
        //   'font-size-base': '16px',
        //   'error-color': '#FF5712',
        //   'text-color': 'rgba(0, 0, 0, 0.85)',
        // },
        globalVars: {
          hack: `true; @import '~@/styles/index.less';`, // 公共样式，导入全局变量
        },
        javascriptEnabled: true,
      },
    },
    requireModuleExtension: true,
  },
  // pluginOptions: {
  //   "style-resources-loader": {
  //     preProcessor: "less",
  //     patterns: [
  //       // 全局变量路径
  //       path.resolve(__dirname, "./src/styles/theme.variables.less"),
  //     ],
  //   },
  // },

  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = 'v2x平台'
      return args
    })
    config.resolve.symlinks(true) // 修复热更新失效
  },
  devServer: {
    // development server port 8000
    port: 9001,
    // If you want to turn on the proxy, please remove the mockjs /src/main.jsL11
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001/',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
      '/banzi': {
        target: 'http://192.168.11.12',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/banzi': '',
        },
      },
      '/lgj': {
        target: 'http://127.0.0.1:8001',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/lgj': '',
        },
      },
      '/road2': {
        target: 'http://10.0.73.165:19003',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/road2': '',
        },
      },
      '/road3': {
        target: 'http://10.0.73.165:19004',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/road3': '',
        },
      },
      '/road': {
        target: 'http://10.0.73.165:19002',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/road': '',
        },
      },
    },
  },
  // disable source map in production
  productionSourceMap: false,
  // configureWebpack: {
  //   plugins: [new AntDesignThemePlugin(options)]
  // },
}

module.exports = vueConfig
