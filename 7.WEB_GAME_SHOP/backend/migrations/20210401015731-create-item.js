'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },

      rate: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      review: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      price: {
        type: Sequelize.INTEGER,
      },

      status: {
        type: Sequelize.STRING,
        defaultValue: 'on',
      },
      sale: {
        type: Sequelize.STRING,
        default: null,
      },
      count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      img: {
        type: Sequelize.STRING,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Items');
  },
};
