const express = require('express'); //Load Express package
const app = express(); //Creates an express application
const winston = require('winston'); //Used for logging

const port = 3000; //Port for listening

//Run startup functions:
require('./startup/config')(express, app); //Loads configuration settings and middleware
require('./startup/logging')(); //Loads logging and error handling
require('./startup/db')(); //Connects to database
require('./startup/routes')(app); //Loads all routes

app.listen(port, ()=> winston.info('Listening on port ' + port));
