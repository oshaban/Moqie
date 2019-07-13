const mongoose = require('mongoose') //Used to perform database operations
const {genreSchema} = require('./genre')

//Generates a new mongoose Schema to define the documents in the database
const Schema = mongoose.Schema;
const movieSchema = new Schema({
    title: {type: String, required: true, min: 3, maxlength: 100},
    genre: {type: genreSchema, required: true},
    numberInStock: {type: Number, required: true, min: 0, max: 100000},
    dailyRentalRate: {type: Number, required: true, min: 0, max: 100000}
});

//Defines a new collection 'Movies' in the DB; known as a Model
const Movie = mongoose.model('Movies', movieSchema);

module.exports.Movie = Movie;