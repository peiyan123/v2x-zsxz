'use strict';
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Radar = app.model.define(
    'radar',
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
      facturer: STRING,
      model: STRING,
      position: STRING,
      status: STRING,
      desc: STRING,
      sn: STRING,
      mbcIp: STRING,
      mbcPort: STRING,
      mbcNetworkCard: STRING,
      groupId: INTEGER,
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: false, // 自动转换驼峰->下划线
    }
  );

  return Radar;
};
