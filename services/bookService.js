let books = [];
let currentAvailableId = 1;

const validGenres = ["SCI_FI", "NOVEL", "HISTORY", "MANGA", "ROMANCE", "PROFESSIONAL"];

// Helper function to check if a genre is valid
const isValidGenre = (genre) => validGenres.includes(genre);

// Create a new book
const createBook = (req, res) => {
    const { title, author, year, price, genres } = req.body;

    const existingBook = books.find(book => book.title.toLowerCase() === title.toLowerCase());
    if (existingBook) {
        return res.status(409).json({
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

    const newBook = {
        id: currentAvailableId++,
        title,
        author,
        year,
        price,
        genres
    };

    books.push(newBook);
    res.status(200).json({ result: newBook.id });
};

// Get a single book by ID
const getBook = (req, res) => {
    const { id } = req.query;
    const book = books.find(book => book.id === parseInt(id));

    if (!book) {
        return res.status(404).json({
            result: null,
            errorMessage: `Error: no such Book with id ${id}`
        });
    }

    res.status(200).json({ result: book });
};

// Get total number of books with filters
const getBooksTotal = (req, res) => {
    const { author, 'price-bigger-than': priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres } = req.query;

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
};

// Get books with filters
const getBooks = (req, res) => {
    let { author, 'price-bigger-than': priceBiggerThan, 'price-less-than': priceLessThan, 'year-bigger-than': yearBiggerThan, 'year-less-than': yearLessThan, genres } = req.query;

    priceBiggerThan = priceBiggerThan ? parseFloat(priceBiggerThan) : undefined;
    priceLessThan = priceLessThan ? parseFloat(priceLessThan) : undefined;
    yearBiggerThan = yearBiggerThan ? parseInt(yearBiggerThan, 10) : undefined;
    yearLessThan = yearLessThan ? parseInt(yearLessThan, 10) : undefined;
    genres = genres ? genres.split(',') : undefined;

    if (genres && !genres.every(genre => validGenres.includes(genre))) {
        return res.status(400).json({
            errorMessage: 'Invalid genres provided. Valid options are: ROMANCE, PROFESSIONAL'
        });
    }

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

    filteredBooks.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
    res.status(200).json({ result: filteredBooks });
};

// Update a book's price
const updateBook = (req, res) => {
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

    books[bookIndex].price = parseFloat(price);
    res.status(200).json({
        result: currentPrice,
        errorMessage: null
    });
};

// Delete a book by ID
const deleteBook = (req, res) => {
    const { id } = req.query;
    const bookIndex = books.findIndex(book => book.id === parseInt(id));

    if (bookIndex === -1) {
        return res.status(404).json({
            result: null,
            errorMessage: `Error: no such Book with id ${id}`
        });
    }

    books.splice(bookIndex, 1);
    res.status(200).json({
        result: books.length,
        errorMessage: null
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
