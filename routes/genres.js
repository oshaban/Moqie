/* Handles routes for the endpoint '/genres' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation
const auth = require('../middleware/auth'); //Middleware for auth
const admin = require('../middleware/admin');

const {Genre} = require('../models/genre')

//A GET request to this endpoint will return all genres
router.get('/', function(req,res) {
    
    async function getGenres() {
        try {
            const fetchedGenres = await Genre.find();
            console.log(fetchedGenres);
            res.send(fetchedGenres);

        } catch (error) {
            res.status(404).send('Resource Not Found');   
        }
    }

    getGenres();
    
});

//A GET request to this endpoint will return a genre with the specified ID in the route param
    //Body request is empty
    //Body response is a JSON with the genre containing the specified ID. 404 is returned if resource not found.
router.get('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter

    async function getGenre() {
        try {
            const fetchedGenre = await Genre
                .find({_id: enteredID})
                .select({name: 1});
            //fetchedGenres = [] if no such genre exists
            
            if(!fetchedGenre.length) {
                res.status(404).send('Resource Not Found')
            } else {
                console.log(fetchedGenre);
                res.send(fetchedGenre)
            }
        } catch (error) {
            res.status(400).send('Database Error') ;   
        }
    }

    getGenre();

});

//A PUT request to this endpoint will update a genre with a specified id
    //Body request is a JSON pay-load with a 'name' property {name: 'your-name'}
        //name property must be a string of length 3; if not valid 400 - Bad request is sent
    //Body response is a JSON with the updated genre 
router.put('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter

    //Validate the HTTP body request
    const result = validateGenre(req.body); //If result.error === null -> input is valid
    
    if(result.error != null) {
        res.status(400).send(result.error); //Sends the error object in the response
    } else {
        updateGenre();
    }

    async function updateGenre() {
        try {
            const fetchedGenre = await Genre.findByIdAndUpdate(enteredID, {name: req.body.name},
            {new: true, useFindAndModify: false});
        
            if(fetchedGenre === null){
                //Genre with given ID was not found in the DB
                res.status(404).send('Resource not found');
            } else {
                console.log(fetchedGenre);
                res.send(fetchedGenre);
            }    
        } catch (error) {
            console.log("Error " + error);
            res.status(404).send('Error: ' + error)
        }
        
    }
});

//A DELETE request to this endpoint will delete a genre with a specified id
    //Body request is empty
    //Body response is a JSON with the deleted genre
router.delete('/:id', [auth, admin], function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter
  
    async function deleteGenre() {
        try {
            const deletedGenre = await Genre.findByIdAndDelete(enteredID);
            
            if(deletedGenre === null) {
                //Genre with ID was not found in the DB
                res.status(404).send('Resource not found')
            } else{
                console.log(deletedGenre);
                res.send(deletedGenre);
            }

        } catch (error) {
            res.status(404).send('Invalid ID entered') ;   
        }
        
    }

    deleteGenre(); 

});

//A POST request to this endpoint will create a new genre
    //Body request is a JSON pay-load with a 'name' property {name: 'your-name'}
        //name property must be a string of length 3; if not valid 400 - Bad request is sent
    //Body response is a JSON with the new genre
router.post('/', auth, function(req,res) {

    const result = validateGenre(req.body); //If result.error === null -> input is valid

    if(result.error === null) {

        //Create a new Genre using the Model
        const newGenreDoc = new Genre({
            name: req.body.name
        });

        async function createGenre() {
            //Save the document to the DB
            try {
                const result = await newGenreDoc.save();
                console.log(result);
                res.send(result); //Send the new object back in the HTTP response 

            } catch (error) {
                console.log(error);
                res.status(404).send('Resource not found');
            }
        }

        createGenre();

    } else {
        res.status(400).send(result.error); //400 Bad Request
    }

});

//Checks if the genre entered is valid
function validateGenre(genre) {
    //Defines validation schema using JOI
    const schema = Joi.object().keys({
        name : Joi.string().min(3).max(30).required()
    })
    //If result.error === null -> input is valid
    return Joi.validate(genre, schema);
}

module.exports = router //Exports the router so it can be used in index.js