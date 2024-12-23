const express = require('express');
const bodyParser = require('body-parser');
const healthRoutes = require('./routes/healthRoutes');
const bookRoutes = require('./routes/bookRoutes');
const booksRoutes = require('./routes/booksRoutes');

const app = express();
const port = 8574;

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the routes
app.use('/book', bookRoutes);
app.use('/books', booksRoutes);
app.use('/health', healthRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
