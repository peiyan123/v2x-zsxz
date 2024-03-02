'use strict';
const { blankValidate } = require('../utils/validate');
const RsuValidate = {
  rules: {
    id: [
      { required: true, message: 'id不能为空' },
    ],
    name: [
      { type: 'string', required: true, message: '名称不能为空' },
      { max: 100, message: '名称字符应不大于100位' },
      { validator: blankValidate },
    ],
  },
  scene: {
    create: [ 'name' ],
    update: [ 'id' ],
    delete: [ 'id' ],
  },
};

module.exports = RsuValidate;
