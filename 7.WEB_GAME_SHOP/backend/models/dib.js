'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dib extends Model {
    /**
     * Helper method for defining associations.
     * This method is not xa part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Dib.belongsTo(models.User,{foreignKey:"userId"});
      Dib.belongsTo(models.Item,{foreignKey:"itemId"});
    }
  };
  Dib.init({
    userId: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Dib',
  });
  return Dib;
};