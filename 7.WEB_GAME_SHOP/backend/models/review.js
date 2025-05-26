'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.User,{foreignKey:"userId"});
      Review.belongsTo(models.Item,{foreignKey:"itemId"});
    }
  };
  Review.init({
    userId: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER,
    rate: DataTypes.FLOAT,
    text: DataTypes.STRING,
    name: DataTypes.STRING,
    buyOption: DataTypes.STRING,
    buyCount: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};