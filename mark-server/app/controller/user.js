'use strict';

const BaseController = require('./base');
const { decodeByBase64 } = require('../utils/cipher');
const fsExtra = require('fs-extra');

class UserController extends BaseController {
  async login() {
    const { ctx, app } = this;
    const requestBody = ctx.request.body;
    const valid = await ctx.validate('user', requestBody, 'login');
    if (!valid) return;
    requestBody.password = decodeByBase64(requestBody.password);
    const result = await this.service.user.findOne(requestBody);
    if (result) {
      // 登陆成功修改ysl文件app-config[device-id],app-config[app-id]
      this.modfiyFile();
      ctx.session.token = result.token;
      this.success(result);
    } else {
      this.failed('用户名或密码错误');
    }
  }

  // 读取ysl文件 存在就修改app-config[device-id],app-config[app-id]
  async modfiyFile() {
    const filePath = this.deviceConfigPath;
    const filePathLocal = 'app/public/files/default-empty.json';
    const isExist = await fsExtra.pathExists(filePath);
    if (isExist) {
      const data = await fsExtra.readJson(filePath);
      const appId = data['app-config']['app-id'];
      const deviceId = data['app-config']['device-id'];
      const result = await fsExtra.readJson(filePathLocal);
      result['app-config']['app-id'] = appId;
      result['app-config']['device-id'] = deviceId;
      await fsExtra.writeJson(filePathLocal, result);
    }
  }

  // 修改密码
  async modifyPassword() {
    const { ctx, app } = this;
    const requestBody = ctx.request.body;
    const valid = await ctx.validate('user', requestBody, 'modify');
    if (!valid) return;
    if (requestBody.new_password != requestBody.confirm_password) return this.failed('两次输入的密码不一致');
    requestBody.old_password = decodeByBase64(requestBody.old_password);
    requestBody.new_password = decodeByBase64(requestBody.new_password);
    requestBody.confirm_password = decodeByBase64(requestBody.confirm_password);
    const result = await this.service.user.modifyPassword(requestBody);
    if (result.returnStatus == 'FAILED') {
      return this.failed(result.errorMessage);
    }
    this.success();
  }
  async logout() {
    const { ctx } = this;
    ctx.session.token = null;
    this.success();
  }
  /**
   * 使用第三方Token进行登录
   */
  async loginWithToken() {
    const { tokenKey } = this.ctx.query;
    // 调用第三方接口用tokenKey获取token
    const { data: tokenData, returnStatus: getTokenStatus } = await this.service.thirdParty.sendRequest(
      'http://webgateway.edge.cmew.work/user/portal/validateKey', { body: { key: tokenKey } }, 'post');
    // 获取失败，则返回空的token
    if (getTokenStatus === 'FAILED' || !tokenData.data) {
      return this.success({ token: '' });
    }
    const token = tokenData.data;
    // 调用第三方接口获取用户信息
    const { data, returnStatus } = await this.service.thirdParty.sendRequest(
      'http://webgateway.edge.cmew.work/user/user/getCurrentUserInfo', {}, 'get', { token });
    // 获取失败，则返回空的token，反之则返回正确的token
    if (returnStatus === 'FAILED' || !data.success) {
      this.success({ token: '' });
    } else {
      // 获取jwt配置
      const { jwt: { secret, expiresIn } } = this.app.config;
      // 生成token
      const tokenNew = this.app.jwt.sign({
        token,
      }, secret, { expiresIn });
      this.ctx.session.token = tokenNew;
      this.success({ token: tokenNew });
    }
  }
}

module.exports = UserController;
