'use strict';
const Service = require('egg').Service;
const fsExtra = require('fs-extra');
const { taskMultipleList } = require('../controller/config');

const TASK_SINGLE_LIST = 'task_single_list';
const TASK_MULTIPLE_LIST = 'task_multiple_list';

class TaskService extends Service {
  /**
   * 设置single task list中的"DistributionSendTask"项
   * @param {boolean} isEnable 是否开启
   */
  async changeDistributionSendTask(isEnable) {
    const singleFilePath = `${this.app.config.algorithmicDir}chan1/${TASK_SINGLE_LIST}.json`;
    let singleFileData = [];
    if (fsExtra.existsSync(singleFilePath)) {
      singleFileData = await fsExtra.readJson(singleFilePath);
    }
    // 找到DistributionSendTask项
    const distributionItem = singleFileData.find(item => item.type === 'DistributionSendTask');
    if (distributionItem) {
      distributionItem.enable = isEnable;
    } else {
      singleFileData.push({ type: 'DistributionSendTask', enable: isEnable });
    }
    await this.writeFile(singleFileData, 'single');
  }
  /**
   * 根据设备是否MEC分机来修改multiple task list
   * @param {boolean} isSubDevice 是否MEC分机
   */
  async changeMultipleTask(isSubDevice) {
    // this.app.locals.store.multipleTask.load();
    // let multipleData = this.app.locals.store.multipleTask.clone();
    // 从数据库获取存储的“Multiple Task List”设置
    const result = await this.service.mec.getOneColumn(1, 'multiple_task', 'multipleTask');
    let multipleData = result.multipleTask && JSON.parse(result.multipleTask);
    // 如果获取到的字段值为空，或者不是数组，则从配置文件获取或者读取配置常量
    if (!multipleData || !Array.isArray(multipleData)) {
      multipleData = await this.getTaskData(TASK_MULTIPLE_LIST) || taskMultipleList;
    }
    // } else {
    //   multipleData = multipleData.data;
    // }
    if (isSubDevice) {
      for (let index = 0; index < multipleData.length; index++) {
        const element = multipleData[index];
        element.enable = false;
      }
    }
    this.writeFile(multipleData, 'multiple');
  }
  /**
   * 将配置文件数据写入json文件
   * @param {JSON} result 写入的json数据
   * @param {string} type 文件类型
   */
  async writeFile(result, type) {
    const filename = type === 'single' ? TASK_SINGLE_LIST : TASK_MULTIPLE_LIST;
    await fsExtra.ensureDir(`${this.app.config.algorithmicDir}chan1/`);
    await fsExtra.writeJson(`${this.app.config.algorithmicDir}chan1/${filename}.json`, result, { spaces: '\t' });
  }
  /**
   * 获取所有task配置文件内容
   * @return {object} 文件内容
   */
  async getAllData() {
    const result = {};
    result.single = await this.getTaskData(TASK_SINGLE_LIST);
    result.multiple = await this.getTaskData(TASK_MULTIPLE_LIST);
    return result;
  }
  /**
   * 读取task文件内容
   * @param {string} filename 文件名
   * @return {JSON object} 文件内容
   */
  async getTaskData(filename) {
    const { algorithmicDir } = this.app.config;
    const filePath = `${algorithmicDir}chan1/${filename}.json`;
    let result = null;
    if (fsExtra.existsSync(filePath)) {
      result = await fsExtra.readJson(filePath);
    }
    return result;
  }
  /**
   * 将接口收到的数据与文件数据进行合并，得到最终要写入文件的数据
   * @param {Array} requestData 接口收到的数据
   * @param {String} type 文件类型
   * @return {Array} 最终写入文件的数据
   */
  async mergeTaskData(requestData, type) {
    const filename = type === 'single' ? TASK_SINGLE_LIST : TASK_MULTIPLE_LIST;
    const fileData = await this.getTaskData(filename);
    if (!fileData) {
      return requestData;
    }
    const requestDataMap = {};
    requestData.forEach(item => {
      requestDataMap[item.type] = item.enable;
    });
    fileData.forEach(item => {
      if (requestDataMap[item.type] !== undefined) {
        item.enable = requestDataMap[item.type];
      }
    });
    return fileData;
  }
}
module.exports = TaskService;
