/* This exports a start up function that loads the router modules, and registers
    the routes for the application*/

//Loading Router Modules:
const genres = require('../routes/genres'); //Loads the router module for genres endpoint
const customers = require('../routes/customers'); //Loads the router module for customers endpoint
const movies = require('../routes/movies'); //Loads the router module for movies endpoint
const rentals = require('../routes/rentals'); //Loads the router module for rentals endpoint
const users = require('../routes/users'); //Loads the router module for rentals endpoint
const auth = require('../routes/auth'); //Loads the auth module for rentals endpoint

//Error handling middleware:
const errorHandle = require('../middleware/error'); //Loads Error Middleware function

function loadRoutes(app) {
    //Routes:
    app.use('/api/genres', genres) //Uses the genres router if path is '/genres'
    app.use('/api/customers', customers) //Uses the customers router if path is '/customers'
    app.use('/api/movies', movies) //Uses the movies router if path is '/movies'
    app.use('/api/rentals', rentals) //Uses the rentals router if path is '/rentals'
    app.use('/api/users', users) //Uses the users router if path is '/users'
    app.use('/api/auth', auth) //Uses the auth router if path is '/auth'

    //Users Express error handling middle-ware:
    app.use(errorHandle);
}

module.exports = loadRoutes;
