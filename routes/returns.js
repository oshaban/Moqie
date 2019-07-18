/* Handles routes for the endpoint '/genres' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation
Joi.objectId = require('joi-objectid')(Joi);
const auth = require('../middleware/auth'); //Middleware for auth
const admin = require('../middleware/admin');
const mongoose = require('mongoose');
const {Rental} = require('../models/rental'); //Loads Rental DB collection
const {Movie} = require('../models/movie'); //Load Movie DB collection

//A POST request to this endpoint will look up a rental, and issue a return
    //Body request: {customerId: ..., movieId: ...}
router.post('/', auth, async function(req,res,next) {

    const {error} = validateReturn(req.body); //Extracts error property from object

    //Checks if valid customerId property in HTTP body
    if(error !=null) {
        return res.status(400).send('CustomerId not provided');
    }

    //Checks if valid movieId property in HTTP body
    if(error !=null) {
        return res.status(400).send('MovieId not provided');
    }

    //Look up rental
    const rental = await Rental.findOne({
        'customer._id' : req.body.customerId,
        'movie._id' : req.body.movieId
    });

    //If rental not found return 404
    if(!rental) {
        return res.status(404).send('No rental found for this customer');
    }

    //If return is already returned return 400
    if(rental.dateReturned) {
        return res.status(400).send('Rental is already returned');
    } 

    //If rental is valid, return the rental and return a 200 status
    if(rental) {
        //Set return date
        rental.set({dateReturned: new Date()});
        
        //Set rental fee
        rental.returnRental();

        //Increase the movie stock by 1
        movie = await Movie.findById(rental.movie._id); //Find the movie
        movie.numberInStock++; //Increase the stock
        movie.save(); //Save the movie to the DVB

        console.log(rental);
        await rental.save(); //Save the rental to the DB
        return res.send(rental);
    }

    res.status(401).send('Client not logged in');

});

//Checks if the return entered is valid
function validateReturn(returnObj) {
    //Defines validation schema using JOI
    const schema = Joi.object().keys({
        customerId : Joi.objectId().required(),
        movieId: Joi.objectId().required()
    })
    //If result.error === null -> input is valid
    return Joi.validate(returnObj, schema);
}

module.exports = router //Exports the router so it can be used in index.js