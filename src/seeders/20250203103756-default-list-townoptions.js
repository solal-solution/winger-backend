module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListTownOptions',
      [
        {
          title: 'dans ma ville',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'dans mon département',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'dans ma région',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'dans la France entière',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'dans le monde entier',
          createdAt: new Date(),
          updatedAt: new Date(),
        },

      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListTownOptions', null, {});
  },
};