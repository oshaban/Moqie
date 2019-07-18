/* Integration tests: Note: https://mongoosejs.com/docs/jest.html */
/* Prior to running: set NODE_ENV=test */

const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

let server; //Stores the server from index.js

describe('/api/genres', ()=> {
    //Load the server before each test
    beforeEach(()=>{ server = require('../../index'); });
    afterEach(async ()=>{ 
        await Genre.remove({}); //Removes all documents
        await server.close(); 
    });
    
    describe('GET', ()=>{
        
        it('should return all genres', async ()=> {
            //Populate test database:
            await Genre.collection.insertMany([
                {name: 'genre1'},
                {name: 'genre2'}
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET/:id', ()=>{
        
        it('should return a genre if valid id', async ()=> {
            //Create new document:
            const genre = new Genre({
                name: 'genre1'
            })
            await genre.save(); //Save the document

            const res = await request(server).get('/api/genres/' + genre._id);
            expect(res.status).toBe(200);
            expect(res.body[0]).toHaveProperty('name', genre.name);
        });

        it('should return 404 if invalid id passed', async ()=> {
            //Database has no documents

            const res = await request(server).get('/api/genres/1'); //Invalid ID
            expect(res.status).toBe(404);
        });

        it('should return 404 if genre not found', async ()=> {
            const id = mongoose.Types.ObjectId(); //Generate a valid id
            const res = await request(server).get('/api/genres/'+ id); //Valid ID, but genre does not exist
            expect(res.status).toBe(404);
        });
    });

    describe('POST', ()=>{
       
        it('should return a 401 if client is not logged in', async ()=> {
            const res = await request(server)
                .post('/api/genres')
                .send({name: 'genre1'});
        
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 3 characters', async ()=> {
            const token = new User().generateAuthToken();
            
            const res = await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name: 'ge'});
        
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is greater than 50 characters', async ()=> {
            const token = new User().generateAuthToken();
            
            const genString = new Array(52).join('a');

            const res = await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name: genString});
        
            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async ()=> {
            const token = new User().generateAuthToken();

            const res = await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name: 'genre1'});
        
            const query = await Genre.find({name : 'genre1'});

            expect(res.status).toBe(200);
            expect(query).not.toBeNull();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });

        it('should save the genre if it is valid', async ()=> {
            const token = new User().generateAuthToken();

            const res = await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({name: 'genre1'});
        
            const query = await Genre.find({name : 'genre1'});

            expect(res.status).toBe(200);
            expect(query).not.toBeNull();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
       
    });

    describe('PUT', ()=>{

        let testName;
        let id='1';
        const exec = async function() {
            const token = new User().generateAuthToken();
            return await request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({name: testName});
        }

        it('should return 400 if genre is less than 3 characters', async ()=> {
            id = '1';
            testName = "ab"; //Invalid name
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is greater than 50 characters', async ()=> {

            id = '1';
            testName = new Array(52).join('a'); //Invalid name
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 404 if genre with given ID not found in database', async ()=> {
            id =  mongoose.Types.ObjectId(); //Valid Mongoose Id, which does not exist in DB
            testName = 'genre1'; //Valid name
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return the updated genre if HTTP request valid', async ()=> {
            
            originalName = 'genre1';
            testName = 'genre2'; //Valid name for HTTP body request
            
            //Create new Genre in the database
            const genre = new Genre({
                name: originalName
            });
            await genre.save();
            id = genre._id;
            const res = await exec();

            //Check that the genre is updated

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('genre2');
        });

    });

    describe('DELETE', ()=>{

        let testName;
        let id='1';
        const exec = async function() {
            const token = new User().generateAuthToken();
            return await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token)
                .send();
        }

        it('should return 404 if genre with given ID not found in database', async ()=> {
            id =  mongoose.Types.ObjectId(); //Valid Mongoose Id, which does not exist in DB
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return the updated genre if delete successful', async ()=> {
            
            originalName = 'genre1';
            //Create new Genre in the database
            const genre = new Genre({
                name: originalName
            });
            await genre.save();
            id = genre._id;
            const res = await exec();

            //Check that the genre is deleted
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('genre1');
        });

    });

});