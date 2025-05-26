'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LineItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      itemId: {
        type: Sequelize.INTEGER,
        references:{model: 'Items', key: 'id'},
        onDelete: 'CASCADE',
      },
      orderId: {
        type: Sequelize.INTEGER,
      },
      buyOption: {
        type: Sequelize.STRING
      },
      buyCount: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      img: {
        type: Sequelize.STRING
      },
      lineTotal: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LineItems');
  }
};