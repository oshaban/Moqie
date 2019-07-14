/* This is a middle-ware function to check if the user as an Admin */

function admin(req,res,next) {
    //This middleware function is executed after the authorization middleware function
    if(!req.payload.isAdmin) return res.status(403).send('Access Denied');
        //req.payload gets the decoded jwt payload from the auth middleware
    next();
}

module.exports = admin;