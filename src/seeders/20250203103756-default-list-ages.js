module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'ListAges',
      [
        {
          title: '18-20',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '20-25',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '25-30',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '30-35',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '35-40',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '40-45',
          createdAt: new Date(),
          updatedAt: new Date(),
        },        {
          title: '45-50',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '50-55',
          createdAt: new Date(),
          updatedAt: new Date(),
        },        
        {
          title: '55-60',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '60-65',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: '65+',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {ignoreDuplicates: true}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ListAges', null, {});
  },
};
