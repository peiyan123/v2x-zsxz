'use strict';
const Service = require('egg').Service;
const { transformTimezone } = require('../utils/utils');

class RadarService extends Service {
  async getAll() {
    const result = await this.app.model.Radar2.findAll({
      order: [[ 'createdAt', 'DESC' ]],
      attributes: { include: transformTimezone(),
      },
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
    const result = await this.app.model.Radar2.create(data);
    return { data: result, returnStatus: 'SUCCEED' };
  }
  async update(data) {
    const isExist = await this.app.model.Radar2.findOne({where: {id: data.id}})
    if (!isExist) return { data: '', returnStatus: 'FAILED', errorMessage: 'ID不存在' };
    const allData = await this.getAll()
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].id == data.id) continue;
      if (data.name && allData[i].name == data.name) return { data: '', returnStatus: 'FAILED', errorMessage: '设备名重复' };
      if (allData[i].ip == data.ip) return { data: '', returnStatus: 'FAILED', errorMessage: 'IP地址重复' };
      if (allData[i].position == data.position) return { data: '', returnStatus: 'FAILED', errorMessage: '相同安装位置已存在相同设备' };
    }
    const result = await this.app.model.Radar2.update(data, {
      where: { id: data.id },
    });
    return { data: result, returnStatus: 'SUCCEED' };
  }
  /**
   * 新建或更新雷达数据
   * @param {object} data 雷达数据
   * @return {object} 新建或更新结果
   */
  async upsertRadar(data) {
    // 根据组id查找是否有对应的radar数据
    const radarInfo = await this.app.model.Radar2.findOne({ where: { groupId: data.groupId } });
    // 未找到，则添加
    if (!radarInfo) {
      return await this.create(data);
    }
    // 找到，则更新
    data.id = radarInfo.id;
    return await this.update(data);
  }

  async delete(id) {
    const result = await this.app.model.Radar2.destroy({
      where: { id },
    });
    return result;
  }
  /**
   * 根据组id查询雷达信息
   * @param {number} groupId 组id
   * @return {object} 查询结果
   */
  async getRadarByGroupId(groupId) {
    const result = await this.app.model.Radar2.findOne({
      where: { groupId },
    });
    return result;
  }
}
module.exports = RadarService;
