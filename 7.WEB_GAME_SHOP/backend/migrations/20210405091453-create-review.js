'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      itemId: {
        type: Sequelize.INTEGER,
        references: { model: 'Items', key: 'id' },
      },
      rate: {
        type: Sequelize.FLOAT,
      },
      text: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      buyOption: {
        type: Sequelize.STRING,
      },
      buyCount: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('Reviews');
  },
};
