/* Handles routes for the endpoint '/customers' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation

const {Customer} = require('../models/customer'); //Load Customer DB Model

//A GET request to this endpoint will return all customers
    //Body request is empty
    //Body response is a JSON with all customers
router.get('/', async function(req,res,next) {
    try {
        const fetchedCustomers = await Customer.find();
        console.log(fetchedCustomers);
        res.send(fetchedCustomers);

    } catch (error) {
        next(error); //Passes the error to the error-middle-ware function  
    }
});

//A GET request to this endpoint will return a customer with the specified ID in the route param
    //Body request is empty
    //Body response is a JSON with the customer containing the specified ID. 404 is returned if resource not found.
router.get('/:id', async function(req,res,next) {
    enteredID = req.params.id; //Gets dynamic route parameter

    try {
        const fetchedCustomer = await Customer
            .find({_id: enteredID})
            .select({name: 1});
        //fetchedCustomer = [] if no such customer exists
        console.log(fetchedCustomer);
        
        if(!fetchedCustomer.length) {
            //There are no such customers found
            res.status(404).send('Resource Not Found');
        }
        else {
            console.log(fetchedCustomer);
            res.send(fetchedCustomer);
        }
    } catch (error) {
        next(error);//Passes the error to the error-middle-ware function  
    }
});

//A PUT request to this endpoint will update a customer with a specified id
    //Body request is a JSON pay-load: {isPremium:..., name:..., phone:...}
    //Body response is a JSON with the updated customer
router.put('/:id', async function(req,res,next) {
    enteredID = req.params.id; //Gets dynamic route parameter

    //Validate the HTTP body request
    const inputValid = validateCustomer(req.body); //If inputValid.error === null -> input is valid
    
    if(inputValid.error != null) {
        res.status(400).send(inputValid.error); //Sends the error object in the response
    } else {
        updateCustomer();
    } 

    try {
        const fetchedCustomer = await Customer
        .findByIdAndUpdate(enteredID,
            {isPremium: req.body.isPremium, name: req.body.name, phone: req.body.phone},
            {new: true, useFindAndModify: false});

        if(fetchedCustomer === null) {
            //Customer with ID was not found in the DB
            res.status(404).send('Resource not found');
        } else {
            console.log(fetchedCustomer);
            res.send(fetchedCustomer);
        }

    } catch (error) {
        next(error);//Passes the error to the error-middle-ware function
    }
});

//A DELETE request to this endpoint will delete a customer with a specified id
    //Body request is empty
    //Body response is a JSON with the deleted customer
router.delete('/:id', async function(req,res,next) {
    enteredID = req.params.id; //Gets dynamic route parameter
  
        try {
            const deletedCustomer = await Customer.findByIdAndDelete(enteredID);
            
            if(deletedCustomer === null) {
                //Customer with ID was not found in the DB
                res.status(404).send('Resource not found');
            } else {
                console.log(deletedCustomer);
                res.send(deletedCustomer);
            }
        } catch (error) {
            next(error); //Passes the error to the error-middle-ware function
        }
});

//A POST request to this endpoint will create a new customer
    //Body request is a JSON pay-load: {isPremium:..., name:..., phone:...}
    //Body response is a JSON with the new customer
router.post('/', async function(req,res,next) {

    const inputValid = validateCustomer(req.body); //If inputValid.error === null -> input is valid

    if(inputValid.error!=null) {
        return res.status(400).send(inputValid.error); //400 Bad Request
    }

    //Create a new Customer using the Model
    const newCustomerDoc = new Customer({
        isPremium: req.body.isPremium,
        name: req.body.name,
        phone: req.body.phone
    });

    //Save the document to the DB
    try {
        const result = await newCustomerDoc.save();
        console.log(result);
        res.send(result); //Send the new object back in the HTTP response 
    } catch (error) {
        next(error); //Passes the error to the error-middle-ware function
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