const express = require('express');
const bodyParser = require('body-parser');
const healthRoutes = require('./routes/healthRoutes');
const bookRoutes = require('./routes/bookRoutes');
const booksRoutes = require('./routes/booksRoutes');
const { connectMongoDB } = require('./mongo/mongo');

const app = express();
const port = 8574;

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the routes
app.use('/book', bookRoutes);
app.use('/books', booksRoutes);
app.use('/health', healthRoutes);

// Function to start the server after successful MongoDB connection
const startServer = async () => {
    try {
        // Attempt to connect to MongoDB using Mongoose
        await connectMongoDB();
        
        // Start the Express server after MongoDB connection is successful
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1); // Exit the application if MongoDB connection fails
    }
};

// Start the server
startServer();
