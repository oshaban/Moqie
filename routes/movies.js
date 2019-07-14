/* Handles routes for the endpoint '/movies' */
/* The movies document contains genres as a sub-document */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation
Joi.objectId = require('joi-objectid')(Joi);

const {Movie} = require('../models/movie'); //Load Movie DB Model
const {Genre} = require('../models/genre'); //Loads Genre DB Model
    //Genre is a sub-document of the Movie document

//A GET request to this endpoint will return all movies
    //Body request is empty
    //Body response is a JSON with all movies
router.get('/', function(req,res) {
    
    async function getMovies() {
        try {
            const fetchedMovies = await Movie.find().sort({title: 1});
            console.log(fetchedMovies);
            res.send(fetchedMovies);

        } catch (error) {
            res.status(404).send('Resource Not Found');   
        }
    }

    getMovies();
    
});

//A GET request to this endpoint will return a movie with the specified ID in the route param
    //Body request is empty
    //Body response is a JSON with the movie containing the specified ID. 404 is returned if resource not found.
router.get('/:id', function(req,res) {
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

});

//A PUT request to this endpoint will update a movie with a specified id
    //Body request is a JSON pay-load: {title, genreID, numberInStock, dailyRentalRate}
    //Body response is a JSON with the updated movie
router.put('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter

    const inputValid = validateMovie(req.body); //If inputValid.error === null -> input is valid

    if(inputValid.error === null) {

        //Find the Genre to update the movie document:
        async function updateMovie() {
            try {
                const genreDoc = await Genre.findById(req.body.genreID); //Finds a Genre based on the GenreID in the HTTP body request

                const result = await Movie.findByIdAndUpdate(enteredID,
                    {title: req.body.title, genre: genreDoc, numberInStock: req.body.numberInStock, dailyRentalRate: req.body.dailyRentalRate},
                    {new: true, useFindAndModify: false});

                console.log(result);
                res.send(result);

            } catch (error) {
                console.log("Error: " + error);
                return res.status(404).send(error);
            }
        }
        updateMovie();

    } else {
        res.status(400).send(inputValid.error); //400 Bad Request
    }

});

//A DELETE request to this endpoint will delete a movie with a specified id
    //Body request is empty
    //Body response is a JSON with the deleted movie
router.delete('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter
  
    async function deleteMovie() {
        try {
            const deletedMovie = await Movie.findByIdAndDelete(enteredID);
            
            if(deletedMovie === null) {
                //Movie with ID was not found in the DB
                res.status(404).send('Movie with given ID is not found.');
            } else {
                console.log(deletedMovie);
                res.send(deletedMovie);
            }
        } catch (error) {
            res.status(400).send('Invalid ID entered.');   
        }
    }

    deleteMovie(); 

});

//A POST request to this endpoint will create a new movie
    //Body request is a JSON pay-load: {title, genreID, numberInStock, dailyRentalRate}
    //Body response is a JSON with the new movie
//Note: The Movie Document contains a Genre sub-document. This will attempt to locate the Genre sub-document
    //using the genreID property of the HTTP body request
router.post('/', function(req,res) {

    const inputValid = validateMovie(req.body); //If inputValid.error === null -> input is valid

    if(inputValid.error === null) {

        //Find the Genre to create the movie document:
        async function getGenreCreateMovie() {
            try {
                const genreDoc = await Genre.findById(req.body.genreID); //Finds a Genre based on the GenreID in the HTTP body request

                //Create a new Movie using the Model
                const newMovieDoc = new Movie({
                    title: req.body.title,
                    genre : genreDoc,
                    numberInStock: req.body.numberInStock,
                    dailyRentalRate: req.body.dailyRentalRate
                });

                const result = await newMovieDoc.save();
                console.log(result);
                res.send(result);

            } catch (error) {
                console.log("Error: " + error);
                return res.status(404).send(error);
            }
        }
        getGenreCreateMovie();

    } else {
        res.status(400).send(inputValid.error); //400 Bad Request
    }
});

//Checks if the movie entered is valid
function validateMovie(movie) {
    //Defines validation schema using JOI
    const schema = Joi.object().keys({
        title: Joi.string().required(),
        genreID: Joi.objectId().required(),
        numberInStock: Joi.number().integer().min(0).max(100000).required(),
        dailyRentalRate: Joi.number().precision(2).min(0).max(100000).required()
    })

    //If result.error === null -> input is valid
    return Joi.validate(movie, schema);
}

module.exports = router //Exports the router so it can be used in index.js