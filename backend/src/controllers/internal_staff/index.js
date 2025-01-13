const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const handlePrismaError = require("../../utils/handlePrismaError");
const prisma = new PrismaClient();
const { hashPassword } = require("../../utils/hashPassword");

const schema = Joi.object({
  role: Joi.string().required(),
  hotelName: Joi.string().allow("").optional(),
  phoneNumber: Joi.string().allow("").optional(),
  email: Joi.string().required(),
  passcode: Joi.string().required(),
  name: Joi.string().allow("").optional(),
  clientId: Joi.number().required(),
});

async function createOrUpdateInternalStaff(req, res) {
  try {
    //destructuring the req.body inside the body inorder to parse some request body values to what the schema expects
    const body = {
      ...req.body,
      phoneNumber: req.body.phoneNumber.toString(),
      clientId: parseInt(req.body.clientId),
    };

    const { error } = schema.validate(body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { role, hotelName, phoneNumber, email, passcode, name, clientId } =
      body;

    const clientExists = await prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists)
      return res
        .status(404)
        .json({ error: "It seems this client is not available anymore" });

    const hashedPassword = await hashPassword(passcode);
    // The upsert method is going to handle updating or creating a record in one operation
    const result = await prisma.internalStaff.upsert({
      where: { email },
      update: {
        role,
        hotelName,
        phoneNumber,
        email,
        passcode: hashedPassword,
        name,
        clientId,
      },
      create: {
        role,
        hotelName,
        phoneNumber,
        email,
        passcode: hashedPassword,
        name,
        clientId,
      },
    });
    res.status(201).json({ result, message: "Staff created successfully!" });
  } catch (error) {
    const prismaError = handlePrismaError(res, error);
    res.status(prismaError.status).json(prismaError.response);
  }
}

async function getAllInternalStaff(req, res) {
  try {
    // I don't want to create a new array to place each staff according the hotel they are working for, it will take an O(n) space and not suitable for larger arrays, so I'm creating the client_start object to keep track of where each client records stop in the array, the db has already sort the records in asc order for us.
    let client_stop = {};
    const _result = await prisma.internalStaff.findMany({
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
        clientId: true,
        phoneNumber: true,
        client: { select: { hotelName: true } },
      },
      orderBy: { clientId: "asc" },
    });
    //lines 87 - 97 if basically checking points where a records with a different clientId starts in the _result array inorder to mark the previous record as the stopping point of the former clientId.
    if (_result.length > 0) {
      let _clientId = _result[0].clientId;
      for (let i = 0; i < _result.length; i++) {
        if (_result[i].clientId !== _clientId) {
          let stop = i - 1;
          client_stop[stop] = true;
          _clientId = _result[i].clientId;
        }
      }
    }
    res.status(200).json({ _result, client_stop });
  } catch (error) {
    const prismaError = handlePrismaError(res, error);
    res.status(prismaError.status).json(prismaError.response);
  }
}

async function getAllClientRelatedStaff(req, res) {
  try {
    let { clientId } = req.query;
    clientId = parseInt(clientId);
    if (!clientId)
      return res
        .status(409)
        .json({ error: "please do well to specify a client" });
    const _result = await prisma.internalStaff.findMany({
      where: { clientId },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
        clientId: true,
        phoneNumber: true,
        client: { select: { hotelName: true } },
      },
    });
    res.status(200).json(_result);
  } catch (error) {
    const prismaError = handlePrismaError(res, error);
    res.status(prismaError.status).json(prismaError.response);
  }
}

async function getStaffById(req, res) {
  try {
    let { id } = req.params;
    id = parseInt(id);
    if (!id)
      return res
        .status(409)
        .json({ error: "please can you specify a valid staff id?" });
    const _result = await prisma.internalStaff.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
        clientId: true,
        phoneNumber: true,
        client: { select: { hotelName: true } },
      },
    });
    if (!_result) return res.status(404).json({ error: "This staff is not available at the moment"});
    res.status(200).json(_result);
  } catch (error) {
    const prismaError = handlePrismaError(res, error);
    res.status(prismaError.status).json(prismaError.response);
  }
};

async function deleteStaffRecord(req, res) {
    try {
		let { id } = req.params;
    id = parseInt(id);
    if (!id) return res.status(400).json({ error: 'Your id may contain unsupported type' });

		// check if staff exists
		const staff = await prisma.internalStaff.findUnique({ where: { id: id } });
		if (!staff) return res.status(404).json({ error: 'This staff is already unavailable' });

		// Delete staff
		await prisma.internalStaff.delete({ where: { id: parseInt(id) } });

		// Return response
		res.status(200).json({ message: 'Staff have been deleted!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
}

module.exports = {
  createOrUpdateInternalStaff,
  getAllInternalStaff,
  getAllClientRelatedStaff,
  getStaffById,
  deleteStaffRecord
};
