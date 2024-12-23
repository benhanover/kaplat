const express = require('express');
const router = express.Router();
const { createBook, getBook, updateBook, deleteBook, getBooksTotal, getBooks } = require('../services/bookService');
const { validateGenres, validateBookData } = require('../middleware/validationMiddleware');



// // POST /book - Create a new book
// router.post('/', validateBookData, createBook);

// GET /books/total - Get total books count with filters
router.get('/total', getBooksTotal);

// GET /books - Get books with filters
router.get('/', getBooks);

// // GET /book - Get a single book by ID
// router.get('/', getBook);

// // PUT /book - Update a book's price
// router.put('/', updateBook);

// // DELETE /book - Delete a book by ID
// router.delete('/', deleteBook);

module.exports = router;
