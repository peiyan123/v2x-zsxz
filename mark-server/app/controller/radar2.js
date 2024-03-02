'use strict';

const BaseController = require('./base');
const fsExtra = require('fs-extra');
const fs = require('fs');
const _ = require('lodash');
const { cameraConfigJsonData, radarConfigJsonData, deviceType, sensorJsonData } = require('./config');
const await = require('await-stream-ready/lib/await');
const { positionName, positionName2 } = require('../utils/constant');
const { pick } = require('lodash');

class RadarController extends BaseController {
  async get() {
    const { ctx } = this;
    const result = await this.service.radar2.getAll();
    this.success(result);
  }
  async create() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const valid = await ctx.validate('radar2', requestData, 'create');
    if (!valid) return;
    const result = await this.service.radar2.create(requestData);
    if (result.returnStatus === 'SUCCEED') {
      const groupName = await this.service.group2.getGroupNameById(requestData.groupId);
      // 新建雷达时需调用EdgeService的保存通道算法配置接口
      this.service.edge.saveDetail2({ radarType: requestData.model, operatorType: 'LIDAR', radarIp: requestData.ip, deviceSn: requestData.sn, id: result.data.id, groupName, ...pick(requestData, [ 'port', 'protocol', 'mbcIp', 'mbcPort', 'mbcNetworkCard' ]) });
      this.success();
    } else {
      this.failed(result.errorMessage);
    }
  }
  async update() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    // 如果上传的状态为null，则设置为默认状态
    if (requestData.status === null) {
      requestData.status = '0';
    }
    const valid = await ctx.validate('radar2', requestData, 'update');
    if (!valid) return;
    const result = await this.service.radar2.update(requestData);
    if (result.returnStatus === 'SUCCEED') {
      const groupName = await this.service.group2.getGroupNameById(requestData.groupId);
      // 更新雷达时需调用EdgeService的保存通道算法配置接口
      this.service.edge.saveDetail2({ radarType: requestData.model, operatorType: 'LIDAR', radarIp: requestData.ip, deviceSn: requestData.sn, groupName, ...pick(requestData, [ 'id', 'port', 'protocol', 'mbcIp', 'mbcPort', 'mbcNetworkCard' ]) });
      this.success();
    } else {
      this.failed(result.errorMessage);
    }
  }
  async delete() {
    const { ctx } = this;
    const radarId = ctx.query.id;
    const valid = await ctx.validate('radar2', ctx.query, 'delete');
    if (!valid) return;
    const isExist = await this.app.model.Radar2.findOne({ where: { id: radarId } });
    if (!isExist) return this.failed('ID不存在');
    // const dir = positionName[String(isExist.position)];
    const dir = await this.service.group2.getGroupNameById(isExist.groupId);
    const result = await this.service.radar2.delete(radarId);
    // 删除雷达时需调用EdgeService的删除通道算法配置接口
    let data = {
      analyIds: [
        { 
          operatorType: 'LIDAR', 
          ids: [ radarId ] 
        }
      ], 
      taskCode: 'chan2'
    }
    this.service.edge.deleteDetail(data);
    // 将sensor 雷达属性 enable：false
    await this.deleteRadarConfig(dir);
    this.success();
  }

  // 设备数据写入文件
  async writeDeviceData() {
    // const filePath = this.deviceConfigPath;
    const filePath = 'app/public/files/default-empty2.json';
    const emptyArr = [];
    const allDeviceData = await this.service.radar2.getAll();
    const result = await fsExtra.readJson(filePath);
    // result['chan-configs'][0]['spl-configs'] = [];
    // 过滤出非雷达的设备
    const notRadarData = result['chan-configs'][0]['spl-configs'].filter(a => a.spl != 'mmwradar');
    allDeviceData.forEach((item, index) => {
      const radarConfigJson = this.cloneDeep(radarConfigJsonData);
      radarConfigJson.name = item.name;
      radarConfigJson['camera-id'] = positionName[String(item.position)] + '_' + String(index * 2 + 1);
      radarConfigJson.config.manufacturer = item.facturer;
      radarConfigJson.config.general[item.facturer] = {
        uri: item.ip,
        port: item.port,
        protocol: item.protocol.toLocaleLowerCase(),
      };
      emptyArr.push(radarConfigJson);
    });
    result['chan-configs'][0]['spl-configs'] = [ ...emptyArr, ...notRadarData ];
    result['chan-configs'][0]['alg-configs'][0].mask = [ ...emptyArr, ...notRadarData ].map(a => a.name);
    result['chan-configs'][0]['alg-configs'][0].config.fusecfgpath = this.algorithmicDir;
    await fsExtra.writeJson(filePath, result);
  }

  // 上报雷达数据
  async reportData() {
    const { ctx } = this;
    const allDeviceData = await this.service.radar2.getAll();
    for (let i = 0; i < allDeviceData.length; i++) {
      const groupName = await this.service.group2.getGroupNameById(allDeviceData[i].groupId);
      allDeviceData[i].positionName = groupName;
      // allDeviceData[i].positionName = positionName[allDeviceData[i].position];
      const result = await this.writeRreportData(allDeviceData[i]);
      if (!result) return this.failed(`请先上报组：“${groupName}”的摄像头数据`);
      // if (!result) return this.failed(`请先上报${positionName2[allDeviceData[i].position]}位置的摄像头数据`);
    }
    // await this.writeDeviceData();
    this.success();
  }

  async writeRreportData(data) {
    const isDirExsit = await fsExtra.pathExists(this.app.config.algorithmicDir + 'chan2/cfg_single/' + data.positionName);
    if (!isDirExsit) return false;
    const fileName = this.app.config.algorithmicDir + 'chan2/cfg_single/' + data.positionName + '/sensor.json';
    const sensorJson = _.cloneDeep(sensorJsonData);
    // const fileName = 'app/public/files/lgj.json';
    const isFileExsit = await fsExtra.pathExists(fileName);
    if (isFileExsit) {
      const fileData = await fsExtra.readJson(fileName);
      fileData.radar.enable = true;
      fileData.radar.ip = data.ip;
      fileData.radar.port = data.port;
      fileData.sub_name = data.positionName;
      await fsExtra.writeJson(fileName, fileData);
    }
    return true;
  }

  async deleteRadarConfig(dir) {
    const fileName = this.app.config.algorithmicDir + 'chan2/cfg_single/' + dir + '/sensor.json';
    const isFileExsit = await fsExtra.pathExists(fileName);
    if (isFileExsit) {
      const fileData = await fsExtra.readJson(fileName);
      fileData.radar.enable = false;
      await fsExtra.writeJson(fileName, fileData);
    }
  }
}

module.exports = RadarController;
