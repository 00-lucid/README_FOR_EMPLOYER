'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    return await queryInterface.bulkInsert(
      'options',
      [
        {
          itemId: 1,
          option: 'red',
          optionPrice: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          itemId: 1,
          option: 'yellow',
          optionPrice: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          itemId: 1,
          option: 'blue',
          optionPrice: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          itemId: 1,
          option: 'skyblue',
          optionPrice: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          itemId: 2,
          option: 'orange',
          optionPrice: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          itemId: 20,
          option: '에메랄드색',
          optionPrice: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          itemId: 20,
          option: '루비색',
          optionPrice: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          itemId: 20,
          option: '사피이어색',
          optionPrice: 120,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          itemId: 38,
          option: '+감정표현',
          optionPrice: 500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkInsert('options', null, {});
  },
};
