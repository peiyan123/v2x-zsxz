'use strict';
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Radar2 = app.model.define(
    'radar2',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: STRING,
      port: STRING,
      protocol: STRING,
      ip: {
        type: STRING,
        validate: {
          isIP(value) {},
        },
      },
      groupId: INTEGER,
      facturer: STRING,
      model: STRING,
      position: STRING,
      status: STRING,
      desc: STRING,
      sn: STRING,
      mbcIp: STRING,
      mbcPort: STRING,
      mbcNetworkCard: STRING,
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: false, // 自动转换驼峰->下划线
    }
  );

  return Radar2;
};
