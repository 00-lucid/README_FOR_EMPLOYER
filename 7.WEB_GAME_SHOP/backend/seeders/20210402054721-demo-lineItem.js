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
      'lineitems',
      [
        {
          userId: 1,
          orderId: 1,
          name: '우주 그루브 나서스 테두리 세트',
          img:
            'https://d392eissrffsyf.cloudfront.net/storeImages/bundles/99901056.jpg',
          buyOption: 'red',
          buyCount: 1,
          lineTotal: 3125,
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
    await queryInterface.bulkInsert('lineitems', null, {});
  },
};
