/* eslint valid-jsdoc: "off" */

'use strict';

const { port } = require('./constant');
const fsExtra = require('fs-extra');
const path = require('path');
const mountDir = '/opt/soft/v2x/';

/**
 * 拷贝数据库文件到挂载的宿主机对应目录
 * @return {String} 程序连接的数据库文件路径
 */
function copyDbFile() {
  const mountPath = `${mountDir}mark_sqlite.db`;
  // 如果文件不存在，则进行拷贝
  if (!fsExtra.existsSync(mountPath)) {
    fsExtra.ensureDirSync(mountDir);
    fsExtra.copyFileSync(path.resolve(__dirname, '../mark_sqlite.db'), mountPath);
  }
  return mountPath;
}
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  const mountPath = copyDbFile();
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {
    sequelize: {
      dialect: 'sqlite',
      host: 'localhost',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      // storage: mountPath,
      storage: require('path').resolve(__dirname, '../mark_sqlite.db'),
    },
    security: { 
      csrf: {
        enable: false,
      },
    },
    jwt: {
      secret: '123456',
      expiresIn: '24h',
    },
    bcrypt: {
      saltRounds: 10,
    },
    axiosPlus: {
      timeout: 10000, // 默认请求超时
      app: true, // 在app.js上启动加载
      agent: false, // 在agent.js上启动加载
    },
  });

  config.cluster = {
    listen: {
      path: '',
      port,
      hostname: '0.0.0.0',
    },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1647063658911_1542';

  // add your middleware config here
  config.middleware = [];

  config.multipart = {
    mode: 'stream',
    fileSize: '20mb',
    files: 150,
    // 第三个元素表示允许传没有扩展名的文件
    fileExtensions: [ '.key', '.pem', '', '.raw', '.bin' ],
    // whitelist: [ '.png', '.jpg', '.jpeg' ],
  };
  // config.onerror = {
  //   all(err, ctx) {
  //     // 在此处定义针对所有响应类型的错误处理方法
  //     // 注意，定义了 config.all 之后，其他错误处理方法不会再生效

  //     ctx.body = err;
  //     ctx.status = 500;
  //   },
  // };
  config.validatePlusNext = {
    resolveError(ctx, errors) {
      if (errors.length) {
        ctx.type = 'json';
        ctx.status = 200;
        ctx.body = {
          data: errors, returnStatus: 'FAILED', errorMessage: errors[0].message,
        };
      }
    },
  };


  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    algorithmicDir: `${mountDir}configs/`,
    cfgSingleDir: `${mountDir}configs/cfg_single/`,
    cfgMultipleDir: `${mountDir}configs/cfg_multiple/`,
    deviceConfigPath: '/opt/soft/configs/default.cfg',
    imageDir: `${mountDir}image/`,
    // 上传视频文件存放的目录路径
    videoPath: `${mountDir}video`,
    // 存放全息路口背景图片和中心点坐标json文件的目录路径
    roadInfoPath: `${mountDir}image`,
    // 存放全局数据文件的存放目录
    dataStoreDir: '.data_store/',
    edgeServerAddress: 'http://10.0.73.165:8666',
  };

  return {
    ...config,
    ...userConfig,
  };
};
