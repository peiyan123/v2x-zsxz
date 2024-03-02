'use strict';

const BaseController = require('./base');
/**
 * 管理settings文件信息的类
 */
class SettingsController extends BaseController {
  /**
   * 获取当前设备是否分布式子设备
   */
  async getSubDevice() {
    // // 在get前需调用下load，以避免get的数据有时会出现脏数据的问题
    // this.app.locals.store.settings.load();
    // const isSubDevice = this.app.locals.store.settings.get('isSubDevice');
    // 获取数据库中保存的设置
    const result = await this.service.mec.getOneColumn(1, 'sub_device');
    const isSubDevice = result && result.subDevice || false;
    this.success({ isSubDevice });
  }
  /**
   * 设置设备为分布式子设备或非子设备
   */
  async setSubDevice() {
    const { ctx } = this;
    const { isSubDevice } = ctx.request.body;
    // app.locals.store.settings.set('isSubDevice', isSubDevice);
    // 将设置存储到数据库中
    this.service.mec.saveMecConfig({ id: 1, subDevice: isSubDevice });
    // 修改single task list中的"DistributionSendTask"项
    this.service.task.changeDistributionSendTask(isSubDevice);
    // 修改multiple task list
    this.service.task.changeMultipleTask(isSubDevice);
    this.success();
  }
}

module.exports = SettingsController;
