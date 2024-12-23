const Book = require('../models/Book'); // Import the Book model

const isBookExist = async (title) => {
    const existingBook = await Book.findOne({ title: new RegExp(`^${title}$`, 'i') });
    return existingBook;
}

const createBook = async (bookData) => {
    const totalBooks = await Book.countDocuments();
    bookData.rawid = totalBooks + 1;
    const newBook = new Book(bookData);
    await newBook.save();
    return bookData.rawid;
};

const findBookByRawId = async (rawid) => {
    const book = await Book.findOne({rawid: rawid});
    return book;
}

// write a function the retreive books by query
const getNumberOfBooksByQuery = async (query) => {
    const count = await Book.countDocuments(query);
    return count;
}

const getBooksByQuery = async (query) => {
    const books = await Book.find(query).sort({ title: 1 });
    return books;
}

// write a function that receives a book and update it in the database
const updateBook = async (book) => {
    try {
        const updatedBook = await Book.findOneAndUpdate(
            { rawid: book.rawid }, // Find the book by rawid
            book, // Update with the new book data
        );
        return updatedBook;
    } catch (error) {
        console.error('Error saving or updating book:', error);
        throw error;
    }
}

const deleteBook = async (id) => {
    try {
        const result = await Book.deleteOne({ rawid: id });
        if (result.deletedCount === 0) {
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
    deleteBook
}