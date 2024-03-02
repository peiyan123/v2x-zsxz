'use strict';
const { blankValidate, rtspValidate, towardsValidate, positionValidate, statusValidate, facturerValidate, dirValidate } = require('../utils/validate');

const CameraValidate = {
  rules: {
    id: [
      { required: true, message: 'id不能为空' },
    ],
    name: [
      // { type: 'string', required: true, message: '名称不能为空' },
      { max: 100, message: '名称字符应不大于100位' },
      { validator: blankValidate },
    ],
    rtsp: [
      { max: 100, message: 'rtsp字符应不大于100位' },
      { validator: blankValidate },
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
    towards: [
      { required: true, message: '相机朝向不能为空' },
      { validator: towardsValidate },
    ],
    facturer: [
      { validator: facturerValidate },
    ],
  },
  scene: {
    create: [ 'name', 'rtsp', 'model', 'position', 'status', 'desc', 'facturer' ],
    update: [ 'id', 'name', 'rtsp', 'model', 'position', 'status', 'desc', 'facturer' ],
    delete: [ 'id' ],
  },
};

module.exports = CameraValidate;
