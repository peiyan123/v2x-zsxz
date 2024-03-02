'use strict';
module.exports = options => {
  return async function verifyToken(ctx, next) {
    const token = ctx.request.header.authorization;
    let decode;
    if (token) {
      // 注释下面代码，以取消同一账号不能同时登录的限制
      // // 如果协带的token与session的token不一致 重新登录
      // const re = await ctx.app.model.User.findOne({ where: { token: token.slice(7) } });
      // if (!re) {
      //   ctx.status = 401;
      //   ctx.body = {
      //     message: '请重新登录',
      //   };
      //   return;
      // }
      if (!ctx.session.token || ctx.session.token != token.slice(7)) {
        ctx.status = 401;
        ctx.body = {
          message: '请重新登录',
        };
        return;
      }
      // 解码 token
      try {
        decode = ctx.app.jwt.verify(token.slice(7), options.secret);
        ctx.service.user.userId = decode.id;
        await next();
      } catch (error) {
        // jwt expired
        if (error.message === 'jwt expired') {
          ctx.status = 401;
          ctx.body = {
            message: error.message,
          };
        } else {
          ctx.status = 500;
          ctx.body = {
            message: error.message,
          };
        }
      }
    } else {
      ctx.status = 401;
      ctx.body = {
        message: '没有token',
      };
      return;
    }
  };
};
