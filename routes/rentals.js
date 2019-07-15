/* Handles routes for the endpoint '/rentals' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation
Joi.objectId = require('joi-objectid')(Joi);

const {Rental} = require('../models/rental'); //Load Rental DB Model
const {Movie} = require('../models/movie'); //Load Movie DB Model
const {Customer} = require('../models/customer'); //Load Customer DB Model

//A GET request to this endpoint will return all rentals
    //Body request is empty
    //Body response is a JSON with all rentals
router.get('/', async function(req,res,next) {
    
    try {
        const fetchedRentals = await Rental.find();
        console.log(fetchedRentals);
        res.send(fetchedRentals);

    } catch (error) {
        next(error); //Passes the error to the error-middle-ware function 
    }   
});

//A POST request to this endpoint will create a new rental
    //Body request is a JSON pay-load: {customerID:..., movieID:...}
    //Body response is a JSON with the new rental
router.post('/', async function(req,res,next) {

    const inputValid = validateRental(req.body); //If inputValid.error === null -> input is valid

    if(inputValid.error != null) {
        return res.status(400).send(inputValid.error); //400 Bad Request
    }

    //Find the Genre to create the rental document:
    try {
        const movieDoc = await Movie.findById(req.body.movieID);
        if(!movieDoc) return res.status(400).send('Invalid Movie ID.');

        const customerDoc = await Customer.findById(req.body.customerID);
        if(!customerDoc) return res.status(400).send('Invalid Customer ID.');

        if(movieDoc.numberInStock === 0) return res.status(400).send('Movie not in stock');

        console.log(movieDoc);

        //Create a new Rental using the Model
        const newRentalDoc = new Rental({
            customer: {
                _id: customerDoc._id,
                name: customerDoc.name,
                phone: customerDoc.phone
            },
            movie: {
                _id: movieDoc._id,
                title: movieDoc.title,
                dailyRentalRate: movieDoc.dailyRentalRate
            },
        });
        
        const rental = await newRentalDoc.save();
        console.log(rental);

        movie.numberInStock--;
        movie.save();

        res.send(rental);

    } catch (error) {
        next(error); //Passes the error to the error-middle-ware function
    }
});

//Checks if the rental entered is valid
function validateRental(rental) {
    //Defines validation schema using JOI
    const schema = Joi.object().keys({
        customerID: Joi.objectId().required(),
        movieID: Joi.objectId().required(),
    })

    //If result.error === null -> input is valid
    return Joi.validate(rental, schema);
}

module.exports = router //Exports the router so it can be used in index.js