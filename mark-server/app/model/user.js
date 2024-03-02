'use strict';
module.exports = app => {
  const { STRING, INTEGER, TEXT } = app.Sequelize;

  const User = app.model.define('user', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    username: TEXT,
    password: TEXT,
    token: TEXT,
  }, {
    freezeTableName: true,
    timestamps: false,
  });

  return User;
};
