const { PrismaClient } = require("@prisma/client");
const Joi = require("joi");
const handlePrismaError = require("../../utils/handlePrismaError");
const prisma = new PrismaClient();

const schema = Joi.object({
  role: Joi.string().required(),
  hotelName: Joi.string().allow("").optional(),
  phoneNumber: Joi.string().allow("").optional(),
  email: Joi.string().required(),
  passcode: Joi.string().required(),
  name: Joi.string().allow("").optional(),
  clientId: Joi.number().required(),
});

// Function to create or update internal staff details
async function createOrUpdateInternalStaff(req, res) {
  try {
    // Step 1: Parse and validate the request body
    // Destructure the req.body and modify specific values to match the schema expectations
    const body = {
      ...req.body,
      phoneNumber: req.body.phoneNumber.toString(), // Ensure phoneNumber is treated as a string
      clientId: parseInt(req.body.clientId), // Convert clientId to an integer
    };

    // Validate the parsed body against the schema
    const { error } = schema.validate(body);
    if (error) 
      // If validation fails, return a 400 error with the validation message
      return res.status(400).json({ error: error.details[0].message });

    // Step 2: Destructure the fields from the request body
    const { role, hotelName, phoneNumber, email, passcode, name, clientId } = body;

    // Step 3: Check if the associated client exists in the database
    const clientExists = await prisma.client.findUnique({
      where: { id: clientId }, // Find client by ID
    });
    if (!clientExists) 
      // If the client does not exist, return a 404 error
      return res
        .status(404)
        .json({ error: "It seems this client is not available anymore" });

    // Step 4: Upsert the internal staff record
    const result = await prisma.internalStaff.upsert({
      where: { email }, // Match by unique email field
      update: {
        role, // Update the role if the record exists
        hotelName, // Update the hotel name
        phoneNumber, // Update the phone number
        email, // Update the email
        passcode, // Update the passcode
        name, // Update the name
        client: {
          connect: {
            id: clientId, // Associate the staff with the existing client
          },
        },
      },
      create: {
        role, // Create with the provided role
        hotelName, // Create with the provided hotel name
        phoneNumber, // Create with the provided phone number
        email, // Create with the provided email
        passcode, // Create with the provided passcode
        name, // Create with the provided name
        clientId, // Link the new staff to the specified client ID
      },
    });

    // Step 5: Return a success response
    res.status(201).json({ result, message: "Staff created successfully!" });
  } catch (error) {
    // Step 6: Handle any errors during the process
    const prismaError = handlePrismaError(res, error); // Map Prisma error to a structured response
    res.status(prismaError.status).json(prismaError.response); // Return the error response
  }
};

// Function to retrieve all internal staff and group them by client
async function getAllInternalStaff(req, res) {
  try {
    // Step 1: Initialize an object to track client grouping stops
    let client_stop = {};

    // Step 2: Query the database to get all internal staff with specific fields
    const _result = await prisma.internalStaff.findMany({
      select: {
        id: true, // Select the staff ID
        role: true, // Select the staff role
        email: true, // Select the staff email
        name: true, // Select the staff name
        clientId: true, // Select the associated client ID
        phoneNumber: true, // Select the staff phone number
        client: { select: { hotelName: true } }, // Select the hotel name from the related client
      },
      orderBy: { clientId: "asc" }, // Order the results by clientId in ascending order
    });

    // Step 3: If there are results, identify the stops for client groupings
    if (_result.length > 0) {
      let _clientId = _result[0].clientId; // Set the initial clientId to the first record's clientId

      // Loop through the results to track where clientId changes
      for (let i = 0; i < _result.length; i++) {
        if (_result[i].clientId !== _clientId) {
          let stop = i - 1; // Mark the last index of the previous client group
          client_stop[stop] = true; // Record the stop position
          _clientId = _result[i].clientId; // Update the current clientId
        }
      }
    }

    // Step 4: Send the results and client stops back to the client
    res.status(200).json({ _result, client_stop });
  } catch (error) {
    // Step 5: Handle errors and send appropriate responses
    const prismaError = handlePrismaError(res, error); // Map Prisma error to a structured response
    res.status(prismaError.status).json(prismaError.response); // Return the error response
  }
}


// Function to get all internal staff related to a specific client
async function getAllClientRelatedStaff(req, res) {
  try {
    // Step 1: Extract and parse the clientId from the request query
    let { clientId } = req.query;
    clientId = parseInt(clientId); // Convert clientId to an integer

    // Step 2: Validate that clientId is provided and valid
    if (!clientId)
      return res
        .status(409) // Conflict status code if clientId is missing
        .json({ error: "please do well to specify a client" });

    // Step 3: Query the database for internal staff belonging to the specified client
    const _result = await prisma.internalStaff.findMany({
      where: { clientId }, // Filter by the provided clientId
      select: {
        id: true, // Select the staff ID
        role: true, // Select the staff role
        email: true, // Select the staff email
        name: true, // Select the staff name
        clientId: true, // Select the associated client ID
        phoneNumber: true, // Select the staff phone number
        client: { select: { hotelName: true } }, // Select the hotel name from the related client
      },
    });

    // Step 4: Return the result as a JSON response
    res.status(200).json(_result);
  } catch (error) {
    // Step 5: Handle errors and send appropriate responses
    const prismaError = handlePrismaError(res, error); // Map Prisma error to a structured response
    res.status(prismaError.status).json(prismaError.response); // Return the error response
  }
}

// Function to fetch a specific staff member by their ID
async function getStaffById(req, res) {
  try {
    // Step 1: Extract and parse the staff ID from the request parameters
    let { id } = req.params;
    id = parseInt(id); // Convert the ID to an integer for database querying

    // Step 2: Validate the ID
    if (!id) {
      return res
        .status(409) // Respond with a 409 Conflict status if ID is invalid
        .json({ error: "please can you specify a valid staff id?" });
    }

    // Step 3: Query the database to find the staff member by their unique ID
    const _result = await prisma.internalStaff.findUnique({
      where: { id }, // Filter by the staff ID
      select: {
        id: true, // Select the staff ID
        role: true, // Select the staff role
        email: true, // Select the staff email
        name: true, // Select the staff name
        clientId: true, // Select the associated client ID
        phoneNumber: true, // Select the staff phone number
        client: { select: { hotelName: true } }, // Select the hotel name of the related client
      },
    });

    // Step 4: Check if the staff member exists
    if (!_result) {
      return res
        .status(404) // Respond with a 404 Not Found status if the staff member is not found
        .json({ error: "This staff is not available at the moment" });
    }

    // Step 5: Return the staff member's details in the response
    res.status(200).json(_result);
  } catch (error) {
    // Step 6: Handle any errors during execution
    const prismaError = handlePrismaError(res, error); // Map Prisma error to a structured response
    res.status(prismaError.status).json(prismaError.response); // Send the error response
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
};

module.exports = {
  createOrUpdateInternalStaff,
  getAllInternalStaff,
  getAllClientRelatedStaff,
  getStaffById,
  deleteStaffRecord
};
