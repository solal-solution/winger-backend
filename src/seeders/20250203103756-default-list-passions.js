module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListPassions',
      [
        {
          title: 'musique',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'lecture',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'cinéma',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'spectacles',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'tv',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'sport',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'internet',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListPassions', null, {});
  },
};
