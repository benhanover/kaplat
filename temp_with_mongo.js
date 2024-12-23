const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 8574;

let books = [];
let currentAvailableId = 1;

const mongoUrl = 'mongodb://mongo:27017'; // Use the service name 'mongo' from docker-compose
const dbName = 'booksDB'; 

async function connectToMongo() {
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        booksCollection = db.collection('books'); // Reference to the 'books' collection
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up a simple route
app.get('/books/health', (req, res) => {
    res.status(200).send('OK');
});

app.post('/book', (req, res) => {
    const { title, author, year, price, genres } = req.body;
    const existingBook = books.find(book => book.title.toLowerCase() === title.toLowerCase());
    if (existingBook) {
        return res.status(409).json({
            errorMessage: `Error: Book with the title [${title}] already exists in the system`
        });
    }
    // Check if the year is within the accepted range
    if (year < 1940 || year > 2100) {
        return res.status(409).json({
            errorMessage: `Error: Can't create new Book that its year [${year}] is not in the accepted range [1940 -> 2100]`
        });
    }

    // Check if the price is positive
    if (price < 0) {
        return res.status(409).json({
            errorMessage: `Error: Can't create new Book with negative price`
        });
    }

    const newBook = {
        id: currentAvailableId, // Assigning the next available ID
        title,
        author,
        year,
        price,
        genres
    };
    currentAvailableId++;

    // Add the new book to the books array
    books.push(newBook);

    // Respond with the newly assigned book number
    res.status(200).json({ result: newBook.id });

});

app.get('/books/total', (req, res) => {
    const { author, 'price-bigger-than': priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres } = req.query;

    const validGenres = ["SCI_FI", "NOVEL", "HISTORY", "MANGA", "ROMANCE", "PROFESSIONAL"];
    let filteredBooks = books;

    if (author) {
        filteredBooks = filteredBooks.filter(book => book.author.toLowerCase() === author.toLowerCase());
    }

    if (priceBiggerThan) {
        filteredBooks = filteredBooks.filter(book => book.price >= parseInt(priceBiggerThan));
    }

    if (priceLessThan) {
        filteredBooks = filteredBooks.filter(book => book.price <= parseInt(priceLessThan));
    }

    if (yearBiggerThan) {
        filteredBooks = filteredBooks.filter(book => book.year >= parseInt(yearBiggerThan));
    }

    if (yearLessThan) {
        filteredBooks = filteredBooks.filter(book => book.year <= parseInt(yearLessThan));
    }

    if (genres) {
        const genreList = genres.split(',');
        if (!genreList.every(genre => validGenres.includes(genre))) {
            return res.status(400).json({
                result: null,
                errorMessage: 'Error: Invalid genre(s) provided'
            });
        }
        filteredBooks = filteredBooks.filter(book => genreList.some(genre => book.genres.includes(genre)));
    }

    res.status(200).json({ result: filteredBooks.length, errorMessage: null });
});

app.get('/books', (req, res) => {
    let { author, 'price-bigger-than': priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres } = req.query;

    // Convert query parameters to appropriate types
    priceBiggerThan = priceBiggerThan ? parseFloat(priceBiggerThan) : undefined;
    priceLessThan = priceLessThan ? parseFloat(priceLessThan) : undefined;
    yearBiggerThan = yearBiggerThan ? parseInt(yearBiggerThan, 10) : undefined;
    yearLessThan = yearLessThan ? parseInt(yearLessThan, 10) : undefined;
    genres = genres ? genres.split(',') : undefined;

    // Validate genres if provided
    const validGenres = ['ROMANCE', 'PROFESSIONAL','SCI_FI', 'NOVEL', 'HISTORY', 'MANGA'];
    if (genres && !genres.every(genre => validGenres.includes(genre))) {
        return res.status(400).json({
            errorMessage: 'Invalid genres provided. Valid options are: ROMANCE, PROFESSIONAL'
        });
    }
// Filter books based on query parameters
    let filteredBooks = books.filter(book => {
        let matches = true;

        if (author) {
            matches = matches && book.author.toLowerCase() === author.toLowerCase();
        }
        if (priceBiggerThan !== undefined) {
            matches = matches && book.price >= priceBiggerThan;
        }
        if (priceLessThan !== undefined) {
            matches = matches && book.price <= priceLessThan;
        }
        if (yearBiggerThan !== undefined) {
            matches = matches && book.year >= yearBiggerThan;
        }
        if (yearLessThan !== undefined) {
            matches = matches && book.year <= yearLessThan;
        }
        if (genres) {
            matches = matches && genres.some(genre => book.genres.includes(genre));
        }

        return matches;
    });

    // Sort the filtered books by title, case insensitive
    filteredBooks.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));

    // Respond with the filtered and sorted list of books
    res.status(200).json({result: filteredBooks});
});

app.get('/book', (req, res) => {
    const { id } = req.query;
    const book = books.find(book => book.id === parseInt(id));

    if (!book) {
        return res.status(404).json({
            result: null,
            errorMessage: `Error: no such Book with id ${id}`
        });
    }

    res.status(200).json({
        result: book,
        errorMessage: null
    });
});

app.put('/book', (req, res) => {
    const { id, price } = req.query;
    const bookIndex = books.findIndex(book => book.id === parseInt(id));

    if (bookIndex === -1) {
        return res.status(404).json({
            result: null,
            errorMessage: `Error: no such Book with id ${id}`
        });
    }

    const currentPrice = books[bookIndex].price;

    if (price < 0) {
        return res.status(409).json({
            result: null,
            errorMessage: `Error: price update for book [${id}] must be a positive integer`
        });
    }

    // Update the book's price
    books[bookIndex].price = parseFloat(price);

    res.status(200).json({
        result: currentPrice,
        errorMessage: null
    });
});

app.delete('/book', (req, res) => {
    const { id } = req.query;
    const bookIndex = books.findIndex(book => book.id === parseInt(id));

    if (bookIndex === -1) {
        return res.status(404).json({
            result: null,
            errorMessage: `Error: no such Book with id ${id}`
        });
    }

    // Remove the book from the array
    books.splice(bookIndex, 1);

    res.status(200).json({
        result: books.length,
        errorMessage: null
    });
});


// Start the server after connecting to MongoDB
connectToMongo()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to start the server due to MongoDB connection error:', error);
        process.exit(1); // Exit the process with an error code
    });