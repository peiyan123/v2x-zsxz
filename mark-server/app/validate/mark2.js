'use strict';
const { blankValidate, rtspValidate } = require('../utils/validate');

const MarkValidate = {
  rules: {
    name: [
      // { type: 'string', required: true, message: '名称不能为空' },
      { max: 100, message: '名称字符应不大于100位' },
      { validator: blankValidate },
    ],
    rtsp: [
      { max: 100, message: 'rtsp字符应不大于100位' },
      { validator: blankValidate },
    ],
    cameraId: [
      { required: true, message: '设备ID不存在' },
    ],
    imageInfo: [
      { required: true, message: '图片信息不能为空' },
    ],
    data: [
      { required: true, message: '标定数据不能为空' },
    ],
  },
  scene: {
    image: [ 'name', 'rtsp' ],
    saveMark: [ 'cameraId', 'imageInfo', 'data' ],
  },
};


module.exports = MarkValidate;
