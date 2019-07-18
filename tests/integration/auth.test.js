/* Integration tests: Note: https://mongoosejs.com/docs/jest.html */
/* Prior to running: set NODE_ENV=test */

const request = require('supertest');
let server; //Stores the server from index.js
const {User} = require('../../models/user');

describe('auth middleware', ()=>{
    let token;
    
    //Load the server before each test
    beforeEach(()=>{ 
        server = require('../../index'); 
        token = new User().generateAuthToken();
    });
    afterEach(async ()=>{ await server.close(); });

    const exec = function() {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({name: 'genre1'});
    }
    
    it('should return 401 if no token is provided', async ()=> {
        token = '';
        const res = await exec();
        
        expect(res.status).toBe(401);
    });

    it('should return 400 if token is invalid', async ()=> {
        token = 'a';
        const res = await exec();
        
        expect(res.status).toBe(400);
    });
});