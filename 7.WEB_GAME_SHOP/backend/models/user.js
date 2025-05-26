'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // fix
      // User.hasMany(models.Item);
      // User.belongsToMany(models.Item, {
      //   through: 'Dibs',
      // })
      User.hasMany(models.Review, { onDelete: 'cascade' });
      User.hasMany(models.Search, { onDelete: 'cascade' });
      User.hasMany(models.Bell, { onDelete: 'cascade' });
      User.hasMany(models.FilterTag, { onDelete: 'cascade' });
      User.belongsToMany(models.Item, {
        through: 'Dibs',
        targetKey: 'id',
        foreignKey: 'userId',
        onDelete: 'cascade',
      });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      tier: DataTypes.STRING,
      buyCount: DataTypes.INTEGER,
      rp: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'User',
    },
  );
  return User;
};
