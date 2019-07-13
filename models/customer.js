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

module.exports.Customer = Customer;