/* Integration tests: Note: https://mongoosejs.com/docs/jest.html */
/* Prior to running: set NODE_ENV=test */

const request = require('supertest');
const {Rental} = require('../../models/rental'); //Load Rental DB collection
const {User} = require('../../models/user'); //Load User DB collection
const {Movie} = require('../../models/movie'); //Load Movie DB collection
const mongoose = require('mongoose');

describe('/api/returns', ()=> {

    describe('/POST', ()=>{
        let server; //Stores the server from index.js
        let customerId;
        let movieId;
        let token;
        let payload;
        let rental;
        let numberInStock = 10;

        const exec = async function() {
            return await request(server)
                .post('/api/returns')
                .set('x-auth-token', token)
                .send(payload);
        }

        beforeEach(async ()=>{
            //Load server before each test
            server = require('../../index'); 
    
            customerId = mongoose.Types.ObjectId();
            movieId = mongoose.Types.ObjectId();
    
            let movieTitle = '12345';
            let movieRentalRate = 10;

            //Create new rental
            rental = new Rental({
                customer: {
                    _id: customerId,
                    name: '12345',
                    phone: '1234567890'
                },
                movie: {
                    _id: movieId,
                    title: movieTitle,
                    dailyRentalRate: movieRentalRate
                },
            });

            movie = new Movie({
                title: movieTitle,
                genre: {name: 'myGenre'},
                numberInStock : numberInStock,
                dailyRentalRate: movieRentalRate
            });
            movie._id = movieId; //Set the movie object ID

            await movie.save();
            await rental.save();
    
        });
        
        afterEach(async ()=>{ 
            await Rental.deleteMany({}); //Removes all documents
            await Movie.deleteMany({}); //Removes all documents
            await server.close(); 
        });


        it('Should return 401 if client not logged in', async ()=>{
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('Should return 400 if customerId not provided', async ()=>{
            token = new User().generateAuthToken();
            payload = {movieId: movieId};

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('Should return 400 if movieId not provided', async ()=>{
            token = new User().generateAuthToken();
            payload = {customerId: customerId};

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('Should return 404 if no rental found for this customer', async ()=>{
            token = new User().generateAuthToken();
            payload = {customerId: customerId, movieId: movieId};

            await Rental.deleteMany({});
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('Should return 400 if rental already returned', async ()=>{
            token = new User().generateAuthToken();
            payload = {customerId: customerId, movieId: movieId};           
            rental.dateReturned = new Date();
            rental.save();

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('Should return 200 if valid request', async ()=>{
            token = new User().generateAuthToken();
            payload = {customerId: customerId, movieId: movieId};           

            const res = await exec();
            expect(res.status).toBe(200);
        });

        it('Should set a rental return date if input is valid', async ()=>{
            token = new User().generateAuthToken();
            payload = {customerId: customerId, movieId: movieId};           
            const res = await exec();

            let rentalQuery = await Rental.findById(rental._id);

            expect(rentalQuery.dateReturned).toBeDefined();

        });

        it('Should set a rentalFee if input is valid', async ()=>{
            token = new User().generateAuthToken();
            payload = {customerId: customerId, movieId: movieId};           
            
            let dateEnd =  new Date();
            dateEnd.setDate(dateEnd.getDate() - 7); // Subtract a week from current date

            //Update rental object before saving it
            rental.dateOut = dateEnd;

            const res = await exec(); 

            let rentalQuery = await Rental.findById(rental._id);
            let dailyRentalRate = rentalQuery.movie.dailyRentalRate;
            let daysOut = rentalQuery.dateReturned - rentalQuery.dateOut;

            expect(rentalQuery.rentalFee).toBe(dailyRentalRate*daysOut);

        });

        it('Should return the rental if input is valid', async ()=>{
            token = new User().generateAuthToken();
            payload = {customerId: customerId, movieId: movieId};           
        
            const res = await exec(); 

            expect(res.body).toHaveProperty('customer');
            expect(res.body).toHaveProperty('movie');
            expect(res.body).toHaveProperty('dateOut');
            expect(res.body).toHaveProperty('dateReturned');
            expect(res.body).toHaveProperty('rentalFee');
        });

    });

});