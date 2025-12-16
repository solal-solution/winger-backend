module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListHeights',
      [
        {
          title: '1m50',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '1m50-1m60',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '1m60-1m70',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '1m70-1m80',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '1m80-1m90',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '1m90+',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListHeights', null, {});
  },
};
