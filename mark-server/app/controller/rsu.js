'use strict';

const BaseController = require('./base');
const fsExtra = require('fs-extra');

class RsuController extends BaseController {
  async get() {
    const result = await this.service.rsu.getAll();
    this.success(result);
  }
  async create() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const valid = await ctx.validate('rsu', requestData,'create');
    if (!valid) return
    const result = await this.service.rsu.create(requestData);
    if (result.returnStatus === 'SUCCEED') {
      this.success();
    } else {
      this.failed(result.errorMessage);
    }
  }
  async update() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const valid = await ctx.validate('rsu', requestData,'update');
    if (!valid) return
    const result = await this.service.rsu.update(requestData);
    if (result.returnStatus === 'SUCCEED') {
      this.success();
    } else {
      this.failed(result.errorMessage);
    }
  }
  async delete() {
    const { ctx } = this;
    const RsuId = ctx.query.id;
    const valid = await ctx.validate('rsu', ctx.query,'delete');
    if (!valid) return
    const isExist = await this.app.model.Rsu.findOne({where: {id: RsuId}})
    if (!isExist) return this.failed('ID不存在')
    const result = await this.service.rsu.delete(RsuId);
    this.success();
  }
  async reportData() {
    const { ctx } = this;
    await this.writeDeviceData();
    this.success();
  }
  async writeDeviceData() {
    const filePath = `${this.app.config.cfgMultipleDir}publish_task/gohighclient_task.json`;
    const allDeviceData = await this.service.rsu.getAll();
    const writeData = allDeviceData.map(item => {
      return {
        ip: item.ip, // 可配置
        port: +item.port, // 可配置
        emergency_threshold: item.emergencyThreshold, // 警告阈值, 可配置
        enable_external_storage_emergency: false,
        frequency: item.frequency, // 单位为Hz, 可配置
        heartbeat_period: item.heartbeatPeriod, // 单位为s, 可配置
        device_info_send_period: item.sendPeriod, // 单位为s, 可配置
        reconnect_maxcnt: -1,
        timeout: -1,
        save_file: false,
        save_file_path: '/home/gohigh.json',
        event_data: true,
        statistic_data: true,
      };
    });
    await fsExtra.ensureFile(filePath);
    await fsExtra.writeJson(filePath, writeData, { spaces: '\t' });
  }
  // // 设备数据写入文件
  // async writeDeviceData() {
  //   const filePath = this.deviceConfigPath;
  //   // const filePath = 'app/public/files/default-empty.json';
  //   const emptyArr = [];
  //   const allDeviceData = await this.service.rsu.getAll();
  //   const result = await fsExtra.readJson(filePath);
  //   const mbConfigs = result['mb-configs'];
  //   const filterMbConfigs = mbConfigs.filter((item) => {
  //     return item.mbc !== 'rsunebulalink' && item.mbc !== 'gohighclient'
  //   })
  //   const deviceData = allDeviceData.map((item) => {
  //     return {
  //       name: item.name,
  //       enable: true,
  //       mbc: item.facturer,
  //       'mbc-config': {
  //         server: {
  //           ip: item.ip,
  //           port: item.port
  //         }
  //       }
  //     }
  //   })
  //   result['mb-configs'] = [...filterMbConfigs,...deviceData]
  //   await fsExtra.writeJson(filePath, result);
  // }
}

module.exports = RsuController;
