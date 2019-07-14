const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation
const bcrypt = require('bcryptjs'); //Used to hash passwords

const {User} = require('../models/user'); //Load User DB Model

//A POST request to this endpoint will check if a user is valid
    //Body request is a JSON pay-load: {name:..., email:..., password:...}
    //Body response is a JSON with the new user
router.post('/', async function(req,res) {

    const inputValid = validate(req.body); //If inputValid.error === null -> input is valid
    if(inputValid.error != null) return res.status(400).send(inputValid.error); //400 Bad Request

    try {
        //Validate the email: Checks if the email exists in the DB
        let user = await User.findOne({email: req.body.email}); //user is null if not registered
        if (user === null) return res.status(400).send('Invalid email or password.'); //400 Bad Request

        //Validate the password: Uses Bcrypt
        const validPassword = await bcrypt.compare(req.body.password, user.password); //Compares a plain-text password, to a hashed password; if equal, returns true

        if(!validPassword) return res.status(400).send('Invalid email or password.'); //400 Bad Request

        //jwt.sign() will set the payload of the JSON webtoken, 2nd argument is secret/private key
        const token = user.generateAuthToken();
        res.send(token);

    } catch (error) {
        console.log(error);
        res.status(404).send('Resource not found');
    }
});

//Checks if the auth request is valid
function validate(request) {
    //Defines validation schema using JOI
    const schema = Joi.object().keys({
        email: Joi.string().min(5).max(255).email({ minDomainSegments: 2 }).required(),
        password: Joi.string().min(6).max(255).required()
    })

    //If result.error === null -> input is valid
    return Joi.validate(request, schema);
}

module.exports = router //Exports the router so it can be used in index.js