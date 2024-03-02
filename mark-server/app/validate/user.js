'use strict';
const {blankValidate} = require('../utils/validate')

const UserValidate = {
  rules: {
    username: [
      { required: true, message: '用户名不能为空' },
      { max: 100, message: '用户名字符应小于100位' },
      {validator: blankValidate}
    ],
    password: [
      { required: true, message: '密码不能为空' },
      { max: 100, message: '密码字符应小于100位' },
      {validator: blankValidate}
    ],
    old_password: [
      { required: true, message: '旧密码不能为空' },
      { max: 100, message: '密码字符应小于100位' },
      {validator: blankValidate}
    ],
    new_password: [
      { required: true, message: '新密码不能为空' },
      { max: 100, message: '密码字符应不大于100位' },
      {validator: blankValidate}
    ],
    confirm_password: [
      { required: true, message: '确认密码不能为空' },
      { max: 100, message: '密码字符应不大于100位' },
      {validator: blankValidate}
    ]
  },
  scene: {
    login: ['username', 'password'],
    modify: ['confirm_password', 'new_password', 'old_password']
  }
};

module.exports = UserValidate;
