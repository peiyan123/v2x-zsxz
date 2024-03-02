'use strict';
module.exports = app => {
  const { INTEGER, TEXT } = app.Sequelize;
  const Group3 = app.model.define('group3', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: TEXT,
    // dataPort: {
    //   type: INTEGER,
    //   field: 'data_port',
    // },
    // pullData: {
    //   type: INTEGER,
    //   field: 'pull_data',
    //   get() {
    //     return this.getDataValue('pullData') === 1;
    //   },
    //   set(value) {
    //     this.setDataValue('pullData', value ? 1 : 0);
    //   },
    // },
    // extensionIp: {
    //   type: TEXT,
    //   field: 'extension_ip',
    // },
    // highSpeedThreshold: {
    //   type: INTEGER,
    //   field: 'high_speed_threshold',
    // },
    // lowSpeedThreshold: {
    //   type: TEXT,
    //   field: 'low_speed_threshold',
    // },
  }, {
    freezeTableName: true,
    timestamps: true,
    underscored: false, // 自动转换驼峰->下划线
  });
  /**
   * 设置与group表关联的表
   */
  Group3.associate = function() {
    // 与camera表关联
    app.model.Group3.hasOne(app.model.Camera3, { onDelete: 'CASCADE', foreignKey: {
      field: 'groupId',
    }, hooks: true });
    // 与radar表关联
    app.model.Group3.hasOne(app.model.Radar3, { onDelete: 'CASCADE', foreignKey: {
      field: 'groupId',
    }, hooks: true });
  };

  return Group3;
};
