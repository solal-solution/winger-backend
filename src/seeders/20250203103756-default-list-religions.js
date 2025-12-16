module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListReligions',
      [
        {
          title: 'catholique',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'protestante',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'orthodoxe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'musulmane',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'juive',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'hindoue',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'bouddhiste',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'agnostique',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'athée',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'autre',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListReligions', null, {});
  },
};
