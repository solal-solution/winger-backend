module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListTattoos',
      [
        {
          title: 'non',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'discrets',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'visibles',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListTattoos', null, {});
  },
};
