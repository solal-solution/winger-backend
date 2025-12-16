module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListSmokers',
      [
        {
          title: 'non',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'régulier',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'irrégulier',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListSmokers', null, {});
  },
};
