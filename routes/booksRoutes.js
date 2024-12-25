const express = require('express');
const router = express.Router();
const {  getBooksTotal, getBooks } = require('../services/bookService');

router.get('/total', getBooksTotal);

router.get('/', getBooks);

router.get('/health', (req, res) => {
    res.status(200).send('OK');
});


module.exports = router;

