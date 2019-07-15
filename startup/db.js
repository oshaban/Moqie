/* This exports a startup function that is used to connect to the database */

const mongoose = require('mongoose');

function dbConnect() {
    //Connects to local MongoDB database
    mongoose.connect('mongodb://localhost:27017/moqie', {useNewUrlParser: true})
    .then(() => console.log('Connected to MongoDB')  )
    .catch((error) => {
        console.log('Could not connect to MongoDB ' + err)
        process.exit(1);
    });
}

module.exports = dbConnect;