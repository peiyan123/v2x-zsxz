'use strict';
const Service = require('egg').Service;

class ThirdPartyService extends Service {
  // 服务器地址
  serviceAddress = ''
  /**
   * 发送http请求
   * @param {string} url url地址
   * @param {object} dataAndParams {data: body传输数据, params: url地址传输参数}
   * @param {string} method 请求类型
   * @param {object} headers 请求头传递参数
   * @return {Promise object} Promise对象
   */
  sendRequest(url, dataAndParams, method, headers) {
    this.ctx.logger.info('[Request third-party service][', method, url, ']', JSON.stringify(dataAndParams));
    const { data, params, ...others } = dataAndParams || {};
    return this.ctx.axios({
      method: method || 'get',
      url: `${this.serviceAddress}${url}`,
      params: params || {},
      data: data || {},
      headers,
      ...others,
    }).then(callbackData => {
      this.ctx.logger.info('[Request third-party service result][', method, url, ']', callbackData);
      return { data: callbackData, returnStatus: 'SUCCEED' };
    }).catch(err => {
      this.ctx.logger.error('[Request third-party service error][', method, url, ']', err);
      const message = err.response && err.response.data && err.response.data.message || err.message || err.toString();
      // throw new Error(message, url);
      return { data: { message, url }, returnStatus: 'FAILED' };
    });
  }
}

module.exports = ThirdPartyService;
