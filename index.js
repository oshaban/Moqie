const mongoose = require('mongoose')
const express = require('express'); //Load Express package
const helmet = require('helmet') //Secures Express apps
const morgan = require('morgan') //Logs HTTP requests
const app = express(); //Creates an express application
const result = require('dotenv').config(); //Sets environment variables

//Checks for environment variables errors:
if(result.error) {
    console.log(result.error);
    process.exit();
}

const port = 3000; //Port for listening

//Loading Router Modules:
const genres = require('./routes/genres'); //Loads the router module for genres endpoint
const customers = require('./routes/customers'); //Loads the router module for customers endpoint
const movies = require('./routes/movies'); //Loads the router module for movies endpoint
const rentals = require('./routes/rentals'); //Loads the router module for rentals endpoint
const users = require('./routes/users'); //Loads the router module for rentals endpoint
const auth = require('./routes/auth'); //Loads the auth module for rentals endpoint

//Connects to local MongoDB database
mongoose.connect('mongodb://localhost:27017/moqie', {useNewUrlParser: true})
    .then(() => console.log('Connected to MongoDB')  )
    .catch((err) => console.log('Could not connect to MongoDB ' + err));

//Middle-ware:
app.use(express.json()); //Middle-ware to parse incoming JSON HTTP Requests
app.use(helmet()); //Middle-ware to secure Express apps

//Uses Morgan only in development environment
if( app.get('env') === 'development') {
    app.use(morgan('tiny')); //Middle-ware to log HTTP requests
}

//Routes:
app.use('/api/genres', genres) //Uses the genres router if path is '/genres'
app.use('/api/customers', customers) //Uses the customers router if path is '/customers'
app.use('/api/movies', movies) //Uses the movies router if path is '/movies'
app.use('/api/rentals', rentals) //Uses the rentals router if path is '/rentals'
app.use('/api/users', users) //Uses the users router if path is '/users'
app.use('/api/auth', auth) //Uses the auth router if path is '/auth'

app.listen(port, ()=> console.log('Listening on port ' + port));