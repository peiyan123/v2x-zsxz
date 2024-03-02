'use strict';

const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');
const dayjs = require('dayjs');

const Controller = require('egg').Controller;
const BaseController = require('./base');
// const ip = require('ip');
const port = require('../../config/constant').port;
const { getServerIp, parsePostParams, getFileMD5 } = require('../utils/utils');
const { commonDir } = require('../utils/constant');

class UploadController extends BaseController {
  async upload() {
    const ctx = this.ctx;
    const currentServerIp = getServerIp(ctx);
    const protocol = this.ctx.request.header['x-forwarded-proto'];
    const stream = await ctx.getFileStream();
    const extname = path.extname(stream.filename);
    if (![ '.png', '.jpeg', '.jpg' ].includes(extname.toLocaleLowerCase())) return this.failed('请上传.png,.jpg,.jpeg的格式');
    // const filename = `holo-img${path.extname(stream.filename).toLocaleLowerCase()}`;
    const filename = 'holo-img' + extname;
    // 生成mec全息路口图片图片目录
    const uploadBasePath = 'app/public/uploads';
    const dirname = 'holo-img';
    // 清空目录并生成目录
    await fsExtra.emptyDir(path.join(uploadBasePath, dirname));
    // 生成写入路径
    const target = path.join(uploadBasePath, dirname, filename);
    // 写入流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (error) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      // 自定义方法
      this.ctx.throw(error);
    }
    const url = protocol + '://' + currentServerIp + ':' + port + '/public/uploads/' + dirname + '/' + filename;
    // this.service.mec.saveMecConfig({id: 1, imageUrl: url});
    this.success({ url });
  }

  async uploadCameraImage() {
    const ctx = this.ctx;
    const { cameraId } = this.ctx.request.query;
    const currentServerIp = getServerIp(this.ctx);
    const protocol = this.ctx.request.header['x-forwarded-proto'];
    const stream = await ctx.getFileStream();
    const extname = path.extname(stream.filename);
    const fileBaseName = path.basename(stream.filename, extname);
    if (![ '.png', '.jpeg', '.jpg' ].includes(extname.toLocaleLowerCase())) return this.failed('请上传.png,.jpg,.jpeg的格式');
    // 生成mec全息路口图片图片目录
    const uploadBasePath = 'app/public/cameraImage';
    const filenameTemp = `${fileBaseName}_${Date.now()}${extname}`;
    // 生成写入路径
    const target = path.join(uploadBasePath, filenameTemp);
    // 写入流
    const writeStream = fs.createWriteStream(target);
    let saveFile = '';
    try {
      const camera = await this.app.model.Camera.findOne({ where: { id: cameraId } });
      if (!camera) {
        return this.failed('摄像头不存在');
      }
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
      saveFile = await this.getSaveFilename(stream.filename, filenameTemp, uploadBasePath);
      await camera.update({ imagePath: `${uploadBasePath}/${saveFile}` });
    } catch (error) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      // 自定义方法
      this.ctx.throw(error);
    }
    const url = protocol + '://' + currentServerIp + ':' + port + '/public/cameraImage/' + saveFile;
    // this.service.mec.saveMecConfig({id: 1, imageUrl: url});
    this.success({ url });
  }
  /**
   * 获取文件最终保存的名字
   * @param {string} targetName 待存放的文件名
   * @param {string} tempName 暂存文件名
   * @param {string} basePath 文件存放的目录路径
   * @return {string} 最终保存的文件名
   */
  async getSaveFilename(targetName, tempName, basePath) {
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

  async uploadCert() {
    const ctx = this.ctx;
    // const currentServerIp = ip.address();
    // const protocol = this.ctx.request.header['x-forwarded-proto'];
    const stream = await ctx.getFileStream();
    const extname = path.extname(stream.filename);
    if (![ '.key', '.pem' ].includes(extname.toLocaleLowerCase())) return this.failed('请上传.pem,.key的格式');
    // const filename = `holo-img${path.extname(stream.filename).toLocaleLowerCase()}`;
    const filename = 'mqtt-ca' + extname;
    // 生成mec全息路口图片图片目录
    const uploadBasePath = 'app/public/uploads';
    const dirname = 'cert';
    // 清空目录并生成目录
    await fsExtra.emptyDir(path.join(uploadBasePath, dirname));
    // 生成写入路径
    const target = path.join(uploadBasePath, dirname, filename);
    // 写入流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (error) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      // 自定义方法
      this.ctx.throw(error);
    }
    this.success();
  }
  /**
   * 分片上传文件入口方法
   */
  async uploadChunkFile() {
    const { ctx } = this;
    const parts = ctx.multipart();
    // 切片上传
    // const file = await ctx.getFileStream();
    const { hash, name } = await parsePostParams(ctx.req);
    const { videoPath } = this.app.config;
    const chunkPath = path.resolve(videoPath, hash);
    await fsExtra.ensureDir(chunkPath);
    let stream;
    while ((stream = await parts()) != null) {
      if (stream.filename) {
        const filename = stream.filename.toLowerCase();
        const target = path.join(chunkPath, filename);
        const writeStream = fs.createWriteStream(target);
        await awaitWriteStream(stream.pipe(writeStream));
      }
    }
    // 将文件移入目录
    // await fsExtra.move(file.filepath, `${chunkPath}/${name}`);
    this.success('切片上传成功');
  }
  /**
   * 切片融合
   */
  async mergeChunkFile() {
    const { name, ext, hash, size } = this.ctx.request.body;
    const { videoPath } = this.app.config;
    const filePath = path.resolve(videoPath, `${hash}.${ext}`);
    const chunks = await this.sortMergeFile(hash);
    await this.mergeChunks(chunks, filePath, size);
    const chunkTempDir = path.resolve(videoPath, hash);
    // 删除切片文件目录
    await fsExtra.remove(chunkTempDir);
    this.success({
      url: `/public/${hash}.${ext}`,
    });
  }
  /**
   * 对切片文件按文件名进行排序
   * @param {string} fileHash 文件hash
   * @return {array} 排序后的文件切换数组
   */
  async sortMergeFile(fileHash) {
    // 读取public存放的切片文件夹
    const { videoPath } = this.app.config;
    const chunkDir = path.resolve(videoPath, fileHash);
    let chunks = await fsExtra.readdir(chunkDir);
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1]);
    chunks = chunks.map(cp => path.resolve(chunkDir, cp));
    return chunks;
  }
  /**
   * 合并切片文件
   * @param {array} files 切片文件数组
   * @param {string} dest 融合后文件的路径
   * @param {number} size 分片的大小
   */
  async mergeChunks(files, dest, size) {
    // 将切片流生成新的文件
    const pipStream = (filePath, writeStream) => new Promise(resolve => {
      const readStream = fsExtra.createReadStream(filePath);
      readStream.on('end', () => {
        // 删除文件
        fsExtra.unlinkSync(filePath);
        resolve();
        // 如果不调用这句，则windows上会出现合并文件大小为0的情况
        writeStream.end();
      });
      readStream.pipe(writeStream, { end: false });
    });
    // const writeStream = fsExtra.createWriteStream(dest);
    await Promise.all(
      files.map((file, index) => pipStream(file, fsExtra.createWriteStream(dest, {
        start: index * size,
        end: (index + 1) * size,
      })))
    );
  }
  /**
   * 检查待上传文件的状态
   */
  async checkChunkFile() {
    const { ext, hash } = this.ctx.request.body;
    const { videoPath } = this.app.config;
    const filePath = path.resolve(videoPath, `${hash}.${ext}`);
    let uploaded = false;
    let uploadedList = [];
    if (fsExtra.existsSync(filePath)) {
      // 文件存在
      uploaded = true;
    } else {
      // 文件不存在，则获取已经上传的分块列表
      uploadedList = await this.getUploadedList(path.resolve(videoPath, hash));
    }
    this.success({
      uploaded,
      uploadedList,
    });
  }
  /**
   * 获取已上传分块名字
   * @param {string} dirPath 分块文件所在的目录路径
   * @return {array} 已上传分块名字的数组
   */
  async getUploadedList(dirPath) {
    return fsExtra.existsSync(dirPath)
      ? (await fsExtra.readdir(dirPath)).filter(name => name[0] !== '.')
      : [];
  }
  /**
   * 上传车标定的外参文件
   */
  async uploadExtrinsicBin() {
    const ctx = this.ctx;
    const stream = await ctx.getFileStream();
    const extname = path.extname(stream.filename);
    if (![ '.bin' ].includes(extname.toLocaleLowerCase())) return this.failed('上传文件类型不正确');
    if (!stream.fields) {
      this.failed('缺少Group参数');
      return;
    }
    // 获取group名字
    const groupName = stream.fields.group;
    // 生成车标定文件存储目录路径
    const dir = this.app.config.algorithmicDir + 'chan1/cfg_single/' + groupName + commonDir;
    // 清空目录并生成目录
    await fsExtra.ensureDir(dir);
    // 生成写入路径
    const target = path.join(dir, stream.filename);
    // 写入流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (error) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      // 自定义方法
      this.ctx.throw(error);
    }
    this.success();
  }
}

module.exports = UploadController;
