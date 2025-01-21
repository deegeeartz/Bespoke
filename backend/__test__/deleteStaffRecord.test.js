const {deleteStaffRecord} = require('../src/controllers/internal_staff/index');

afterEach(async () => {
    jest.clearAllMocks();
});

let req = {
    params: {
        id : '109',
    }
};

let res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
};

test("can delete a staff record", async() => {
    await deleteStaffRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Staff have been deleted!' });
});

test("returns 404 if staff not found", async() => {
    req.params = {id: "1"}
    await deleteStaffRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'This staff is already unavailable' });
});

test("test with random values passedd to the id", async() => {
    req.params = {id: "a"}
    await deleteStaffRecord(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Your id may contain unsupported type' });
});
