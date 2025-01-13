const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

afterAll(async () => {
    await prisma.$disconnect();
});

// afterEach(async () => {
//     await prisma.internalStaff.deleteMany();
//     await prisma.queryStaff.deleteMany();
//     jest.clearAllMocks();
// });

describe('test some prisma schema', () => {
    it('can run a create method of internal staff schema', async () => {

        const data = {
            role : 'customer service',
            hotelName : 'hotel1',
            phoneNumber : '1234567890',
            email : 'test@example.com',
            passcode : 'passcode',
            name : 'test',
            clientId : 1,

        };
        await prisma.internalStaff.create({ data });
        const result = await prisma.internalStaff.findMany();
        console.log(result);
        expect(result.length).toBe(1);
    });

    it('checking if undefined is also interpreted to null', async () => {

        const data = {
            role : 'customer service',
            hotelName : undefined,
            phoneNumber : '1234567890',
            email : 'test@example.com',
            passcode : 'passcode',
            name : 'test',
            clientId : 1,

        };
        await prisma.internalStaff.create({ data });
        const result = await prisma.internalStaff.findMany();
        console.log('for result 2 - ', result);
        expect(result.length).toBe(1);
    });
});