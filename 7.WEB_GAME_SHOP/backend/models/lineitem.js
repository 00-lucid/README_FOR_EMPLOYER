'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LineItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // fix
      // user.belongsToMany(models.comment,{through:models.like});
      LineItem.belongsTo(models.Item);
      LineItem.belongsTo(models.User);
    }
  };
  LineItem.init({
    userId: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    img: DataTypes.STRING,
    buyOption: DataTypes.STRING,
    buyCount: DataTypes.INTEGER,
    lineTotal: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LineItem',
  });
  return LineItem;
};