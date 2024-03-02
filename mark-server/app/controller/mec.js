'use strict';
const nodeCMD = require('node-cmd');
const os = require('node-os-utils');
const fs = require('fs');
const tls = require('tls');
const fsExtra = require('fs-extra');
const mqtt = require('mqtt');
const { deviceInfoConfig } = require('./config');

const BaseController = require('./base');

class MecController extends BaseController {
  mqttInstance = null
  async saveConfig() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    requestData.id = 1;
    // const valid = await ctx.validate('mec', requestData);
    // if (!valid) return;
    await this.service.mec.saveMecConfig(requestData);
    // 写入配置文件，mqtt信息，经纬度
    // const filePath = this.deviceConfigPath;
    const filePathLocal = 'app/public/files/default-empty.json';
    const result = await fsExtra.readJson(filePathLocal);
    result['app-config'].latitude = requestData.latitude;
    result['app-config'].longitude = requestData.longitude;
    result['mb-configs'][0]['mbc-config'].server.ip = requestData.ip;
    result['mb-configs'][0]['mbc-config'].server.port = requestData.port;
    result['mb-configs'][0]['mbc-config'].user = requestData.username;
    result['mb-configs'][0]['mbc-config'].pwd = requestData.password;
    // await fsExtra.writeJson(filePath, result);
    await fsExtra.writeJson(filePathLocal, result);
    // 如果传递了mqtt地址，则调用保存方法
    if (requestData.ip) {
      await this.saveMqttConfig(requestData);
    }
    await this.saveDeviceInfoConfig(requestData);
    // 如果是保存设备信息，则调用EdgeService保存设备信息配置的接口
    if (requestData.deviceId !== undefined) {
      // this.service.edge.saveDeviceDetail(requestData);
    }
    this.success();
  }
  /**
   * 将mqtt配置写入json文件
   * @param {object} requestData 客户端发生的数据
   */
  async saveMqttConfig(requestData) {
    const { ip, port, username, password } = requestData;
    const result = {
      ip,
      port: !port ? 0 : +port, // port需是数字类型，故做转换
      user: username,
      pwd: password,
      tls: {
        enable: false,
        capath: '/opt/soft/v2x/chan1/cfg_multiple/publish_task/tls',
        cafile: '/opt/soft/v2x/chan1/cfg_multiple/publish_task/tls/ca.pem',
        certfile: '/opt/soft/v2x/chan1/cfg_multiple/publish_task/tls/app.pem',
        keyfile: '/opt/soft/v2x/chan1/cfg_multiple/publish_task/tls/app.key',
      },
      qos: 1,
      keeplive: 10,
      timeout: 100,
      reconnect_maxcnt: -1,
      device_info_upload_period: 30,
    };
    const dirPath = `${this.app.config.algorithmicDir}chan1/cfg_multiple/publish_task`;
    await fsExtra.ensureDir(dirPath);
    await fsExtra.writeJson(`${dirPath}/mqttalgodata_task.json`, result, { spaces: '\t' });
  }
  /**
   * 将device info配置写入json文件
   * @param {object} requestData 客户端发生的数据
   */
  async saveDeviceInfoConfig(requestData) {
    const { deviceId, sn, latitude, longitude, elevation } = requestData;
    const result = {
      id: deviceId,
      sn,
      latitude: !latitude ? 0 : +latitude, // 字符串转数字
      longitude: !longitude ? 0 : +longitude, // 字符串转数字
      elevation: !elevation ? 0 : +elevation, // 字符串转数字,
    };
    const dirPath = `${this.app.config.algorithmicDir}`;
    await fsExtra.ensureDir(dirPath);
    await fsExtra.writeJson(`${dirPath}device_info.json`, result, { spaces: '\t' });
  }

  async getConfig() {
    const result = await this.service.mec.getMecConfig(1) || {};
    Object.keys(deviceInfoConfig).forEach(key => {
      if (key === 'id') {
        result.deviceId = result.deviceId === null || result.deviceId === undefined ? deviceInfoConfig[key] : result.deviceId;
      } else {
        result[key] = result[key] === null || result[key] === undefined ? deviceInfoConfig[key] : result[key];
      }
    });
    this.success(result);
  }
  /**
   * 获取全息路口页面的背景图
   */
  async getRoadPicture() {
    const ctx = this.ctx;
    const { roadInfoPath } = this.app.config;
    const filePath = `${roadInfoPath}/chan3/topview_bg.jpg`;
    if (fsExtra.existsSync(filePath)) {
      const stream = fsExtra.createReadStream(filePath);
      ctx.set('Content-type', 'image/jpeg');
      ctx.body = stream;
    } else {
      this.failed('未找到背景图片');
    }
  }
  /**
   * 获取全息路口页面中心点经纬度和相关信息
   */
  async getRoadConfig() {
    const { roadInfoPath } = this.app.config;
    const filePath = `${roadInfoPath}/chan1/topview_bg.jpg.cfg.json`;
    if (fsExtra.existsSync(filePath)) {
      const result = await fsExtra.readJson(filePath);
      this.success(result);
    } else {
      this.failed('未找到中心点经纬度信息文件');
    }
  }
  /**
   * 获取mec相关信息
   */
  async getMecInfo() {
    // const result = await this.getAppInfo();
    // const result = await this.tcpConnect('docker_info');
    const result = await this.getDeviceInfo();
    this.success(result);
  }
  /**
   * 获取应用列表信息
   */
  async getApplications() {
    const { ctx } = this;
    const requestData = ctx.request.query;
    const result = await this.getContainersInfo(requestData);
    this.success(result);
  }

  async getAppInfo() {
    const outputArr = [];
    const appNameStr = await nodeCMD.runSync('docker ps --format "table {{.Names}}"').data;
    const appImageStr = await nodeCMD.runSync('docker ps --format "table {{.Image}}"').data;
    const appStatusStr = await nodeCMD.runSync('docker ps --format "table {{.Status}}"').data;
    const appPortStr = await nodeCMD.runSync('docker ps --format "table {{.Ports}}"').data;
    const appCreateTimeStr = await nodeCMD.runSync('docker ps --format "table {{.CreatedAt}}"').data;
    const appCommandStr = await nodeCMD.runSync('docker ps --format "table {{.Command}}"').data;
    const appIdStr = await nodeCMD.runSync('docker ps --format "table {{.ID}}"').data;
    const appSizeStr = await nodeCMD.runSync('docker images --format "{{.Size}}"').data;
    this.handleStrToArr(appNameStr).forEach((item, index) => {
      const obj = {};
      obj.name = item;
      obj.image = this.handleStrToArr(appImageStr)[index];
      obj.status = this.handleStrToArr(appStatusStr)[index];
      obj.port = this.handleStrToArr(appPortStr)[index];
      obj.createTime = this.handleStrToArr(appCreateTimeStr)[index];
      obj.command = this.handleStrToArr(appCommandStr)[index];
      obj.id = this.handleStrToArr(appIdStr)[index];
      obj.size = appSizeStr.split('\n')[index];
      outputArr.push(obj);
    });
    return outputArr;
  }

  handleStrToArr(str) {
    if (!str) return [];
    const arr = str.split('\n');
    arr.shift();
    arr.pop();
    return arr;
  }

  getGPUUsage() {
    return new Promise(resolve => {
      nodeCMD.get('nvidia-smi -q -d UTILIZATION', (e, b, c) => {
        if (!e) {
          const a = b.split('\r\n').find(s => s.indexOf('Gpu') >= 0 && s.indexOf('%') >= 0);
          const start = a.indexOf(':') + 2;
          const end = a.indexOf('%') - 1;
          const ss = a.substring(start, end);
          console.log(ss);
          resolve(ss);
        }
      });
    });
  }

  async testConnect() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const valid = await ctx.validate('mec', requestData, 'cert');
    if (!valid) return;
    let ca,
      cert,
      key;
    // if (!fsExtra.pathExists('app/public/cert/ca.pem'))return this.failed('请上传证书')
    // 如果没有发送用户名或密码，则需用证书登录
    if (!requestData.username || !requestData.password) {
      try {
        ca = fs.readFileSync('/opt/soft/v2x/configs/chan1/cfg_multiple/publish_task/tls/ca.pem');
        cert = fs.readFileSync('/opt/soft/v2x/configs/chan1/cfg_multiple/publish_task/tls/app.pem');
        key = fs.readFileSync('/opt/soft/v2x/configs/chan1/cfg_multiple/publish_task/tls/app.key');
      } catch (error) {
        return this.failed('证书不存在');
      }
    }
    const result = await this.mqttConnect({ ...requestData, ca, cert, key });
    this.mqttInstance.end();
    if (result == 'success') {
      this.success();
    } else {
      this.failed('连接失败');
    }
  }

  mqttConnect(params) {
    const { ip, port, username, password, ca, cert, key } = params;
    let options = null;
    // 如果有用户名和密码，则不需要证书
    if (username && password) {
      options = {
        clean: true,
        connectTimeout: 4000,
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
        username,
        password,
        reconnectPeriod: 1000,
        rejectUnauthorized: false,
        requestCert: false,
      };
    } else {
      // 没有用户名或密码，则需要证书
      options = {
        clean: true,
        connectTimeout: 4000,
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
        username,
        password,
        reconnectPeriod: 1000,
        rejectUnauthorized: false,
        key,
        ca: [ ca ],
        cert,
        requestCert: true,
      };
    }
    const connectUrl = `mqtts://${ip}:${port}`;
    return new Promise(resolve => {
      this.mqttInstance = mqtt.connect(connectUrl, options);
      this.mqttInstance.on('connect', () => {
        console.log('success');
        resolve('success');
      });
      this.mqttInstance.on('error', error => {
        console.log('error', error);
        resolve('failed');
      });
      this.mqttInstance.on('close', () => {
        console.log('close');
        resolve('failed');
      });
      this.mqttInstance.on('offline', () => {
        console.log('offline');
        resolve('failed');
      });
    });
  }
  /**
   * 调用EdgeService的配置应用接口
   */
  async saveApply() {
    const { data, returnStatus } = await this.service.edge.saveApply();
    if (!fsExtra.existsSync(`${this.app.config.algorithmicDir}chan1/task_single_list.json`)) {
      let data = [
        {
          "type": "CameraAlgoTask",
          "enable": true
        },
        {
          "type": "FuseTask",
          "enable": true
        },
        {
          "type": "ShowTask",
          "enable": false
        }
      ]
      await fsExtra.writeJson(`${this.app.config.algorithmicDir}chan1/task_single_list.json`, data, { spaces: '\t' });
    }
    if (!fsExtra.existsSync(`${this.app.config.algorithmicDir}chan1/task_multiple_list.json`)) {
      let data = [
        {
            "type": "MultiObjFuseTask",
            "enable": true
        },
        {
            "type": "OcclusionCalTask",
            "enable": true
        },
        {
            "type": "MultiEventFuseTask",
            "enable": true
        }
      ]
      await fsExtra.writeJson(`${this.app.config.algorithmicDir}chan1/task_multiple_list.json`, data, { spaces: '\t' });
    }
    if (returnStatus === 'FAILED' || !data.success) {
      this.failed(data.message);
    } else {
      this.success();
    }
  }
}

module.exports = MecController;
