const mongoose = require('mongoose');

// Define the book schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    genres: { type: [String], required: true },
    rawid: { type: Number, required: true }
});

// Create a model from the schema
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
