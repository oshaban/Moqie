const mongoose = require('mongoose') //Used to perform database operations
const jwt = require('jsonwebtoken'); //Used to generate JSON Webtoken

//Generates a new mongoose Schema to define the documents in the database
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {type: String, required: true, minlength: 3, maxlength: 50},
    email: {type: String, required: true, unique: true, minlength: 5, maxlength: 255},
    password: {type: String, required: true, minlength: 6, maxlength: 1024},
    isAdmin: {type: Boolean}
});

//Create a function for userSchema to create a JWT
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, process.env.JWTPRIVATEKEY); 
    return token;
}

//Defines a new collection 'Users' in the DB; known as a Model
const User = mongoose.model('Users', userSchema);

module.exports.User = User;