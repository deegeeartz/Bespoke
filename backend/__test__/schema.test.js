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

// describe('test some prisma schema', () => {
//     it('can run a create method of internal staff schema', async () => {

//         const data = {
//             role : 'customer service',
//             hotelName : 'hotel1',
//             phoneNumber : '1234567890',
//             email : 'test@example.com',
//             passcode : 'passcode',
//             name : 'test',
//             clientId : 1,

//         };
//         await prisma.internalStaff.create({ data });
//         const result = await prisma.internalStaff.findMany();
//         console.log(result);
//         expect(result.length).toBe(1);
//     });

//     it('checking if undefined is also interpreted to null', async () => {

//         const data = {
//             role : 'customer service',
//             hotelName : undefined,
//             phoneNumber : '1234567890',
//             email : 'test@example.com',
//             passcode : 'passcode',
//             name : 'test',
//             clientId : 1,

//         };
//         await prisma.internalStaff.create({ data });
//         const result = await prisma.internalStaff.findMany();
//         console.log('for result 2 - ', result);
//         expect(result.length).toBe(1);
//     });
// });

test('retrieving client id from an audit survey', async () => {
    let surveyId = 3;
    const _clientId = await prisma.survey.findUnique({
        where : {id : parseInt(surveyId)},
        select : {
            clientId : true
        }
    });
    console.log(_clientId);
    expect(_clientId.clientId).toEqual(2);
});

test('retrieving categories from survey', async () => {
    let clientId = 2;
    const result = await prisma.survey.findFirst({
        where : {
            id : 3
        },
        select : {
            questions : true,
            categories : true
        }
    });
    console.log(result);

    const question = await prisma.question.findFirst({
        where : {
            id : 11
        },
        select : {
            categoryId : true
        }
    });
    console.log(question.categoryId);
    // console.log(result[0]);
    expect(1).toEqual(1);
});
