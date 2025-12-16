module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListEducations',
      [
        {
          title: 'bac-',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'bac',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'bac+2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'bac+3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'bac+4',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'bac++',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListEducations', null, {});
  },
};
