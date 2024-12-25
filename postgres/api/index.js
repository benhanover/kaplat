const Book = require('../models/Book');
const { sequelize } = require('../postgress');
const { Op } = require('sequelize'); 

// Check if a book exists by title (case-insensitive)
const isBookExist = async (title) => {
    const existingBook = await Book.findOne({
        where: {
            title: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('title')),
                sequelize.fn('LOWER', title)
            ),
        },
    });
    return existingBook;
};

// Create a new book
const createBook = async (bookData) => {
    // Query the total number of books in the database
    const totalBooks = await Book.count();
    
    // Assign rawid as total number of books + 1
    const rawid = totalBooks + 1;

    // Insert the new book with the calculated rawid
    const newBook = await Book.create({
        ...bookData,
        rawid: rawid,
    });
    // Return the rawid of the newly created book
    return newBook.rawid;
};

// Find a book by rawid
const findBookByRawId = async (rawid) => {
    const book = await Book.findOne({ where: { rawid } });
    return book;
};

// Get the number of books matching a query
const getNumberOfBooksByQuery = async (query) => {
    const count = await Book.count({ where: query });
    return count;
};

// Get books matching a query
const getBooksByQuery = async (query) => {
    const books = await Book.findAll({
        where: query,
        order: [['title', 'ASC']],
    });
    return books;
};

// Update a book
const updateBook = async (book) => {
    console.log('book:', book);
    try {
        // Ensure rawid is treated as an integer
        const rawid = parseInt(book.rawid, 10);

        const [updated] = await Book.update(
            { price: book.price }, // Only update the price field
            {
                where: { rawid: rawid }, // Ensure rawid is an integer
            }
        );

        if (updated) {
            const updatedBook = await Book.findOne({ where: { rawid: rawid } });
            return updatedBook;
        }

        throw new Error(`Book with rawid ${rawid} not found`);
    } catch (error) {
        console.error('Error updating book:', error);
        throw error;
    }
};


// Delete a book by rawid
const deleteBook = async (id) => {
    try {
        const result = await Book.destroy({ where: { rawid: id } });
        if (!result) {
            throw new Error(`Error: no such Book with id ${id}`);
        }
        return result;
    } catch (error) {
        console.error('Error deleting book:', error);
        throw error;
    }
};

module.exports = {
    isBookExist,
    createBook,
    findBookByRawId,
    getNumberOfBooksByQuery,
    getBooksByQuery,
    updateBook,
    deleteBook,
};
