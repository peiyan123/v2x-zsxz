'use strict';
const Service = require('egg').Service;
const { transformTimezone } = require('../utils/utils');

class RsuService extends Service {
  async getAll() {
    const result = await this.app.model.Rsu.findAll({
      order: [[ 'createdAt', 'DESC' ]],
      attributes: { include: transformTimezone() },
    });
    return result;
  }
  async create(data) {
    const allData = await this.getAll()
    for (let i = 0; i < allData.length; i++) {
      if (data.name && allData[i].name == data.name) return { data: '', returnStatus: 'FAILED', errorMessage: '设备名重复' };
      if (allData[i].ip == data.ip) return { data: '', returnStatus: 'FAILED', errorMessage: 'IP地址重复' };
      if (allData[i].position == data.position) return { data: '', returnStatus: 'FAILED', errorMessage: '相同安装位置已存在相同设备' };
    }

    const result = await this.app.model.Rsu.create(data);
    return { data: result, returnStatus: 'SUCCEED' };
  }
  async update(data) {
    const isExist = await this.app.model.Rsu.findOne({where: {id: data.id}})
    if (!isExist) return { data: '', returnStatus: 'FAILED', errorMessage: 'ID不存在' };
    const allData = await this.getAll()
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].id == data.id) continue;
      if (data.name && allData[i].name == data.name) return { data: '', returnStatus: 'FAILED', errorMessage: '设备名重复' };
      if (allData[i].ip == data.ip) return { data: '', returnStatus: 'FAILED', errorMessage: 'IP地址重复' };
      if (allData[i].position == data.position) return { data: '', returnStatus: 'FAILED', errorMessage: '相同安装位置已存在相同设备' };
    }
    const result = await this.app.model.Rsu.update(data, {
      where: { id: data.id },
    });
    return { data: result, returnStatus: 'SUCCEED' };
  }

  async delete(id) {
    const result = await this.app.model.Rsu.destroy({
      where: { id },
    });
    return result;
  }
}
module.exports = RsuService;
