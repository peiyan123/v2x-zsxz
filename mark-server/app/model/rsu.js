'use strict';
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Rsu = app.model.define(
    'rsu',
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
      emergencyThreshold: {
        type: INTEGER,
        field: 'emergency_threshold',
      },
      frequency: INTEGER,
      heartbeatPeriod: {
        type: INTEGER,
        field: 'heartbeat_period',
      },
      sendPeriod: {
        type: INTEGER,
        field: 'send_period',
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: false, // 自动转换驼峰->下划线
    }
  );

  return Rsu;
};
