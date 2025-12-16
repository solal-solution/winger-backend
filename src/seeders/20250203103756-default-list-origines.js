module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListOrigines',
      [
        {
          title: 'française',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'européenne',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'étrangère',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListOrigines', null, {});
  },
};
