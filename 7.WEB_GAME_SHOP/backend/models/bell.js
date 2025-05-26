'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bell extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bell.belongsTo(models.User);
    }
  };
  Bell.init({
    userId: DataTypes.INTEGER,
    text: DataTypes.STRING,
    read: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Bell',
  });
  return Bell;
};