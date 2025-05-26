'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class statisticTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  statisticTag.init({
    tag: DataTypes.STRING,
    count: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'statisticTag',
  });
  return statisticTag;
};