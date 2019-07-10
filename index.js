const express = require('express'); //Load Express package
const helmet = require('helmet') //Secures Express apps
const morgan = require('morgan') //Logs HTTP requests
const app = express(); //Creates an express application

const port = 3000; //Port for listening

const genres = require('./routes/genres'); //Loads the router module

//Middle-ware:
app.use(express.json()); //Middle-ware to parse incoming JSON HTTP Requests
app.use(helmet()); //Middle-ware to secure Express apps

//Uses Morgan only in development environment
if( app.get('env') === 'development') {
    app.use(morgan('tiny')); //Middle-ware to log HTTP requests
}

//Routes:
app.use('/api/genres', genres) //Uses the genres router if path is '/genres'

app.listen(port, ()=> console.log('Listening on port ' + port));