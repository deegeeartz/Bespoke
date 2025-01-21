const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const handlePrismaError = require('../../utils/handlePrismaError');
const { hashPassword } = require('../../utils/hashPassword');

const prisma = new PrismaClient();
const orderBy = { id: 'desc' };

const schema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(8).required(),
	name: Joi.string().required(),
	hotelName: Joi.string(),
	location: Joi.string(),
	additionalNotes: Joi.string().allow(''),
});

const getAllClients = async (req, res) => {
	try {
		const result = await prisma.client.findMany({
			select: {
				id: true,
				hotelName: true,
				user: { select: { name: true } },
			},
			orderBy,
		});
		// Return response
		res.status(200).json({ result });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const getAllRecords = async (req, res) => {
	try {
		const { search } = req.query;
		let result;

		if (search) {
			result = await prisma.client.findMany({
				where: {
					OR: [{ user: { name: { contains: search } } }, { user: { email: { contains: search } } }],
				},
				include: { user: true },
				orderBy,
			});
		} else {
			result = await prisma.client.findMany({ include: { user: true }, orderBy });
			if (!result.length) return res.status(404).json({ error: 'No client found!' });
		}

		// Return response
		res.status(200).json({ result });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const getRecordById = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await prisma.client.findUnique({
			where: { id: parseInt(id, 10) },
			include: { user: true },
		});
		if (!result) return res.status(404).json({ error: 'Client not found!' });

		res.status(200).json({ result });
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred!' });
	}
};

const createRecord = async (req, res) => {
	try {
		// Validation
		const { error } = schema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const { email, password, name, hotelName, location, additionalNotes } = req.body;

		// Check if email is already in use
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) return res.status(409).json({ error: 'Email is already in use' });

		// Create record and associated user
		const hashedPassword = await hashPassword(password);
		const result = await prisma.client.create({
			data: {
				hotelName,
				location,
				additionalNotes,
				passcode: password,
				user: {
					create: {
						name,
						email,
						password: hashedPassword,
						role: 'CLIENT',
					},
				},
			},
			include: { user: true },
		});

		res.status(201).json({ result, message: 'Client created successfully!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const updateRecord = async (req, res) => {
	const { id } = req.params;
	try {
		// Validation
		const { error } = schema.validate(req.body);
		if (error) return res.status(400).json({ error: error.details[0].message });

		const { email, password, name, hotelName, location, additionalNotes } = req.body;

		// Find existing record
		const client = await prisma.client.findUnique({ where: { id: parseInt(id) }, include: { user: true } });
		if (!client) return res.status(404).json({ error: 'Client not found!' });

		// Check if email is already in use by another user
		if (email && email !== client.user.email) {
			const existingUser = await prisma.user.findUnique({ where: { email } });
			if (existingUser) return res.status(409).json({ error: 'Email is already in use' });
		}

		// Update record
		const hashedPassword = await hashPassword(password);
		const updatedRecord = await prisma.client.update({
			where: { id: parseInt(id) },
			data: {
				hotelName,
				location,
				additionalNotes,
				passcode: password,
				user: {
					update: {
						name: name ?? client.user.name,
						email: email ?? client.user.email,
						password: password ? hashedPassword : client.user.password,
					},
				},
			},
			include: { user: true },
		});

		res.status(200).json({ result: updatedRecord, message: 'Client updated successfully!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

const deleteRecord = async (req, res) => {
	try {
		const { id } = req.params;
		// check if record exists
		const client = await prisma.client.findUnique({ where: { id: parseInt(id) } });
		if (!client) return res.status(404).json({ error: 'Client not found!' });

		// Delete user and client
		await prisma.client.delete({ where: { id: client.id } });
		await prisma.user.delete({ where: { id: client.userId } });

		// Return response
		res.status(200).json({ message: 'Client deleted successfully!' });
	} catch (error) {
		const prismaError = handlePrismaError(error);
		res.status(prismaError.status).json(prismaError.response);
	}
};

module.exports = {
	getAllRecords,
	getAllClients,
	getRecordById,
	createRecord,
	updateRecord,
	deleteRecord,
};
