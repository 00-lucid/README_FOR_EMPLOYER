'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Item.hasMany(models.LineItem, { onDelete: 'cascade' });
      Item.hasMany(models.Tag, { onDelete: 'cascade' });
      // Item.belongsToMany(models.User, {
      //   through: 'Dibs',
      // })
      Item.belongsToMany(models.User, {
        through: 'Dibs',
        targetKey: 'id',
        foreignKey: 'itemId',
        onDelete: 'cascade',
      });
    }
  }
  Item.init(
    {
      name: DataTypes.STRING,

      rate: DataTypes.FLOAT,
      review: DataTypes.INTEGER,
      price: DataTypes.INTEGER,

      status: DataTypes.STRING,
      sale: DataTypes.STRING,
      count: DataTypes.INTEGER,

      img: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Item',
    },
  );
  return Item;
};
