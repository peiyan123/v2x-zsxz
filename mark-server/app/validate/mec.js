'use strict';
const {ipValidate,ipDomainValidate,blankValidate,portValidate,lonValidate,latValidate} = require('../utils/validate')
const MecValidate = {
  rules: {
    id: [
      { required: true, message: 'id不能为空' },
    ],
    ip: [
      {required: true, message: 'ip地址不能为空'},
      { max: 100, message: 'ip字符应不大于100位' },
      {validator: ipDomainValidate},
      {validator: blankValidate}
    ],
    port: [
      {required: true, message: '端口不能为空'},
      {validator:portValidate},
      {validator: blankValidate}
    ],
    username: [
      {required: true, message: '用户名不能为空'},
      { max: 100, message: '用户名字符应不大于100位' },
      {validator: blankValidate}
    ],
    password: [
      {required: true, message: '密码不能为空'},
      { max: 100, message: '密码字符应不大于100位' },
      {validator: blankValidate}
    ],
    longitude: [
      // {required: true, message: '经度不能为空'},
      {validator: lonValidate},
      {validator: blankValidate}
    ],
    latitude: [
      // {required: true, message: '纬度不能为空'},
      {validator: latValidate},
      {validator: blankValidate}
    ],
    imageUrl: [
      // {required: true, message: '请选择全息地图'},
    ]
  },
  scene: {
    cert: ['ip','username','password','port'],
  }
};

module.exports = MecValidate;
