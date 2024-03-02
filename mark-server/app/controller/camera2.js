'use strict';
const Stream = require('../../rtsp/videoStream');
const nodeCMD = require('node-cmd');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const BaseController = require('./base');
const fsExtra = require('fs-extra');
// const { positionName } = require('../utils/constant');
const { getPageInfo, getOrderInfo, checkRtsp } = require('../utils/utils');
const path = require('path');

class CameraController extends BaseController {


  async get() {
    const { ctx } = this;
    const { name, rtsp, current, pageSize, sort, order } = ctx.request.query;
    const orderInfo = getOrderInfo(sort, order);
    const pageParams = getPageInfo(current, pageSize);
    const result = await this.service.camera2.getByNameAndRtsp({ name, rtsp }, orderInfo, pageParams);
    this.success(result);
  }

  /**
   * 获取视频流
   */
  async getVideo() {
    const { ctx, app } = this;
    const { hash } = ctx.request.query;
    const { name } = ctx.params;
    const extName = path.extname(name);
    const type = `video/${extName.substring(1)}`;
    const filePath = path.join(app.config.videoPath, `${hash}${extName}`);
    if (!fsExtra.existsSync(filePath)) {
      this.failed('未找到文件');
      return;
    }
    const fileSize = fsExtra.statSync(filePath).size;
    // const step = parseInt(fileSize / 100);
    let start = ctx.get('range').substr(ctx.get('range').indexOf('=') + 1, ctx.get('range').indexOf('-') - 1),
      end = ctx.get('range').substr(ctx.get('range').indexOf('-') + 1);
    start = parseInt(start);
    end = parseInt(end);

    if (isNaN(start)) {
      start = 0;
    }
    if (isNaN(end)) {
      end = fileSize - 1;
      // end=start+step>=fileSize?fileSize-1:start+step;
    }
    ctx.status = 206;
    const header = {
      'Accept-Ranges': 'bytes',
      'Content-Type': type,
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'cache-control': 'public,max-age=31536000',
    };
    ctx.set(header);
    ctx.body = fsExtra.createReadStream(filePath, {
      start,
      end,
      autoClose: true,
    });
  }

  async create() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const valid = await ctx.validate('camera2', requestData, 'create');
    if (!valid) return;
    // const cameraName = positionName[String(requestData.position)];
    const cameraName = await this.service.group2.getGroupNameById(requestData.groupId);
    if (requestData.rtsp) {
      const checkResult = await checkRtsp(requestData.rtsp, `${this.imageDir}${cameraName}`, 'capture_img.png', ctx.logger)
      if (checkResult) {
        this.failed(`${checkResult}，保存失败`);
        return;
      }
    }
    // 获取状态值
    requestData.status = this.getStatus(requestData);
    const result = await this.service.camera2.create(requestData);
    if (result.returnStatus === 'SUCCEED') {
      // 新建摄像头时需调用EdgeService的保存通道算法配置接口
      this.service.edge.saveDetail2({ deviceSn: requestData.sn, id: result.data.id, operatorType: 'VIDEO', uri: requestData.rtsp, groupName: cameraName });
      this.success();
    } else {
      this.failed(result.errorMessage);
    }
  }
  async update() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const valid = await ctx.validate('camera2', requestData, 'update');
    if (!valid) return;
    // const cameraName = positionName[String(requestData.position)];
    const cameraName = await this.service.group2.getGroupNameById(requestData.groupId);
    if (requestData.rtsp) {
      const checkResult = await checkRtsp(requestData.rtsp, `${this.imageDir}${cameraName}`, 'capture_img.png', ctx.logger);
      if (checkResult) {
        this.failed(`${checkResult}，保存失败`);
        return;
      }
    }
    // 获取状态值
    requestData.status = this.getStatus(requestData);
    const result = await this.service.camera2.update(requestData);
    if (result.returnStatus === 'SUCCEED') {
      // 更新摄像头时需调用EdgeService的保存通道算法配置接口
      this.service.edge.saveDetail2({ deviceSn: requestData.sn, id: requestData.id, operatorType: 'VIDEO', uri: requestData.rtsp, groupName: cameraName });
      this.success();
    } else {
      this.failed(result.errorMessage);
    }
  }
  async delete() {
    const { ctx } = this;
    const cameraId = ctx.query.id;
    const valid = await ctx.validate('camera2', ctx.query, 'delete');
    if (!valid) return;
    const isExist = await this.app.model.Camera2.findOne({ where: { id: cameraId } });
    if (!isExist) return this.failed('ID不存在');
    // const dir = positionName[String(isExist.position)];
    const dir = await this.service.group2.getGroupNameById(isExist.groupId);
    const result = await this.service.camera2.delete(cameraId);
    // 删除摄像头时需调用EdgeService的删除通道算法配置接口
    // this.service.edge.deleteDetail2([{ operatorType: 'VIDEO', ids: [ cameraId ] }]);
    let data = {
      analyIds: [
        { 
          operatorType: 'VIDEO', 
          ids: [ cameraId ] 
        }
      ], 
      taskCode: 'chan2'
    }
    this.service.edge.deleteDetail(data);
    await this.deleteCameraConfig(dir);
    this.success();
  }

  async deleteCameraConfig(dirName) {
    const dir = this.app.config.algorithmicDir + 'chan2/cfg_single/' + dirName;
    const isDirExist = await fsExtra.pathExists(dir);
    if (isDirExist) {
      await fsExtra.remove(dir);
    }
  }
  // 解析rtsp
  startRtsp() {
    if (this.app.rtspStream.wsServer.clients.size >= 5) {
      this.failed('同时浏览不能超过5台');
    } else {
      this.success();
    }
  }

  closeRtsp() {
    // if (this.app.rtspStream) {
    //   this.app.rtspStream.stop();
    //   this.app.rtspStream = null;
    // }
    // const rtspStream = this.app.rtspStream.pop();
    // if (rtspStream) {
    //   rtspStream.stop();
    // }
    this.success();
  }

  async rebootDevice() {
    // setTimeout(()=> {
    //   nodeCMD.runSync("docker stop $(docker ps -a --format 'table {{.ID}}' | sed -n '2,$p') && \
    //   docker start $(docker ps -a --format 'table {{.ID}}' | sed -n '2,$p')");
    // },1000)


    // nodeCMD.runSync("docker stop $(docker ps -a --format 'table {{.ID}}' | sed -n '2,$p') && \
    //   docker start $(docker ps -a --format 'table {{.ID}}' | sed -n '2,$p')");
    // this.success();
    try {
      // 应用当前配置的时候需调用EdgeService的配置应用接口
      this.service.edge.saveApply2();
      // 获取所有容器信息，需带上all参数
      const containersInfo = await this.getContainersInfo({ all: true });
      // 找到需要重启的容器
      const algoContainer = containersInfo.find(item => /v2x\/bin/.test(item.Command));
      if (algoContainer) {
        // 重启容器
        const result = await this.restartContainer(algoContainer.Id);
        // const result = await this.tcpConnect('restart_dockers');
        this.success(result);
      } else {
        this.failed('Container not found');
      }
    } catch (error) {
      this.failed(error.message || 'error');
    }
  }
  /**
   * 获取摄像头的状态值
   * @param {object} data 源数据
   * @return {string} 状态值
   */
  getStatus(data) {
    // 如果视频和rtsp都为空，则设置状态为“摄像机和视频都不可用”
    if ((!data.video || data.video.length === 0) && !data.rtsp) {
      return '1';
    }
    // 如果视频不为空，或rtsp不为空，则设置状态为“运行正常”
    return '2';
  }
}

module.exports = CameraController;
