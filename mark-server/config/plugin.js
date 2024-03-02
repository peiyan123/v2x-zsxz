'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  jwt: {
    enable: true,
    package: 'egg-jwt',
  },
  validatePlusNext: {
    enable: true,
    package: 'egg-validate-plus-next',
  },
  axiosPlus: {
    enable: true,
    package: 'egg-axios-plus',
  },
};
