'use strict';

const BaseController = require('./base');

class TaskController extends BaseController {
  /**
   * 将task_single_list配置写入json文件
   */
  async saveSingleConfig() {
    const requestData = this.ctx.request.body;
    // const writeData = await this.service.task.mergeTaskData(requestData, 'single');
    await this.service.task2.writeFile(requestData, 'single');
    this.success();
  }
  /**
   * 将task_multiple_list配置写入json文件
   */
  async saveMultipleConfig() {
    const requestData = this.ctx.request.body;
    // const writeData = await this.service.task.mergeTaskData(requestData, 'multiple');
    await this.service.task2.writeFile(requestData, 'multiple');
    // // 将配置保存在.config目录中，以便恢复
    // this.app.locals.store.multipleTask.set({ data: requestData });
    // 将配置保存在数据库中，以便恢复
    this.service.mec2.saveMecConfig({ id: 1, multipleTask: requestData });
    this.success();
  }

  /**
   * 获取task_single_list.json和task_multiple_list.json文件内容并返回
   */
  async getTaskConfig() {
    const result = await this.service.task2.getAllData();
    this.success(result);
  }

}

module.exports = TaskController;
