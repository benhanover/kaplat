const mongoose = require('mongoose');

// MongoDB URI using Docker service name 'mongo' as hostname
const mongoURI = 'mongodb://mongo:27017/books';

const connectMongoDB = async () => {
    try {
        // Connect to MongoDB using Mongoose without deprecated options
        await mongoose.connect(mongoURI);

        console.log('Connected to MongoDB');

        // Handle Mongoose connection events
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB');
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        return mongoose.connection;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
};

// Export the function for use in other files
module.exports = { connectMongoDB };
