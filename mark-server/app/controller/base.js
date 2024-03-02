'use strict';
const fs = require('fs');
const path = require('path');
const { stat } = require('fs/promises');
const os = require('os');
const Controller = require('egg').Controller;
const net = require('net');
const { getServerIp } = require('../utils/utils');

class BaseController extends Controller {
  dirCmd = os.arch() === 'x64' ? path.resolve(__dirname, '../../cmdx64') : path.resolve(__dirname, '../../cmd')
  cmd = `chmod a+x ${this.dirCmd}/* && export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/app/all_depend_libs:${this.dirCmd} && ${this.dirCmd}`
  // algorithmicDir = '/opt/thundersoft/algs/configs/'
  // deviceConfigPath = '/opt/thundersoft/configs/default.cfg'
  // imageDir = '/opt/thundersoft/algs/image/'
  algorithmicDir = this.app.config.algorithmicDir
  deviceConfigPath = this.app.config.deviceConfigPath
  imageDir = this.app.config.imageDir
  // algorithmicDir = 'app/public/墨玉路路口/'
  // maskPath = this.cmd + '/v2x_gen_mask_img ' + this.algorithmicDir
  success(result = null) {
    this.ctx.body = { data: result, returnStatus: 'SUCCEED' };
    this.ctx.status = 200;
  }

  failed(message = '', result = null) {
    this.ctx.body = { data: result, returnStatus: 'FAILED', errorMessage: message };
    this.ctx.status = 200;
  }

  // 递归创建目录
  mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    }
    if (this.mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
  // 深拷贝
  cloneDeep(data) {
    return JSON.parse(JSON.stringify(data));
  }

  // 判断目录是否存在
  async isDirExist(dir) {
    try {
      const result = await stat(dir);
      if (result.isDirectory()) {
        return true;
      }
    } catch (error) {
      return false;
    }
  }
  // 连接tcp
  tcpConnect(cmdStr) {
    // docker_info
    // restart_dockers
    // restart_system 重启设备
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.connect('21060', '127.0.0.1', () => {
        client.write(cmdStr);
      });
      client.on('data', data => {
        const da = data.toString();
        resolve(da);
      });
      client.on('error', err => {
        reject(err);
      });
    });
  }
  /**
   * 发送http请求
   * @param {string} url url地址
   * @param {object} dataAndParams {data: body传输数据, params: url地址传输参数}
   * @param {string} method 请求类型
   * @param {object} headers 请求头传递参数
   * @return {Promise object} Promise对象
   */
  sendRequest(url, dataAndParams, method, headers) {
    const { data, params, ...others } = dataAndParams || {};
    return this.ctx.axios({
      method: method || 'get',
      url,
      params: params || {},
      data: data || {},
      headers,
      ...others,
    }).then(callbackData => {
      return callbackData;
    }).catch(err => {
      const message = err.response && err.response.data && err.response.data.message || err.message || err.toString();
      throw new Error(message, url);
    });
  }
  /**
   * 调用守护进程的接口
   * @param {string} url 请求地址
   * @param {object} dataAndParams 请求数据和参数
   * @param {string} method 请求类型
   * @return {object} Promise对象
   */
  sendRequestToDaemon(url, dataAndParams, method) {
    const ip = getServerIp();
    const newUrl = url.replace(/^\//, '');
    return this.sendRequest(`http://${ip}:21060/${newUrl}`, dataAndParams, method);
  }
  /**
   * 获取设备容器信息
   * @param {object} params 请求参数
   * @return {object} Promise对象
   */
  async getContainersInfo(params) {
    try {
      return await this.sendRequestToDaemon('/api/containers/info', { params });
    } catch (error) {
      throw error;
    }
  }
  /**
   * 获取设备信息
   * @return {object} Promise对象
   */
  async getDeviceInfo() {
    try {
      return await this.sendRequestToDaemon('/api/device/info');
    } catch (error) {
      throw error;
    }
  }
  /**
   * 重启容器
   * @param {string} id 容器id
   * @return {object} Promise对象
   */
  async restartContainer(id) {
    try {
      // 设置超时时间30秒
      return await this.sendRequestToDaemon('/api/containers/restart', { params: { id }, timeout: 30000 }, 'post');
    } catch (error) {
      throw error;
    }
  }
  /**
   * 重启设备
   * @return {object} Promise对象
   */
  async restartDevice() {
    try {
      return await this.sendRequestToDaemon('/api/device/restart', {}, 'post');
    } catch (error) {
      throw error;
    }
  }
  /**
   * 获取设备信息
   * @param {object} params 请求参数
   * @return {object} Promise对象
   */
  async getContainersLogs(params) {
    try {
      return await this.sendRequestToDaemon('/api/containers/logs', { params });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BaseController;
