'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Search extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Search.belongsTo(models.User,{foreignKey:"userId"});
    }
  };
  Search.init({
    userId: DataTypes.INTEGER,
    keyword: DataTypes.STRING,
    count: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Search',
  });
  return Search;
};