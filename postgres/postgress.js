const { Sequelize } = require('sequelize');

// PostgreSQL connection URI
const postgresURI = 'postgres://postgres:docker@postgres:5432/books'; // Fixed password case

// Initialize Sequelize
const sequelize = new Sequelize(postgresURI, {
    dialect: 'postgres',
    logging: false, // Disable logging for cleaner output
});

// Function to connect to PostgreSQL
const connectPostgres = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL');
    } catch (error) {
        console.error('Failed to connect to PostgreSQL:', error);
        throw error;
    }
};

module.exports = { sequelize, connectPostgres };
