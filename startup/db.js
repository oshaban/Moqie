/* This exports a startup function that is used to connect to the database */

const mongoose = require('mongoose');

function dbConnect() {

    //Print the environment system is running on:
    console.log(`Running on ${process.env.NODE_ENV} environment`);

    let DB = process.env.DB_DEV; //Automatically load development database

    //If environment is set to test, load test database
    if(process.env.NODE_ENV==="test") {
        DB=process.env.DB_TEST
    } 

    //Connects to local MongoDB database
    mongoose.connect(DB, {useNewUrlParser: true})
    .then(() => console.log(`Connected to ${DB}`) )
    .catch((error) => {
        console.log('Could not connect to MongoDB ' + error)
        process.exit(1);
    });
}

module.exports = dbConnect;