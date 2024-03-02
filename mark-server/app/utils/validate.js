'use strict';
const { rsuFacturer, radarFacturer, regIp, regDomain, regBlank, regPort, regLat, regLon, regRtsp, towardsVal, positionVal, deviceStatus, facturer, cameraFacturer, dirName, protocol } = require('./constant');

module.exports = {
  ipValidate: (rule, value, callback, source, options) => {
    if (value && regIp.test(value)) {
      return callback();
    }
    callback({ message: '输入正确的ip格式' });
  },
  ipDomainValidate: (rule, value, callback, source, options) => {
    if (value && regIp.test(value) || value && regDomain.test(value)) {
      return callback();
    }
    callback({ message: '输入正确的服务器地址格式' });
  },
  blankValidate: (rule, value, callback, source, options) => {
    if (value && regBlank.test(value)) {
      return callback({ message: '不能输入空白字符' });
    }
    callback();
  },
  portValidate: (rule, value, callback, source, options) => {
    if (value && regPort.test(value) && Number(value) >= 1000 && Number(value) <= 65535) {
      return callback();
    }
    callback({ message: '请输入1000-65535的数字' });
  },
  lonValidate: (rule, value, callback, source, options) => {
    if (value && !regLon.test(value)) {
      callback({ message: '请输入正确的经度' });
    }
    return callback();
  },
  latValidate: (rule, value, callback, source, options) => {
    if (value && !regLat.test(value)) {
      callback({ message: '请输入正确的纬度' });
    }
    return callback();
  },
  rtspValidate: (rule, value, callback, source, options) => {
    if (value && !regRtsp.test(value)) {
      callback({ message: '请输入正确的rtsp地址' });
    }
    return callback();
  },
  towardsValidate: (rule, value, callback, source, options) => {
    if (value && !towardsVal.includes(value)) {
      callback({ message: '请输入正确的朝向信息' });
    }
    return callback();
  },
  positionValidate: (rule, value, callback, source, options) => {
    if (value && !positionVal.includes(value)) {
      callback({ message: '请输入正确的安装位置信息' });
    }
    return callback();
  },
  statusValidate: (rule, value, callback, source, options) => {
    if (value && !deviceStatus.includes(value)) {
      callback({ message: '请输入正确的状态信息' });
    }
    return callback();
  },
  facturerValidate: (rule, value, callback, source, options) => {
    if (value && !cameraFacturer.includes(value)) {
      callback({ message: '请输入正确的厂商信息' });
    }
    return callback();
  },
  rsuFacturerValidate: (rule, value, callback, source, options) => {
    if (value && !rsuFacturer.includes(value)) {
      callback({ message: '请输入正确的厂商信息' });
    }
    return callback();
  },
  radarFacturerValidate: (rule, value, callback, source, options) => {
    if (value && !radarFacturer.includes(value)) {
      callback({ message: '请输入正确的厂商信息' });
    }
    return callback();
  },
  dirValidate: (rule, value, callback, source, options) => {
    if (value && !dirName.includes(value)) {
      callback({ message: '请输入正确的目录名称' });
    }
    return callback();
  },
  protocolValidate: (rule, value, callback, source, options) => {
    if (value && !protocol.includes(value)) {
      callback({ message: '请输入正确的协议' });
    }
    return callback();
  },
};
