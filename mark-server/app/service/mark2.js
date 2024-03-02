'use strict';
const Service = require('egg').Service;

class MarkService extends Service {

  async create(cameraId, data, imageInfo) {
    // const index = 0;
    const insertData = [];
    const dataToBeDeleted = [];
    // 标定页面提交数据时进入if逻辑中
    if (data && data.length > 0 && data[0].data) {
      data.forEach(a => {
        // 如果delete为真，表示是待删除的数据
        if (a.delete) {
          dataToBeDeleted.push({ camera_id: cameraId, type: a.type, file_name: a.name });
        } else {
          const item = { id: new Date().getTime().toString(), camera_id: cameraId, type: a.type, value: JSON.stringify(a.data), image_info: JSON.stringify(imageInfo), file_name: a.name };
          insertData.push(item);
        }
      });
    } else {
      // 如果是从分机拉取数据时做存储，则执行下面逻辑
      data.forEach(item => {
        item.camera_id = cameraId;
        delete item.id;
        insertData.push(item);
      });
    }
    // let sql = 'insert into mark(camera_id,type,value) values';
    // insertData.forEach((data, index) => {
    //   if (index !== 0) {
    //     sql += ',';
    //   }
    //   sql += `(${data.camera_id},'${data.type}','${data.value}')`;
    // });
    // sql += ' on duplicate key update value=values(value)';
    // const result = this.app.model.transaction(() => {
    //   for (let i = 0; i< insertData.length)
    // })
    // console.log(this.app.model.transaction);
    // const handler = async () => {
    //   if (index === insertData.length) return;
    //   await this.app.model.Mark.upsert(insertData[index]);
    //   index++;
    //   handler();
    // };
    const result = await this.app.model.transaction(async () => {
      for (let i = 0; i < insertData.length; i++) {
        await this.app.model.Mark2.upsert(insertData[i]);
      }
      // 执行数据库删除操作
      for (let i = 0; i < dataToBeDeleted.length; i++) {
        await this.app.model.Mark2.destroy({ where: dataToBeDeleted[i] });
      }
    });
    return result;
  }

  async handleMarkData(params) {
    const cameraId = params.cameraId;
    const data = params.data;
    const imageInfo = params.imageInfo;
    return this.create(cameraId, data, imageInfo);
  }

  async getMarkData(cameraId) {
    const result = await this.app.model.Mark2.findAll({
      where: { camera_id: cameraId },
    });
    return result;
  }

  async deleteData(cameraId) {
    const result = await this.app.model.Mark2.destroy({ where: { camera_id: cameraId } });
    return result;
  }

  // 获取所有数据
  async getReportData() {
    const result = await this.app.model.Mark2.findAll();
    const resultGroup = this.ctx.helper.groupBy(result, item => item.camera_id);
    const result2 = await this.app.model.Camera2.findAll();
    const cameraData = this.ctx.helper.groupBy(result2, item => item.id);
    return { resultGroup, cameraData };
  }
}

module.exports = MarkService;
