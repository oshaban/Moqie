/* Contains authentication middleware */

const jwt = require('jsonwebtoken'); //Loads jwt module

//This middle-ware function checks if the HTTP request Header has a valid JWTs
function auth(req,res,next) {
    //Check if a JWT is provided in th HTTP request header
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Access denied. No token provided.');

    //Verify if the token is valid using jwt module
        //If valid, .verify() will return the payload
    try {
        const decodedPayload = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.payload = decodedPayload; //Add the decoded payload to the request body
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

module.exports = auth; //Exports a middle-ware function