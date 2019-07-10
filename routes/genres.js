/* Handles routes for the endpoint '/genres' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation

genres = [
    {id: 1, name: 'drama'},
    {id: 2, name: 'comedy'},
    {id: 3, name: 'action'}
]

//A GET request to this endpoint will return all genres
router.get('/', function(req,res) {
    res.send(genres);
});

//A GET request to this endpoint will return a genre with the specified ID in the route param
    //Body request is empty
    //Body response is a JSON with the genre containing the specified ID. 404 is returned if resource not found.
router.get('/:id', function(req,res) {
    enteredID = parseInt(req.params.id); //Gets dynamic route parameter
    
    //Contains genre object if id found, otherwise is undefined
    const result = genres.find((obj)=>{return obj.id == enteredID;})

    if(result === undefined){
        res.status(404).send('The genre with given ID was not found');
    } else {
        res.send(result)
    }
    
});

//A PUT request to this endpoint will update a genre with a specified id
    //Body request is a JSON pay-load with a 'name' property {name: 'your-name'}
        //name property must be a string of length 3; if not valid 400 - Bad request is sent
    //Body response is a JSON with the updated genre 
router.put('/:id', function(req,res) {
    enteredID = parseInt(req.params.id); //Gets dynamic route parameter

    //Checks if a genre with the id in the route param exists in the array
        //findIndex returns -1 if no element found
    const elementIndex = genres.findIndex((element)=>{
        if(element.id === enteredID){
            return true;
        }
    });

    if(elementIndex === -1){
        res.status(404).send('Genre with the given ID does not exist');
    } else {
        //Check if Body of request is valid
        const result = validateGenre(req.body); //If result.error === null -> input is valid

        if(result.error === null) {
            genres[elementIndex].name = req.body.name //Updates the object in the array
            res.send(genres[elementIndex]);
        } else {
            res.status(400).send(result.error); //Sends the error object in the response
        }
    }
});

//A DELETE request to this endpoint will delete a genre with a specified id
    //Body request is empty
    //Body response is a JSON with the deleted genre
router.delete('/:id', function(req,res) {
    enteredID = parseInt(req.params.id); //Gets dynamic route parameter
  
    //Checks if a genre with the id in the route param exists
        //findIndex returns -1 if no element found
    const elementIndex = genres.findIndex((element)=>{
        if(element.id === enteredID){
            return true;
        }
    });

    if(elementIndex === -1){
        res.status(404).send('Genre with the given ID does not exist');
    } else {
        const objDel = genres.splice(elementIndex,1);
        res.send(objDel);
    }

});

//A PUT request to this endpoint will update a genre with a specified id
    //Body request is a JSON pay-load with a 'name' property {name: 'your-name'}
        //name property must be a string of length 3; if not valid 400 - Bad request is sent
    //Body response is a JSON with the new genre
router.post('/', function(req,res) {
    enteredID = parseInt(req.params.id); //Gets dynamic route parameter

    const result = validateGenre(req.body); //If result.error === null -> input is valid

    if(result.error === null) {
        newObj = {id: genres.length+1, name: req.body.name};
        genres.push(newObj); //Adds it to the array
        res.send(newObj); //Send the new object back 
    } else {
        res.status(400).send(result.error);
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