/* Handles routes for the endpoint '/genres' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation
const mongoose = require('mongoose') //Used to perform database operations

//Generates a new mongoose Schema to define the documents in the database
const Schema = mongoose.Schema;
const genreSchema = new Schema({
    name: {type: String, required: true, minlength: 3, maxlength:30}
});

//Defines a new collection 'Genres' in the DB; known as a Model
const Genre = mongoose.model('Genres', genreSchema);

//A GET request to this endpoint will return all genres
router.get('/', function(req,res) {
    
    async function getGenres() {
        try {
            const fetchedGenres = await Genre
                .find()
                .select({name: 1})
                .sort('name');
            console.log(fetchedGenres);
            res.send(fetchedGenres);

        } catch (error) {
            res.status(400).send('Database Error') ;   
        }
    }

    getGenres();
    
});

//A GET request to this endpoint will return a genre with the specified ID in the route param
    //Body request is empty
    //Body response is a JSON with the genre containing the specified ID. 404 is returned if resource not found.
router.get('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter

    async function getGenres() {
        try {
            const fetchedGenres = await Genre
                .find({_id: enteredID}) //*** */add logic to return an error if id doesn't exist in DB****
                .select({name: 1});
            console.log(fetchedGenres);
            res.send(fetchedGenres);

        } catch (error) {
            res.status(400).send('Database Error') ;   
        }
        
    }

    getGenres();

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
    } 

    async function updateGenre() {
        const fetchedGenre = await Genre.findByIdAndUpdate(enteredID, {name: req.body.name}, {
            new: true
        });
    
        if(!fetchedGenre){
            res.status(404).send('Genre with the given ID does not exist');
        } else {
            res.send(fetchedGenre);
        }
    }

    updateGenre();

});

//A DELETE request to this endpoint will delete a genre with a specified id
    //Body request is empty
    //Body response is a JSON with the deleted genre
router.delete('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter
  
    async function deleteGenre() {
        try {
            const deletedGenre = await Genre.findByIdAndDelete(enteredID);
            console.log(deletedGenre);
            res.send(deletedGenre);

        } catch (error) {
            res.status(404).send('Resource Not Found') ;   
        }
        
    }

    deleteGenre(); 

});

//A POST request to this endpoint will create a new genre
    //Body request is a JSON pay-load with a 'name' property {name: 'your-name'}
        //name property must be a string of length 3; if not valid 400 - Bad request is sent
    //Body response is a JSON with the new genre
router.post('/', function(req,res) {

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