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
    return await queryInterface.bulkInsert('statistictags', [
      {
        tag: '스킨',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tag: '크로마',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tag: '랜덤',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tag: '챔피언',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tag: '세트',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tag: '아이콘',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tag: '감정표현',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tag: '와드스킨',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        tag: '전략적팀전투',
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkInsert('statistictags', null, {});
  }
};
