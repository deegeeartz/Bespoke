const {createOrUpdateInternalStaff} = require('../src/controllers/internal_staff/index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

afterAll(async () => {
    await prisma.$disconnect();
});

let req = {
    body: {
        role : 'customer service',
        hotelName : 'hotel2',
        phoneNumber : '1234567890',
        email : 'test5@example.com',
        passcode : 'passcode',
        name : 'test',
        clientId : 1,
    }
};
let res = {
    status: jest.fn(() => res),
    json: jest.fn(),
};


// afterEach(async () => {
//     await prisma.internalStaff.deleteMany();
//     jest.clearAllMocks();
// });     

test('can create Internal Staff and link it to a client successfully', async () => {
    
    await createOrUpdateInternalStaff(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
});

test('can create Internal Staff and link it to a client successfully again', async () => {
    req.body.email = 'anotherone@example.com'
    req.body.clientId = 2
    await createOrUpdateInternalStaff(req, res);
    req.body.clientId = 3
    req.body.email = 'anotheragain@test.com'
    await createOrUpdateInternalStaff(req, res);
    expect(res.json).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
});

// test('cannot create Internal Staff if the client does not exist', async () => {
//     req.body.clientId = 4;
//     await createOrUpdateInternalStaff(req, res);
//     expect(res.json).toHaveBeenCalledWith({ error: 'It seems this client is not available anymore' });
//     expect(res.status).toHaveBeenCalledWith(404);
// });

// test('overrides an existing staff data', async () => {
//     req.body.clientId = 1;
//     await createOrUpdateInternalStaff(req, res);
//     req.body.name = 'ajh'
//     await createOrUpdateInternalStaff(req, res);
//     expect(res.json).toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(201);
// });

// test('can parse some body values to what the db expects', async () => {
//     req.body.phoneNumber = 1234567890;
//     req.body.clientId = '1';
//     await createOrUpdateInternalStaff(req, res);
//     expect(res.json).toHaveBeenCalled();
//     expect(res.status).toHaveBeenCalledWith(201);
// });

// test('Joi validation', async () => {
//     req.body.email = '';
//     await createOrUpdateInternalStaff(req, res);
//     expect(res.json).toHaveBeenCalledWith({ error: '"email" is not allowed to be empty' });
// });