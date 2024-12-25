const mongoApi = require('../mongo/api');
const postgresApi = require('../postgres/api');
const { Op } = require('sequelize');

    
const validGenres = ["SCI_FI", "NOVEL", "HISTORY", "MANGA", "ROMANCE", "PROFESSIONAL"];


createBook = async (req, res) => {
    const { title, author, year, price, genres } = req.body;
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

    let mongo_existingBook, postgres_existingBook;

    // Mongo
    try {
        mongo_existingBook = await mongoApi.isBookExist(title);
    } catch (error) {
        console.error('Error checking book existence in MongoDB:', error);
        return res.status(500).json({ errorMessage: 'Internal server error while checking book existence in MongoDB' });
    }

    // Postgres
    try {
        postgres_existingBook = await postgresApi.isBookExist(title);
    } catch (error) {
        console.error('Error checking book existence in Postgres:', error);
        return res.status(500).json({ errorMessage: 'Internal server error while checking book existence in Postgres' });
    }

    if (mongo_existingBook || postgres_existingBook) {
        return res.status(409).json({
            result: null,  // Ensure result is null
            errorMessage: `Error: Book with the title [${title}] already exists in the system`
        });
    }

    let mongo_id, postgres_id;

    // Mongo
    try {
        mongo_id = await mongoApi.createBook({ title, author, year, price, genres });
    } catch (error) {
        console.error('Error creating book in MongoDB:', error);
        return res.status(500).json({ errorMessage: 'Internal server error while creating book in MongoDB' });
    }

    // Postgres
    try {
        postgres_id = await postgresApi.createBook({ title, author, year, price, genres });
    } catch (error) {
        console.error('Error creating book in Postgres:', error);
        return res.status(500).json({ errorMessage: 'Internal server error while creating book in Postgres' });
    }

    switch (req.query.persistenceMethod) {
        case "MONGO":
            return res.status(200).json({ result:  mongo_id  });
        case "POSTGRES":
            return res.status(200).json({ result:  postgres_id  });
        default:
            return res.status(200).json({ result:  mongo_id  });
    }   
};

const getBook = async (req, res) => {
    const { id } = req.query;
    let book
    switch (req.query.persistenceMethod) {
        case 'MONGO':
            try {
                book = await mongoApi.findBookByRawId(id);
            } catch (error) {
                console.error('Error fetching book:', error);
                return res.status(500).json({ errorMessage: 'Internal server error' });
            }
        case 'POSTGRES':
            try {
                book = await postgresApi.findBookByRawId(id);
            } catch (error) {
                console.error('Error fetching book:', error);
                return res.status(500).json({ errorMessage: 'Internal server error' });
            }
        default:
            try {
                book = await mongoApi.findBookByRawId(id);
            } catch (error) {
                console.error('Error fetching book:', error);
                return res.status(500).json({ errorMessage: 'Internal server error' });
            }
    }
    if (!book) {
        return res.status(404).json({
            result: null,
            errorMessage: `Error: no such Book with id ${id}`
        });
    }

    return res.status(200).json({ result: book });
};

// Get total number of books with filters
const getBooksTotal = async (req, res) => {
    let { author, 'price-bigger-than': priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres } = req.query;
    let query = {};
    let postgresQuery = {};

    if (author) {
        query.author = new RegExp(`^${author}$`, 'i');
        postgresQuery.author = author;
    }

    if (priceBiggerThan) {
        query.price = { $gte: parseFloat(priceBiggerThan) };
        postgresQuery.price = { $gte: parseFloat(priceBiggerThan) };
    }

    if (priceLessThan) {
        query.price = { ...query.price, $lte: parseFloat(priceLessThan) };
        postgresQuery.price = { ...postgresQuery.price, $lte: parseFloat(priceLessThan) };
    }

    if (yearBiggerThan) {
        query.year = { $gte: parseInt(yearBiggerThan, 10) };
        postgresQuery.year = { $gte: parseInt(yearBiggerThan, 10) };
    }

    if (yearLessThan) {
        query.year = { ...query.year, $lte: parseInt(yearLessThan, 10) };
        postgresQuery.year = { ...postgresQuery.year, $lte: parseInt(yearLessThan, 10) };
    }

    if (genres) {
        const genreList = genres.split(',');
        if (!genreList.every(genre => validGenres.includes(genre))) {
            return res.status(400).json({
                errorMessage: 'Invalid genres provided. Valid options are: ROMANCE, PROFESSIONAL'
            });
        }
        query.genres = { $in: genreList };
        postgresQuery.genres = genreList;
    }

    let totalBooks;
    try {
        switch (req.query.persistenceMethod) {
            case 'MONGO':
                try {
                    totalBooks = await mongoApi.getNumberOfBooksByQuery(query);
                } catch (error) {
                    console.error('Error fetching book:', error);
                    return res.status(500).json({ errorMessage: 'Internal server error' });
                }
            case 'POSTGRES':
                try {
                    totalBooks = await postgresApi.getNumberOfBooksByQuery(postgresQuery);
                } catch (error) {
                    console.error('Error fetching book:', error);
                    return res.status(500).json({ errorMessage: 'Internal server error' });
                }
            default:
                try {
                    totalBooks = await mongoApi.getNumberOfBooksByQuery(query);
                } catch (error) {
                    console.error('Error fetching book:', error);
                    return res.status(500).json({ errorMessage: 'Internal server error' });
                }
        }

        res.status(200).json({ result: totalBooks, errorMessage: null });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};


// Get books with filters
const getBooks = async (req, res) => {
    let { author, 'price-bigger-than': priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres } = req.query;
    let query = {};
    let postgresQuery = {};

    if (author) {
        query.author = new RegExp(`^${author}$`, 'i');
        postgresQuery.author = author;
    }

    if (priceBiggerThan) {
        query.price = { $gte: parseFloat(priceBiggerThan) };
        postgresQuery.price = { ...postgresQuery.price, [Op.gte]: parseFloat(priceBiggerThan) };

    }

    if (priceLessThan) {
        query.price = { ...query.price, $lte: parseFloat(priceLessThan) };
        postgresQuery.price = { ...postgresQuery.price, [Op.lte]: parseFloat(priceLessThan) };
    }

    if (yearBiggerThan) {
        query.year = { $gte: parseInt(yearBiggerThan, 10) };
        postgresQuery.year = { ...postgresQuery.year, [Op.gte]: parseInt(yearBiggerThan, 10) };
    }

    if (yearLessThan) {
        query.year = { ...query.year, $lte: parseInt(yearLessThan, 10) };
        postgresQuery.year = { ...postgresQuery.year, [Op.lte]: parseInt(yearLessThan, 10) };
    }

    if (genres) {
        const genreList = genres.split(',');
        if (!genreList.every(genre => validGenres.includes(genre))) {
            return res.status(400).json({
                errorMessage: 'Invalid genres provided. Valid options are: ROMANCE, PROFESSIONAL'
            });
        }
        query.genres = { $in: genreList };
        postgresQuery.genres = { [Op.overlap]: genreList }; // For PostgreSQL JSONB array match
    }

    let books;
    try {
        switch (req.query.persistenceMethod) {
            case 'MONGO':
                try {
                    books = await mongoApi.getBooksByQuery(query);
                } catch (error) {
                    console.error('Error fetching books from MongoDB:', error);
                    return res.status(500).json({ errorMessage: 'Internal server error' });
                }
                break;
            case 'POSTGRES':
                try {
                    books = await postgresApi.getBooksByQuery(postgresQuery);
                    books = books.map(book => {
                        const parsedBook = book.toJSON();
                        parsedBook.genres = JSON.parse(parsedBook.genres || '[]');
                        return parsedBook;
                    });
                } catch (error) {
                    console.error('Error fetching books from Postgres:', error);
                    return res.status(500).json({ errorMessage: 'Internal server error' });
                }
                break;
            default:
                try {
                    books = await mongoApi.getBooksByQuery(query);
                } catch (error) {
                    console.error('Error fetching books from MongoDB:', error);
                    return res.status(500).json({ errorMessage: 'Internal server error' });
                }
        }

        res.status(200).json({ result: books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};


// Update a book's price
const updateBook = async (req, res) => {
    const { id, price } = req.query;

    if (price < 0) {
        return res.status(409).json({
            result: null,
            errorMessage: `Error: price update for book [${id}] must be a positive integer`
        });
    }

    let book, currentPriceMongo, currentPricePostgres;

    // MONGO
    try {
        book = await mongoApi.findBookByRawId(id);
        if (!book) {
            return res.status(404).json({
                result: null,
                errorMessage: `Error: no such Book with id ${id}`
            });
        }
        currentPriceMongo = book.price;
        book.price = parseFloat(price);
        await mongoApi.updateBook(book);
    } catch (error) {
        console.error('Error updating book in MongoDB:', error);
        return res.status(500).json({ errorMessage: 'Internal server error' });
    }
    // POSTGRES
    try {
        book = await postgresApi.findBookByRawId(id);
        if (!book) {
            return res.status(404).json({
                result: null,
                errorMessage: `Error: no such Book with id ${id}`
            });
        }
        currentPricePostgres = book.price;
        book.price = parseFloat(price);
        await postgresApi.updateBook(book);
    } catch (error) {
        console.error('Error updating book in Postgres:', error);
        return res.status(500).json({ errorMessage: 'Internal server error' });
    }

        switch (req.query.persistenceMethod) {
            case 'MONGO':
                return res.status(200).json({
                    result: currentPriceMongo,
                    errorMessage: null
                });
            case 'POSTGRES':
                return res.status(200).json({
                    result: currentPricePostgres,
                    errorMessage: null
                });
            default:
                return res.status(200).json({
                    result: currentPriceMongo,
                    errorMessage: null
                });
        }
};


// Delete a book by ID
const deleteBook = async (req, res) => {
    const { id } = req.query;
    // MONGO
    try {
        await mongoApi.deleteBook(id);
    } catch (error) {
        console.error('Error deleting book in MongoDB:', error);
        return res.status(500).json({ errorMessage: 'Internal server error' });
    }

    // POSTGRES
    try {
        await postgresApi.deleteBook(id);

    } catch (error) {
        console.error('Error deleting book in Postgres:', error);
        return res.status(500).json({ errorMessage: 'Internal server error' });
    }
    return res.status(200).json({
            errorMessage: null,
            result: parseInt(id),
        });
};

module.exports = {
    createBook,
    getBook,
    updateBook,
    deleteBook,
    getBooksTotal,
    getBooks
};
