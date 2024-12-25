const express = require('express');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes/bookRoutes');
const booksRoutes = require('./routes/booksRoutes');
const { connectMongoDB } = require('./mongo/mongo'); // MongoDB connection
const { connectPostgres } = require('./postgres/postgress'); // PostgreSQL connection

const app = express();
const port = 8574;

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the routes
app.use('/book', bookRoutes);
app.use('/books', booksRoutes);

// Function to start the server after successful MongoDB and PostgreSQL connections
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectMongoDB();
        console.log('Connected to MongoDB');

        // Connect to PostgreSQL
        await connectPostgres();
        console.log('Connected to PostgreSQL');

        // Start the Express server after successful database connections
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('error starting the server', error);
        process.exit(1); // Exit the application if any database connection fails
    }
};

// Start the server
startServer();
