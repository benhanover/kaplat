const Book = require('../mongo/models/Book'); // Import the Book model
const mongoApi = require('../mongo/api');
const validGenres = ["SCI_FI", "NOVEL", "HISTORY", "MANGA", "ROMANCE", "PROFESSIONAL"];

// Create a new book
const createBook = async (req, res) => {
    const { title, author, year, price, genres } = req.body;

    try {
        const existingBook =  await mongoApi.isBookExist(title);
        
        if (existingBook) {
            return res.status(409).json({
                result: null,  // Ensure result is null
                errorMessage: `Error: Book with the title [${title}] already exists in the system`
            });
        }

        if (year < 1940 || year > 2100) {
            return res.status(409).json({
                errorMessage: `Error: Invalid year [${year}], should be between 1940 and 2100`
            });
        }

        if (price < 0) {
            return res.status(409).json({
                errorMessage: `Error: Price cannot be negative`
            });
        }
        
        const id = await mongoApi.createBook({ title, author, year, price, genres });
        res.status(200).json({ result: id });
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

// Get a single book by ID
const getBook = async (req, res) => {
    const { id } = req.query;

    try {
        const book = await mongoApi.findBookByRawId(id);
        
        if (!book) {
            return res.status(404).json({
                result: null,
                errorMessage: `Error: no such Book with id ${id}`
            });
        }

        res.status(200).json({ result: book });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

// Get total number of books with filters
const getBooksTotal = async (req, res) => {
    const { author, 'price-bigger-than': priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres } = req.query;

    try {
        let query = {};

        if (author) {
            query.author = new RegExp(`^${author}$`, 'i');
        }

        if (priceBiggerThan) {
            query.price = { $gte: parseFloat(priceBiggerThan) };
        }

        if (priceLessThan) {
            query.price = { ...query.price, $lte: parseFloat(priceLessThan) };
        }

        if (yearBiggerThan) {
            query.year = { $gte: parseInt(yearBiggerThan, 10) };
        }

        if (yearLessThan) {
            query.year = { ...query.year, $lte: parseInt(yearLessThan, 10) };
        }

        if (genres) {
            const genreList = genres.split(',');
            if (!genreList.every(genre => validGenres.includes(genre))) {
                return res.status(400).json({
                    result: null,
                    errorMessage: 'Error: Invalid genre(s) provided'
                });
            }
            query.genres = { $in: genreList };
        }

        const totalBooks = await mongoApi.getNumberOfBooksByQuery(query);
        res.status(200).json({ result: totalBooks, errorMessage: null });
    } catch (error) {
        console.error('Error fetching total books:', error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

// Get books with filters
const getBooks = async (req, res) => {
    let { author, 'price-bigger-than': priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres } = req.query;

    try {
        let query = {};

        if (author) {
            query.author = new RegExp(`^${author}$`, 'i');
        }

        if (priceBiggerThan) {
            query.price = { $gte: parseFloat(priceBiggerThan) };
        }

        if (priceLessThan) {
            query.price = { ...query.price, $lte: parseFloat(priceLessThan) };
        }

        if (yearBiggerThan) {
            query.year = { $gte: parseInt(yearBiggerThan, 10) };
        }

        if (yearLessThan) {
            query.year = { ...query.year, $lte: parseInt(yearLessThan, 10) };
        }

        if (genres) {
            const genreList = genres.split(',');
            if (!genreList.every(genre => validGenres.includes(genre))) {
                return res.status(400).json({
                    errorMessage: 'Invalid genres provided. Valid options are: ROMANCE, PROFESSIONAL'
                });
            }
            query.genres = { $in: genreList };
        }

        const filteredBooks = await mongoApi.getBooksByQuery(query);
        res.status(200).json({ result: filteredBooks });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

// Update a book's price
const updateBook = async (req, res) => {
    const { id, price } = req.query;
    
    try {
        const book = await mongoApi.findBookByRawId(id);
        if (!book) {
            return res.status(404).json({
                result: null,
                errorMessage: `Error: no such Book with id ${id}`
            });
        }

        if (price < 0) {
            return res.status(409).json({
                result: null,
                errorMessage: `Error: price update for book [${id}] must be a positive integer`
            });
        }

        const currentPrice = book.price;
        book.price = parseFloat(price);
        // await book.save();
        await mongoApi.updateBook(book)
        res.status(200).json({
            result: currentPrice,
            errorMessage: null
        });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

// Delete a book by ID
const deleteBook = async (req, res) => {
    const { id } = req.query;

    try {
        await mongoApi.deleteBook(id);
        res.status(200).json({
            errorMessage: null,
            result: parseInt(id),
            });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

module.exports = {
    createBook,
    getBook,
    updateBook,
    deleteBook,
    getBooksTotal,
    getBooks
};
