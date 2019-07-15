/* This exports a startup function used to handle errors and configure logging */

const winston = require('winston'); //Used for error logging

function logging() {
    //Creates a new winston transport, to log to a file:
    winston.configure({transports: [new winston.transports.File({ filename: 'logfile.log' }) ]});

    //Catching exceptions and promise rejections in Node:
    process.on('uncaughtException', (exception) => {
        console.log('UNHANDLED EXCEPTION');
        console.log(exception);
        winston.error(exception.message,exception);
        process.exit(1);
    });

    process.on('uncaughtRejection', (exception) => {
        console.log('UNHANDLED REJECTION');
        console.log(exception);
        winston.error(exception.message,exception);
        process.exit(1);
    })
}

module.exports = logging;

