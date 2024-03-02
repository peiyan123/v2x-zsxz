'use strict';
const Service = require('egg').Service;
const sequelize = require('sequelize');
const { transformTimezone } = require('../utils/utils');

class CameraService extends Service {
  async getAll() {
    const result = await this.app.model.Camera.findAll({ order: [[ 'createdAt', 'DESC' ]] });
    return result;
  }
  /**
   * 以name和rtsp为搜索条件来查询camera列表
   * @param {object} searchParams  搜索条件参数
   * @param {object} orderInfo 排序条件参数
   * @param {object} pageParams 排序条件参数
   * @return {object} 搜索结果
   */
  async getByNameAndRtsp(searchParams, orderInfo, pageParams) {
    const { name, rtsp } = searchParams;
    // 增加默认排序条件
    orderInfo.push([[ 'createdAt', 'DESC' ]]);
    // 分页查询条件
    const pageInfo = pageParams ? {
      limit: pageParams.pageSize,
      offset: (pageParams.current - 1) * pageParams.pageSize,
    } : {};
    // let whereClause = {};
    // 拼接name和rtsp组成的搜索条件语句
    let clauseStr = '';
    if (name) {
      clauseStr = `INSTR(name, '${name}') > 0`;
      // const nameTemp = name.replace(/%/g, '\\%').replace(/_/g, '\\_');
      // whereClause.name = {
      //   [Op.like]: sequelize.literal(`'%${nameTemp}%' ESCAPE '\\'`),
      // };
    }
    if (rtsp) {
      if (clauseStr) {
        clauseStr = `${clauseStr} AND INSTR(rtsp, '${rtsp}') > 0`;
      } else {
        clauseStr = `INSTR(rtsp, '${rtsp}') > 0`;
      }
      // const rtspTemp = rtsp.replace(/%/g, '\\%').replace(/_/g, '\\_');
      // whereClause.rtsp = {
      //   [Op.like]: sequelize.literal(`'%${rtspTemp}%' ESCAPE '\\'`),
      // };
    }
    const whereClause = sequelize.literal(clauseStr);
    const { rows, count } = await this.app.model.Camera.findAndCountAll({
      where: whereClause,
      order: orderInfo,
      ...pageInfo,
      attributes: { include: transformTimezone() },
    });
    return { list: rows, total: count, ...pageParams };
  }
  async create(data) {
    const allData = await this.getAll();
    for (let i = 0; i < allData.length; i++) {
      if (data.name && allData[i].name == data.name) return { data: '', returnStatus: 'FAILED', errorMessage: '设备名重复' };
      if (data.rtsp && allData[i].rtsp == data.rtsp) return { data: '', returnStatus: 'FAILED', errorMessage: 'RTSP地址重复' };
      // if (allData[i].position == data.position) return { data: '', returnStatus: 'FAILED', errorMessage: '相同安装位置已存在相同设备' };
    }
    const result = await this.app.model.Camera.create(data);
    return { data: result, returnStatus: 'SUCCEED' };
  }
  async update(data) {
    const isExist = await this.app.model.Camera.findOne({ where: { id: data.id } });
    if (!isExist) return { data: '', returnStatus: 'FAILED', errorMessage: 'ID不存在' };
    const allData = await this.getAll();
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].id == data.id) continue;
      if (data.name && allData[i].name == data.name) return { data: '', returnStatus: 'FAILED', errorMessage: '设备名重复' };
      if (data.rtsp && allData[i].rtsp == data.rtsp) return { data: '', returnStatus: 'FAILED', errorMessage: 'RTSP地址重复' };
      // if (allData[i].position == data.position) return { data: '', returnStatus: 'FAILED', errorMessage: '相同安装位置已存在相同设备' };
    }
    const result = await this.app.model.Camera.update(data, {
      where: { id: data.id },
    });
    return { data: result, returnStatus: 'SUCCEED' };
  }
  /**
   * 新建或更新Camera数据
   * @param {object} data Camera数据
   * @return {object} 新建或更新结果
   */
  async upsertCamera(data) {
    // 根据组id查找是否有对应的camera数据
    const cameraInfo = await this.app.model.Camera.findOne({ where: { groupId: data.groupId } });
    let cameraId = null;
    // 未找到，则添加
    if (!cameraInfo) {
      const { data: createData, returnStatus } = await this.create(data);
      // 获取新建数据id
      if (returnStatus === 'SUCCEED') {
        cameraId = createData.id;
      }
    } else {
      // 找到，则更新
      data.id = cameraInfo.id;
      await this.update(data);
      cameraId = cameraInfo.id;
    }
    if (cameraId) {
      return { data: cameraId, returnStatus: 'SUCCEED' };
    }
    return { data: cameraId, returnStatus: 'FAILED' };
  }

  async delete(id) {
    // 删除camera后再删除mark关联数据
    const result = await this.app.model.transaction(t => {
      return this.app.model.Camera.destroy({
        where: { id },
        transaction: t,
      }).then(() => {
        return this.app.model.Mark.destroy({
          where: { camera_id: id },
          transaction: t,
        });
      });
    });
    return result;
  }
  async getGroupId(id) {
    return await this.app.model.Camera.findOne({ where: { id }, attributes: [ 'groupId' ] });
  }
}

module.exports = CameraService;
