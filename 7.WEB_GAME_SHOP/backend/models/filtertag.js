'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FilterTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      FilterTag.belongsTo(models.User);
    }
  };
  FilterTag.init({
    userId: DataTypes.INTEGER,
    tag: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FilterTag',
  });
  return FilterTag;
};