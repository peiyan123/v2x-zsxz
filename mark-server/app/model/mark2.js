'use strict';
module.exports = app => {
  const { STRING, INTEGER, TEXT } = app.Sequelize;

  const Mark2 = app.model.define('mark2', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    camera_id: INTEGER,
    type: STRING,
    value: TEXT,
    image_info: TEXT,
    file_name: TEXT,
  }, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      // Create a unique index on email
      {
        unique: true,
        fields: [ 'camera_id', 'type', 'file_name' ],
      },
    ],
  });

  return Mark2;
};
