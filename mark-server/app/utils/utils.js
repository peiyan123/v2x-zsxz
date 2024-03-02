'use strict';

const ip = require('ip');
const formidable = require('formidable');
const fsExtra = require('fs-extra');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
const sequelize = require('sequelize');
const path = require('path');

function isRtsp(str) {
  return str && str.includes('rtsp');
}
/**
 * rtsp流截图
 * @param {string} rtspUrl rtsp地址
 * @param {string} folder 图片存储目录
 * @param {string} fileanme 图片名字
 * @return {object} Promise对象
 */
function captureRtsp(rtspUrl, folder, fileanme) {
  return new Promise((resolve, reject) => {
    // ffmpeg(rtspUrl, { timeout: 10 })
    //   // 在x86平台的docker容器中，需设置下面参数，否则截图会报超时，使用ffmpeg命令截图时，没有这个参数，则会报：“Could not find codec parameters for stream 0 (Video: hevc, none): unspecified size”的错误
    //   .inputOptions([ '-rtsp_transport tcp' ])
    //   .setFfmpegPath(ffmpeg_static)
    //   // .outputOptions(['-vframes 1'])
    //   // .videoCodec("png")
    //   .on('error', function(err, stdout, stderr) {
    //     reject(err);
    //     // log.info('stdout: ' + stdout); log.info('stderr: ' + stderr);
    //   })
    //   .on('end', function() {
    //     resolve();
    //   })
    //   .screenshots({
    //     folder,
    //     filename: fileanme || 'test-t_%s-w_%w-h_%h-r_%r-f_%f-b_%b-i_%i.png',
    //     // count: 1,
    //     // 连续截取2张图片，并使用第二张图片作为最终的截图，以防在有的相机上截取出来的第一张图片是一片灰色的情况
    //     timemarks: [ 1, 2 ],
    //     size: '100%',
    //   });
    // timemarks为元素个数为2的数组，表示连续截取2张图片，并使用第二张图片作为最终的截图，以防在有的相机上截取出来的第一张图片是一片灰色的情况（其中timemarks第二个元素如果是2，还是可能出现灰色图片，因此改为3，时间间隔拉大）
    const options = { rtspUrl, folder, fileanme, timemarks: [ 1, 3 ] };
    const resovleCallback = () => {
      resolve();
    };
    const rejectCallback = (err, stdout, stderr) => {
      reject(err);
    };
    screenshotsTwice(options, resovleCallback, rejectCallback);
  });
  // .output(res, { end: true }).format("image2").run();
}
/**
 * 对rtsp流进行两次截图，其中如果第一次截图超时，则调用第二次截图，且修改参数withoutSeekInput
 * @param {Object} options 参数配置
 * @param {Function} resolveCallback 截图成功时的resolve回调方法
 * @param {Function} rejectCallback 截图失败时的reject回调方法
 * @param {Object} logger 负责打印日志的对象
 */
function screenshotsTwice(options, resolveCallback, rejectCallback, logger) {
  let isTimeout = false;
  // 设置超时返回
  const timer = setTimeout(() => {
    // 第一次截图超时，则调用第二次截图，且设置withoutSeekInput为true，即去掉“-ss”参数，再试一次
    // eslint-disable-next-line no-use-before-define
    screenshots({ ...options, timeout: 10, withoutSeekInput: true }, secondError, resolveCallback);
    isTimeout = true;
  }, 10000);
  const secondError = (err, stdout, stderr) => {
    if (logger) {
      logger.error('[Check rtsp] error:', err);
      logger.error('[Check rtsp] stdout:', stdout);
      logger.error('[Check rtsp] stderr:', stderr);
    }
    rejectCallback(err, stdout, stderr);
  };
  const firstError = (err, stdout, stderr) => {
    clearTimeout(timer);
    if (isTimeout) {
      return;
    }
    secondError(err, stdout, stderr);
  };
  const firstEnd = () => {
    clearTimeout(timer);
    if (isTimeout) {
      return;
    }
    resolveCallback();
  };
  // 进行第一次截图，此时withoutSeekInput参数未设置，则会带上“-ss”参数
  screenshots(options, firstError, firstEnd);
}
/**
 * 调用fluent-ffmpeg的截图方法对rtsp流进行截图
 * @param {Object} options 参数配置
 * @param {Function} errorCallback 错误回调
 * @param {Function} endCallback 截图结束回调
 */
function screenshots(options, errorCallback, endCallback) {
  const { rtspUrl, folder, fileanme, timeout, timemarks, withoutSeekInput } = options;
  ffmpeg(rtspUrl, { timeout: timeout || 10 })
    .inputOptions([ '-rtsp_transport tcp' ])
    .setFfmpegPath(ffmpeg_static)
    .on('error', errorCallback)
    .on('end', endCallback)
    .screenshots({
      folder,
      filename: fileanme || 'test-t_%s-w_%w-h_%h-r_%r-f_%f-b_%b-i_%i.png',
      // count: 1,
      timemarks: timemarks || [ 1 ],
      size: '100%',
      withoutSeekInput,
    });
}
/**
 * 检查rtsp地址是否有效
 * @param {string} rtspUrl rtsp地址
 * @param {string} folder 存放截图目录
 * @param {string} fileanme 截图名字
 * @param {object} logger 日志对象
 * @return {boolean} rtsp地址是否有效
 */
async function checkRtsp(rtspUrl, folder, fileanme, logger) {
  // 确保目录存在
  await fsExtra.ensureDir(folder);
  return new Promise((resolve, reject) => {
    if (!isRtsp(rtspUrl)) {
      resolve('rtsp流地址无效');
    } else {
      const options = { rtspUrl, folder, fileanme };
      const resovleCallback = () => {
        resolve('');
      };
      const rejectCallback = error => {
        if (error && error.message && error.message.indexOf('timeout') >= 0) {
          resolve('rtsp流地址访问超时');
        } else {
          resolve('rtsp流地址无法访问');
        }
      };
      screenshotsTwice(options, resovleCallback, rejectCallback, logger);
      // // 删除待执行命令中的input参数中的"-ss"参数和对应的值，避免出现有的RTSP流在截图时会卡住导致超时的问题（通过命令行运行截图命令后发现卡住问题，Ctrl+C强行结束命令后会出现“could not seek to position xxx”的错误）
      // ffmpegCommand._currentInput.options.remove('-ss', 1);
      // let isTimeout = false;
      // // 设置超时返回
      // const timer = setTimeout(() => {
      //   isTimeout = true;
      //   logger.error('[Check rtsp] timeout!');
      //   resolve(false);
      // }, 10000);
      // ffmpeg(rtspUrl, { timeout: 20 })
      //   // 在x86平台的docker容器中，需设置下面参数，否则截图会报超时，使用ffmpeg命令截图时，没有这个参数，则会报：“Could not find codec parameters for stream 0 (Video: hevc, none): unspecified size”的错误
      //   .inputOptions([ '-rtsp_transport tcp' ])
      //   .setFfmpegPath(ffmpeg_static)
      //   .on('error', function(err, stdout, stderr) {
      //     logger.error('[Check rtsp] error:', err);
      //     logger.error('[Check rtsp] stdout:', stdout);
      //     logger.error('[Check rtsp] stderr:', stderr);
      //     clearTimeout(timer);
      //     if (isTimeout) {
      //       return;
      //     }
      //     resolve(false);
      //   })
      //   .on('end', function() {
      //     clearTimeout(timer);
      //     if (isTimeout) {
      //       return;
      //     }
      //     resolve(true);
      //   })
      //   .screenshots({
      //     folder,
      //     filename: fileanme || 'test-t_%s-w_%w-h_%h-r_%r-f_%f-b_%b-i_%i.png',
      //     count: 1,
      //     timemarks: [ 1 ],
      //     size: '100%',
      //   });
      // ffmpeg(rtspUrl, { timeout: 5 })
      //   // .setFfmpegPath(ffmpeg_static)
      //   .setFfprobePath(ffprobe_static.path)
      //   .ffprobe(function(err, data) {
      //     clearTimeout(timer);
      //     if (isTimeout) {
      //       return;
      //     }
      //     // 如果data有值，则表示有效，否则无效
      //     if (data) {
      //       resolve(true);
      //     } else {
      //       resolve(false);
      //     }
      //   });
    }
  });
}

/**
 * 获取服务器IP地址
 * @param {Object} ctx 当前请求的上下文对象
 * @return {string} 服务器IP地址
 */
function getServerIp(ctx) {
  return ctx?.request?.header['X-Real-IP'] || ip.address();
}
/**
 * 获取分页查询参数信息
 * @param {number} current 当前页面索引
 * @param {number} pageSize 每页数量
 * @return {object} 分页查询参数信息
 */
function getPageInfo(current, pageSize) {
  return { current: current ? +current : 1, pageSize: pageSize ? +pageSize : 10 };
}
/**
 * 获取查询的排序参数信息
 * @param {string} sort 排序字段名
 * @param {string} order 排序方式，以'desc'(不分大小写)开头则代表倒序，否则为顺序
 * @return {array} 查询的排序参数信息
 */
function getOrderInfo(sort, order) {
  if (sort) {
    const sortItem = /^desc/i.test(order) ? [ sort, 'DESC' ] : [ sort ];
    return [ sortItem ];
  }
  return [];
}
/**
 * 解析post请求参数，content-type为application/x-www-form-urlencoded 或 application/josn
 * @param {object} req 请求对象
 * @return {object} Promise对象
 */
function parsePostParams(req) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(fields);
    });
  });
}
/**
 * 获取文件的MD5值
 * @param {string} filePath 文件路径
 * @param {boolean} isBigFile 是否大文件
 * @return {string} 文件MD5值
 */
async function getFileMD5(filePath, isBigFile) {
  // 如果是大文件，则使用流的方式获取MD5值
  if (isBigFile) {
    return await new Promise((resolve, reject) => {
      const stream = fsExtra.createReadStream(filePath);
      const hash = crypto.createHash('md5');
      stream.on('data', chunk => {
        hash.update(chunk, 'utf8');
      });
      stream.on('end', () => {
        const md5 = hash.digest('hex');
        resolve(md5);
      });
    });
  }
  // 如果是小文件，则直接读取文件的二进制数据来获取MD5值
  const buffer = fsExtra.readFileSync(filePath);
  const hash = crypto.createHash('md5');
  hash.update(buffer, 'utf8');
  return hash.digest('hex');
}
/**
 * 转换创建和更新时间的时区
 * @param {string} table 表名
 * @return {array} 转换后的列数组
 */
function transformTimezone(table) {
  const tablePrefix = table ? `${table}.` : '';
  return [
    [ sequelize.literal(`datetime(${tablePrefix}createdAt, \'+08:00\')`), 'createdAt' ],
    [ sequelize.literal(`datetime(${tablePrefix}updatedAt, \'+08:00\')`), 'updatedAt' ],
  ];
}
/**
   * 获取文件最终保存的名字
   * @param {string} targetName 待存放的文件名
   * @param {string} tempName 暂存文件名
   * @param {string} basePath 文件存放的目录路径
   * @return {string} 最终保存的文件名
   */
async function getSaveFilename(targetName, tempName, basePath) {
  const targetPath = path.join(basePath, targetName);
  const tempPath = path.join(basePath, tempName);
  if (fsExtra.existsSync(targetPath)) {
    const oldMD5 = await getFileMD5(targetPath, true);
    const tempMD5 = await getFileMD5(tempPath);
    // 如果MD5值相同，则删除缓存文件，返回待存放的文件名
    if (oldMD5 === tempMD5) {
      fsExtra.removeSync(tempPath);
      return targetName;
    }
    const extname = path.extname(targetName);
    // 名字为：filename_md5.ext形式的文件
    const newFilename = `${path.basename(targetName, extname)}_${tempMD5}${extname}`;
    const newPath = path.join(basePath, newFilename);
    // 如果文件存在，则比较MD5值
    if (fsExtra.existsSync(newPath)) {
      const newMD5 = await getFileMD5(newPath);
      // MD5值不同，则使用filename_时间戳.ext的形式命名上传文件
      if (newMD5 !== tempMD5) {
        return tempName;
      }
      // MD5值相同，则删除缓存文件，返回filename_md5.ext形式的文件名
      fsExtra.removeSync(tempPath);
      return newFilename;
    }
    // 如果文件不存在，则重命名暂存文件
    fsExtra.renameSync(tempPath, newPath);
    // 返回filename_md5.ext形式的文件名
    return newFilename;
  }
  // 如果上传文件名不存在，则重命名暂存文件
  fsExtra.renameSync(tempPath, targetPath);
  return targetName;
}
/**
 * 设置下载接口返回的filename
 * @param {Object} ctx ctx对象
 * @param {String} filename 文件名字
 */
function setAttachmentFilename(ctx, filename) {
  // 根据不同浏览器设置返回的Content-Disposition字段，将文件名字符串作为URI组件进行编码，避免出现乱码
  const userAgent = (ctx.request.headers['user-agent'] || '').toLowerCase();
  if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0 || userAgent.indexOf('firefox') >= 0) {
    ctx.set('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    // } else if (userAgent.indexOf('firefox') >= 0) {
    //   ctx.set('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    //   // ctx.set('Content-Disposition', `attachment; filename*=utf8\'\' ${encodeURIComponent(camera.name)}.zip`);
  } else {
    // safari等其他非主流浏览器只能自求多福了
    ctx.set('Content-Disposition', `attachment; filename=${Buffer.from(filename, 'utf-8').toString('binary')}`);
  }
}
/**
 * 递归删除文件夹及子节点
 * @param {String} folderPath 待删除的目录路径
 */
function deleteFolderRecursive(folderPath) {
  if (fsExtra.existsSync(folderPath)) {
    fsExtra.readdirSync(folderPath).forEach(file => {
      const curPath = path.join(folderPath, file);
      if (fsExtra.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fsExtra.unlinkSync(curPath);
      }
    });
    fsExtra.rmdirSync(folderPath);
  }
}
/**
 * 下载文件
 * @param {String} filePath 文件路径
 * @param {Object} ctx ctx对象
 * @return {Object} 处理结果
 */
function downloadFile(filePath, ctx) {
  try {
    const filename = path.basename(filePath);
    if (!fsExtra.existsSync(filePath)) {
      return '文件不存在';
    }
    ctx.attachment(filePath);
    ctx.set('Content-Type', 'application/octet-stream');
    // 根据不同浏览器设置返回的Content-Disposition字段，将文件名字符串作为URI组件进行编码，避免出现乱码
    const userAgent = (ctx.request.headers['user-agent'] || '').toLowerCase();
    if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0 || userAgent.indexOf('firefox') >= 0) {
      ctx.set('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
      // } else if (userAgent.indexOf('firefox') >= 0) {
      //   ctx.set('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
      //   // ctx.set('Content-Disposition', `attachment; filename*=utf8\'\' ${encodeURIComponent(camera.name)}.zip`);
    } else {
      // safari等其他非主流浏览器只能自求多福了
      ctx.set('Content-Disposition', `attachment; filename=${Buffer.from(filename, 'utf-8').toString('binary')}`);
    }
    ctx.body = fsExtra.createReadStream(filePath);
  } catch (error) {
    return '下载失败';
  }
}
module.exports = {
  isRtsp,
  getServerIp,
  getPageInfo,
  getOrderInfo,
  parsePostParams,
  getFileMD5,
  captureRtsp,
  checkRtsp,
  transformTimezone,
  getSaveFilename,
  setAttachmentFilename,
  deleteFolderRecursive,
  downloadFile,
};
