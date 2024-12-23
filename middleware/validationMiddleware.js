const validGenres = ["SCI_FI", "NOVEL", "HISTORY", "MANGA", "ROMANCE", "PROFESSIONAL"];

const validateGenres = (req, res, next) => {
    const { genres } = req.body;
    if (genres && !genres.every(genre => validGenres.includes(genre))) {
        return res.status(400).json({
            errorMessage: 'Invalid genre(s) provided'
        });
    }
    next();
};

const validateBookData = (req, res, next) => {
    const { title, author, year, price, genres } = req.body;

    if (!title || !author || !year || !price || !genres) {
        return res.status(400).json({
            errorMessage: 'Missing required fields'
        });
    }

    validateGenres(req, res, next);
};

module.exports = { validateGenres, validateBookData };
