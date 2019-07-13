const mongoose = require('mongoose') //Used to perform database operations

//Generates a new mongoose Schema to define the documents in the database
const Schema = mongoose.Schema;
const genreSchema = new Schema({
    name: {type: String, required: true, minlength: 3, maxlength:30}
});

//Defines a new collection 'Genres' in the DB; known as a Model
const Genre = mongoose.model('Genres', genreSchema);

module.exports.Genre = Genre
module.exports.genreSchema = genreSchema