/* Handles routes for the endpoint '/rentals' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation

const {Rental} = require('../models/rental'); //Load Rental DB Model
const {Movie} = require('../models/movie'); //Load Movie DB Model
const {Customer} = require('../models/customer'); //Load Customer DB Model

//A GET request to this endpoint will return all rentals
    //Body request is empty
    //Body response is a JSON with all rentals
router.get('/', function(req,res) {
    
    async function getRentals() {
        try {
            const fetchedRentals = await Rental.find();
            console.log(fetchedRentals);
            res.send(fetchedRentals);

        } catch (error) {
            res.status(404).send('Resource Not Found');   
        }
    }

    getRentals();
    
});

//A GET request to this endpoint will return a movie with the specified ID in the route param
    //Body request is empty
    //Body response is a JSON with the movie containing the specified ID. 404 is returned if resource not found.
/* router.get('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter

    async function getMovie() {
        try {
            const fetchedMovie = await Movie.find({_id: enteredID});
            //fetchedMovie = [] if no such movie exists
            console.log(fetchedMovie);
            
            if(!fetchedMovie.length) {
                //There are no such movies found
                res.status(404).send('Movie with given ID is not found.');
            }
            else {
                console.log(fetchedMovie);
                res.send(fetchedMovie);
            }
        } catch (error) {
            //If ID entered is an invalid MongoDB ID
            res.status(400).send('Invalid ID entered');   
        }
    }

    getMovie();

}); */

//A POST request to this endpoint will create a new rental
    //Body request is a JSON pay-load: {customerID:..., movieID:...}
    //Body response is a JSON with the new rental
router.post('/', function(req,res) {

    const inputValid = validateRental(req.body); //If inputValid.error === null -> input is valid

    if(inputValid.error === null) {

        //Find the Genre to create the rental document:
        async function createRental() {
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
                console.log("Error: " + error);
                return res.status(404).send(error);
            }
        }
        createRental();

    } else {
        res.status(400).send(inputValid.error); //400 Bad Request
    }
});

//Checks if the rental entered is valid
function validateRental(rental) {
    //Defines validation schema using JOI
    const schema = Joi.object().keys({
        customerID: Joi.string().required(),
        movieID: Joi.string().required(),
    })

    //If result.error === null -> input is valid
    return Joi.validate(rental, schema);
}

module.exports = router //Exports the router so it can be used in index.js