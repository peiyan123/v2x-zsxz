'use strict';
const Service = require('egg').Service;

class MecService extends Service {
  async saveMecConfig(data) {
    const result = await this.app.model.Mec3.upsert(data);
    return result;
  }

  async getMecConfig(id) {
    const result = await this.app.model.Mec3.findOne({
      where: {
        id,
      },
    });
    return result;
  }
  /**
   * 获取mec表指定列的值
   * @param {number} id 待查询的id
   * @param {string} columnKey 返回的列名字
   * @param {string} columnAlias 返回的列别名
   * @return {object} 查询结果
   */
  async getOneColumn(id, columnKey, columnAlias) {
    let attributes = columnKey;
    if (columnAlias) {
      attributes = [ columnKey, columnAlias ];
    }
    const result = await this.app.model.Mec3.findOne({
      where: {
        id,
      },
      attributes: [ attributes ],
    });
    return result;
  }
}

module.exports = MecService;
