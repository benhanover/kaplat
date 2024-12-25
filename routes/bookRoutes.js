const express = require('express');
const router = express.Router();
const { createBook, getBook, updateBook, deleteBook} = require('../services/bookService');
const { validateBookData } = require('../middleware/validationMiddleware');

router.post('/', validateBookData, createBook);

router.get('/', getBook);

router.put('/', updateBook);

router.delete('/', deleteBook);

module.exports = router;
