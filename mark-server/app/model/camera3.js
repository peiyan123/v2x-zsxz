'use strict';
module.exports = app => {
  const { STRING, INTEGER, JSON } = app.Sequelize;

  const Camera3 = app.model.define(
    'camera3',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: STRING,
      rtsp: STRING,
      facturer: STRING,
      model: STRING,
      position: STRING,
      towards: STRING,
      status: STRING,
      desc: STRING,
      imagePath: STRING,
      video: JSON,
      sn: STRING,
      groupId: INTEGER,
    },
    {
      freezeTableName: true,
      timestamps: true,
      underscored: false, // 自动转换驼峰->下划线
    }
  );

  /**
   * 设置与camera表关联的表
   */
  Camera3.associate = function() {
    // 与mark表关联
    app.model.Camera3.hasMany(app.model.Mark3, { onDelete: 'CASCADE', foreignKey: {
      field: 'camera_id',
    }, hooks: true });
  };

  return Camera3;
};
