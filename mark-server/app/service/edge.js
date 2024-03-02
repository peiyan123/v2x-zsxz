'use strict';

const ThirdPartyService = require('./thirdParty');

/**
 * 向EdgeService发送请求的服务类
 */
class EdgeService extends ThirdPartyService {
  serviceAddress = this.app.config.edgeServerAddress
  /**
   * 保存通道算法配置
   * @param {Object} data 发送数据
   * @return {Object} 请求结果
   */
  async saveDetail(data) {
    // uri参数是必需的参数，如果uri地址为空，则不调用接口
    // if (!data.uri) {
    //   return;
    // }
    const dataAll = { ...data, fusePath: this.app.config.algorithmicDir + 'chan1' };
    dataAll.taskCode = 'chan1'
    const result = await this.sendRequest(data.uri ? '/zs/v1/alg/saveDetail' : '/zs/v1/alg/saveRadarDetail', { data: dataAll }, 'POST');
    return result;
  }
  /**
   * 删除通道算法配置
   * @param {Object} data 发送数据
   * @return {Object} 请求结果
   */
  async deleteDetail(data) {
    // 如果待删除数据为空，则不调用接口
    if (data.length <= 0) {
      return;
    }
    const result = await this.sendRequest('/zs/v1/alg/deleteDetail', { data }, 'POST');
    return result;
  }
  /**
   * 配置应用
   * @return {object} 查询结果
   */
  async saveApply() {
    const result = await this.sendRequest('/zs/v1/alg/saveApply?taskCode=chan1');
    return result;
  }
  /**
   * 保存设备信息配置
   * @param {Object} data 发送数据
   * @return {Object} 请求结果
   */
  async saveDeviceDetail(data) {
    const result = await this.sendRequest('/zs/v1/device/saveDetail', { ...data, taskCode: 'chan1' }, 'POST');
    return result;
  }


   /**
   * 保存通道算法配置
   * @param {Object} data 发送数据
   * @return {Object} 请求结果
   */
   async saveDetail2(data) {
    // uri参数是必需的参数，如果uri地址为空，则不调用接口
    // if (!data.uri) {
    //   return;
    // }
    const dataAll = { ...data, fusePath: this.app.config.algorithmicDir + 'chan2', taskCode: 'chan2' };
    const result = await this.sendRequest(data.uri ? '/zs/v1/alg/saveDetail' : '/zs/v1/alg/saveRadarDetail', { data: dataAll }, 'POST');
    return result;
  }
  /**
   * 配置应用
   * @return {object} 查询结果
   */
  async saveApply2() {
    const result = await this.sendRequest('/zs/v1/alg/saveApply?taskCode=chan2');
    return result;
  }
  /**
   * 保存设备信息配置
   * @param {Object} data 发送数据
   * @return {Object} 请求结果
   */
  async saveDeviceDetail2(data) {
    const result = await this.sendRequest('/zs/v1/device/saveDetail', { ...data, taskCode: 'chan2' }, 'POST');
    return result;
  }




   /**
   * 保存通道算法配置
   * @param {Object} data 发送数据
   * @return {Object} 请求结果
   */
   async saveDetail3(data) {
    // uri参数是必需的参数，如果uri地址为空，则不调用接口
    // if (!data.uri) {
    //   return;
    // }
    const dataAll = { ...data, fusePath: this.app.config.algorithmicDir + 'chan3', taskCode: 'chan3' };
    const result = await this.sendRequest(data.uri ? '/zs/v1/alg/saveDetail' : '/zs/v1/alg/saveRadarDetail', { data: dataAll }, 'POST');
    return result;
  }
  /**
   * 配置应用
   * @return {object} 查询结果
   */
  async saveApply3() {
    const result = await this.sendRequest(`/zs/v1/alg/saveApply?taskCode=chan3`);
    return result;
  }
  /**
   * 保存设备信息配置
   * @param {Object} data 发送数据
   * @return {Object} 请求结果
   */
  async saveDeviceDetail3(data) {
    const result = await this.sendRequest('/zs/v1/device/saveDetail', { ...data, taskCode: 'chan3' }, 'POST');
    return result;
  }
}

module.exports = EdgeService;
