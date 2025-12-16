module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListKids',
      [
        {
          title: 'non',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'à charge',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'en garde alternée',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'indépendants',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListKids', null, {});
  },
};
