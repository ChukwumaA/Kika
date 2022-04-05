const request = require('supertest')
const appServer = require('../../app')

describe('Handles Buyer API', () => {
    it('Creates a new buyer successfully', async () => {
        await request(appServer).post('/api/v1/buyer/register').send({
            name: "Test",
            username: "TestUser",
            email: 'testuser@yopmail.com',
            password: "Password@1!"
        })
    })

    it('Returns all the buyers available on our system', async () => {
        await request(appServer).get('/api/v1/buyer')
        .expect(200)
    })

    it("Return a single buyer based on the buyer's ID", async () => {
        await request(appServer).get('/api/v1/buyer/')
        .expect(200)
    })
})