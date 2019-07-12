/* Handles routes for the endpoint '/customers' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation
const mongoose = require('mongoose') //Used to perform database operations

//Generates a new mongoose Schema to define the documents in the database
const Schema = mongoose.Schema;
const customerSchema = new Schema({
    isPremium : {type: Boolean, required: true,},
    name: {type: String, required: true, minlength: 3, maxlength:30},
    phone : {type: String, required: true, minlength:10, maxlength:10}
});

//Defines a new collection 'Customers' in the DB; known as a Model
const Customer = mongoose.model('Customers', customerSchema);

//A GET request to this endpoint will return all customers
    //Body request is empty
    //Body response is a JSON with all customers
router.get('/', function(req,res) {
    
    async function getCustomers() {
        try {
            const fetchedCustomers = await Customer.find()
            console.log(fetchedCustomers);
            res.send(fetchedCustomers);

        } catch (error) {
            res.status(404).send('Resource Not Found');   
        }
    }

    getCustomers();
    
});

//A GET request to this endpoint will return a customer with the specified ID in the route param
    //Body request is empty
    //Body response is a JSON with the customer containing the specified ID. 404 is returned if resource not found.
router.get('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter

    async function getCustomer() {
        try {
            const fetchedCustomer = await Customer
                .find({_id: enteredID}); //[] if no such customer exists
     
            console.log(fetchedCustomer);
            
            if(!fetchedCustomer.length) {
                //There are no such customers found
                res.status(404).send('Resource Not Found');
            }
            else {
                res.send(fetchedCustomer);
            }

        } catch (error) {
            //If ID entered is an invalid MongoDB ID
            res.status(400).send('Invalid ID entered');   
        }
    }

    getCustomer();

});

//A PUT request to this endpoint will update a customer with a specified id
    //Body request is a JSON pay-load: {isPremium:..., name:..., phone:...}
    //Body response is a JSON with the updated customer
router.put('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter

    //Validate the HTTP body request
    const inputValid = validateCustomer(req.body); //If inputValid.error === null -> input is valid
    
    if(inputValid.error != null) {
        res.status(400).send(inputValid.error); //Sends the error object in the response
    } else {
        updateCustomer();
    } 

    async function updateCustomer() {
        try {
            const fetchedCustomer = await Customer
            .findByIdAndUpdate(enteredID,
                {isPremium: req.body.isPremium, name: req.body.name, phone: req.body.phone},
                {new: true, useFindAndModify: false});
            res.send(fetchedCustomer);
        } catch (error) {
            console.log("Error " + error);
            res.status(404).send('Error: ' + error)
        }
    }
});

//A DELETE request to this endpoint will delete a customer with a specified id
    //Body request is empty
    //Body response is a JSON with the deleted customer
router.delete('/:id', function(req,res) {
    enteredID = req.params.id; //Gets dynamic route parameter
  
    async function deleteCustomer() {
        try {
            const deletedCustomer = await Customer.findByIdAndDelete(enteredID);
            console.log(deletedCustomer);
            res.send(deletedCustomer);

        } catch (error) {
            res.status(404).send('Resource Not Found') ;   
        }
    }

    deleteCustomer(); 

});

//A POST request to this endpoint will create a new customer
    //Body request is a JSON pay-load: {isPremium:..., name:..., phone:...}
    //Body response is a JSON with the new customer
router.post('/', function(req,res) {

    const inputValid = validateCustomer(req.body); //If inputValid.error === null -> input is valid

    if(inputValid.error === null) {

        //Create a new Customer using the Model
        const newCustomerDoc = new Customer({
            isPremium: req.body.isPremium,
            name: req.body.name,
            phone: req.body.phone
        });

        async function createCustomer() {
            //Save the document to the DB
            try {
                const result = await newCustomerDoc.save();
                console.log(result);
                res.send(result); //Send the new object back in the HTTP response 

            } catch (error) {
                console.log(error);
                res.status(404).send('Resource not found');
            }
        }

        createCustomer();

    } else {
        res.status(400).send(inputValid.error); //400 Bad Request
    }

});

//Checks if the customer entered is valid
function validateCustomer(customer) {
    //Defines validation schema using JOI
    const schema = Joi.object().keys({
        isPremium: Joi.boolean().required(),
        name : Joi.string().min(3).max(30).required(),
        phone: Joi.string().min(10).max(10).required()
    })

    //If result.error === null -> input is valid
    return Joi.validate(customer, schema);
}

module.exports = router //Exports the router so it can be used in index.js