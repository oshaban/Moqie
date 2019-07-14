/* Handles routes for the endpoint '/users' */

const express = require('express');
const router = express.Router(); //Creates a router as a module
const Joi = require('@hapi/joi'); //Used for input validation
const bcrypt = require('bcryptjs'); //Used to hash passwords
const auth = require('../middleware/auth');

const {User} = require('../models/user'); //Load User DB Model

//A GET request to this endpoint will return user with the current JSON Web Token (JWT)
    //Request header 'x-auth-token' should contain a JSON Web Token (JWT)
    //Request body will contain the user with given token
router.get('/me', auth, async function(req,res) {
    //Endpoint is only available to authenticated users
        //Uses auth middle-ware to ensure JWT is provided
    const user = await User.findById(req.user._id).select('-password'); //Excludes password from user
    res.send(user);
});

//A POST request to this endpoint will create a new user
    //Body request is a JSON pay-load: {name:..., email:..., password:...}
    //Response header has a JSON web-token (JWT) for the new user, and body contains {name, email}
router.post('/', async function(req,res) {

    const inputValid = validateUser(req.body); //If inputValid.error === null -> input is valid
    if(inputValid.error != null) return res.status(400).send(inputValid.error); //400 Bad Request

    try {
        //Check if user is already registered
        let user = await User.findOne({email: req.body.email}); //user is null if not registered
        if (user) return res.status(400).send('User already registered.'); //400 Bad Request

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })

        //Hash user password before saving it:
        const salt = await bcrypt.genSalt(10); //Generates a salt 
        user.password = await bcrypt.hash(user.password,salt); //Saves the hashed password in DB

        await user.save();

        const token = user.generateAuthToken(); //Creates JSON Web Token (JWT)

        //Sends back to client the JWT in the header, and {name, email} in the body
        res.header('x-auth-token', token)
            .send({
            name: user.name,
            email: user.email
            }); 

    } catch (error) {
        console.log(error);
        res.status(404).send('Resource not found');
    }
});

//Checks if the user entered is valid
function validateUser(user) {
    //Defines validation schema using JOI
    const schema = Joi.object().keys({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).email({ minDomainSegments: 2 }).required(),
        password: Joi.string().min(6).max(255).required(),
        isAdmin: Joi.boolean()
    })

    //If result.error === null -> input is valid
    return Joi.validate(user, schema);
}

module.exports = router //Exports the router so it can be used in index.js