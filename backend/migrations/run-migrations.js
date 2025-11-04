const sequelize = require('../config/database');
const { User, Category, Product } = require('../models');

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('All models synchronized successfully.');

    // Create default admin user if not exists
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        password: 'admin123'
      });
      console.log('Default admin user created (email: admin@example.com, password: admin123)');
    }

    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
