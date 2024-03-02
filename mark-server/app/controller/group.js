'use strict';

const BaseController = require('./base');
const fsExtra = require('fs-extra');
const { deleteFolderRecursive } = require('../utils/utils');

class GroupController extends BaseController {
  /**
   * 获取所有的组
   */
  async getAll() {
    const result = await this.service.group.getAll();
    this.success(result);
  }
  /**
   * 获取组的基本信息和设备信息
   */
  async getGroupInfoById() {
    const { ctx } = this;
    const { id } = ctx.request.query;
    const result = await this.service.group.getGroupInfoById(id);
    if (result.returnStatus === 'SUCCEED') {
      this.success(result.data);
    } else {
      this.failed(result.errorMessage);
    }
  }
  /**
   * 创建组
   */
  async create() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const valid = await ctx.validate('group', requestData, 'create');
    if (!valid) return;
    const result = await this.service.group.create(requestData);
    if (result.returnStatus === 'SUCCEED') {
      this.success(result.data);
    } else {
      this.failed(result.errorMessage);
    }
  }
  /**
   * 更新组
   */
  async update() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const valid = await ctx.validate('group', requestData, 'update');
    if (!valid) return;
    const result = await this.service.group.update(requestData);
    if (result.returnStatus === 'SUCCEED') {
      this.success();
    } else {
      this.failed(result.errorMessage);
    }
  }
  /**
   * 删除组
   */
  async delete() {
    const { ctx } = this;
    const id = ctx.query.id;
    const valid = await ctx.validate('group', ctx.query, 'delete');
    if (!valid) return;
    const result = await this.service.group.delete(id);
    if (result.returnStatus === 'SUCCEED') {
      // 删除摄像头或雷达时需调用EdgeService的删除通道算法配置接口
      if (result.deleteIds && result.deleteIds.length > 0) {
        let data = {
          analyIds: result.deleteIds,
          taskCode: 'chan1'
        }
        this.service.edge.deleteDetail(data);
      }
      if (result && result.data && result.data.name) {
        // 删除configs/cfg_single/目录下的对应group名字对应的文件夹及子文件夹
        deleteFolderRecursive(`${this.app.config.algorithmicDir}chan1/cfg_single/${result.data.name}`);
      }
      this.success();
    } else {
      this.failed(result.errorMessage);
    }
  }
  /**
   * 从分机拉取数据
   */
  async pullDataFromExtension() {
    const { ctx } = this;
    const id = ctx.query.id;
    const { data } = await this.service.group.getGroupInfoById(id);
    if (data.extensionIp) {
      try {
        // 发送请求，获取数据
        const result = await this.sendRequest(`http://${data.extensionIp}:8001/group/all-info`, { params: { name: data.name } }, 'get');
        if (result.returnStatus === 'SUCCEED') {
          const data = result.data;
          if (data) {
            // 更新group的dataPort字段
            await this.service.group.update({ id, dataPort: data.dataPort });
            if (data.camera) {
              // 修改group id，避免拉取的和当前id不一致
              data.camera.groupId = id;
              // 删除id，防止覆盖其他组数据
              delete data.camera.id;
              // 更新camera
              const { data: cameraId } = await this.service.camera.upsertCamera(data.camera);
              const mark = data.mark;
              if (mark && mark.length > 0 && cameraId) {
                // const cameraId = mark[0].camera_id;
                const imageInfo = mark[0].image_info;
                // 更新标注信息
                await this.service.mark.create(cameraId, mark, imageInfo);
              }
            }
            if (data.radar) {
              // 修改group id，避免拉取的和当前id不一致
              data.radar.groupId = id;
              // 删除id，防止覆盖其他组数据
              delete data.radar.id;
              // 更新radar
              await this.service.radar.upsertRadar(data.radar);
            }
          }
          this.success();
        } else {
          const msg = result.errorMessage || '拉取失败，请检查ip配置';
          this.failed(msg);
        }
      } catch (e) {
        ctx.logger.error('######## pull result error', e);
        this.failed('拉取失败，请检查ip配置');
      }
    } else {
      this.failed('拉取失败，请检查ip配置');
    }
  }
  /**
   * 根据group ID获取组的所有数据包括标注数据
   */
  async getAllInfoByGroupName() {
    const { ctx } = this;
    const { name } = ctx.request.query;
    const result = await this.service.group.getGroupInfoByName(name);
    if (result.returnStatus === 'SUCCEED') {
      const { data } = result;
      if (!data) {
        this.failed('未找到对应组的数据');
      } else {
        let markData = null;
        if (data.camera) {
          const cameraId = data.camera.id;
          // 获取标注数据
          markData = await this.service.mark.getMarkData(cameraId);
          data.dataValues.mark = markData;
        }
        // data.mark = markData;
        this.success(data);
      }
    } else {
      this.failed(result.errorMessage);
    }
  }
  /**
   * 导入配置参数接口
   */
  async uploadConfigFiles() {
    const { ctx } = this;
    const parts = ctx.multipart();
    // 先删除group表中的数据，以及关联表的数据
    await this.service.group.deleteAllGroups();
    await fsExtra.emptyDir(this.app.config.algorithmicDir + 'chan1/');
    // 用于保存group名字和camera ID映射关系的对象， key为group名字，value为camera ID
    const cameraIds = {};
    let stream;
    while ((stream = await parts()) != null) {
      if (stream.filename) {
        // 解析配置文件数据为数据库数据，并将数据存储在对应表中，然后保存文件到mec对应位置
        await this.service.group.saveConfigFiles(stream, cameraIds);
        // console.log('ffffffffffffff', filename)
        // console.log('field: ' + stream.fieldname);
        // console.log('filename: ' + stream.filename);
        // console.log('encoding: ' + stream.encoding);
        // console.log('mime: ' + stream.mime);
      } else if (stream.length) {
        // 处理其他参数
        // console.log('field: ' + stream[0]);
        // console.log('value: ' + stream[1]);
        // console.log('valueTruncated: ' + stream[2]);
        // console.log('fieldnameTruncated: ' + stream[3]);
      }
    }
    // 更新相机标定页面的图片
    await this.service.group.updateCameraImage(cameraIds);
    this.success('参数上传成功');
  }
}

module.exports = GroupController;
