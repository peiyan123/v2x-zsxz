module.exports = {
  plugins: {
    tailwindcss: {},
    // 这个工具可以实现自动添加CSS3前缀
    autoprefixer: {
      overrideBrowserslist: ['last 5 version', '>1%', 'ie >=8'],
    },
    // postcss-px-to-viewport 是一个将 px 单位转换为“视口单位”(vw, vh, vmin, vmax) 的 PostCSS 插件。主要用于移动端布局。在pc端缩放浏览器会造成样式变化，故暂时注释。
    // 'postcss-px-to-viewport': {
    //   unitToConvert: 'px', // 需要转换的单位，默认为"px"
    //   viewportWidth: 1920, //  设计稿的视口宽度
    //   unitPrecision: 5, // 单位转换后保留的精度
    //   propList: ['*'], // 能转化为vw的属性列表
    //   viewportUnit: 'vw', //  希望使用的视口单位
    //   fontViewportUnit: 'vw', // 字体使用的视口单位
    //   selectorBlackList: [], // 需要忽略的CSS选择器
    //   minPixelValue: 1, // 最小的转换数值，如果为1的话，只有大于1的值会被转换
    //   mediaQuery: false, // 媒体查询里的单位是否需要转换单位
    //   replace: true, // 是否直接更换属性值，而不添加备用属性
    //   exclude: [/node_modules/], // 忽略某些文件夹下的文件或特定文件 /node_modules/
    //   include: undefined, // 如果设置了include，那将只有匹配到的文件才会被转换，例如只转换 'src/mobile' 下的文件 (include: /\/src\/mobile\//)
    //   landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
    //   landscapeUnit: 'vw', // 横屏时使用的单位
    //   landscapeWidth: 568, // 横屏时使用的视口宽度
    // },
  },
}