const mongoose = require('mongoose') //Used to perform database operations
const {genreSchema} = require('./genre')

//Generates a new mongoose Schema to define the documents in the database
const Schema = mongoose.Schema;

const customerSchema = new Schema({
    name: {type: String, required: true, minlength: 3, maxlength:30},
    phone : {type: String, required: true, minlength:10, maxlength:10}
});

const movieSchema = new Schema({
    title: {type: String, required: true, min: 3, maxlength: 100},
    dailyRentalRate: {type: Number, required: true, min: 0, max: 100000}
});

const rentalSchema = new Schema({
    customer: {type: customerSchema, required: true},
    movie: {type: movieSchema, required: true},
    dateOut : {type: Date, required: true, default: Date.now},
    dateReturned: {type: Date},
    rentalFee: {type: Number, min: 0, max: 100000}
});

//Calculates rental fee upon returned
rentalSchema.methods.returnRental = function() {
    let dailyRentalRate = this.movie.dailyRentalRate;
    let daysOut = this.dateReturned - this.dateOut;
    
    this.set({rentalFee: dailyRentalRate * daysOut});
}

//Defines a new collection 'Rentals' in the DB; known as a Model
const Rental = mongoose.model('Rentals', rentalSchema);

module.exports.Rental = Rental;