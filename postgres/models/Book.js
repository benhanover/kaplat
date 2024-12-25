
const { sequelize } = require('../postgress'); // Make sure this is correctly initializing Sequelize
const { DataTypes } = require('sequelize');

const Book = sequelize.define('Book', {
    rawid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Title cannot be empty',
            },
        },
    },
    author: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1940],
                msg: 'Year must be 1940 or later',
            },
            max: {
                args: [2100],
                msg: 'Year must be 2100 or earlier',
            },
        },
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'Price cannot be negative',
            },
        },
    },
    genres: {
        type: DataTypes.JSON, // Use JSON instead of ARRAY
        allowNull: true,
        validate: {
            isArray(value) {
                if (value && !Array.isArray(value)) {
                    throw new Error('Genres must be an array');
                }
            },
        },
    },
}, {
    tableName: 'books', // Explicitly set the table name
    timestamps: false, // Automatically add createdAt and updatedAt
});

module.exports = Book;