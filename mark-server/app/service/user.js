'use strict';
const Service = require('egg').Service;

class UserService extends Service {
  userId;
  async findOne(params) {
    const { app } = this;
    const result = await app.model.User.findOne({
      where: params,
    });
    if (result) {
      const { id, username, password } = result;
      // 获取jwt配置
      const { jwt: { secret, expiresIn } } = this.app.config;
      // 生成token
      const token = this.app.jwt.sign({
        id, username,
      }, secret, { expiresIn });
      // token 保存数据库
      await app.model.User.update({ token }, { where: { username } });
      return {
        username,
        token,
        userId: id,
      };
    }
    return result;
  }
  async modifyPassword(params) {
    const result = await this.app.model.User.findOne({
      where: {
        password: params.old_password,
      },
    });
    if (!result) return { errorMessage: '输入的旧密码不对', returnStatus: 'FAILED', data: '' };
    const result2 = await this.app.model.User.update({ password: params.new_password }, { where: { id: result.id } });
    return result2;
  }
}

module.exports = UserService;
