/* This is a middle-ware function for error handling */

const winston = require('winston');

function errorHandle(err,req,res,next,){
    console.log(err); //Logs the error to console
    winston.error(err.message, err); //Logs an error using winston
    
    res.status(500).send('Something failed');
}

module.exports = errorHandle;

