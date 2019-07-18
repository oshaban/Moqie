/* This exports a function to set configuration settings and load middle-ware functions */

const result = require('dotenv').config(); //Sets environment variables
const helmet = require('helmet') //Secures Express apps
const morgan = require('morgan') //Logs HTTP requests to console
const compression = require('compression'); //Nodejs compression middleware

function config(express, app) {
    //Checks for environment variables errors using dotenv:
        //If an environment variable is not set, and error will be thrown
    if(result.error) {
        console.log(result.error);
        process.exit(1);
    }

    //Uses Morgan only in development environment
    if( app.get('env') === 'development') {
        app.use(morgan('tiny')); //Middle-ware to log HTTP requests
    }

    //Middle-ware:
    app.use(express.json()); //Middle-ware to parse incoming JSON HTTP Requests
    app.use(compression());
    app.use(helmet()); //Middle-ware to secure Express apps
}

module.exports = config