const {getAllInternalStaff, getAllClientRelatedStaff, getStaffById} = require('../src/controllers/internal_staff/index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

afterAll(async () => {
    await prisma.$disconnect();
});

afterEach(async () => {
    jest.clearAllMocks();
});

let req = {
    query: {
        clientId : '1',
    }
};

let res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
};

test('retrieving internal staff for a particular client', async() => {
    const result = await getAllClientRelatedStaff(req, res);
    console.log(result);
    expect(res.status).toHaveBeenCalledWith(200);
});

test('retrieving internal staff for all client', async() => {
    req.query = {};
    const result = await getAllInternalStaff(req, res);
    console.log(result);
    expect(res.status).toHaveBeenCalledWith(200);
});

test("retrieving internal staff for a client that doesn't exist", async() => {
    req.query = {clientId : '4',};
    const result = await getAllClientRelatedStaff(req, res);
    console.log(result);
    expect(res.json).toHaveBeenCalled();
});

test("returns error if clientId query not defined", async() => {
    req.query = {};
    const result = await getAllClientRelatedStaff(req, res);
    console.log(result);
    expect(res.json).toHaveBeenCalledWith({ error: "please do well to specify a client" });
});

test("get staff by id returns a 404 if staff not found", async() => {
    req.params = {id: 1};
    await getStaffById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "This staff is not available at the moment"});
});

test("get staff by id returns a 200 if staff found", async() => {
    req.params = {id: 103};
    await getStaffById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ 
        client : {
            hotelName: "hotel2",
        },
        clientId: 2,
        email : "another@example.com",
        id : 103,
        name : "test",
        phoneNumber: "1234567890",
        role : "customer service",});
});

test("get staff by id returns a 409 if id not provided", async() => {
    req.params = {};
    await getStaffById(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "please can you specify a valid staff id?" });
});
