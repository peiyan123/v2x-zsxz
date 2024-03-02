'use strict';
module.exports = app => {
  const { STRING, INTEGER, JSON, REAL } = app.Sequelize;

  const Mec2 = app.model.define(
    'mec2',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      // imageUrl: STRING,
      port: STRING,
      username: STRING,
      password: STRING,
      // latitude: STRING,
      // longitude: STRING,
      ip: {
        type: STRING,
      },
      // // 保存“是否作为分布式子设备”设置的字段
      // subDevice: {
      //   type: INTEGER,
      //   field: 'sub_device',
      //   get() {
      //     return this.getDataValue('sub_device') === 1;
      //   },
      //   set(value) {
      //     this.setDataValue('subDevice', value ? 1 : 0);
      //   },
      // },
      // 保存“Multiple Task List”设置的字段
      multipleTask: {
        type: JSON,
        field: 'multiple_task',
      },
      // deviceId: {
      //   type: STRING,
      //   field: 'device_id',
      // },
      // sn: STRING,
      // elevation: REAL,
    },
    {
      freezeTableName: true,
      timestamps: false,
      underscored: false, // 自动转换驼峰->下划线
    }
  );

  return Mec2;
};
