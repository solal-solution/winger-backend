module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListSilhouettes',
      [
        {
          title: 'normale',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'mince',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'sportive',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: 'quelques kilos à perdre',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListSilhouettes', null, {});
  },
};
