'use strict';
const { blankValidate, ipValidate, portValidate, positionValidate, statusValidate, radarFacturerValidate, dirValidate, protocolValidate } = require('../utils/validate');

const { regIp } = require('../utils/constant.js');
const RadarValidate = {
  rules: {
    id: [
      { required: true, message: 'id不能为空' },
    ],
    name: [
      // { type: 'string', required: true, message: '名称不能为空' },
      { max: 100, message: '名称字符应不大于100位' },
      { validator: blankValidate },
    ],
    ip: [
      { required: true, message: 'ip地址不能为空' },
      { max: 100, message: 'ip字符应不大于100位' },
      { validator: ipValidate },
      { validator: blankValidate },
    ],
    port: [
      // { required: true, message: '端口不能为空' },
      // { validator: portValidate },
      // { validator: blankValidate },
    ],
    protocol: [
      { required: true, message: '协议不能为空' },
      { max: 100, message: '协议字符应不大于100位' },
      { validator: blankValidate },
      { validator: protocolValidate },
    ],
    model: [
      { required: true, message: '型号不能为空' },
      { max: 100, message: '型号字符应不大于100位' },
      { validator: blankValidate },
    ],
    position: [
      { required: true, message: '安装位置不能为空' },
      { validator: positionValidate },
    ],
    status: [
      { required: true, message: '状态不能为空' },
      { validator: statusValidate },
    ],
    desc: [
      { max: 500, message: '描述字符应不大于500位' },
    ],
    facturer: [
      { validator: radarFacturerValidate },
    ],
  },
  scene: {
    create: [ 'name', 'ip', 'port', 'protocol', 'model', 'position', 'status', 'desc', 'facturer' ],
    update: [ 'id', 'ip', 'port', 'protocol', 'name', 'model', 'position', 'status', 'desc', 'facturer' ],
    delete: [ 'id' ],
  },
};

module.exports = RadarValidate;
